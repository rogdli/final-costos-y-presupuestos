/**
 * Reglas de clasificación de comprobantes.
 *
 * Dos decisiones, y nada más, definen cómo se trata un importe:
 *
 * 1. ¿Tiene producto asociado?  Sí -> costo DIRECTO de ese producto.
 *                               No -> va al POOL INDIRECTO y se reparte por el driver.
 * 2. ¿Es fijo o variable?       Fijo     -> suma a los costos fijos de la empresa.
 *                               Variable -> suma al costo variable del producto.
 *
 * El tipo funcional es la clasificación conceptual que pide la consigna
 * (material directo, MOD, MOI, CIF, gasto de administración y ventas).
 * Sirve para informar y agrupar, no para decidir la asignación.
 */

export const TIPO = {
  COSTO_DIRECTO: 'Costo directo',
  MANO_OBRA_DIRECTA: 'Mano de obra directa',
  MANO_OBRA_INDIRECTA: 'Mano de obra indirecta',
  CIF: 'CIF',
  GASTO_ADM: 'Gasto Adm. y Venta',
}

export const TIPOS_MANO_OBRA = [TIPO.MANO_OBRA_DIRECTA, TIPO.MANO_OBRA_INDIRECTA]

export const COMPORTAMIENTO = { FIJO: 'Fijo', VARIABLE: 'Variable' }

export function esFijo(comprobante) {
  return comprobante.comportamiento === COMPORTAMIENTO.FIJO
}

export function esVariable(comprobante) {
  return !esFijo(comprobante)
}

export function sumarComprobantes(comprobantes, predicate = () => true) {
  return comprobantes.filter(predicate).reduce((total, c) => total + (Number(c.importe) || 0), 0)
}

export function sumarPorTipo(comprobantes, tipoFuncional) {
  return sumarComprobantes(comprobantes, (c) => c.tipoFuncional === tipoFuncional)
}

/**
 * Producto al que se imputa un comprobante, o null si va al pool indirecto.
 * Un comprobante que apunta a un producto que ya no existe (porque lo borraron)
 * no se pierde: pasa a ser indirecto.
 */
export function productoImputado(comprobante, productos) {
  if (!comprobante.productoId) return null
  return productos.some((p) => p.id === comprobante.productoId) ? comprobante.productoId : null
}

export function esDirecto(comprobante, productos) {
  return productoImputado(comprobante, productos) !== null
}

export function esIndirecto(comprobante, productos) {
  return productoImputado(comprobante, productos) === null
}

/** Separa los comprobantes en directos (con producto) e indirectos (generales). */
export function clasificar(comprobantes, productos) {
  const directos = []
  const indirectos = []

  for (const comprobante of comprobantes) {
    if (esDirecto(comprobante, productos)) directos.push(comprobante)
    else indirectos.push(comprobante)
  }

  return { directos, indirectos }
}

/** Agrupa importes por tipo funcional, para las tablas de desglose. */
export function agruparPorTipo(comprobantes) {
  const acumulado = new Map()

  for (const comprobante of comprobantes) {
    const tipo = comprobante.tipoFuncional
    acumulado.set(tipo, (acumulado.get(tipo) ?? 0) + (Number(comprobante.importe) || 0))
  }

  return [...acumulado].map(([tipoFuncional, importe]) => ({ tipoFuncional, importe }))
}
