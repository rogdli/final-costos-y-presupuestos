import * as XLSX from 'xlsx'
import { TIPOS_FUNCIONALES, COMPORTAMIENTOS } from './seedData'

const STORAGE_KEY = 'costos-rotiseria:estado'

export function cargarEstado() {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY)
    return crudo ? JSON.parse(crudo) : null
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

function numero(valor) {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
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

  const productos = filasProductos.map((p, i) => {
    const nombre = String(p.nombre ?? '').trim()
    if (!nombre) throw new Error(`La fila ${i + 2} de Productos no tiene nombre.`)

    return {
      id: String(p.id ?? nombre.toLowerCase().replace(/\s+/g, '-')),
      nombre,
      cantidadVendida: numero(p.cantidadVendida),
      horasProduccion: numero(p.horasProduccion),
      precioCompetencia: numero(p.precioCompetencia),
    }
  })

  const comprobantes = XLSX.utils.sheet_to_json(libro.Sheets.Comprobantes).map((c, i) => {
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

    return {
      numero: numero(c.numero) || i + 1,
      concepto: String(c.concepto ?? '').trim(),
      importe: numero(c.importe),
      productoId: c.productoId ? String(c.productoId) : null,
      tipoFuncional,
      comportamiento,
    }
  })

  const [parametros] = libro.Sheets.Parametros ? XLSX.utils.sheet_to_json(libro.Sheets.Parametros) : []

  return {
    productos,
    comprobantes,
    metodoCif: parametros?.metodoCif,
    utilidadObjetivo: parametros?.utilidadObjetivo === undefined ? undefined : numero(parametros.utilidadObjetivo),
  }
}
