import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { calcularCostoTotalUnitario } from '../costos-unitarios/costosUnitarios.calc'
import { calcularCostosFijosTotales } from '../gastos-fijos/gastosFijos.calc'
import { calcularMargenContribucion, calcularPePorProducto, calcularPuntoEquilibrio } from './puntoEquilibrio.calc'

describe('punto de equilibrio con precios de competencia', () => {
  const costosUnitarios = calcularCostoTotalUnitario(seedProductos, seedComprobantes)
  const costosVariablesUnitarios = costosUnitarios.porProducto.map((p) => p.costoVariableUnitario)
  const precios = seedProductos.map((p) => p.precioCompetencia)
  const margen = calcularMargenContribucion(seedProductos, costosVariablesUnitarios, precios)
  const costosFijosTotales = calcularCostosFijosTotales(seedComprobantes)
  const pe = calcularPuntoEquilibrio(costosFijosTotales, margen.mcTotalGlobal, margen.ventasTotales)

  it('calcula el margen de contribución unitario y total por producto', () => {
    const [pollo, empanadas, milanesas] = margen.porProducto

    expect(pollo.mcUnitario).toBe(2900)
    expect(pollo.mcTotal).toBe(1450000)
    expect(empanadas.mcUnitario).toBe(4350)
    expect(empanadas.mcTotal).toBe(1740000)
    expect(milanesas.mcUnitario).toBe(4500)
    expect(milanesas.mcTotal).toBe(2025000)
  })

  it('calcula ventas, costo variable y margen de contribución totales', () => {
    expect(margen.ventasTotales).toBe(12775000)
    expect(margen.costoVariableTotal).toBe(7560000)
    expect(margen.mcTotalGlobal).toBe(5215000)
  })

  it('determina que los precios de competencia NO cubren los costos fijos', () => {
    expect(costosFijosTotales).toBe(11100000)
    expect(pe.imc).toBeCloseTo(0.40821917808219177, 6)
    expect(pe.peEnPesos).toBeCloseTo(27191275.167785235, 0)
    expect(pe.alcanzable).toBe(true)
    expect(pe.resultadoOperativo).toBe(-5885000)
    expect(pe.cubreCostosFijos).toBe(false)
  })

  it('abre el punto de equilibrio por producto según el mix de ventas', () => {
    const [pollo, empanadas, milanesas] = calcularPePorProducto(pe.peEnPesos, margen)

    expect(pollo.participacion).toBeCloseTo(0.33268101761252444, 6)
    expect(pollo.peEnPesos).toBeCloseTo(9046021.093000958, 0)
    expect(pollo.peEnUnidades).toBeCloseTo(1064.2377756471715, 3)
    expect(empanadas.peEnPesos).toBeCloseTo(8088207.094918503, 0)
    expect(milanesas.peEnPesos).toBeCloseTo(10057046.97986577, 0)

    const suma = [pollo, empanadas, milanesas].reduce((total, p) => total + p.peEnPesos, 0)
    expect(suma).toBeCloseTo(pe.peEnPesos, 3)
  })

  it('sin margen de contribución positivo el punto de equilibrio no es alcanzable', () => {
    const sinMargen = calcularPuntoEquilibrio(11100000, -500000, 12775000)

    expect(sinMargen.alcanzable).toBe(false)
    expect(sinMargen.peEnPesos).toBeNull()
    expect(calcularPePorProducto(sinMargen.peEnPesos, margen)[0].peEnPesos).toBeNull()
  })
})
