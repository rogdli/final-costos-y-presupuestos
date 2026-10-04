import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos, seedUtilidadObjetivo } from '../shared/seedData'
import { calcularCostoDirecto } from '../costos-directos/costosDirectos.calc'
import { calcularPreciosSugeridos } from './precios.calc'

describe('calcularPreciosSugeridos', () => {
  const costoDirecto = calcularCostoDirecto(seedProductos, seedComprobantes)
  const costosVariablesUnitarios = costoDirecto.porProducto.map((p) => p.costoDirectoUnitario)
  const costosFijosTotales = 7550000

  const resultado = calcularPreciosSugeridos(
    seedProductos,
    costosVariablesUnitarios,
    costosFijosTotales,
    seedUtilidadObjetivo
  )

  it('calcula la contribución marginal unitaria mínima y deseada', () => {
    expect(resultado.contribucionMinima).toBeCloseTo(5592.592592592592, 6)
    expect(resultado.contribucionDeseada).toBeCloseTo(6592.592592592592, 6)
  })

  it('calcula el precio mínimo y sugerido por producto', () => {
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(pollo.precioMinimo).toBeCloseTo(12967.592592592591, 4)
    expect(pollo.precioSugerido).toBeCloseTo(13967.592592592591, 4)
    expect(empanadas.precioMinimo).toBeCloseTo(13848.842592592591, 4)
    expect(empanadas.precioSugerido).toBeCloseTo(14848.842592592591, 4)
    expect(milanesas.precioMinimo).toBeCloseTo(14748.148148148146, 4)
    expect(milanesas.precioSugerido).toBeCloseTo(15748.148148148146, 4)
  })
})
