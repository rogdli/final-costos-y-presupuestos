export function calcularMargenContribucion(productos, costosVariablesUnitarios, precios) {
  const porProducto = productos.map((producto, index) => {
    const costoVariableUnitario = costosVariablesUnitarios[index]
    const precio = precios[index]
    const mcUnitario = precio - costoVariableUnitario
    const mcTotal = mcUnitario * producto.cantidadVendida
    const ventas = precio * producto.cantidadVendida

    return { productoId: producto.id, costoVariableUnitario, precio, mcUnitario, mcTotal, ventas }
  })

  const mcTotalGlobal = porProducto.reduce((total, p) => total + p.mcTotal, 0)
  const ventasTotales = porProducto.reduce((total, p) => total + p.ventas, 0)

  return { porProducto, mcTotalGlobal, ventasTotales }
}

export function calcularPuntoEquilibrio(costosFijosTotales, mcTotalGlobal, ventasTotales) {
  const imc = ventasTotales > 0 ? mcTotalGlobal / ventasTotales : 0
  const peEnPesos = imc > 0 ? costosFijosTotales / imc : Infinity
  const resultadoOperativo = mcTotalGlobal - costosFijosTotales
  const cubreCostosFijos = resultadoOperativo >= 0

  return { imc, peEnPesos, resultadoOperativo, cubreCostosFijos }
}
