import { esFijo, sumarComprobantes } from '../shared/comprobantes'
import { calcularCostoDirecto } from '../costos-directos/costosDirectos.calc'
import { calcularCif, METODO_CIF } from '../cif/cif.calc'
import { calcularCostoTotalUnitario } from '../costos-unitarios/costosUnitarios.calc'
import { calcularCostosFijosTotales, calcularGastosFijos } from '../gastos-fijos/gastosFijos.calc'
import {
  calcularMargenContribucion,
  calcularPePorProducto,
  calcularPuntoEquilibrio,
} from '../punto-equilibrio/puntoEquilibrio.calc'
import { calcularPreciosSugeridos } from '../precios/precios.calc'

export function calcularCasoCompleto(
  productos,
  comprobantes,
  { metodoCif = METODO_CIF.HORAS, utilidadObjetivo = 0 } = {}
) {
  const costoDirecto = calcularCostoDirecto(productos, comprobantes)
  const cif = calcularCif(productos, comprobantes, metodoCif)
  const costosUnitarios = calcularCostoTotalUnitario(productos, comprobantes, metodoCif)

  const cifTotal = cif.cifTotal
  const gastosFijosTotales = calcularGastosFijos(comprobantes)
  const costosFijosTotales = calcularCostosFijosTotales(comprobantes)

  // Costeo variable: solo lo marcado como Variable integra el costo variable
  // unitario, venga de un comprobante directo o del pool indirecto.
  const costosVariablesUnitarios = costosUnitarios.porProducto.map((p) => p.costoVariableUnitario)
  const precios = productos.map((p) => p.precioCompetencia)

  const margen = calcularMargenContribucion(productos, costosVariablesUnitarios, precios)
  const puntoEquilibrio = calcularPuntoEquilibrio(costosFijosTotales, margen.mcTotalGlobal, margen.ventasTotales)
  const pePorProducto = calcularPePorProducto(puntoEquilibrio.peEnPesos, margen)
  const preciosSugeridos = calcularPreciosSugeridos(
    productos,
    costosVariablesUnitarios,
    costosFijosTotales,
    utilidadObjetivo
  )

  return {
    costoDirecto,
    cif,
    costosUnitarios,
    cifTotal,
    gastosFijosTotales,
    costosFijosTotales,
    costosVariablesUnitarios,
    margen,
    puntoEquilibrio,
    pePorProducto,
    preciosSugeridos,
    ingresosTotales: margen.ventasTotales,
    costoVariableTotal: margen.costoVariableTotal,
    control: calcularControlAsignacion(productos, comprobantes, costoDirecto, cif),
  }
}

/**
 * Control de asignación: la plata cargada en comprobantes tiene que ser igual a
 * la plata repartida entre los productos. Si no coincide, algo quedó afuera del
 * cálculo (por ejemplo, no hay unidades ni horas cargadas y el driver no puede
 * repartir el pool indirecto).
 */
export function calcularControlAsignacion(productos, comprobantes, costoDirecto, cif) {
  const totalCargado = sumarComprobantes(comprobantes)
  const totalAsignado = costoDirecto.totalDirecto + cif.cifAsignadoTotal
  const diferencia = totalCargado - totalAsignado

  return {
    totalCargado,
    totalAsignado,
    diferencia,
    cobertura: totalCargado > 0 ? totalAsignado / totalCargado : 1,
    completo: Math.abs(diferencia) < 0.01,
    sinProductos: productos.length === 0,
    baseDriverEnCero: cif.cifTotal > 0 && cif.base <= 0,
  }
}

/** Aplica un ajuste porcentual a los importes según su comportamiento. */
function ajustarComprobantes(comprobantes, ajusteVariables, ajusteFijos) {
  if (!ajusteVariables && !ajusteFijos) return comprobantes

  return comprobantes.map((comprobante) => {
    const ajuste = esFijo(comprobante) ? ajusteFijos : ajusteVariables
    if (!ajuste) return comprobante
    return { ...comprobante, importe: (Number(comprobante.importe) || 0) * (1 + ajuste / 100) }
  })
}

export function simular(productosBase, comprobantes, overrides = {}) {
  const {
    precios = {},
    cantidades = {},
    ajusteVariables = 0,
    ajusteFijos = 0,
    metodoCif = METODO_CIF.HORAS,
    utilidadObjetivo = 0,
  } = overrides

  const productosSimulados = productosBase.map((producto) => ({
    ...producto,
    precioCompetencia: precios[producto.id] ?? producto.precioCompetencia,
    cantidadVendida: cantidades[producto.id] ?? producto.cantidadVendida,
  }))

  const comprobantesSimulados = ajustarComprobantes(comprobantes, ajusteVariables, ajusteFijos)

  return calcularCasoCompleto(productosSimulados, comprobantesSimulados, { metodoCif, utilidadObjetivo })
}
