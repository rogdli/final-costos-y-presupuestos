import { RotateCcw } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import MetricTile from '../shared/ui/MetricTile'
import Field from '../shared/ui/Field'
import Divider from '../shared/ui/Divider'
import SectionHeading from '../shared/ui/SectionHeading'
import AlertaCobertura from '../alertas/AlertaCobertura'
import { formatMoney, formatNumber, formatPercent } from '../shared/format'

/** Diferencia contra el caso base, para leer el efecto de cada cambio. */
function Delta({ base, simulado, mejorSiBaja = false }) {
  if (base === null || simulado === null || !Number.isFinite(base) || !Number.isFinite(simulado)) return null

  const diferencia = simulado - base
  if (Math.abs(diferencia) < 0.01) return <span className="ui-delta">sin cambio</span>

  const mejora = mejorSiBaja ? diferencia < 0 : diferencia > 0
  const signo = diferencia > 0 ? '+' : '−'

  return (
    <span className={`ui-delta ${mejora ? 'ui-delta--ok' : 'ui-delta--warn'}`}>
      {signo}
      {formatMoney(Math.abs(diferencia)).replace('$', '').trim()} vs. base
    </span>
  )
}

export default function Simulador({
  productos,
  overrides,
  utilidadObjetivo,
  onCambiarPrecio,
  onCambiarCantidad,
  onCambiarAjuste,
  onCambiarUtilidadObjetivo,
  onRestablecer,
  casoBase,
  casoSimulado,
}) {
  const base = casoBase.puntoEquilibrio
  const sim = casoSimulado.puntoEquilibrio

  return (
    <>
      <Card
        title="Tablero del escenario"
        actions={
          <Button variant="ghost" onClick={onRestablecer}>
            <RotateCcw size={14} strokeWidth={1.5} />
            Restablecer
          </Button>
        }
      >
        <div className="ui-metric-row">
          <MetricTile label="Ingreso total" value={formatMoney(casoSimulado.ingresosTotales)} />
          <MetricTile label="Costo variable total" value={formatMoney(casoSimulado.costoVariableTotal)} />
          <MetricTile label="Costo fijo total" value={formatMoney(casoSimulado.costosFijosTotales)} />
          <MetricTile label="Margen de contribución total" value={formatMoney(casoSimulado.margen.mcTotalGlobal)} />
          <MetricTile label="Índice de margen de contribución" value={formatPercent(sim.imc)} />
        </div>

        <div className="ui-metric-row ui-metric-row--spaced">
          <MetricTile
            label="Punto de equilibrio en $"
            value={sim.alcanzable ? formatMoney(sim.peEnPesos) : 'No alcanzable'}
            tone={sim.alcanzable ? 'espresso' : 'terracotta'}
          />
          <MetricTile
            label="Resultado operativo simulado"
            value={formatMoney(sim.resultadoOperativo)}
            tone={sim.cubreCostosFijos ? 'espresso' : 'terracotta'}
          />
        </div>

        <p className="ui-hint">
          Punto de equilibrio base: {base.alcanzable ? formatMoney(base.peEnPesos) : 'no alcanzable'}{' '}
          <Delta base={base.peEnPesos} simulado={sim.peEnPesos} mejorSiBaja />. Resultado operativo base:{' '}
          {formatMoney(base.resultadoOperativo)} <Delta base={base.resultadoOperativo} simulado={sim.resultadoOperativo} />.
        </p>

        <AlertaCobertura key={String(sim.cubreCostosFijos)} cubreCostosFijos={sim.cubreCostosFijos} />
      </Card>

      <Card title="Variables del escenario">
        <SectionHeading>Precio y cantidad por producto</SectionHeading>

        <Table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio base</th>
              <th>Precio simulado</th>
              <th>Cantidad base</th>
              <th>Cantidad simulada</th>
              <th>Precio sugerido</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, i) => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{formatMoney(producto.precioCompetencia)}</td>
                <td>
                  <input
                    type="number"
                    placeholder={producto.precioCompetencia}
                    value={overrides.precios[producto.id] ?? ''}
                    onChange={(e) => onCambiarPrecio(producto.id, e.target.value)}
                  />
                </td>
                <td>{formatNumber(producto.cantidadVendida)}</td>
                <td>
                  <input
                    type="number"
                    placeholder={producto.cantidadVendida}
                    value={overrides.cantidades[producto.id] ?? ''}
                    onChange={(e) => onCambiarCantidad(producto.id, e.target.value)}
                  />
                </td>
                <td>{formatMoney(casoSimulado.preciosSugeridos.porProducto[i].precioSugerido)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Divider />
        <SectionHeading info="Los ajustes de costos se aplican sobre los importes de los comprobantes según su comportamiento: un 10 en costos fijos simula una estructura fija 10% más cara. Al cambiar cantidades, los costos variables asociados a productos acompañan ese volumen; los variables generales se ajustan con el driver elegido. Si el driver son horas, se estiman según las horas por unidad del caso base. Los datos base no se modifican.">
          Costos y utilidad
        </SectionHeading>

        <div className="ui-form-grid">
          <Field label="Ajuste de costos variables (%)">
            <input
              type="number"
              value={overrides.ajusteVariables ?? 0}
              onChange={(e) => onCambiarAjuste('ajusteVariables', e.target.value)}
            />
          </Field>
          <Field label="Ajuste de costos fijos (%)">
            <input
              type="number"
              value={overrides.ajusteFijos ?? 0}
              onChange={(e) => onCambiarAjuste('ajusteFijos', e.target.value)}
            />
          </Field>
          <Field label="Utilidad mensual objetivo">
            <input type="number" value={utilidadObjetivo} onChange={(e) => onCambiarUtilidadObjetivo(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Punto de equilibrio del escenario, por producto">
        <Table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Participación en ventas</th>
              <th>MC unitario</th>
              <th>PE en $</th>
              <th>PE en unidades</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, i) => {
              const mc = casoSimulado.margen.porProducto[i]
              const pe = casoSimulado.pePorProducto[i]
              return (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{formatPercent(pe.participacion)}</td>
                  <td>{formatMoney(mc.mcUnitario)}</td>
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
              <th>{sim.alcanzable ? formatMoney(sim.peEnPesos) : '—'}</th>
              <th />
            </tr>
          </tfoot>
        </Table>
      </Card>
    </>
  )
}
