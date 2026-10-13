import { ChartPie, ReceiptText } from 'lucide-react'
import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Tabs from '../shared/ui/Tabs'
import { formatMoney } from '../shared/format'
import { TIPO } from '../shared/comprobantes'

export default function GastosFijos({ comprobantes, gastosAdministracion, costosFijosTotales, desglose }) {
  const items = comprobantes.filter((c) => c.tipoFuncional === TIPO.GASTO_ADM)

  const composicion = (
    <Table>
      <thead>
        <tr>
          <th>Tipo funcional</th>
          <th>Importe fijo</th>
        </tr>
      </thead>
      <tbody>
        {desglose.map((fila) => (
          <tr key={fila.tipoFuncional}>
            <td>{fila.tipoFuncional}</td>
            <td>{formatMoney(fila.importe)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th>Total</th>
          <th>{formatMoney(costosFijosTotales)}</th>
        </tr>
      </tfoot>
    </Table>
  )

  const detalle = (
    <Table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Importe</th>
          <th>Comportamiento</th>
        </tr>
      </thead>
      <tbody>
        {items.map((c) => (
          <tr key={c.numero}>
            <td>{c.concepto}</td>
            <td>{formatMoney(c.importe)}</td>
            <td>{c.comportamiento}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th>Total</th>
          <th>{formatMoney(gastosAdministracion)}</th>
          <th />
        </tr>
      </tfoot>
    </Table>
  )

  return (
    <Card info="Costos fijos = suma de importes marcados Fijo. Gastos de administración y ventas = suma de ese tipo funcional.">
      <div className="ui-metric-row">
        <MetricTile
          label="Gastos de administración y ventas"
          value={formatMoney(gastosAdministracion)}
          info="Suma de comprobantes tipo Gasto Adm. y Venta."
        />
        <MetricTile
          label="Costos fijos totales de la empresa"
          value={formatMoney(costosFijosTotales)}
          info="Suma de comprobantes marcados Fijo."
        />
      </div>

      <Tabs
        label="Detalle de los costos fijos"
        tabs={[
          { id: 'composicion', label: 'Composición de los costos fijos', Icon: ChartPie, content: composicion },
          { id: 'detalle', label: 'Detalle de administración y ventas', Icon: ReceiptText, content: detalle },
        ]}
      />
    </Card>
  )
}
