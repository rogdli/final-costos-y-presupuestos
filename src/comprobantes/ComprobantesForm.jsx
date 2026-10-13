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
import { numeroNoNegativo } from '../shared/numeros'
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
  const [errores, setErrores] = useState({})

  function cambiarCampo(campo, valor) {
    if (campo === 'importe' && valor !== '' && Number(valor) < 0) {
      setErrores((prev) => ({ ...prev, importe: 'No puede ser negativo.' }))
      return
    }
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({
      ...prev,
      [campo]: undefined,
      ...(campo === 'tipoFuncional' ? { productoId: undefined } : {}),
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = {}
    if (!form.concepto.trim()) nuevosErrores.concepto = 'Escribí qué gasto o compra estás cargando.'
    if (form.importe === '') nuevosErrores.importe = 'Completá el importe.'
    else if (numeroNoNegativo(form.importe, { positivo: true }) === null) {
      nuevosErrores.importe = 'Ingresá un importe mayor que cero.'
    }
    if ([TIPO.COSTO_DIRECTO, TIPO.MANO_OBRA_DIRECTA].includes(form.tipoFuncional) && !form.productoId) {
      nuevosErrores.productoId = productos.length === 0
        ? 'Primero agregá un producto en la pestaña Productos.'
        : 'Elegí el producto al que corresponde este costo directo.'
    }
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    onAgregar({
      numero: Math.max(0, ...comprobantes.map((c) => c.numero)) + 1,
      concepto: form.concepto.trim(),
      importe: Number(form.importe),
      tipoFuncional: form.tipoFuncional,
      comportamiento: form.comportamiento,
      productoId: form.productoId || null,
    })
    setForm(vacio)
    setErrores({})
  }

  function nombreProducto(productoId) {
    return productos.find((p) => p.id === productoId)?.nombre ?? 'General'
  }

  const esGeneral = !form.productoId
  const tipoRequiereProducto = [TIPO.COSTO_DIRECTO, TIPO.MANO_OBRA_DIRECTA].includes(form.tipoFuncional)

  const ayuda = `${
    esGeneral && tipoRequiereProducto && productos.length === 0
      ? 'Primero agregá un producto en la pestaña Productos para cargar un costo directo.'
      : esGeneral && tipoRequiereProducto
      ? 'Este tipo de costo es directo: elegí un producto para poder guardarlo. Si corresponde a todos, elegí Mano de obra indirecta, CIF o Gasto Adm. y Venta.'
      : esGeneral
      ? 'Sin producto asociado el importe va al pool indirecto y se reparte entre todos los productos según el driver elegido en la pestaña CIF.'
      : `Con producto asociado el importe se imputa entero a ${nombreProducto(form.productoId)} como costo directo.`
  } El comportamiento fijo o variable define si suma a los costos fijos de la empresa o al costo variable del producto.`

  return (
    <>
      <Card title="Agregar comprobante" info={ayuda}>
        {Object.values(errores).some(Boolean) && <p className="ui-form-alert" role="alert">Revisá los campos marcados para agregar el comprobante.</p>}
        <form className="ui-form-grid ui-form-grid--comprobantes" onSubmit={handleSubmit} noValidate>
          <Field label="Concepto">
            <input
              value={form.concepto}
              aria-label="Concepto"
              required
              placeholder="Ej.: Compra de harina"
              aria-invalid={Boolean(errores.concepto)}
              aria-describedby={errores.concepto ? 'comprobante-concepto-error' : undefined}
              onChange={(e) => cambiarCampo('concepto', e.target.value)}
            />
            {errores.concepto && <span id="comprobante-concepto-error" className="ui-field__error">{errores.concepto}</span>}
          </Field>
          <Field label="Importe">
            <input
              type="number"
              aria-label="Importe"
              min="0"
              step="any"
              required
              placeholder="Ej.: 25000"
              value={form.importe}
              aria-invalid={Boolean(errores.importe)}
              aria-describedby={errores.importe ? 'comprobante-importe-error' : undefined}
              onChange={(e) => cambiarCampo('importe', e.target.value)}
            />
            {errores.importe && <span id="comprobante-importe-error" className="ui-field__error">{errores.importe}</span>}
          </Field>
          <Field label="Tipo funcional">
            <select value={form.tipoFuncional} onChange={(e) => cambiarCampo('tipoFuncional', e.target.value)}>
              {TIPOS_FUNCIONALES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Comportamiento">
            <select value={form.comportamiento} onChange={(e) => cambiarCampo('comportamiento', e.target.value)}>
              {COMPORTAMIENTOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Producto asociado">
            <select
              value={form.productoId}
              aria-label="Producto asociado"
              required={tipoRequiereProducto}
              aria-invalid={Boolean(errores.productoId)}
              aria-describedby={errores.productoId ? 'comprobante-producto-error' : undefined}
              onChange={(e) => cambiarCampo('productoId', e.target.value)}
            >
              <option value="">General</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {errores.productoId && <span id="comprobante-producto-error" className="ui-field__error">{errores.productoId}</span>}
          </Field>
          <div className="ui-form-grid__submit">
            <Button type="submit">Agregar comprobante</Button>
          </div>
        </form>
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
