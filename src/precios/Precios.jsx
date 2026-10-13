import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import Tag from '../shared/ui/Tag'
import { formatMoney } from '../shared/format'

export default function Precios({ productos, margen, preciosSugeridos, utilidadObjetivo }) {
  return (
    <Card info="Mínimo = costo variable unitario + fijos ÷ unidades. Sugerido = costo variable unitario + (fijos + utilidad objetivo) ÷ unidades.">
      <div className="ui-metric-row">
        <MetricTile
          label="Contribución mínima unitaria"
          value={formatMoney(preciosSugeridos.contribucionMinima)}
          info="Contribución mínima = costos fijos ÷ unidades vendidas."
        />
        <MetricTile
          label="Contribución deseada unitaria"
          value={formatMoney(preciosSugeridos.contribucionDeseada)}
          info="Contribución deseada = (costos fijos + utilidad objetivo) ÷ unidades vendidas."
        />
        <MetricTile label="Utilidad mensual objetivo" value={formatMoney(utilidadObjetivo)} />
      </div>

      <Divider />

      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio de venta</th>
            <th>Precio competencia</th>
            <th>Frente a competencia</th>
            <th>MC unitario (venta)</th>
            <th>Precio mínimo (PE)</th>
            <th>Precio sugerido (con utilidad)</th>
            <th>Con el precio de venta</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => {
            const mc = margen.porProducto[i]
            const sugerido = preciosSugeridos.porProducto[i]
            const alcanza = mc.precio >= sugerido.precioMinimo
            const diferenciaCompetencia = mc.precio - producto.precioCompetencia

            return (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatMoney(mc.precio)}</td>
                <td>{formatMoney(producto.precioCompetencia)}</td>
                <td>{diferenciaCompetencia === 0 ? 'Igual' : diferenciaCompetencia > 0
                  ? `${formatMoney(diferenciaCompetencia)} más caro`
                  : `${formatMoney(Math.abs(diferenciaCompetencia))} más barato`}</td>
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
