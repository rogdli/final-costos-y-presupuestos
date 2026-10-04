import { calcularCostoDirecto } from '../costos-directos/costosDirectos.calc'
import { calcularCif } from '../cif/cif.calc'

export function calcularCostoTotalUnitario(productos, comprobantes, metodoCif) {
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
    }
  })

  return { metodoCif, porProducto }
}
