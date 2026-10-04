export function calcularPreciosSugeridos(productos, costosVariablesUnitarios, costosFijosTotales, utilidadObjetivo) {
  const unidadesTotales = productos.reduce((total, p) => total + p.cantidadVendida, 0)
  const contribucionMinima = unidadesTotales > 0 ? costosFijosTotales / unidadesTotales : 0
  const contribucionDeseada = unidadesTotales > 0 ? contribucionMinima + utilidadObjetivo / unidadesTotales : 0

  const porProducto = productos.map((producto, index) => {
    const costoVariableUnitario = costosVariablesUnitarios[index]
    const precioMinimo = costoVariableUnitario + contribucionMinima
    const precioSugerido = costoVariableUnitario + contribucionDeseada

    return {
      productoId: producto.id,
      precioCompetencia: producto.precioCompetencia,
      precioMinimo,
      precioSugerido,
      ventasSugeridas: precioSugerido * producto.cantidadVendida,
    }
  })

  return { unidadesTotales, contribucionMinima, contribucionDeseada, porProducto }
}
