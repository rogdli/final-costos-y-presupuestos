import { sumarComprobantes, sumarPorTipo } from '../shared/comprobantes'

export function calcularCostoDirecto(productos, comprobantes) {
  const costoLaboralCocineros = sumarPorTipo(comprobantes, 'Mano de obra directa')
  const horasTotales = productos.reduce((total, p) => total + p.horasProduccion, 0)
  const tasaMODPorHora = horasTotales > 0 ? costoLaboralCocineros / horasTotales : 0

  const porProducto = productos.map((producto) => {
    const materiales = sumarComprobantes(
      comprobantes,
      (c) => c.tipoFuncional === 'Costo directo' && c.productoId === producto.id
    )
    const modAsignada = tasaMODPorHora * producto.horasProduccion
    const costoDirectoTotal = materiales + modAsignada
    const costoDirectoUnitario = producto.cantidadVendida > 0 ? costoDirectoTotal / producto.cantidadVendida : 0

    return { productoId: producto.id, materiales, modAsignada, costoDirectoTotal, costoDirectoUnitario }
  })

  return { costoLaboralCocineros, horasTotales, tasaMODPorHora, porProducto }
}
