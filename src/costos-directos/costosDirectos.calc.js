import {
  TIPO,
  TIPOS_MANO_OBRA,
  clasificar,
  esVariable,
  productoImputado,
  sumarComprobantes,
} from '../shared/comprobantes'

/**
 * Costos directos: los comprobantes que tienen un producto asociado.
 *
 * Se abren en materiales, mano de obra y otros, y se separan en variables y
 * fijos: solo la parte variable entra al costo variable unitario con el que se
 * calcula el margen de contribución.
 */
export function calcularCostoDirecto(productos, comprobantes) {
  const { directos, indirectos } = clasificar(comprobantes, productos)

  const porProducto = productos.map((producto) => {
    const delProducto = directos.filter((c) => productoImputado(c, productos) === producto.id)

    const materiales = sumarComprobantes(delProducto, (c) => c.tipoFuncional === TIPO.COSTO_DIRECTO)
    const manoObra = sumarComprobantes(delProducto, (c) => TIPOS_MANO_OBRA.includes(c.tipoFuncional))
    const otros = sumarComprobantes(
      delProducto,
      (c) => c.tipoFuncional !== TIPO.COSTO_DIRECTO && !TIPOS_MANO_OBRA.includes(c.tipoFuncional)
    )

    const costoDirectoTotal = materiales + manoObra + otros
    const directoVariable = sumarComprobantes(delProducto, esVariable)
    const directoFijo = costoDirectoTotal - directoVariable

    const cantidad = producto.cantidadVendida
    const costoDirectoUnitario = cantidad > 0 ? costoDirectoTotal / cantidad : 0
    const costoDirectoVariableUnitario = cantidad > 0 ? directoVariable / cantidad : 0

    return {
      productoId: producto.id,
      materiales,
      manoObra,
      otros,
      directoVariable,
      directoFijo,
      costoDirectoTotal,
      costoDirectoUnitario,
      costoDirectoVariableUnitario,
    }
  })

  const totalDirecto = porProducto.reduce((total, p) => total + p.costoDirectoTotal, 0)
  const totalDirectoVariable = porProducto.reduce((total, p) => total + p.directoVariable, 0)

  return {
    porProducto,
    totalDirecto,
    totalDirectoVariable,
    totalDirectoFijo: totalDirecto - totalDirectoVariable,
    manoObraDirecta: porProducto.reduce((total, p) => total + p.manoObra, 0),
    materialesDirectos: porProducto.reduce((total, p) => total + p.materiales, 0),
    /** Mano de obra cargada como general: no es directa, se reparte por el driver. */
    manoObraGeneral: sumarComprobantes(indirectos, (c) => TIPOS_MANO_OBRA.includes(c.tipoFuncional)),
    horasTotales: productos.reduce((total, p) => total + p.horasProduccion, 0),
  }
}
