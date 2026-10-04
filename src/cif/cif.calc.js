import { sumarPorTipo } from '../shared/comprobantes'

export const METODO_CIF = { UNIDADES: 'unidades', HORAS: 'horas' }

export function calcularCifTotal(comprobantes) {
  return sumarPorTipo(comprobantes, 'CIF')
}

export function calcularCif(productos, comprobantes, metodo = METODO_CIF.UNIDADES) {
  const cifTotal = calcularCifTotal(comprobantes)
  const unidadesTotales = productos.reduce((total, p) => total + p.cantidadVendida, 0)
  const horasTotales = productos.reduce((total, p) => total + p.horasProduccion, 0)

  const base = metodo === METODO_CIF.HORAS ? horasTotales : unidadesTotales
  const tasa = base > 0 ? cifTotal / base : 0

  const porProducto = productos.map((producto) => {
    const consumo = metodo === METODO_CIF.HORAS ? producto.horasProduccion : producto.cantidadVendida
    const cifAsignado = tasa * consumo
    const cifUnitario = producto.cantidadVendida > 0 ? cifAsignado / producto.cantidadVendida : 0

    return { productoId: producto.id, cifAsignado, cifUnitario }
  })

  return { cifTotal, metodo, tasa, porProducto }
}
