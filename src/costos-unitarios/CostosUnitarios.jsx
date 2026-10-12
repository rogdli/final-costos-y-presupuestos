import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import { formatMoney } from '../shared/format'

export default function CostosUnitarios({ productos, costosUnitarios }) {
  return (
    <Card>
      <p className="ui-hint">
        Costeo por absorción: cada producto carga su costo directo más la parte del pool indirecto que le asignó el
        driver. La columna de costo variable unitario es la que se usa para el margen de contribución y el punto de
        equilibrio, y solo incluye lo cargado como Variable.
      </p>

      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Costo directo unitario</th>
            <th>Indirecto unitario</th>
            <th>Costo total unitario</th>
            <th>Costo variable unitario</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => {
            const fila = costosUnitarios.porProducto[i]
            return (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatMoney(fila.costoDirectoUnitario)}</td>
                <td>{formatMoney(fila.cifUnitario)}</td>
                <td>
                  <strong>{formatMoney(fila.costoTotalUnitario)}</strong>
                </td>
                <td>{formatMoney(fila.costoVariableUnitario)}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Card>
  )
}
