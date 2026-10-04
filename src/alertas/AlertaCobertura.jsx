import { CircleCheck, TriangleAlert } from 'lucide-react'

export default function AlertaCobertura({ cubreCostosFijos }) {
  const Icon = cubreCostosFijos ? CircleCheck : TriangleAlert

  return (
    <div className={`ui-alert ${cubreCostosFijos ? 'ui-alert--ok' : 'ui-alert--warn'}`}>
      <Icon size={16} strokeWidth={1.5} />
      {cubreCostosFijos
        ? 'Cubre los costos fijos: resultado operativo positivo.'
        : 'No cubre los costos fijos: el margen de contribución no alcanza a cubrir la estructura fija.'}
    </div>
  )
}
