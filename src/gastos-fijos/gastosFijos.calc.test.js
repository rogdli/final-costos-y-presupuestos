import { describe, expect, it } from 'vitest'
import { seedComprobantes } from '../shared/seedData'
import { calcularGastosFijos } from './gastosFijos.calc'

describe('calcularGastosFijos', () => {
  it('suma los gastos fijos de administración y ventas', () => {
    expect(calcularGastosFijos(seedComprobantes)).toBe(3100000)
  })
})
