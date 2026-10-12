import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos } from '../shared/seedData'
import { TIPO } from '../shared/comprobantes'
import { calcularCostoDirecto } from './costosDirectos.calc'

describe('calcularCostoDirecto', () => {
  const resultado = calcularCostoDirecto(seedProductos, seedComprobantes)

  it('solo imputa a cada producto los comprobantes que lo tienen asociado', () => {
    const [pollo, empanadas, milanesas] = resultado.porProducto

    expect(pollo.materiales).toBe(2800000)
    expect(pollo.costoDirectoTotal).toBe(2800000)
    expect(pollo.costoDirectoUnitario).toBe(5600)

    expect(empanadas.materiales).toBe(2060000)
    expect(empanadas.costoDirectoUnitario).toBe(5150)

    expect(milanesas.materiales).toBe(2700000)
    expect(milanesas.costoDirectoUnitario).toBe(6000)
  })

  it('deja fuera la mano de obra cargada como general y la reporta aparte', () => {
    expect(resultado.manoObraDirecta).toBe(0)
    expect(resultado.manoObraGeneral).toBe(3550000)
    expect(resultado.totalDirecto).toBe(7560000)
    expect(resultado.horasTotales).toBe(400)
  })

  it('separa la parte variable de la fija del costo directo', () => {
    expect(resultado.totalDirectoVariable).toBe(7560000)
    expect(resultado.totalDirectoFijo).toBe(0)
  })

  it('con la apertura de mano de obra directa reproduce el criterio de la cátedra', () => {
    // La alternativa al criterio simplificado: la mano de obra se clasifica como
    // directa y se asigna a cada producto según sus horas de producción
    // (tasa 8875/hora sobre 400 horas).
    const conModDirecta = [
      ...seedComprobantes.filter((c) => c.tipoFuncional !== TIPO.MANO_OBRA_INDIRECTA),
      { numero: 28, concepto: 'MOD pollo', importe: 887500, productoId: 'pollo-asado', tipoFuncional: TIPO.MANO_OBRA_DIRECTA, comportamiento: 'Variable' },
      { numero: 29, concepto: 'MOD empanadas', importe: 1242500, productoId: 'docena-empanadas', tipoFuncional: TIPO.MANO_OBRA_DIRECTA, comportamiento: 'Variable' },
      { numero: 30, concepto: 'MOD milanesas', importe: 1420000, productoId: 'milanesa-guarnicion', tipoFuncional: TIPO.MANO_OBRA_DIRECTA, comportamiento: 'Variable' },
    ]

    const [pollo, empanadas, milanesas] = calcularCostoDirecto(seedProductos, conModDirecta).porProducto

    expect(pollo.manoObra).toBe(887500)
    expect(pollo.costoDirectoUnitario).toBe(7375)
    expect(empanadas.costoDirectoUnitario).toBe(8256.25)
    expect(milanesas.costoDirectoUnitario).toBeCloseTo(9155.555555555555, 6)
  })
})
