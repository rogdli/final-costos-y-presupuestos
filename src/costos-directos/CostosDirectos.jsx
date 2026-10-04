import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import { formatMoney } from '../shared/format'

export default function CostosDirectos({ productos, costoDirecto }) {
  return (
    <Card>
      <div className="ui-metric-row">
        <MetricTile
          label="Costo laboral cocineros (sueldos + F-931)"
          value={formatMoney(costoDirecto.costoLaboralCocineros)}
        />
        <MetricTile label="Tasa MOD por hora" value={formatMoney(costoDirecto.tasaMODPorHora)} />
      </div>

      <Divider />

      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Materiales directos</th>
            <th>MOD asignada</th>
            <th>Costo directo total</th>
            <th>Costo directo unitario</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => {
            const fila = costoDirecto.porProducto[i]
            return (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatMoney(fila.materiales)}</td>
                <td>{formatMoney(fila.modAsignada)}</td>
                <td>{formatMoney(fila.costoDirectoTotal)}</td>
                <td>
                  <strong>{formatMoney(fila.costoDirectoUnitario)}</strong>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Card>
  )
}
