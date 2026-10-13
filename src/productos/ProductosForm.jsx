import { useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import Field from '../shared/ui/Field'
import { formatMoney, formatNumber } from '../shared/format'
import { numeroNoNegativo } from '../shared/numeros'

const vacio = { nombre: '', cantidadVendida: '', horasProduccion: '', precioCompetencia: '', precioVenta: '' }

/** Identificador único a partir del nombre, con sufijo si ya existe. */
function nuevoId(nombre, productos) {
  const base = nombre.trim().toLowerCase().replace(/\s+/g, '-')
  if (!productos.some((p) => p.id === base)) return base

  let sufijo = 2
  while (productos.some((p) => p.id === `${base}-${sufijo}`)) sufijo++
  return `${base}-${sufijo}`
}

export default function ProductosForm({ productos, comprobantes, onAgregar, onEditar, onEliminar }) {
  const [form, setForm] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const formularioRef = useRef(null)

  function editar(producto) {
    setEditandoId(producto.id)
    setForm({
      nombre: producto.nombre,
      cantidadVendida: String(producto.cantidadVendida),
      horasProduccion: String(producto.horasProduccion),
      precioCompetencia: String(producto.precioCompetencia),
      precioVenta: String(producto.precioVenta ?? producto.precioCompetencia),
    })
    setErrores({})
    formularioRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setForm(vacio)
    setErrores({})
  }

  function cambiarCampo(campo, valor) {
    if (campo !== 'nombre' && valor !== '' && Number(valor) < 0) {
      setErrores((prev) => ({ ...prev, [campo]: 'No puede ser negativo.' }))
      return
    }
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = Object.fromEntries(
      Object.entries(errores).filter(([, mensaje]) => mensaje === 'No puede ser negativo.')
    )
    if (!form.nombre.trim()) nuevosErrores.nombre = 'Escribí el nombre del producto.'
    if (form.cantidadVendida === '') nuevosErrores.cantidadVendida = 'Completá la cantidad vendida.'
    else if (numeroNoNegativo(form.cantidadVendida, { entero: true }) === null) {
      nuevosErrores.cantidadVendida = 'Usá una cantidad entera de 0 o más.'
    }
    if (form.horasProduccion === '') nuevosErrores.horasProduccion = 'Completá las horas de producción.'
    else if (numeroNoNegativo(form.horasProduccion) === null) {
      nuevosErrores.horasProduccion = 'Ingresá horas de 0 o más.'
    }
    if (form.precioCompetencia === '') nuevosErrores.precioCompetencia = 'Completá el precio de referencia.'
    else if (numeroNoNegativo(form.precioCompetencia) === null) {
      nuevosErrores.precioCompetencia = 'Ingresá un precio de 0 o más.'
    }
    if (form.precioVenta === '') nuevosErrores.precioVenta = 'Completá el precio de venta.'
    else if (numeroNoNegativo(form.precioVenta) === null) {
      nuevosErrores.precioVenta = 'Ingresá un precio de 0 o más.'
    }
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    const producto = {
      id: editandoId ?? nuevoId(form.nombre, productos),
      nombre: form.nombre.trim(),
      cantidadVendida: Number(form.cantidadVendida),
      horasProduccion: Number(form.horasProduccion),
      precioCompetencia: Number(form.precioCompetencia),
      precioVenta: Number(form.precioVenta),
    }
    if (editandoId) onEditar(producto)
    else onAgregar(producto)
    cancelarEdicion()
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
        title={editandoId ? 'Editar producto' : 'Agregar producto'}
        info="Las unidades vendidas y las horas de producción reparten los costos indirectos. El precio de venta calcula ingresos y márgenes; el precio de competencia solo sirve para comparar."
      >
        {Object.values(errores).some(Boolean) && <p className="ui-form-alert" role="alert">Revisá los campos marcados para {editandoId ? 'guardar' : 'agregar'} el producto.</p>}
        <form ref={formularioRef} className="ui-form-grid ui-form-grid--productos" onSubmit={handleSubmit} noValidate>
          <Field label="Nombre">
            <input
              value={form.nombre}
              aria-label="Nombre"
              required
              placeholder="Ej.: Pollo asado"
              aria-invalid={Boolean(errores.nombre)}
              aria-describedby={errores.nombre ? 'producto-nombre-error' : undefined}
              onChange={(e) => cambiarCampo('nombre', e.target.value)}
            />
            {errores.nombre && <span id="producto-nombre-error" className="ui-field__error">{errores.nombre}</span>}
          </Field>
          <Field label="Cantidad vendida">
            <input
              type="number"
              aria-label="Cantidad vendida"
              min="0"
              step="1"
              required
              placeholder="Ej.: 500"
              value={form.cantidadVendida}
              aria-invalid={Boolean(errores.cantidadVendida)}
              aria-describedby={errores.cantidadVendida ? 'producto-cantidad-error' : undefined}
              onChange={(e) => cambiarCampo('cantidadVendida', e.target.value)}
            />
            {errores.cantidadVendida && <span id="producto-cantidad-error" className="ui-field__error">{errores.cantidadVendida}</span>}
          </Field>
          <Field label="Horas de producción">
            <input
              type="number"
              aria-label="Horas de producción"
              min="0"
              step="any"
              required
              placeholder="Ej.: 100"
              value={form.horasProduccion}
              aria-invalid={Boolean(errores.horasProduccion)}
              aria-describedby={errores.horasProduccion ? 'producto-horas-error' : undefined}
              onChange={(e) => cambiarCampo('horasProduccion', e.target.value)}
            />
            {errores.horasProduccion && <span id="producto-horas-error" className="ui-field__error">{errores.horasProduccion}</span>}
          </Field>
          <Field label="Precio competencia">
            <input
              type="number"
              aria-label="Precio competencia"
              min="0"
              step="any"
              required
              placeholder="Ej.: 8500"
              value={form.precioCompetencia}
              aria-invalid={Boolean(errores.precioCompetencia)}
              aria-describedby={errores.precioCompetencia ? 'producto-precio-error' : undefined}
              onChange={(e) => cambiarCampo('precioCompetencia', e.target.value)}
            />
            {errores.precioCompetencia && <span id="producto-precio-error" className="ui-field__error">{errores.precioCompetencia}</span>}
          </Field>
          <Field label="Precio de venta">
            <input
              type="number"
              aria-label="Precio de venta"
              min="0"
              step="any"
              required
              placeholder="Ej.: 8500"
              value={form.precioVenta}
              aria-invalid={Boolean(errores.precioVenta)}
              aria-describedby={errores.precioVenta ? 'producto-venta-error' : undefined}
              onChange={(e) => cambiarCampo('precioVenta', e.target.value)}
            />
            {errores.precioVenta && <span id="producto-venta-error" className="ui-field__error">{errores.precioVenta}</span>}
          </Field>
          <div className="ui-form-grid__submit">
            <Button type="submit">{editandoId ? 'Guardar cambios' : 'Agregar producto'}</Button>
            {editandoId && <Button type="button" variant="ghost" onClick={cancelarEdicion}>Cancelar</Button>}
          </div>
        </form>
      </Card>

      <Card
        title="Productos del período"
        info="Al eliminar un producto, sus comprobantes no se borran: pasan a General y se reparten como indirectos. Los costos directos pasan a CIF y la mano de obra directa pasa a mano de obra indirecta."
      >
        <Table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad vendida</th>
              <th>Horas de producción</th>
              <th>Precio competencia</th>
              <th>Precio de venta</th>
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
                <td>{formatMoney(p.precioVenta ?? p.precioCompetencia)}</td>
                <td>{comprobantesDe(p.id)}</td>
                <td>
                  <Button variant="ghost" onClick={() => editar(p)} aria-label={`Editar ${p.nombre}`}>
                    <Pencil size={14} strokeWidth={1.5} />
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    if (editandoId === p.id) cancelarEdicion()
                    onEliminar(p.id)
                  }} aria-label={`Eliminar ${p.nombre}`}>
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
              <th />
            </tr>
          </tfoot>
        </Table>
      </Card>
    </>
  )
}
