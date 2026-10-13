import * as XLSX from 'xlsx'
import { TIPOS_FUNCIONALES, COMPORTAMIENTOS, METODOS_CIF } from './seedData'
import { TIPO } from './comprobantes'
import { numeroNoNegativo } from './numeros'

const STORAGE_KEY = 'costos-rotiseria:estado'

export function cargarEstado() {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY)
    if (!crudo) return null

    const estado = JSON.parse(crudo)
    if (!Array.isArray(estado?.productos) || !Array.isArray(estado?.comprobantes)) return null

    let corregidos = false
    const limpiarNumero = (valor, opciones) => {
      const numero = numeroNoNegativo(valor, opciones)
      if (numero !== null) return numero
      corregidos = true
      return 0
    }

    const productos = estado.productos.map((producto) => ({
      ...producto,
      cantidadVendida: limpiarNumero(producto.cantidadVendida, { entero: true }),
      horasProduccion: limpiarNumero(producto.horasProduccion),
      precioCompetencia: limpiarNumero(producto.precioCompetencia),
    }))
    const idsProductos = new Set(productos.map((producto) => producto.id))
    const comprobantes = estado.comprobantes.map((comprobante) => {
      const productoId = idsProductos.has(comprobante.productoId) ? comprobante.productoId : null
      let tipoFuncional = comprobante.tipoFuncional
      if (productoId !== comprobante.productoId) corregidos = true
      if (!productoId && tipoFuncional === TIPO.COSTO_DIRECTO) tipoFuncional = TIPO.CIF
      if (!productoId && tipoFuncional === TIPO.MANO_OBRA_DIRECTA) tipoFuncional = TIPO.MANO_OBRA_INDIRECTA
      if (tipoFuncional !== comprobante.tipoFuncional) corregidos = true
      return { ...comprobante, importe: limpiarNumero(comprobante.importe), productoId, tipoFuncional }
    })

    const overrides = estado.overrides ?? {}
    const limpiarValores = (valores, opciones) => Object.fromEntries(
      Object.entries(valores ?? {}).flatMap(([id, valor]) => {
        const numero = idsProductos.has(id) ? numeroNoNegativo(valor, opciones) : null
        if (numero !== null) return [[id, numero]]
        corregidos = true
        return []
      })
    )
    const limpiarAjuste = (valor) => {
      const numero = Number(valor)
      if (Number.isFinite(numero) && numero >= -100 && numero <= 100) return numero
      corregidos = true
      return Number.isFinite(numero) ? Math.max(-100, Math.min(100, numero)) : 0
    }
    const porcentajeGuardado = overrides.porcentajePrecioGlobal
    const porcentajePrecioGlobal = porcentajeGuardado === null || porcentajeGuardado === undefined
      ? porcentajeGuardado : numeroNoNegativo(porcentajeGuardado)
    if (porcentajeGuardado !== null && porcentajeGuardado !== undefined &&
      (porcentajePrecioGlobal === null || porcentajePrecioGlobal > 200)) corregidos = true

    const metodoCif = Object.values(METODOS_CIF).includes(estado.metodoCif) ? estado.metodoCif : METODOS_CIF.HORAS
    if (estado.metodoCif !== undefined && metodoCif !== estado.metodoCif) corregidos = true

    return {
      ...estado,
      productos,
      comprobantes,
      utilidadObjetivo: estado.utilidadObjetivo === undefined
        ? undefined : limpiarNumero(estado.utilidadObjetivo),
      metodoCif,
      overrides: {
        ...overrides,
        precios: limpiarValores(overrides.precios),
        cantidades: limpiarValores(overrides.cantidades, { entero: true }),
        ajusteVariables: limpiarAjuste(overrides.ajusteVariables ?? 0),
        ajusteFijos: limpiarAjuste(overrides.ajusteFijos ?? 0),
        porcentajePrecioGlobal: porcentajePrecioGlobal !== null && porcentajePrecioGlobal <= 200
          ? porcentajePrecioGlobal : undefined,
      },
      avisoDatosCorregidos: corregidos
        ? 'Se corrigieron datos negativos o inválidos guardados anteriormente. Revisá productos, comprobantes y simulación.'
        : '',
    }
  } catch {
    return null
  }
}

export function guardarEstado(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
  } catch {}
}

export function exportarExcel({ productos, comprobantes, metodoCif, utilidadObjetivo }) {
  const libro = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(productos), 'Productos')
  XLSX.utils.book_append_sheet(
    libro,
    XLSX.utils.json_to_sheet(comprobantes.map((c) => ({ ...c, productoId: c.productoId ?? '' }))),
    'Comprobantes'
  )
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet([{ metodoCif, utilidadObjetivo }]), 'Parametros')

  XLSX.writeFile(libro, 'costos-rotiseria.xlsx')
}

