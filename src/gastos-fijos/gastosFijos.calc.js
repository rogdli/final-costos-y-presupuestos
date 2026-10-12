import { TIPO, agruparPorTipo, esFijo, sumarComprobantes, sumarPorTipo } from '../shared/comprobantes'

/** Gastos de administración y ventas del período (vista de la pestaña). */
export function calcularGastosFijos(comprobantes) {
  return sumarPorTipo(comprobantes, TIPO.GASTO_ADM)
}

/**
 * Costos fijos de la empresa: todo lo marcado como Fijo al cargar el
 * comprobante, sea directo o indirecto. Es el denominador del punto de
 * equilibrio, y depende del comportamiento elegido, no del tipo funcional.
 */
export function calcularCostosFijosTotales(comprobantes) {
  return sumarComprobantes(comprobantes, esFijo)
}

/** Desglose de los fijos por tipo funcional, para la tabla de la pestaña. */
export function calcularDesgloseFijos(comprobantes) {
  return agruparPorTipo(comprobantes.filter(esFijo)).sort((a, b) => b.importe - a.importe)
}
