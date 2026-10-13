/** Devuelve null cuando un dato no es un número válido para cargar en la app. */
export function numeroNoNegativo(valor, { entero = false, positivo = false } = {}) {
  if (valor === null || valor === undefined || String(valor).trim() === '') return null

  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero < 0 || numero > Number.MAX_SAFE_INTEGER ||
    (positivo && numero === 0) || (entero && !Number.isSafeInteger(numero))) {
    return null
  }

  return numero
}
