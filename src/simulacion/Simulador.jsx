import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import Button from '../shared/ui/Button'
import MetricTile from '../shared/ui/MetricTile'
import Field from '../shared/ui/Field'
import Divider from '../shared/ui/Divider'
import SectionHeading from '../shared/ui/SectionHeading'
import AlertaCobertura from '../alertas/AlertaCobertura'
import GraficoResultados from './GraficoResultados'
import { formatMoney, formatNumber, formatPercent } from '../shared/format'
import { numeroNoNegativo } from '../shared/numeros'

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

function PrecioSimuladoControl({ producto, precioIngresado, onCambiarPrecio }) {
  const precioBase = Math.max(0, Number(producto.precioVenta ?? producto.precioCompetencia) || 0)
  const precioSimulado = precioIngresado ?? precioBase
  const [precioMaximo, setPrecioMaximo] = useState(() =>
    Math.max(precioBase * 2, precioSimulado, precioBase > 0 ? 1 : 1000)
  )
  const [error, setError] = useState('')

  function cambiarPrecioExacto(valor) {
    if (valor === '') {
      setError('')
      onCambiarPrecio(producto.id, '')
      return
    }

    const precio = numeroNoNegativo(valor)
    if (precio === null) {
      setError('El precio debe ser 0 o mayor.')
      return
    }
    setError('')
    setPrecioMaximo((maximo) => Math.max(maximo, precio))
    onCambiarPrecio(producto.id, precio)
  }

  return (
    <div className="ui-price-control">
      <input
        type="number"
        min="0"
        step="any"
        aria-label={`Precio simulado de ${producto.nombre}`}
        aria-invalid={Boolean(error)}
        placeholder={precioBase}
        value={precioIngresado ?? ''}
        onChange={(e) => cambiarPrecioExacto(e.target.value)}
      />
      {error && <span className="ui-field__error" role="alert">{error}</span>}
      <input
        type="range"
        min="0"
        max={precioMaximo}
        step="1"
        aria-label={`Ajustar precio simulado de ${producto.nombre}`}
        value={precioSimulado}
        onChange={(e) => onCambiarPrecio(producto.id, e.target.value)}
      />
      <div className="ui-price-control__limits" aria-hidden="true">
        <span>$0</span>
        <span>{formatMoney(precioMaximo)}</span>
      </div>
    </div>
  )
}

function CantidadSimuladaControl({ producto, cantidadIngresada, onCambiarCantidad }) {
  const [error, setError] = useState('')

  function cambiarCantidad(valor) {
    if (valor !== '' && numeroNoNegativo(valor, { entero: true }) === null) {
      setError('Usá una cantidad entera de 0 o más.')
      return
    }
    setError('')
    onCambiarCantidad(producto.id, valor)
  }

  return (
    <div className="ui-simulated-number">
      <input
        type="number"
        min="0"
        step="1"
        aria-label={`Cantidad simulada de ${producto.nombre}`}
        aria-invalid={Boolean(error)}
        placeholder={producto.cantidadVendida}
        value={cantidadIngresada ?? ''}
        onChange={(e) => cambiarCantidad(e.target.value)}
      />
      {error && <span className="ui-field__error" role="alert">{error}</span>}
    </div>
  )
}

