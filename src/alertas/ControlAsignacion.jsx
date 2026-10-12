import { CircleCheck, TriangleAlert } from 'lucide-react'
import { formatMoney, formatPercent } from '../shared/format'

/**
 * Control de cierre: la plata cargada en comprobantes tiene que ser igual a la
 * plata repartida entre los productos. Si no coincide, avisa qué falta.
 */
export default function ControlAsignacion({ control }) {
  const Icon = control.completo ? CircleCheck : TriangleAlert

  const motivo = control.sinProductos
    ? 'No hay productos cargados: no hay entre quiénes repartir los costos indirectos.'
    : control.baseDriverEnCero
      ? 'Las unidades vendidas y las horas de producción están en cero: el driver no puede repartir el pool indirecto.'
      : 'Revisá los comprobantes: hay importes que no llegaron a ningún producto.'

  return (
    <div className={`ui-alert ${control.completo ? 'ui-alert--ok' : 'ui-alert--warn'}`}>
      <Icon size={16} strokeWidth={1.5} />
      <span>
        {control.completo ? (
          <>
            Todo asignado: se cargaron {formatMoney(control.totalCargado)} y se repartieron{' '}
            {formatMoney(control.totalAsignado)} entre los productos ({formatPercent(control.cobertura)}).
          </>
        ) : (
          <>
            Quedaron {formatMoney(control.diferencia)} sin asignar de {formatMoney(control.totalCargado)} cargados (
            {formatPercent(control.cobertura)} asignado). {motivo}
          </>
        )}
      </span>
    </div>
  )
}
