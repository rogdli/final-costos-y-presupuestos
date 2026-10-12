import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { METODO_CIF } from '../cif/cif.calc'
import { calcularCostoTotalUnitario } from './costosUnitarios.calc'

describe('calcularCostoTotalUnitario', () => {
  it('suma costo directo e indirecto unitario con el driver de horas', () => {
    const { porProducto } = calcularCostoTotalUnitario(seedProductos, seedComprobantes, METODO_CIF.HORAS)

    expect(porProducto[0].costoTotalUnitario).toBe(11150)
    expect(porProducto[1].costoTotalUnitario).toBe(14862.5)
    expect(porProducto[2].costoTotalUnitario).toBeCloseTo(15866.666666666666, 6)
  })

  it('suma costo directo e indirecto unitario con el driver de unidades', () => {
    const { porProducto } = calcularCostoTotalUnitario(seedProductos, seedComprobantes, METODO_CIF.UNIDADES)

    expect(porProducto[0].costoTotalUnitario).toBeCloseTo(13822.222222222223, 6)
    expect(porProducto[1].costoTotalUnitario).toBeCloseTo(13372.222222222223, 6)
    expect(porProducto[2].costoTotalUnitario).toBeCloseTo(14222.222222222223, 6)
  })

  it('el costo variable unitario deja afuera lo fijo, con cualquier driver', () => {
    for (const metodo of [METODO_CIF.HORAS, METODO_CIF.UNIDADES]) {
      const { porProducto } = calcularCostoTotalUnitario(seedProductos, seedComprobantes, metodo)

      expect(porProducto[0].costoVariableUnitario).toBe(5600)
      expect(porProducto[1].costoVariableUnitario).toBe(5150)
      expect(porProducto[2].costoVariableUnitario).toBe(6000)
    }
  })

  it('el costo total de todos los productos iguala el total de comprobantes cargados', () => {
    for (const metodo of [METODO_CIF.HORAS, METODO_CIF.UNIDADES]) {
      const { porProducto } = calcularCostoTotalUnitario(seedProductos, seedComprobantes, metodo)
      const total = porProducto.reduce((acum, p) => acum + p.costoTotal, 0)

      expect(total).toBeCloseTo(18660000, 3)
    }
  })
})
