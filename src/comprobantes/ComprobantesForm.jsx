import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import Tag from '../shared/ui/Tag'
import Field from '../shared/ui/Field'
import Divider from '../shared/ui/Divider'
import SectionHeading from '../shared/ui/SectionHeading'
import { formatMoney } from '../shared/format'
import { TIPOS_FUNCIONALES, COMPORTAMIENTOS } from '../shared/seedData'

const vacio = {
  concepto: '',
  importe: '',
  tipoFuncional: TIPOS_FUNCIONALES[0],
  comportamiento: COMPORTAMIENTOS[0],
  productoId: '',
}

const TONO_TIPO = {
  'Costo directo': 'honey',
  'Mano de obra directa': 'honey',
  CIF: 'linen',
  'Gasto Adm. y Venta': 'linen',
}

export default function ComprobantesForm({ comprobantes, productos, onAgregar, onEliminar }) {
  const [form, setForm] = useState(vacio)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.concepto.trim() || !form.importe) return

    onAgregar({
      numero: (comprobantes.at(-1)?.numero ?? 0) + 1,
      concepto: form.concepto.trim(),
      importe: Number(form.importe) || 0,
      tipoFuncional: form.tipoFuncional,
      comportamiento: form.comportamiento,
      productoId: form.productoId || null,
    })
    setForm(vacio)
  }

  function nombreProducto(productoId) {
    return productos.find((p) => p.id === productoId)?.nombre ?? 'General'
  }

  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <th>N°</th>
            <th>Concepto</th>
            <th>Importe</th>
            <th>Tipo funcional</th>
            <th>Comportamiento</th>
            <th>Producto</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {comprobantes.map((c) => (
            <tr key={c.numero}>
              <td>{c.numero}</td>
              <td>{c.concepto}</td>
              <td>{formatMoney(c.importe)}</td>
              <td>
                <Tag tone={TONO_TIPO[c.tipoFuncional]}>{c.tipoFuncional}</Tag>
              </td>
              <td>
                <Tag tone={c.comportamiento === 'Fijo' ? 'linen' : 'honey'}>{c.comportamiento}</Tag>
              </td>
              <td>{nombreProducto(c.productoId)}</td>
              <td>
                <Button variant="ghost" onClick={() => onEliminar(c.numero)} aria-label={`Eliminar comprobante ${c.numero}`}>
                  <Trash2 size={14} strokeWidth={1.5} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Divider />
      <SectionHeading>Agregar comprobante</SectionHeading>

      <form className="ui-form-grid" onSubmit={handleSubmit}>
        <Field label="Concepto">
          <input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} />
        </Field>
        <Field label="Importe">
          <input type="number" value={form.importe} onChange={(e) => setForm({ ...form, importe: e.target.value })} />
        </Field>
        <Field label="Tipo funcional">
          <select value={form.tipoFuncional} onChange={(e) => setForm({ ...form, tipoFuncional: e.target.value })}>
            {TIPOS_FUNCIONALES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Comportamiento">
          <select value={form.comportamiento} onChange={(e) => setForm({ ...form, comportamiento: e.target.value })}>
            {COMPORTAMIENTOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Producto asociado">
          <select value={form.productoId} onChange={(e) => setForm({ ...form, productoId: e.target.value })}>
            <option value="">General</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>
        <div className="ui-form-grid__submit">
          <Button type="submit">Agregar comprobante</Button>
        </div>
      </form>
    </Card>
  )
}
