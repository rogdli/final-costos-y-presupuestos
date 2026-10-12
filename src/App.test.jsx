import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
})
