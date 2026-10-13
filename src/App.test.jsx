import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'

const SECCIONES = [
  'Productos',
  'Comprobantes',
  'Costos directos',
  'Indirectos',
  'Costos fijos',
  'Costos unitarios',
  'Precios',
  'Punto de equilibrio',
  'Simulador',
]

function irA(seccion) {
  fireEvent.click(screen.getByRole('button', { name: seccion }))
}

describe('App', () => {
  it('renderiza todas las secciones sin errores', () => {
    render(<App />)

    for (const seccion of SECCIONES) {
      irA(seccion)
      expect(screen.getByRole('heading', { level: 1, name: seccion })).toBeInTheDocument()
    }
  })

  it('muestra el control de asignación completo en Comprobantes', () => {
    render(<App />)
    irA('Comprobantes')

    expect(screen.getByText(/Todo asignado/)).toBeInTheDocument()
  })

  it('muestra el punto de equilibrio y la alerta de cobertura del caso base', () => {
    render(<App />)
    irA('Punto de equilibrio')

    expect(screen.getByText('Punto de equilibrio en $')).toBeInTheDocument()
    expect(screen.getByText(/No cubre los costos fijos/)).toBeInTheDocument()
  })

  it('el simulador muestra el tablero con el punto de equilibrio del escenario', () => {
    render(<App />)
    irA('Simulador')

    expect(screen.getByText('Ingreso total')).toBeInTheDocument()
    expect(screen.getByText('Costo fijo total')).toBeInTheDocument()
    expect(screen.getByText('Punto de equilibrio en $')).toBeInTheDocument()
  })

  it('indica qué falta al agregar un producto y rechaza cantidades negativas', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))

    expect(screen.getByText('Escribí el nombre del producto.')).toBeInTheDocument()
    expect(screen.getByText('Completá la cantidad vendida.')).toBeInTheDocument()
    expect(screen.getByText('Completá las horas de producción.')).toBeInTheDocument()
    expect(screen.getByText('Completá el precio de referencia.')).toBeInTheDocument()

    const cantidad = screen.getByRole('spinbutton', { name: 'Cantidad vendida' })
    fireEvent.change(cantidad, { target: { value: '-5' } })
    expect(cantidad.value).toBe('')
    expect(screen.getByText('No puede ser negativo.')).toBeInTheDocument()
  })

  it('permite agregar un producto cuando están completos los datos válidos', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Tarta' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Cantidad vendida' }), { target: { value: '12' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Horas de producción' }), { target: { value: '3.5' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Precio competencia' }), { target: { value: '2500' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))

    expect(screen.getByRole('row', { name: /Tarta 12 3,5/ })).toBeInTheDocument()
    expect(screen.queryByText('Revisá los campos marcados para agregar el producto.')).not.toBeInTheDocument()
  })

  it('exige importe y producto en costos directos, y no guarda un importe negativo', () => {
    render(<App />)
    irA('Comprobantes')
    fireEvent.click(screen.getByRole('button', { name: 'Agregar comprobante' }))

    expect(screen.getByText('Escribí qué gasto o compra estás cargando.')).toBeInTheDocument()
    expect(screen.getByText('Completá el importe.')).toBeInTheDocument()
    expect(screen.getByText('Elegí el producto al que corresponde este costo directo.')).toBeInTheDocument()

    const importe = screen.getByRole('spinbutton', { name: 'Importe' })
    fireEvent.change(importe, { target: { value: '-100' } })
    expect(importe.value).toBe('')
    expect(screen.getByText('No puede ser negativo.')).toBeInTheDocument()
  })

  it('reclasifica los costos directos cuando se elimina su producto', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Pollo asado' }))
    irA('Comprobantes')

    const fila = screen.getByText('Compra de pollos frescos').closest('tr')
    expect(within(fila).getByText('CIF')).toBeInTheDocument()
    expect(within(fila).getByText('General')).toBeInTheDocument()
  })

  it('rechaza cantidades simuladas negativas y mantiene la barra de costos no negativa', () => {
    render(<App />)
    irA('Simulador')

    const cantidad = screen.getByRole('spinbutton', { name: 'Cantidad simulada de Pollo asado' })
    fireEvent.change(cantidad, { target: { value: '-10' } })
    expect(cantidad.value).toBe('')
    expect(screen.getByText('Usá una cantidad entera de 0 o más.')).toBeInTheDocument()

    const costosVariables = screen.getByRole('slider', { name: /Costos variables/ })
    expect(costosVariables).toHaveAttribute('min', '0')
    fireEvent.change(costosVariables, { target: { value: '90' } })
    expect(screen.getByText('90% (100% = actual)')).toBeInTheDocument()
  })
})
