import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import SectionHeading from '../shared/ui/SectionHeading'
import AlertaCobertura from '../alertas/AlertaCobertura'
import { formatMoney, formatNumber, formatPercent } from '../shared/format'

export default function PuntoEquilibrio({
  costosFijosTotales,
  ingresosTotales,
  costoVariableTotal,
  margen,
  puntoEquilibrio,
  pePorProducto,
  productos,
}) {
  const tonoResultado = puntoEquilibrio.cubreCostosFijos ? 'espresso' : 'terracotta'

  return (
    <Card>
      <div className="ui-metric-row">
        <MetricTile label="Ingreso total" value={formatMoney(ingresosTotales)} />
        <MetricTile label="Costo variable total" value={formatMoney(costoVariableTotal)} />
        <MetricTile label="Costos fijos totales" value={formatMoney(costosFijosTotales)} />
        <MetricTile label="Margen de contribución total" value={formatMoney(margen.mcTotalGlobal)} />
        <MetricTile label="Índice de margen de contribución" value={formatPercent(puntoEquilibrio.imc)} />
        <MetricTile
          label="Punto de equilibrio en $"
          value={puntoEquilibrio.alcanzable ? formatMoney(puntoEquilibrio.peEnPesos) : 'No alcanzable'}
          tone={puntoEquilibrio.alcanzable ? 'espresso' : 'terracotta'}
        />
        <MetricTile
          label="Resultado operativo"
          value={formatMoney(puntoEquilibrio.resultadoOperativo)}
          tone={tonoResultado}
        />
      </div>

      <p className="ui-hint">
        {puntoEquilibrio.alcanzable ? (
          <>
            Con esta estructura de costos y estos precios hay que facturar {formatMoney(puntoEquilibrio.peEnPesos)} en el
            mes para salir hecho. Hoy se facturan {formatMoney(ingresosTotales)}.
          </>
        ) : (
          <>
            No hay nivel de ventas que cubra los costos fijos: el margen de contribución es cero o negativo, así que
            vender más agranda la pérdida. Hay que subir precios o bajar el costo variable.
          </>
        )}
      </p>

      <Divider />
      <SectionHeading>Punto de equilibrio por producto, según el mix de ventas</SectionHeading>

      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Participación en ventas</th>
            <th>MC unitario</th>
            <th>MC total</th>
            <th>PE en $</th>
            <th>PE en unidades</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, i) => {
            const mc = margen.porProducto[i]
            const pe = pePorProducto[i]
            return (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatPercent(pe.participacion)}</td>
                <td>{formatMoney(mc.mcUnitario)}</td>
                <td>{formatMoney(mc.mcTotal)}</td>
                <td>{formatMoney(pe.peEnPesos)}</td>
                <td>{formatNumber(pe.peEnUnidades)}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th>{formatPercent(1)}</th>
            <th />
            <th>{formatMoney(margen.mcTotalGlobal)}</th>
            <th>{puntoEquilibrio.alcanzable ? formatMoney(puntoEquilibrio.peEnPesos) : '—'}</th>
            <th />
          </tr>
        </tfoot>
      </Table>

      <p className="ui-hint">
        La apertura por producto depende del mix: si cambia la proporción de lo que se vende, cambia cuánto tiene que
        facturar cada uno.
      </p>

      <Divider />

      <AlertaCobertura
        key={String(puntoEquilibrio.cubreCostosFijos)}
        cubreCostosFijos={puntoEquilibrio.cubreCostosFijos}
      />
    </Card>
  )
}
