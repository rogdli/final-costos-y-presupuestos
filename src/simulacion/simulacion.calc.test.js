import { describe, expect, it } from 'vitest'
import { seedComprobantes, seedProductos, seedUtilidadObjetivo } from '../shared/seedData'
import { METODO_CIF } from '../cif/cif.calc'
import { calcularCasoCompleto, simular } from './simulacion.calc'

describe('calcularCasoCompleto', () => {
  const resultado = calcularCasoCompleto(seedProductos, seedComprobantes, {
    utilidadObjetivo: seedUtilidadObjetivo,
  })

  it('reproduce el caso base: con precios de competencia no se cubren los costos fijos', () => {
    expect(resultado.costosFijosTotales).toBe(11100000)
    expect(resultado.puntoEquilibrio.peEnPesos).toBeCloseTo(27191275.167785235, 0)
    expect(resultado.puntoEquilibrio.resultadoOperativo).toBe(-5885000)
    expect(resultado.puntoEquilibrio.cubreCostosFijos).toBe(false)
  })

  it('no deja plata sin asignar', () => {
    expect(resultado.control.totalCargado).toBe(18660000)
    expect(resultado.control.totalAsignado).toBeCloseTo(18660000, 3)
    expect(resultado.control.diferencia).toBeCloseTo(0, 6)
    expect(resultado.control.completo).toBe(true)
  })

  it('cierra la ecuación: ingresos - costo variable - costos fijos = resultado operativo', () => {
    const resultadoEsperado = resultado.ingresosTotales - resultado.costoVariableTotal - resultado.costosFijosTotales
    expect(resultado.puntoEquilibrio.resultadoOperativo).toBeCloseTo(resultadoEsperado, 3)
  })

  it('avisa cuando el driver no puede repartir el pool indirecto', () => {
    const productosSinDriver = seedProductos.map((p) => ({ ...p, cantidadVendida: 0, horasProduccion: 0 }))
    const sinDriver = calcularCasoCompleto(productosSinDriver, seedComprobantes, { metodoCif: METODO_CIF.HORAS })

    expect(sinDriver.control.completo).toBe(false)
    expect(sinDriver.control.baseDriverEnCero).toBe(true)
    expect(sinDriver.control.diferencia).toBeCloseTo(11100000, 3)
  })
})

describe('simular', () => {
  it('al aplicar los precios sugeridos, el resultado operativo iguala la utilidad objetivo', () => {
    const base = calcularCasoCompleto(seedProductos, seedComprobantes, { utilidadObjetivo: seedUtilidadObjetivo })
    const precios = Object.fromEntries(base.preciosSugeridos.porProducto.map((p) => [p.productoId, p.precioSugerido]))

    const simulado = simular(seedProductos, seedComprobantes, { precios, utilidadObjetivo: seedUtilidadObjetivo })

    expect(simulado.puntoEquilibrio.resultadoOperativo).toBeCloseTo(seedUtilidadObjetivo, 3)
    expect(simulado.puntoEquilibrio.cubreCostosFijos).toBe(true)
  })

  it('al subir el precio baja el punto de equilibrio', () => {
    const base = calcularCasoCompleto(seedProductos, seedComprobantes)
    const simulado = simular(seedProductos, seedComprobantes, { precios: { 'pollo-asado': 12000 } })

    expect(simulado.puntoEquilibrio.peEnPesos).toBeLessThan(base.puntoEquilibrio.peEnPesos)
  })

  it('el ajuste de costos fijos solo mueve la estructura fija', () => {
    const simulado = simular(seedProductos, seedComprobantes, { ajusteFijos: 10 })

    expect(simulado.costosFijosTotales).toBeCloseTo(12210000, 3)
    expect(simulado.costoVariableTotal).toBe(7560000)
  })

  it('el ajuste de costos variables solo mueve el costo variable', () => {
    const simulado = simular(seedProductos, seedComprobantes, { ajusteVariables: 10 })

    expect(simulado.costosFijosTotales).toBe(11100000)
    expect(simulado.costoVariableTotal).toBeCloseTo(8316000, 3)
  })

  it('no muta los productos ni los comprobantes originales', () => {
    const precioOriginal = seedProductos[0].precioCompetencia
    const importeOriginal = seedComprobantes[0].importe

    simular(seedProductos, seedComprobantes, { precios: { [seedProductos[0].id]: 99999 }, ajusteVariables: 50 })

    expect(seedProductos[0].precioCompetencia).toBe(precioOriginal)
    expect(seedComprobantes[0].importe).toBe(importeOriginal)
  })

  it('ignora precios y cantidades negativos y no deja que una baja de costos pase de cero', () => {
    const base = calcularCasoCompleto(seedProductos, seedComprobantes)
    const simulado = simular(seedProductos, seedComprobantes, {
      precios: { [seedProductos[0].id]: -100 },
      cantidades: { [seedProductos[0].id]: -5 },
      ajusteVariables: -200,
    })

    expect(simulado.ingresosTotales).toBe(base.ingresosTotales)
    expect(simulado.costoVariableTotal).toBe(0)
    expect(simulado.costosFijosTotales).toBe(base.costosFijosTotales)
  })
})
