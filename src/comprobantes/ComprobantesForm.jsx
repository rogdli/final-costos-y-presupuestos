import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import Tag from '../shared/ui/Tag'
import Field from '../shared/ui/Field'
import Divider from '../shared/ui/Divider'
import SectionHeading from '../shared/ui/SectionHeading'
import ControlAsignacion from '../alertas/ControlAsignacion'
import { formatMoney } from '../shared/format'
import { TIPOS_FUNCIONALES, COMPORTAMIENTOS } from '../shared/seedData'
import { TIPO, productoImputado } from '../shared/comprobantes'

const vacio = {
  concepto: '',
  importe: '',
  tipoFuncional: TIPOS_FUNCIONALES[0],
  comportamiento: COMPORTAMIENTOS[0],
  productoId: '',
}

const TONO_TIPO = {
  [TIPO.COSTO_DIRECTO]: 'honey',
  [TIPO.MANO_OBRA_DIRECTA]: 'honey',
  [TIPO.MANO_OBRA_INDIRECTA]: 'wisteria',
  [TIPO.CIF]: 'linen',
  [TIPO.GASTO_ADM]: 'linen',
}

export default function ComprobantesForm({ comprobantes, productos, control, onAgregar, onEliminar }) {
  const [form, setForm] = useState(vacio)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.concepto.trim() || !form.importe) return

    onAgregar({
      numero: Math.max(0, ...comprobantes.map((c) => c.numero)) + 1,
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

  const esGeneral = !form.productoId

  return (
    <>
      <Card title="Agregar comprobante">
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

        <p className="ui-hint">
          {esGeneral
            ? 'Sin producto asociado el importe va al pool indirecto y se reparte entre todos los productos según el driver elegido en la pestaña CIF.'
            : `Con producto asociado el importe se imputa entero a ${nombreProducto(form.productoId)} como costo directo.`}{' '}
          El comportamiento fijo o variable define si suma a los costos fijos de la empresa o al costo variable del
          producto.
        </p>
      </Card>

      <Card title="Comprobantes del período">
        <ControlAsignacion control={control} />

        <Divider />
        <SectionHeading>Detalle</SectionHeading>

        <Table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Concepto</th>
              <th>Importe</th>
              <th>Tipo funcional</th>
              <th>Comportamiento</th>
              <th>Producto</th>
              <th>Asignación</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((c) => {
              const imputado = productoImputado(c, productos)
              return (
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
                  <td>{imputado ? 'Directo' : 'Indirecto (driver)'}</td>
                  <td>
                    <Button
                      variant="ghost"
                      onClick={() => onEliminar(c.numero)}
                      aria-label={`Eliminar comprobante ${c.numero}`}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card>
    </>
  )
}
