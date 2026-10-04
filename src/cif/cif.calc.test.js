import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { calcularCif, calcularCifTotal, METODO_CIF } from './cif.calc'

describe('calcularCif', () => {
  it('calcula el total de CIF fijos', () => {
    expect(calcularCifTotal(seedComprobantes)).toBe(4450000)
  })

  it('asigna CIF por unidades vendidas (mismo unitario para todos los productos)', () => {
    const resultado = calcularCif(seedProductos, seedComprobantes, METODO_CIF.UNIDADES)
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(resultado.tasa).toBeCloseTo(3296.296296296296, 6)
    expect(pollo.cifAsignado).toBeCloseTo(1648148.148148148, 3)
    expect(pollo.cifUnitario).toBeCloseTo(3296.296296296296, 6)
    expect(empanadas.cifAsignado).toBeCloseTo(1318518.5185185184, 3)
    expect(milanesas.cifAsignado).toBeCloseTo(1483333.3333333333, 3)
  })

  it('asigna CIF por horas de producción (unitario distinto por producto)', () => {
    const resultado = calcularCif(seedProductos, seedComprobantes, METODO_CIF.HORAS)
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(resultado.tasa).toBe(11125)
    expect(pollo.cifAsignado).toBe(1112500)
    expect(pollo.cifUnitario).toBe(2225)
    expect(empanadas.cifAsignado).toBe(1557500)
    expect(empanadas.cifUnitario).toBe(3893.75)
    expect(milanesas.cifAsignado).toBe(1780000)
    expect(milanesas.cifUnitario).toBeCloseTo(3955.5555555555557, 6)
  })
})
