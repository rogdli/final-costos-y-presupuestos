import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos, seedUtilidadObjetivo } from '../shared/seedData'
import { METODO_CIF } from '../cif/cif.calc'
import { calcularCasoCompleto, simular } from './simulacion.calc'

describe('calcularCasoCompleto', () => {
  it('reproduce el caso base: con precios de competencia no se cubren los costos fijos', () => {
    const resultado = calcularCasoCompleto(seedProductos, seedComprobantes, {
      metodoCif: METODO_CIF.UNIDADES,
      utilidadObjetivo: seedUtilidadObjetivo,
    })

    expect(resultado.costosFijosTotales).toBe(7550000)
    expect(resultado.puntoEquilibrio.resultadoOperativo).toBeCloseTo(-5885000, 3)
    expect(resultado.puntoEquilibrio.cubreCostosFijos).toBe(false)
  })
})

describe('simular', () => {
  it('al aplicar los precios sugeridos, el resultado operativo iguala la utilidad objetivo', () => {
    const base = calcularCasoCompleto(seedProductos, seedComprobantes, { utilidadObjetivo: seedUtilidadObjetivo })
    const precios = Object.fromEntries(
      base.preciosSugeridos.porProducto.map((p) => [p.productoId, p.precioSugerido])
    )

    const simulado = simular(seedProductos, seedComprobantes, {
      precios,
      utilidadObjetivo: seedUtilidadObjetivo,
    })

    expect(simulado.puntoEquilibrio.resultadoOperativo).toBeCloseTo(seedUtilidadObjetivo, 3)
    expect(simulado.puntoEquilibrio.cubreCostosFijos).toBe(true)
  })

  it('no muta los productos originales', () => {
    const originalPrecio = seedProductos[0].precioCompetencia
    simular(seedProductos, seedComprobantes, { precios: { [seedProductos[0].id]: 99999 } })
    expect(seedProductos[0].precioCompetencia).toBe(originalPrecio)
  })
})
