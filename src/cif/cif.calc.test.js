import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { TIPO } from '../shared/comprobantes'
import { calcularCif, calcularCifTotal, METODO_CIF } from './cif.calc'

describe('pool de costos indirectos', () => {
  it('reúne todo lo cargado sin producto asociado, cualquiera sea el tipo funcional', () => {
    expect(calcularCifTotal(seedComprobantes, seedProductos)).toBe(11100000)

    const { porTipo } = calcularCif(seedProductos, seedComprobantes, METODO_CIF.HORAS)
    expect(porTipo).toEqual([
      { tipoFuncional: TIPO.CIF, importe: 4450000 },
      { tipoFuncional: TIPO.MANO_OBRA_INDIRECTA, importe: 3550000 },
      { tipoFuncional: TIPO.GASTO_ADM, importe: 3100000 },
    ])
  })

  it('reparte por horas de producción', () => {
    const resultado = calcularCif(seedProductos, seedComprobantes, METODO_CIF.HORAS)
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(resultado.base).toBe(400)
    expect(resultado.tasa).toBe(27750)
    expect(pollo.cifAsignado).toBe(2775000)
    expect(pollo.cifUnitario).toBe(5550)
    expect(empanadas.cifAsignado).toBe(3885000)
    expect(empanadas.cifUnitario).toBe(9712.5)
    expect(milanesas.cifAsignado).toBe(4440000)
    expect(milanesas.cifUnitario).toBeCloseTo(9866.666666666666, 6)
  })

  it('reparte por unidades vendidas (mismo unitario para todos los productos)', () => {
    const resultado = calcularCif(seedProductos, seedComprobantes, METODO_CIF.UNIDADES)
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(resultado.base).toBe(1350)
    expect(resultado.tasa).toBeCloseTo(8222.222222222223, 6)
    expect(pollo.cifAsignado).toBeCloseTo(4111111.111111111, 3)
    expect(empanadas.cifAsignado).toBeCloseTo(3288888.888888889, 3)
    expect(milanesas.cifAsignado).toBe(3700000)
    expect(pollo.cifUnitario).toBeCloseTo(8222.222222222223, 6)
    expect(milanesas.cifUnitario).toBeCloseTo(8222.222222222223, 6)
  })

  it('reparte el pool completo con cualquiera de los dos drivers', () => {
    for (const metodo of [METODO_CIF.HORAS, METODO_CIF.UNIDADES]) {
      const resultado = calcularCif(seedProductos, seedComprobantes, metodo)
      expect(resultado.cifAsignadoTotal).toBeCloseTo(11100000, 3)
      expect(resultado.cifSinAsignar).toBeCloseTo(0, 6)
    }
  })

  it('separa la parte fija de la variable del pool', () => {
    const resultado = calcularCif(seedProductos, seedComprobantes, METODO_CIF.HORAS)

    expect(resultado.cifFijo).toBe(11100000)
    expect(resultado.cifVariable).toBe(0)
    expect(resultado.porProducto[0].cifVariableUnitario).toBe(0)
  })

  it('con solo los CIF de fábrica en el pool reproduce las tasas de la cátedra', () => {
    // Criterio de la resolución de cátedra, que deja los gastos de
    // administración y ventas fuera del reparto (consigna 15: comparación).
    const soloFabrica = seedComprobantes.filter((c) => c.tipoFuncional === TIPO.CIF || c.productoId)

    expect(calcularCif(seedProductos, soloFabrica, METODO_CIF.UNIDADES).tasa).toBeCloseTo(3296.296296296296, 6)
    expect(calcularCif(seedProductos, soloFabrica, METODO_CIF.HORAS).tasa).toBe(11125)
  })

  it('si no hay unidades ni horas cargadas, avisa que no pudo repartir', () => {
    const productosSinDriver = seedProductos.map((p) => ({ ...p, cantidadVendida: 0, horasProduccion: 0 }))
    const resultado = calcularCif(productosSinDriver, seedComprobantes, METODO_CIF.HORAS)

    expect(resultado.tasa).toBe(0)
    expect(resultado.cifSinAsignar).toBe(11100000)
  })
})
