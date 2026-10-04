import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import { formatMoney } from '../shared/format'
import { METODO_CIF } from './cif.calc'

export default function Cif({ productos, cif, metodoCif, onCambiarMetodo }) {
  return (
    <Card
      actions={
        <div className="ui-toggle-row">
          <span className="ui-toggle-row__label">Criterio de asignación</span>
          <div className="ui-toggle-group">
            <button
              className={`ui-toggle ${metodoCif === METODO_CIF.UNIDADES ? 'ui-toggle--active' : ''}`}
              onClick={() => onCambiarMetodo(METODO_CIF.UNIDADES)}
            >
              Unidades vendidas
            </button>
            <button
              className={`ui-toggle ${metodoCif === METODO_CIF.HORAS ? 'ui-toggle--active' : ''}`}
              onClick={() => onCambiarMetodo(METODO_CIF.HORAS)}
            >
              Horas de producción
            </button>
          </div>
        </div>
      }
    >
      <div className="ui-metric-row">
        <MetricTile label="CIF fijos totales" value={formatMoney(cif.cifTotal)} />
        <MetricTile
          label={metodoCif === METODO_CIF.HORAS ? 'Tasa CIF por hora' : 'CIF unitario por unidad'}
          value={formatMoney(cif.tasa)}
        />
      </div>

      <Divider />

      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>CIF asignado</th>
            <th>CIF unitario</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => {
            const fila = cif.porProducto[i]
            return (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatMoney(fila.cifAsignado)}</td>
                <td>{formatMoney(fila.cifUnitario)}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Card>
  )
}
