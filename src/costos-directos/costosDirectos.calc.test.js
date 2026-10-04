import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { calcularCostoDirecto } from './costosDirectos.calc'

describe('calcularCostoDirecto', () => {
  const resultado = calcularCostoDirecto(seedProductos, seedComprobantes)

  it('calcula el costo laboral total de cocineros y la tasa MOD por hora', () => {
    expect(resultado.costoLaboralCocineros).toBe(3550000)
    expect(resultado.horasTotales).toBe(400)
    expect(resultado.tasaMODPorHora).toBe(8875)
  })

  it('asigna materiales, MOD y costo directo unitario por producto', () => {
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(pollo.materiales).toBe(2800000)
    expect(pollo.modAsignada).toBe(887500)
    expect(pollo.costoDirectoTotal).toBe(3687500)
    expect(pollo.costoDirectoUnitario).toBe(7375)

    expect(empanadas.materiales).toBe(2060000)
    expect(empanadas.modAsignada).toBe(1242500)
    expect(empanadas.costoDirectoTotal).toBe(3302500)
    expect(empanadas.costoDirectoUnitario).toBe(8256.25)

    expect(milanesas.materiales).toBe(2700000)
    expect(milanesas.modAsignada).toBe(1420000)
    expect(milanesas.costoDirectoTotal).toBe(4120000)
    expect(milanesas.costoDirectoUnitario).toBeCloseTo(9155.555555555555, 6)
  })
})
