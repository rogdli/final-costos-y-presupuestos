import { CircleCheck, TriangleAlert } from 'lucide-react'

export default function CoberturaBadge({ cubreCostosFijos }) {
  const Icon = cubreCostosFijos ? CircleCheck : TriangleAlert

  return (
    <span className={`ui-badge ${cubreCostosFijos ? 'ui-badge--ok' : 'ui-badge--warn'}`}>
      <Icon size={14} strokeWidth={1.5} />
      {cubreCostosFijos ? 'Cubre costos fijos' : 'No cubre costos fijos'}
    </span>
  )
}
