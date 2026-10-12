import { describe, expect, it } from 'vitest'
import { seedComprobantes } from '../shared/seedData'
import { TIPO } from '../shared/comprobantes'
import { calcularCostosFijosTotales, calcularDesgloseFijos, calcularGastosFijos } from './gastosFijos.calc'

describe('costos fijos', () => {
  it('suma los gastos de administración y ventas del período', () => {
    expect(calcularGastosFijos(seedComprobantes)).toBe(3100000)
  })

  it('los costos fijos totales salen del comportamiento, no del tipo funcional', () => {
    expect(calcularCostosFijosTotales(seedComprobantes)).toBe(11100000)
  })

  it('una comisión variable de ventas no suma a los costos fijos', () => {
    const conComision = [
      ...seedComprobantes,
      { numero: 28, concepto: 'Comisiones de delivery', importe: 500000, productoId: null, tipoFuncional: TIPO.GASTO_ADM, comportamiento: 'Variable' },
    ]

    expect(calcularGastosFijos(conComision)).toBe(3600000)
    expect(calcularCostosFijosTotales(conComision)).toBe(11100000)
  })

  it('desglosa los fijos por tipo funcional', () => {
    expect(calcularDesgloseFijos(seedComprobantes)).toEqual([
      { tipoFuncional: TIPO.CIF, importe: 4450000 },
      { tipoFuncional: TIPO.MANO_OBRA_INDIRECTA, importe: 3550000 },
      { tipoFuncional: TIPO.GASTO_ADM, importe: 3100000 },
    ])
  })
})
