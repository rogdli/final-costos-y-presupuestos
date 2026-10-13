import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import Field from '../shared/ui/Field'
import { formatMoney, formatNumber } from '../shared/format'

const vacio = { nombre: '', cantidadVendida: '', horasProduccion: '', precioCompetencia: '' }

/** Identificador único a partir del nombre, con sufijo si ya existe. */
function nuevoId(nombre, productos) {
  const base = nombre.trim().toLowerCase().replace(/\s+/g, '-')
  if (!productos.some((p) => p.id === base)) return base

  let sufijo = 2
  while (productos.some((p) => p.id === `${base}-${sufijo}`)) sufijo++
  return `${base}-${sufijo}`
}

export default function ProductosForm({ productos, comprobantes, onAgregar, onEliminar }) {
  const [form, setForm] = useState(vacio)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return

    onAgregar({
      id: nuevoId(form.nombre, productos),
      nombre: form.nombre.trim(),
      cantidadVendida: Number(form.cantidadVendida) || 0,
      horasProduccion: Number(form.horasProduccion) || 0,
      precioCompetencia: Number(form.precioCompetencia) || 0,
    })
    setForm(vacio)
  }

  function comprobantesDe(productoId) {
    return comprobantes.filter((c) => c.productoId === productoId).length
  }

  const totales = productos.reduce(
    (acum, p) => ({
      cantidad: acum.cantidad + p.cantidadVendida,
      horas: acum.horas + p.horasProduccion,
    }),
    { cantidad: 0, horas: 0 }
  )

  return (
    <>
      <Card
        title="Agregar producto"
        info="Las unidades vendidas y las horas de producción son los dos drivers con los que se reparten los costos indirectos. Si están en cero, el pool indirecto no se puede repartir."
      >
        <form className="ui-form-grid" onSubmit={handleSubmit}>
          <Field label="Nombre">
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>
          <Field label="Cantidad vendida">
            <input
              type="number"
              value={form.cantidadVendida}
              onChange={(e) => setForm({ ...form, cantidadVendida: e.target.value })}
            />
          </Field>
          <Field label="Horas de producción">
            <input
              type="number"
              value={form.horasProduccion}
              onChange={(e) => setForm({ ...form, horasProduccion: e.target.value })}
            />
          </Field>
          <Field label="Precio competencia">
            <input
              type="number"
              value={form.precioCompetencia}
              onChange={(e) => setForm({ ...form, precioCompetencia: e.target.value })}
            />
          </Field>
          <div className="ui-form-grid__submit">
            <Button type="submit">Agregar producto</Button>
          </div>
        </form>
      </Card>

      <Card
        title="Productos del período"
        info="Al eliminar un producto, sus comprobantes directos no se borran: pasan a General y se reparten como indirectos, para que su importe no desaparezca del cálculo."
      >
        <Table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad vendida</th>
              <th>Horas de producción</th>
              <th>Precio competencia</th>
              <th>Comprobantes directos</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{formatNumber(p.cantidadVendida)}</td>
                <td>{formatNumber(p.horasProduccion)}</td>
                <td>{formatMoney(p.precioCompetencia)}</td>
                <td>{comprobantesDe(p.id)}</td>
                <td>
                  <Button variant="ghost" onClick={() => onEliminar(p.id)} aria-label={`Eliminar ${p.nombre}`}>
                    <Trash2 size={14} strokeWidth={1.5} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Totales</th>
              <th>{formatNumber(totales.cantidad)}</th>
              <th>{formatNumber(totales.horas)}</th>
              <th />
              <th />
              <th />
            </tr>
          </tfoot>
        </Table>
      </Card>
    </>
  )
}
