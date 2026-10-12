import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos, seedUtilidadObjetivo } from '../shared/seedData'
import { calcularCostoTotalUnitario } from '../costos-unitarios/costosUnitarios.calc'
import { calcularCostosFijosTotales } from '../gastos-fijos/gastosFijos.calc'
import { calcularPreciosSugeridos } from './precios.calc'

describe('calcularPreciosSugeridos', () => {
  const costosUnitarios = calcularCostoTotalUnitario(seedProductos, seedComprobantes)
  const costosVariablesUnitarios = costosUnitarios.porProducto.map((p) => p.costoVariableUnitario)
  const costosFijosTotales = calcularCostosFijosTotales(seedComprobantes)

  const resultado = calcularPreciosSugeridos(
    seedProductos,
    costosVariablesUnitarios,
    costosFijosTotales,
    seedUtilidadObjetivo
  )

  it('toma como costos fijos a repartir toda la estructura fija', () => {
    expect(costosFijosTotales).toBe(11100000)
  })

  it('calcula la contribución marginal unitaria mínima y deseada', () => {
    expect(resultado.unidadesTotales).toBe(1350)
    expect(resultado.contribucionMinima).toBeCloseTo(8222.222222222223, 6)
    expect(resultado.contribucionDeseada).toBeCloseTo(9222.222222222223, 6)
  })

  it('calcula el precio mínimo y sugerido por producto', () => {
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(pollo.precioMinimo).toBeCloseTo(13822.222222222223, 4)
    expect(pollo.precioSugerido).toBeCloseTo(14822.222222222223, 4)
    expect(empanadas.precioMinimo).toBeCloseTo(13372.222222222223, 4)
    expect(empanadas.precioSugerido).toBeCloseTo(14372.222222222223, 4)
    expect(milanesas.precioMinimo).toBeCloseTo(14222.222222222223, 4)
    expect(milanesas.precioSugerido).toBeCloseTo(15222.222222222223, 4)
  })

  it('los precios de competencia quedan por debajo del precio mínimo', () => {
    resultado.porProducto.forEach((fila) => {
      expect(fila.precioCompetencia).toBeLessThan(fila.precioMinimo)
    })
  })
})
