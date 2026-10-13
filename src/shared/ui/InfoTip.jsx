import { useId, useState } from 'react'
import { Info } from 'lucide-react'

/**
 * Ícono de ayuda con una explicación corta. Se abre con hover, con foco de
 * teclado o tocándolo (mobile), y se cierra con Escape o al salir del foco.
 */
export default function InfoTip({ children, label = 'Más información' }) {
  const id = useId()
  const [abierto, setAbierto] = useState(false)

  return (
    <span className={`ui-infotip ${abierto ? 'ui-infotip--abierto' : ''}`}>
      <button
        type="button"
        className="ui-infotip__trigger"
        aria-label={label}
        aria-describedby={id}
        onClick={() => setAbierto((a) => !a)}
        onBlur={() => setAbierto(false)}
        onKeyDown={(e) => e.key === 'Escape' && setAbierto(false)}
      >
        <Info size={16} strokeWidth={1.5} />
      </button>
      <span role="tooltip" id={id} className="ui-infotip__bubble">
        {children}
      </span>
    </span>
  )
}