function numeroExcel(valor, campo, opciones) {
  const numero = numeroNoNegativo(valor, opciones)
  if (numero === null) {
    const condicion = opciones?.entero ? 'un número entero de 0 o más' : opciones?.positivo
      ? 'un número mayor que cero' : 'un número de 0 o más'
    throw new Error(`${campo}: ingresá ${condicion}.`)
  }
  return numero
}

/**
 * Lee un Excel con el mismo formato que exporta la app y valida lo mínimo para
 * no dejar el estado roto: hojas presentes y filas con los campos esperados.
 */
export async function importarExcel(file) {
  const buffer = await file.arrayBuffer()
  const libro = XLSX.read(buffer, { type: 'array' })

  const faltantes = ['Productos', 'Comprobantes'].filter((hoja) => !libro.Sheets[hoja])
  if (faltantes.length > 0) {
    throw new Error(
      `El archivo no tiene la hoja ${faltantes.join(' ni ')}. Importá un Excel exportado desde esta app.`
    )
  }

  const filasProductos = XLSX.utils.sheet_to_json(libro.Sheets.Productos)
  if (filasProductos.length === 0) {
    throw new Error('La hoja Productos está vacía: no hay productos para cargar.')
  }

  const idsProductos = new Set()
  const productos = filasProductos.map((p, i) => {
    const nombre = String(p.nombre ?? '').trim()
    if (!nombre) throw new Error(`La fila ${i + 2} de Productos no tiene nombre.`)

    const id = String(p.id ?? nombre.toLowerCase().replace(/\s+/g, '-')).trim()
    if (!id || idsProductos.has(id)) throw new Error(`La fila ${i + 2} de Productos tiene un ID vacío o repetido.`)
    idsProductos.add(id)

    return {
      id,
      nombre,
      cantidadVendida: numeroExcel(p.cantidadVendida, `Productos, fila ${i + 2}, cantidad vendida`, { entero: true }),
      horasProduccion: numeroExcel(p.horasProduccion, `Productos, fila ${i + 2}, horas de producción`),
      precioCompetencia: numeroExcel(p.precioCompetencia, `Productos, fila ${i + 2}, precio competencia`),
    }
  })

  const numerosComprobantes = new Set()
  const comprobantes = XLSX.utils.sheet_to_json(libro.Sheets.Comprobantes).map((c, i) => {
    const concepto = String(c.concepto ?? '').trim()
    if (!concepto) throw new Error(`La fila ${i + 2} de Comprobantes no tiene concepto.`)
    const tipoFuncional = String(c.tipoFuncional ?? '').trim()
    if (!TIPOS_FUNCIONALES.includes(tipoFuncional)) {
      throw new Error(
        `La fila ${i + 2} de Comprobantes tiene el tipo funcional "${tipoFuncional}". Valores válidos: ${TIPOS_FUNCIONALES.join(', ')}.`
      )
    }

    const comportamiento = String(c.comportamiento ?? '').trim()
    if (!COMPORTAMIENTOS.includes(comportamiento)) {
      throw new Error(
        `La fila ${i + 2} de Comprobantes tiene el comportamiento "${comportamiento}". Valores válidos: ${COMPORTAMIENTOS.join(', ')}.`
      )
    }

    const numero = c.numero === undefined || c.numero === null || String(c.numero).trim() === ''
      ? i + 1
      : numeroExcel(c.numero, `Comprobantes, fila ${i + 2}, número`, { entero: true, positivo: true })
    if (numerosComprobantes.has(numero)) throw new Error(`La fila ${i + 2} de Comprobantes tiene un número repetido.`)
    numerosComprobantes.add(numero)

    const productoId = c.productoId ? String(c.productoId).trim() : null
    if (productoId && !idsProductos.has(productoId)) {
      throw new Error(`Comprobantes, fila ${i + 2}: el producto asociado no existe en la hoja Productos.`)
    }
    if ([TIPO.COSTO_DIRECTO, TIPO.MANO_OBRA_DIRECTA].includes(tipoFuncional) && !productoId) {
      throw new Error(`Comprobantes, fila ${i + 2}: un costo directo necesita un producto asociado.`)
    }

    return {
      numero,
      concepto,
      importe: numeroExcel(c.importe, `Comprobantes, fila ${i + 2}, importe`, { positivo: true }),
      productoId,
      tipoFuncional,
      comportamiento,
    }
  })

  const [parametros] = libro.Sheets.Parametros ? XLSX.utils.sheet_to_json(libro.Sheets.Parametros) : []
  const metodoCif = parametros?.metodoCif || undefined
  if (metodoCif && !Object.values(METODOS_CIF).includes(metodoCif)) {
    throw new Error('La hoja Parametros tiene un método de reparto indirecto inválido.')
  }

  return {
    productos,
    comprobantes,
    metodoCif,
    utilidadObjetivo: parametros?.utilidadObjetivo === undefined
      ? undefined
      : numeroExcel(parametros.utilidadObjetivo, 'Parametros, utilidad objetivo'),
  }
}
