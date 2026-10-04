import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { calcularCostoDirecto } from '../costos-directos/costosDirectos.calc'
import { calcularCifTotal } from '../cif/cif.calc'
import { calcularGastosFijos } from '../gastos-fijos/gastosFijos.calc'
import { calcularMargenContribucion, calcularPuntoEquilibrio } from './puntoEquilibrio.calc'

describe('punto de equilibrio con precios de competencia', () => {
  const costoDirecto = calcularCostoDirecto(seedProductos, seedComprobantes)
  const costosVariablesUnitarios = costoDirecto.porProducto.map((p) => p.costoDirectoUnitario)
  const precios = seedProductos.map((p) => p.precioCompetencia)
  const margen = calcularMargenContribucion(seedProductos, costosVariablesUnitarios, precios)

  it('calcula el margen de contribución unitario y total por producto', () => {
    const [pollo, empanadas, milanesas] = margen.porProducto

    expect(pollo.mcUnitario).toBe(1125)
    expect(pollo.mcTotal).toBe(562500)
    expect(empanadas.mcUnitario).toBe(1243.75)
    expect(empanadas.mcTotal).toBe(497500)
    expect(milanesas.mcUnitario).toBeCloseTo(1344.4444444444453, 6)
    expect(milanesas.mcTotal).toBeCloseTo(605000, 3)
  })

  it('calcula el margen de contribución total y las ventas totales', () => {
    expect(margen.mcTotalGlobal).toBeCloseTo(1665000, 3)
    expect(margen.ventasTotales).toBe(12775000)
  })

  it('determina que los precios de competencia NO cubren los costos fijos', () => {
    const cifTotal = calcularCifTotal(seedComprobantes)
    const gastosFijos = calcularGastosFijos(seedComprobantes)
    const costosFijosTotales = cifTotal + gastosFijos
    expect(costosFijosTotales).toBe(7550000)

    const pe = calcularPuntoEquilibrio(costosFijosTotales, margen.mcTotalGlobal, margen.ventasTotales)

    expect(pe.imc).toBeCloseTo(0.13033268101761253, 6)
    expect(pe.peEnPesos).toBeCloseTo(57928678.67867868, 0)
    expect(pe.resultadoOperativo).toBeCloseTo(-5885000, 3)
    expect(pe.cubreCostosFijos).toBe(false)
  })
})
