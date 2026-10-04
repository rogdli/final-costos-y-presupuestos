import * as XLSX from 'xlsx'

const STORAGE_KEY = 'costos-rotiseria:estado'

export function cargarEstado() {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY)
    return crudo ? JSON.parse(crudo) : null
  } catch {
    return null
  }
}

export function guardarEstado(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
  } catch {}
}

export function exportarExcel({ productos, comprobantes, metodoCif, utilidadObjetivo }) {
  const libro = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(productos), 'Productos')
  XLSX.utils.book_append_sheet(
    libro,
    XLSX.utils.json_to_sheet(comprobantes.map((c) => ({ ...c, productoId: c.productoId ?? '' }))),
    'Comprobantes'
  )
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet([{ metodoCif, utilidadObjetivo }]), 'Parametros')

  XLSX.writeFile(libro, 'costos-rotiseria.xlsx')
}

export async function importarExcel(file) {
  const buffer = await file.arrayBuffer()
  const libro = XLSX.read(buffer, { type: 'array' })

  const productos = XLSX.utils.sheet_to_json(libro.Sheets.Productos)
  const comprobantes = XLSX.utils
    .sheet_to_json(libro.Sheets.Comprobantes)
    .map((c) => ({ ...c, productoId: c.productoId || null }))
  const [parametros] = XLSX.utils.sheet_to_json(libro.Sheets.Parametros)

  return {
    productos,
    comprobantes,
    metodoCif: parametros?.metodoCif,
    utilidadObjetivo: parametros?.utilidadObjetivo,
  }
}
