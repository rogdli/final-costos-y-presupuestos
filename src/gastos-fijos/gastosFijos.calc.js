import { sumarPorTipo } from '../shared/comprobantes'

export function calcularGastosFijos(comprobantes) {
  return sumarPorTipo(comprobantes, 'Gasto Adm. y Venta')
}
