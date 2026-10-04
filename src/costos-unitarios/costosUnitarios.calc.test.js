import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { METODO_CIF } from '../cif/cif.calc'
import { calcularCostoTotalUnitario } from './costosUnitarios.calc'

describe('calcularCostoTotalUnitario', () => {
  it('con CIF por unidades vendidas', () => {
    const { porProducto } = calcularCostoTotalUnitario(seedProductos, seedComprobantes, METODO_CIF.UNIDADES)

    expect(porProducto[0].costoTotalUnitario).toBeCloseTo(10671.296296296296, 6)
    expect(porProducto[1].costoTotalUnitario).toBeCloseTo(11552.546296296296, 6)
    expect(porProducto[2].costoTotalUnitario).toBeCloseTo(12451.85185185185, 6)
  })

  it('con CIF por horas de producción', () => {
    const { porProducto } = calcularCostoTotalUnitario(seedProductos, seedComprobantes, METODO_CIF.HORAS)

    expect(porProducto[0].costoTotalUnitario).toBe(9600)
    expect(porProducto[1].costoTotalUnitario).toBe(12150)
    expect(porProducto[2].costoTotalUnitario).toBeCloseTo(13111.11111111111, 6)
  })
})
