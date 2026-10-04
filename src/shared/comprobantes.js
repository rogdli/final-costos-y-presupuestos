export function sumarComprobantes(comprobantes, predicate) {
  return comprobantes.filter(predicate).reduce((total, c) => total + c.importe, 0)
}

export function sumarPorTipo(comprobantes, tipoFuncional) {
  return sumarComprobantes(comprobantes, (c) => c.tipoFuncional === tipoFuncional)
}
