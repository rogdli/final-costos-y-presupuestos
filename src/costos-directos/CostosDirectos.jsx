import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import { formatMoney } from '../shared/format'

export default function CostosDirectos({ productos, costoDirecto }) {
  return (
    <Card
      info={
        <>
          Costo directo = suma de comprobantes asociados al producto.
          {costoDirecto.manoObraGeneral > 0 && (
            <>
              {' '}
              Mano de obra General ({formatMoney(costoDirecto.manoObraGeneral)}) va a Indirectos.
            </>
          )}
        </>
      }
    >
      <div className="ui-metric-row">
        <MetricTile label="Materiales directos" value={formatMoney(costoDirecto.materialesDirectos)} />
        <MetricTile label="Mano de obra directa asignada" value={formatMoney(costoDirecto.manoObraDirecta)} />
        <MetricTile
          label="Total costos directos"
          value={formatMoney(costoDirecto.totalDirecto)}
          info="Total directo = materiales + mano de obra directa + otros directos. Unitario = total directo ÷ unidades."
        />
      </div>

      <Divider />

      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Materiales</th>
            <th>Mano de obra directa</th>
            <th>Otros directos</th>
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
                <td>{formatMoney(fila.manoObra)}</td>
                <td>{formatMoney(fila.otros)}</td>
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
