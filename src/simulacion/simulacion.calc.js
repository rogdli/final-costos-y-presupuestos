import { calcularCostoDirecto } from '../costos-directos/costosDirectos.calc'
import { calcularCif, calcularCifTotal, METODO_CIF } from '../cif/cif.calc'
import { calcularCostoTotalUnitario } from '../costos-unitarios/costosUnitarios.calc'
import { calcularGastosFijos } from '../gastos-fijos/gastosFijos.calc'
import { calcularMargenContribucion, calcularPuntoEquilibrio } from '../punto-equilibrio/puntoEquilibrio.calc'
import { calcularPreciosSugeridos } from '../precios/precios.calc'

export function calcularCasoCompleto(
  productos,
  comprobantes,
  { metodoCif = METODO_CIF.UNIDADES, utilidadObjetivo = 0 } = {}
) {
  const costoDirecto = calcularCostoDirecto(productos, comprobantes)
  const cif = calcularCif(productos, comprobantes, metodoCif)
  const costosUnitarios = calcularCostoTotalUnitario(productos, comprobantes, metodoCif)

  const cifTotal = calcularCifTotal(comprobantes)
  const gastosFijosTotales = calcularGastosFijos(comprobantes)
  const costosFijosTotales = cifTotal + gastosFijosTotales

  const costosVariablesUnitarios = costoDirecto.porProducto.map((p) => p.costoDirectoUnitario)
  const precios = productos.map((p) => p.precioCompetencia)

  const margen = calcularMargenContribucion(productos, costosVariablesUnitarios, precios)
  const puntoEquilibrio = calcularPuntoEquilibrio(costosFijosTotales, margen.mcTotalGlobal, margen.ventasTotales)
  const preciosSugeridos = calcularPreciosSugeridos(
    productos,
    costosVariablesUnitarios,
    costosFijosTotales,
    utilidadObjetivo
  )

  return {
    costoDirecto,
    cif,
    costosUnitarios,
    cifTotal,
    gastosFijosTotales,
    costosFijosTotales,
    margen,
    puntoEquilibrio,
    preciosSugeridos,
  }
}

export function simular(productosBase, comprobantes, overrides = {}) {
  const { precios = {}, cantidades = {}, metodoCif = METODO_CIF.UNIDADES, utilidadObjetivo = 0 } = overrides

  const productosSimulados = productosBase.map((producto) => ({
    ...producto,
    precioCompetencia: precios[producto.id] ?? producto.precioCompetencia,
    cantidadVendida: cantidades[producto.id] ?? producto.cantidadVendida,
  }))

  return calcularCasoCompleto(productosSimulados, comprobantes, { metodoCif, utilidadObjetivo })
}
