import { ChartPie, Split } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import Tabs from '../shared/ui/Tabs'
import ControlAsignacion from '../alertas/ControlAsignacion'
import { formatMoney, formatNumber } from '../shared/format'
import { METODO_CIF } from './cif.calc'

export default function Cif({ productos, cif, control, metodoCif, onCambiarMetodo }) {
  const porHoras = metodoCif === METODO_CIF.HORAS

  const composicion = (
    <Table>
      <thead>
        <tr>
          <th>Tipo funcional</th>
          <th>Importe</th>
          <th>Participación</th>
        </tr>
      </thead>
      <tbody>
        {cif.porTipo.map((fila) => (
          <tr key={fila.tipoFuncional}>
            <td>{fila.tipoFuncional}</td>
            <td>{formatMoney(fila.importe)}</td>
            <td>{cif.cifTotal > 0 ? `${((fila.importe / cif.cifTotal) * 100).toFixed(1)}%` : '—'}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th>Total</th>
          <th>{formatMoney(cif.cifTotal)}</th>
          <th />
        </tr>
      </tfoot>
    </Table>
  )

  const reparto = (
    <Table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>{porHoras ? 'Horas' : 'Unidades'}</th>
          <th>Indirecto asignado</th>
          <th>Indirecto unitario</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto, i) => {
          const fila = cif.porProducto[i]
          return (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{formatNumber(fila.consumo)}</td>
              <td>{formatMoney(fila.cifAsignado)}</td>
              <td>
                <strong>{formatMoney(fila.cifUnitario)}</strong>
              </td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr>
          <th>Total repartido</th>
          <th>{formatNumber(cif.base)}</th>
          <th>{formatMoney(cif.cifAsignadoTotal)}</th>
          <th />
        </tr>
      </tfoot>
    </Table>
  )

  return (
    <Card
      info="Indirectos = suma de comprobantes sin producto asociado. Se reparten por unidades u horas."
      actions={
        <div className="ui-toggle-row">
          <span className="ui-toggle-row__label">Driver de asignación</span>
          <div className="ui-toggle-group">
            <button
              className={`ui-toggle ${metodoCif === METODO_CIF.UNIDADES ? 'ui-toggle--active' : ''}`}
              onClick={() => onCambiarMetodo(METODO_CIF.UNIDADES)}
            >
              Unidades vendidas
            </button>
            <button
              className={`ui-toggle ${porHoras ? 'ui-toggle--active' : ''}`}
              onClick={() => onCambiarMetodo(METODO_CIF.HORAS)}
            >
              Horas de producción
            </button>
          </div>
        </div>
      }
    >
      <div className="ui-metric-row">
        <MetricTile
          label="Pool indirecto total"
          value={formatMoney(cif.cifTotal)}
          info="Pool indirecto = suma de comprobantes sin producto asociado."
        />
        <MetricTile label="Parte fija" value={formatMoney(cif.cifFijo)} />
        <MetricTile label="Parte variable" value={formatMoney(cif.cifVariable)} />
        <MetricTile
          label={porHoras ? 'Base: horas de producción' : 'Base: unidades vendidas'}
          value={formatNumber(cif.base)}
        />
        <MetricTile
          label={porHoras ? 'Tasa por hora' : 'Tasa por unidad'}
          value={formatMoney(cif.tasa)}
          info={`Tasa = pool indirecto ÷ ${porHoras ? 'horas totales' : 'unidades totales'}. Asignado = tasa × ${porHoras ? 'horas' : 'unidades'} del producto.`}
        />
      </div>

      <Tabs
        label="Detalle del pool indirecto"
        tabs={[
          { id: 'composicion', label: 'Qué compone el pool', Icon: ChartPie, content: composicion },
          { id: 'reparto', label: 'Cómo se reparte', Icon: Split, content: reparto },
        ]}
      />

      <Divider />

      <ControlAsignacion control={control} />
    </Card>
  )
}
