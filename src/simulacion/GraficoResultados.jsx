import Card from '../shared/ui/Card'
import { formatMoney } from '../shared/format'

export default function GraficoResultados({ productos, margen }) {
  const filas = margen.porProducto.map((fila, index) => ({
    id: fila.productoId,
    nombre: productos[index]?.nombre ?? fila.productoId,
    ventas: fila.ventas,
    costosVariables: fila.costoVariableUnitario * fila.cantidadVendida,
    margen: fila.mcTotal,
  }))
  const escala = Math.max(1, ...filas.flatMap(({ ventas, costosVariables, margen: contribucion }) => [
    Math.abs(ventas), Math.abs(costosVariables), Math.abs(contribucion),
  ]))

  return (
    <Card title="Ventas, costos y margen por producto" info="Ventas = precio × cantidad. Costos variables = costo variable unitario × cantidad. Margen = ventas − costos variables.">
      {filas.length === 0 ? (
        <p className="ui-hint">Agregá productos para ver la comparación.</p>
      ) : (
        <>
          <p className="ui-hint">El gráfico usa los valores simulados y la misma escala para todos los productos.</p>
          <div className="ui-product-chart">
            {filas.map((fila) => (
              <div className="ui-product-chart__item" key={fila.id}>
                <h3>{fila.nombre}</h3>
                {[
                  { label: 'Ventas', valor: fila.ventas, clase: 'ventas' },
                  { label: 'Costos variables', valor: fila.costosVariables, clase: 'costos' },
                  { label: 'Margen', valor: fila.margen, clase: fila.margen < 0 ? 'negativo' : 'margen' },
                ].map(({ label, valor, clase }) => (
                  <div className="ui-product-chart__row" key={label}>
                    <span>{label}</span>
                    <div className="ui-product-chart__track" aria-hidden="true">
                      <div
                        className={`ui-product-chart__bar ui-product-chart__bar--${clase}`}
                        style={{ width: `${Math.min(100, Math.abs(valor) / escala * 100)}%` }}
                      />
                    </div>
                    <strong>{formatMoney(valor)}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
