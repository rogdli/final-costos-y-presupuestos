import Card from '../shared/ui/Card'
import Table from '../shared/ui/Table'
import MetricTile from '../shared/ui/MetricTile'
import Divider from '../shared/ui/Divider'
import { formatMoney } from '../shared/format'

export default function GastosFijos({ comprobantes, total }) {
  const items = comprobantes.filter((c) => c.tipoFuncional === 'Gasto Adm. y Venta')

  return (
    <Card>
      <MetricTile label="Total gastos fijos Adm. y Venta" value={formatMoney(total)} />

      <Divider />

      <Table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.numero}>
              <td>{c.concepto}</td>
              <td>{formatMoney(c.importe)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
