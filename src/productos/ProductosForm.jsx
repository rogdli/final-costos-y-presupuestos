import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import Field from '../shared/ui/Field'
import Divider from '../shared/ui/Divider'
import SectionHeading from '../shared/ui/SectionHeading'
import { formatMoney } from '../shared/format'

const vacio = { nombre: '', cantidadVendida: '', horasProduccion: '', precioCompetencia: '' }

export default function ProductosForm({ productos, onAgregar, onEliminar }) {
  const [form, setForm] = useState(vacio)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return

    onAgregar({
      id: form.nombre.trim().toLowerCase().replace(/\s+/g, '-'),
      nombre: form.nombre.trim(),
      cantidadVendida: Number(form.cantidadVendida) || 0,
      horasProduccion: Number(form.horasProduccion) || 0,
      precioCompetencia: Number(form.precioCompetencia) || 0,
    })
    setForm(vacio)
  }

  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad vendida</th>
            <th>Horas de producción</th>
            <th>Precio competencia</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.cantidadVendida}</td>
              <td>{p.horasProduccion}</td>
              <td>{formatMoney(p.precioCompetencia)}</td>
              <td>
                <Button variant="ghost" onClick={() => onEliminar(p.id)} aria-label={`Eliminar ${p.nombre}`}>
                  <Trash2 size={14} strokeWidth={1.5} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Divider />
      <SectionHeading>Agregar producto</SectionHeading>

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
  )
}
