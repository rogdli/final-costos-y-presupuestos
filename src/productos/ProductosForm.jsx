import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import Field from '../shared/ui/Field'
import { formatMoney, formatNumber } from '../shared/format'
import { numeroNoNegativo } from '../shared/numeros'

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
  const [errores, setErrores] = useState({})

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
    const nuevosErrores = {}
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
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    onAgregar({
      id: nuevoId(form.nombre, productos),
      nombre: form.nombre.trim(),
      cantidadVendida: Number(form.cantidadVendida),
      horasProduccion: Number(form.horasProduccion),
      precioCompetencia: Number(form.precioCompetencia),
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
        {Object.values(errores).some(Boolean) && <p className="ui-form-alert" role="alert">Revisá los campos marcados para agregar el producto.</p>}
        <form className="ui-form-grid ui-form-grid--productos" onSubmit={handleSubmit} noValidate>
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
          <div className="ui-form-grid__submit">
            <Button type="submit">Agregar producto</Button>
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
