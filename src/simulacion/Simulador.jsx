import { RotateCcw } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import MetricTile from '../shared/ui/MetricTile'
import Field from '../shared/ui/Field'
import Divider from '../shared/ui/Divider'
import AlertaCobertura from '../alertas/AlertaCobertura'
import { formatMoney } from '../shared/format'

export default function Simulador({
  productos,
  overrides,
  utilidadObjetivo,
  onCambiarPrecio,
  onCambiarCantidad,
  onCambiarUtilidadObjetivo,
  onRestablecer,
  casoSimulado,
}) {
  return (
    <Card
      actions={
        <Button variant="ghost" onClick={onRestablecer}>
          <RotateCcw size={14} strokeWidth={1.5} />
          Restablecer
        </Button>
      }
    >
      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio (override)</th>
            <th>Cantidad (override)</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>
                <input
                  type="number"
                  placeholder={producto.precioCompetencia}
                  value={overrides.precios[producto.id] ?? ''}
                  onChange={(e) => onCambiarPrecio(producto.id, e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder={producto.cantidadVendida}
                  value={overrides.cantidades[producto.id] ?? ''}
                  onChange={(e) => onCambiarCantidad(producto.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Field label="Utilidad mensual objetivo" className="ui-field--standalone">
        <input type="number" value={utilidadObjetivo} onChange={(e) => onCambiarUtilidadObjetivo(e.target.value)} />
      </Field>

      <Divider />

      <div className="ui-metric-row">
        <MetricTile label="Margen de contribución total" value={formatMoney(casoSimulado.margen.mcTotalGlobal)} />
        <MetricTile
          label="Resultado operativo simulado"
          value={formatMoney(casoSimulado.puntoEquilibrio.resultadoOperativo)}
          tone={casoSimulado.puntoEquilibrio.cubreCostosFijos ? 'espresso' : 'terracotta'}
        />
      </div>

      <AlertaCobertura
        key={String(casoSimulado.puntoEquilibrio.cubreCostosFijos)}
        cubreCostosFijos={casoSimulado.puntoEquilibrio.cubreCostosFijos}
      />
    </Card>
  )
}
