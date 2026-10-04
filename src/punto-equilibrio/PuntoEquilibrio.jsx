import Card from '../shared/ui/Card'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import AlertaCobertura from '../alertas/AlertaCobertura'
import { formatMoney, formatPercent } from '../shared/format'

export default function PuntoEquilibrio({ costosFijosTotales, margen, puntoEquilibrio }) {
  const tonoResultado = puntoEquilibrio.cubreCostosFijos ? 'espresso' : 'terracotta'

  return (
    <Card>
      <div className="ui-metric-row">
        <MetricTile label="Costos fijos totales" value={formatMoney(costosFijosTotales)} />
        <MetricTile label="Margen de contribución total" value={formatMoney(margen.mcTotalGlobal)} />
        <MetricTile label="Índice de margen de contribución" value={formatPercent(puntoEquilibrio.imc)} />
        <MetricTile label="Punto de equilibrio en $" value={formatMoney(puntoEquilibrio.peEnPesos)} />
        <MetricTile
          label="Resultado operativo"
          value={formatMoney(puntoEquilibrio.resultadoOperativo)}
          tone={tonoResultado}
        />
      </div>

      <Divider />

      <AlertaCobertura
        key={String(puntoEquilibrio.cubreCostosFijos)}
        cubreCostosFijos={puntoEquilibrio.cubreCostosFijos}
      />
    </Card>
  )
}
