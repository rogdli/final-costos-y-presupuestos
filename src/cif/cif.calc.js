import { agruparPorTipo, clasificar, esFijo, esVariable, sumarComprobantes } from '../shared/comprobantes'

export const METODO_CIF = { UNIDADES: 'unidades', HORAS: 'horas' }

/**
 * Pool de costos indirectos: TODO comprobante cargado sin producto asociado,
 * cualquiera sea su tipo funcional. Entran los CIF de fábrica, la mano de obra
 * general y los gastos de administración y ventas.
 *
 * Así no queda plata sin asignar: cada peso cargado termina dentro del costo de
 * algún producto, que es la condición para saber cuánto aporta cada producto a
 * cubrir la estructura fija.
 */
export function calcularCifTotal(comprobantes, productos = []) {
  const { indirectos } = clasificar(comprobantes, productos)
  return sumarComprobantes(indirectos)
}

export function calcularCif(productos, comprobantes, metodo = METODO_CIF.HORAS) {
  const { indirectos } = clasificar(comprobantes, productos)

  const cifTotal = sumarComprobantes(indirectos)
  const cifFijo = sumarComprobantes(indirectos, esFijo)
  const cifVariable = sumarComprobantes(indirectos, esVariable)

  const unidadesTotales = productos.reduce((total, p) => total + p.cantidadVendida, 0)
  const horasTotales = productos.reduce((total, p) => total + p.horasProduccion, 0)

  const base = metodo === METODO_CIF.HORAS ? horasTotales : unidadesTotales
  const tasa = base > 0 ? cifTotal / base : 0
  const tasaFija = base > 0 ? cifFijo / base : 0
  const tasaVariable = base > 0 ? cifVariable / base : 0

  const porProducto = productos.map((producto) => {
    const consumo = metodo === METODO_CIF.HORAS ? producto.horasProduccion : producto.cantidadVendida
    const cifAsignado = tasa * consumo
    const cifFijoAsignado = tasaFija * consumo
    const cifVariableAsignado = tasaVariable * consumo
    const cantidad = producto.cantidadVendida

    return {
      productoId: producto.id,
      consumo,
      cifAsignado,
      cifFijoAsignado,
      cifVariableAsignado,
      cifUnitario: cantidad > 0 ? cifAsignado / cantidad : 0,
      cifVariableUnitario: cantidad > 0 ? cifVariableAsignado / cantidad : 0,
    }
  })

  const cifAsignadoTotal = porProducto.reduce((total, p) => total + p.cifAsignado, 0)

  return {
    cifTotal,
    cifFijo,
    cifVariable,
    metodo,
    base,
    tasa,
    tasaFija,
    tasaVariable,
    unidadesTotales,
    horasTotales,
    porTipo: agruparPorTipo(indirectos).sort((a, b) => b.importe - a.importe),
    porProducto,
    cifAsignadoTotal,
    /** Lo que el driver no pudo repartir (base en cero: sin unidades u horas cargadas). */
    cifSinAsignar: cifTotal - cifAsignadoTotal,
  }
}
