import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import { formatMoney } from '../shared/format'

export default function CostosUnitarios({ productos, costosUnitarios }) {
  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Costo directo unitario</th>
            <th>CIF unitario</th>
            <th>Costo total unitario</th>
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
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Card>
  )
}
