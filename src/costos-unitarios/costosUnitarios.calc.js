import { calcularCostoDirecto } from '../costos-directos/costosDirectos.calc'
import { calcularCif, METODO_CIF } from '../cif/cif.calc'

/**
 * Costeo por absorción: cada producto carga su costo directo más la parte del
 * pool indirecto que le asignó el driver. La suma de los costos totales de
 * todos los productos iguala el total de comprobantes del período.
 */
export function calcularCostoTotalUnitario(productos, comprobantes, metodoCif = METODO_CIF.HORAS) {
  const costoDirecto = calcularCostoDirecto(productos, comprobantes)
  const cif = calcularCif(productos, comprobantes, metodoCif)

  const porProducto = productos.map((producto, index) => {
    const directo = costoDirecto.porProducto[index]
    const indirecto = cif.porProducto[index]

    return {
      productoId: producto.id,
      costoDirectoUnitario: directo.costoDirectoUnitario,
      cifUnitario: indirecto.cifUnitario,
      costoTotalUnitario: directo.costoDirectoUnitario + indirecto.cifUnitario,
      costoVariableUnitario: directo.costoDirectoVariableUnitario + indirecto.cifVariableUnitario,
      costoTotal: directo.costoDirectoTotal + indirecto.cifAsignado,
    }
  })

  return { metodoCif, porProducto }
}