export default function Simulador({
  productos,
  overrides,
  utilidadObjetivo,
  onCambiarPrecio,
  onCambiarPreciosGlobal,
  onCambiarCantidad,
  onCambiarAjuste,
  onCambiarUtilidadObjetivo,
  onRestablecer,
  casoBase,
  casoSimulado,
}) {
  const base = casoBase.puntoEquilibrio
  const sim = casoSimulado.puntoEquilibrio
  const [errorUtilidad, setErrorUtilidad] = useState('')

  function cambiarUtilidad(valor) {
    if (valor !== '' && numeroNoNegativo(valor) === null) {
      setErrorUtilidad('La utilidad objetivo debe ser 0 o mayor.')
      return
    }
    setErrorUtilidad('')
    onCambiarUtilidadObjetivo(valor)
  }

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

      <GraficoResultados productos={productos} margen={casoSimulado.margen} />

      <Card title="Variables del escenario">
        <SectionHeading info="Mové la barra para subir o bajar todos los precios respecto del precio base. Por ejemplo, 110% aumenta cada precio un 10%. Podés ajustar un producto por separado abajo; si volvés a mover la barra global, el porcentaje se aplica otra vez a todos.">Precio global</SectionHeading>
        <div className="ui-global-price">
          <div className="ui-global-price__heading">
            <label htmlFor="precio-global">Mismo ajuste para todos los productos</label>
            <strong>
              {overrides.porcentajePrecioGlobal === null
                ? 'Precios ajustados individualmente'
                : `${overrides.porcentajePrecioGlobal}% del precio base`}
            </strong>
          </div>
          <input
            id="precio-global"
            type="range"
            min="0"
            max="200"
            step="1"
            value={overrides.porcentajePrecioGlobal ?? 100}
            onChange={(e) => onCambiarPreciosGlobal(e.target.value)}
            disabled={productos.length === 0}
          />
          <div className="ui-price-control__limits" aria-hidden="true">
            <span>0%</span>
            <span>100% (base)</span>
            <span>200%</span>
          </div>
        </div>
        <Divider />
        <SectionHeading>Precio y cantidad por producto</SectionHeading>

        <Table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio de venta base</th>
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
                <td>{formatMoney(producto.precioVenta ?? producto.precioCompetencia)}</td>
                <td>
                  <PrecioSimuladoControl
                    producto={producto}
                    precioIngresado={overrides.precios[producto.id]}
                    onCambiarPrecio={onCambiarPrecio}
                  />
                </td>
                <td>{formatNumber(producto.cantidadVendida)}</td>
                <td>
                  <CantidadSimuladaControl
                    producto={producto}
                    cantidadIngresada={overrides.cantidades[producto.id]}
                    onCambiarCantidad={onCambiarCantidad}
                  />
                </td>
                <td>{formatMoney(casoSimulado.preciosSugeridos.porProducto[i].precioSugerido)}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <p className="ui-hint">
          Arrastrá la barra para probar otro precio por producto. Arranca en $0 y normalmente llega al doble del precio
          base. Si escribís un valor mayor, el tope se amplía. El escenario se actualiza al instante.
        </p>

        <Divider />
        <SectionHeading info="En las barras de costos, 100% deja el valor actual, 90% lo baja un 10% y 110% lo sube un 10%. Al cambiar cantidades, los costos variables asociados a productos acompañan ese volumen; los variables generales se ajustan con el driver elegido. Si el driver son horas, se estiman según las horas por unidad del caso base. Los datos base no se modifican.">
          Costos y utilidad
        </SectionHeading>

        <div className="ui-form-grid">
          <Field label="Costos variables (% del valor base)">
            <input
              type="range"
              className="ui-cost-range"
              min="0"
              max="200"
              step="1"
              value={100 + (overrides.ajusteVariables ?? 0)}
              onChange={(e) => onCambiarAjuste('ajusteVariables', e.target.value)}
            />
            <span className="ui-cost-range__value">{100 + (overrides.ajusteVariables ?? 0)}% (100% = actual)</span>
          </Field>
          <Field label="Costos fijos (% del valor base)">
            <input
              type="range"
              className="ui-cost-range"
              min="0"
              max="200"
              step="1"
              value={100 + (overrides.ajusteFijos ?? 0)}
              onChange={(e) => onCambiarAjuste('ajusteFijos', e.target.value)}
            />
            <span className="ui-cost-range__value">{100 + (overrides.ajusteFijos ?? 0)}% (100% = actual)</span>
          </Field>
          <Field label="Utilidad mensual objetivo">
            <input
              type="number"
              min="0"
              step="any"
              value={utilidadObjetivo === 0 ? '' : utilidadObjetivo}
              placeholder="0"
              aria-invalid={Boolean(errorUtilidad)}
              onChange={(e) => cambiarUtilidad(e.target.value)}
            />
            {errorUtilidad && <span className="ui-field__error" role="alert">{errorUtilidad}</span>}
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
