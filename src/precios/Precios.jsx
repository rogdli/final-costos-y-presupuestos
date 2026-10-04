import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import { formatMoney } from '../shared/format'

export default function Precios({ productos, margen, preciosSugeridos }) {
  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio competencia</th>
            <th>MC unitario (competencia)</th>
            <th>Precio mínimo (PE)</th>
            <th>Precio sugerido (con utilidad)</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => {
            const mc = margen.porProducto[i]
            const sugerido = preciosSugeridos.porProducto[i]
            return (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatMoney(mc.precio)}</td>
                <td>{formatMoney(mc.mcUnitario)}</td>
                <td>{formatMoney(sugerido.precioMinimo)}</td>
                <td>
                  <strong>{formatMoney(sugerido.precioSugerido)}</strong>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Card>
  )
}
