import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import SectionHeading from '../shared/ui/SectionHeading'
import AlertaCobertura from '../alertas/AlertaCobertura'
import { formatMoney, formatNumber, formatPercent } from '../shared/format'
import { AYUDA_FORMULAS } from '../shared/ayudaFormulas'

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
    <Card
      info={
        puntoEquilibrio.alcanzable
          ? `PE = costos fijos ÷ índice de margen: ${formatMoney(puntoEquilibrio.peEnPesos)}. Ventas actuales: ${formatMoney(ingresosTotales)}.`
          : 'Sin punto de equilibrio: el índice de margen es cero o negativo.'
      }
    >
      <div className="ui-metric-row">
        <MetricTile label="Ingreso total" value={formatMoney(ingresosTotales)} info={AYUDA_FORMULAS.ingresos} />
        <MetricTile label="Costo variable total" value={formatMoney(costoVariableTotal)} info={AYUDA_FORMULAS.costosVariables} />
        <MetricTile label="Costos fijos totales" value={formatMoney(costosFijosTotales)} info={AYUDA_FORMULAS.costosFijos} />
        <MetricTile label="Margen de contribución total" value={formatMoney(margen.mcTotalGlobal)} info={AYUDA_FORMULAS.margen} />
        <MetricTile label="Índice de margen de contribución" value={formatPercent(puntoEquilibrio.imc)} info={AYUDA_FORMULAS.indiceMargen} />
        <MetricTile
          label="Punto de equilibrio en $"
          value={puntoEquilibrio.alcanzable ? formatMoney(puntoEquilibrio.peEnPesos) : 'No alcanzable'}
          tone={puntoEquilibrio.alcanzable ? 'espresso' : 'terracotta'}
          info={AYUDA_FORMULAS.puntoEquilibrio}
        />
        <MetricTile
          label="Resultado operativo"
          value={formatMoney(puntoEquilibrio.resultadoOperativo)}
          tone={tonoResultado}
          info={AYUDA_FORMULAS.resultado}
        />
      </div>

      <Divider />
      <SectionHeading info="MC unitario = precio − costo variable unitario. Participación = ventas del producto ÷ ventas totales. PE del producto = PE total × participación.">
        Punto de equilibrio por producto, según el mix de ventas
      </SectionHeading>

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

      <Divider />

      <AlertaCobertura
        key={String(puntoEquilibrio.cubreCostosFijos)}
        cubreCostosFijos={puntoEquilibrio.cubreCostosFijos}
      />
    </Card>
  )
}
