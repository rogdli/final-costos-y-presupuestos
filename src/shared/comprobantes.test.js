import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from './seedData'
import { TIPO, clasificar, esFijo, esVariable, sumarComprobantes } from './comprobantes'

describe('reglas de clasificación', () => {
  it('un comprobante con producto asociado es directo; sin producto es indirecto', () => {
    const { directos, indirectos } = clasificar(seedComprobantes, seedProductos)

    expect(directos).toHaveLength(9)
    expect(indirectos).toHaveLength(18)
    expect(sumarComprobantes(directos)).toBe(7560000)
    expect(sumarComprobantes(indirectos)).toBe(11100000)
  })

  it('el tipo funcional no define la asignación: un costo directo sin producto va al pool indirecto', () => {
    const comprobantes = [
      { numero: 1, importe: 100, productoId: null, tipoFuncional: TIPO.COSTO_DIRECTO, comportamiento: 'Variable' },
    ]
    const { directos, indirectos } = clasificar(comprobantes, seedProductos)

    expect(directos).toHaveLength(0)
    expect(indirectos).toHaveLength(1)
  })

  it('un comprobante que apunta a un producto inexistente no se pierde: pasa a indirecto', () => {
    const comprobantes = [
      { numero: 1, importe: 100, productoId: 'producto-borrado', tipoFuncional: TIPO.COSTO_DIRECTO, comportamiento: 'Variable' },
    ]
    const { directos, indirectos } = clasificar(comprobantes, seedProductos)

    expect(directos).toHaveLength(0)
    expect(sumarComprobantes(indirectos)).toBe(100)
  })

  it('el comportamiento separa fijos de variables', () => {
    expect(sumarComprobantes(seedComprobantes, esFijo)).toBe(11100000)
    expect(sumarComprobantes(seedComprobantes, esVariable)).toBe(7560000)
    expect(sumarComprobantes(seedComprobantes)).toBe(18660000)
  })
})
