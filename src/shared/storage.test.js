import { afterEach, describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { seedComprobantes, seedProductos } from './seedData'
import { cargarEstado, importarExcel } from './storage'

function archivoExcel(productos, comprobantes, parametros = []) {
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(productos), 'Productos')
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(comprobantes), 'Comprobantes')
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(parametros), 'Parametros')
  const buffer = XLSX.write(libro, { type: 'array', bookType: 'xlsx' })
  return { arrayBuffer: async () => buffer }
}

afterEach(() => localStorage.removeItem('costos-rotiseria:estado'))

describe('validación de datos externos', () => {
  it('rechaza cantidades e importes negativos importados con un mensaje de fila', async () => {
    const productoNegativo = { ...seedProductos[0], cantidadVendida: -1 }
    await expect(importarExcel(archivoExcel([productoNegativo], [])))
      .rejects.toThrow('Productos, fila 2, cantidad vendida: ingresá un número entero de 0 o más.')

    const comprobanteNegativo = { ...seedComprobantes[0], importe: -500 }
    await expect(importarExcel(archivoExcel([seedProductos[0]], [comprobanteNegativo])))
      .rejects.toThrow('Comprobantes, fila 2, importe: ingresá un número mayor que cero.')
  })

  it('rechaza costos directos sin producto y utilidades objetivo negativas en Excel', async () => {
    const sinProducto = { ...seedComprobantes[0], productoId: '' }
    await expect(importarExcel(archivoExcel([seedProductos[0]], [sinProducto])))
      .rejects.toThrow('Comprobantes, fila 2: un costo directo necesita un producto asociado.')

    await expect(importarExcel(archivoExcel([seedProductos[0]], [seedComprobantes[0]], [
      { metodoCif: 'horas', utilidadObjetivo: -1 },
    ]))).rejects.toThrow('Parametros, utilidad objetivo: ingresá un número de 0 o más.')
  })

  it('corrige valores negativos guardados antes de abrir la app', () => {
    localStorage.setItem('costos-rotiseria:estado', JSON.stringify({
      productos: [{ ...seedProductos[0], cantidadVendida: -5, precioCompetencia: -100 }],
      comprobantes: [{ ...seedComprobantes[0], importe: -50 }],
      utilidadObjetivo: -1000,
      overrides: { precios: { 'pollo-asado': -10 }, cantidades: { 'pollo-asado': -2 }, ajusteFijos: -150 },
    }))

    const estado = cargarEstado()
    expect(estado.productos[0].cantidadVendida).toBe(0)
    expect(estado.productos[0].precioCompetencia).toBe(0)
    expect(estado.comprobantes[0].importe).toBe(0)
    expect(estado.utilidadObjetivo).toBe(0)
    expect(estado.overrides.precios).toEqual({})
    expect(estado.overrides.cantidades).toEqual({})
    expect(estado.overrides.ajusteFijos).toBe(-100)
    expect(estado.avisoDatosCorregidos).toMatch(/Se corrigieron datos negativos/)
  })
})
