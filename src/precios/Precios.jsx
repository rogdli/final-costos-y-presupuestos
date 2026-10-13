import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import Tag from '../shared/ui/Tag'
import { formatMoney } from '../shared/format'

export default function Precios({ productos, margen, preciosSugeridos, utilidadObjetivo }) {
  return (
    <Card info="El precio mínimo cubre el costo variable del producto más su parte de la estructura fija. El precio sugerido agrega la utilidad objetivo del mes. Si el precio de la competencia está por debajo del mínimo, con ese precio el producto no alcanza a cubrir los fijos.">
      <div className="ui-metric-row">
        <MetricTile
          label="Contribución mínima unitaria"
          value={formatMoney(preciosSugeridos.contribucionMinima)}
        />
        <MetricTile label="Contribución deseada unitaria" value={formatMoney(preciosSugeridos.contribucionDeseada)} />
        <MetricTile label="Utilidad mensual objetivo" value={formatMoney(utilidadObjetivo)} />
      </div>

      <Divider />

      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio competencia</th>
            <th>MC unitario (competencia)</th>
            <th>Precio mínimo (PE)</th>
            <th>Precio sugerido (con utilidad)</th>
            <th>Con el precio de competencia</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => {
            const mc = margen.porProducto[i]
            const sugerido = preciosSugeridos.porProducto[i]
            const alcanza = mc.precio >= sugerido.precioMinimo

            return (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatMoney(mc.precio)}</td>
                <td>{formatMoney(mc.mcUnitario)}</td>
                <td>{formatMoney(sugerido.precioMinimo)}</td>
                <td>
                  <strong>{formatMoney(sugerido.precioSugerido)}</strong>
                </td>
                <td>
                  <Tag tone={alcanza ? 'honey' : 'linen'}>
                    {alcanza ? 'Cubre su parte de fijos' : `Faltan ${formatMoney(sugerido.precioMinimo - mc.precio)}`}
                  </Tag>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Card>
  )
}
