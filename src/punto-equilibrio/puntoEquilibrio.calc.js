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
  const costoVariableTotal = porProducto.reduce(
    (total, p, i) => total + p.costoVariableUnitario * productos[i].cantidadVendida,
    0
  )

  return { porProducto, mcTotalGlobal, ventasTotales, costoVariableTotal }
}

/**
 * Punto de equilibrio en pesos = costos fijos / índice de margen de contribución.
 *
 * Si el margen de contribución es cero o negativo no existe nivel de ventas que
 * cubra los fijos: `peEnPesos` queda en null y `alcanzable` en false, en lugar
 * de mostrar un infinito.
 */
export function calcularPuntoEquilibrio(costosFijosTotales, mcTotalGlobal, ventasTotales) {
  const imc = ventasTotales > 0 ? mcTotalGlobal / ventasTotales : 0
  const alcanzable = imc > 0
  const peEnPesos = alcanzable ? costosFijosTotales / imc : null
  const resultadoOperativo = mcTotalGlobal - costosFijosTotales

  return {
    imc,
    alcanzable,
    peEnPesos,
    resultadoOperativo,
    cubreCostosFijos: resultadoOperativo >= 0,
  }
}

/**
 * Apertura del punto de equilibrio por producto según el mix de ventas: cada
 * producto tiene que facturar su participación del PE total.
 */
export function calcularPePorProducto(peEnPesos, margen) {
  return margen.porProducto.map((fila) => {
    const participacion = margen.ventasTotales > 0 ? fila.ventas / margen.ventasTotales : 0
    const pePesos = peEnPesos === null ? null : peEnPesos * participacion

    return {
      productoId: fila.productoId,
      participacion,
      peEnPesos: pePesos,
      peEnUnidades: pePesos === null || fila.precio <= 0 ? null : pePesos / fila.precio,
    }
  })
}
