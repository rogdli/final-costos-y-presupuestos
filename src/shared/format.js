const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Los valores no calculables (sin dato, infinitos) se muestran como guión. */
function sinDato(value) {
  return value === null || value === undefined || !Number.isFinite(value)
}

export function formatMoney(value) {
  return sinDato(value) ? '—' : moneyFormatter.format(value)
}

export function formatPercent(value) {
  return sinDato(value) ? '—' : percentFormatter.format(value)
}

export function formatNumber(value) {
  return sinDato(value) ? '—' : numberFormatter.format(value)
}
