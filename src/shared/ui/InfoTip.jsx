import { useId, useRef, useState } from 'react'
import { Info } from 'lucide-react'

/**
 * Ícono de ayuda con una explicación corta. Se abre con hover, con foco de
 * teclado o tocándolo (mobile), y se cierra con Escape o al salir del foco.
 */
export default function InfoTip({ children, label = 'Más información' }) {
  const id = useId()
  const [abierto, setAbierto] = useState(false)
  const [alinearDerecha, setAlinearDerecha] = useState(false)
  const triggerRef = useRef(null)

  function ubicarAyuda() {
    const borde = triggerRef.current?.getBoundingClientRect().right ?? 0
    setAlinearDerecha(borde + Math.min(340, window.innerWidth * 0.8) > window.innerWidth - 16)
  }

  return (
    <span className={`ui-infotip ${abierto ? 'ui-infotip--abierto' : ''} ${alinearDerecha ? 'ui-infotip--derecha' : ''}`}
      onMouseEnter={ubicarAyuda}>
      <button
        ref={triggerRef}
        type="button"
        className="ui-infotip__trigger"
        aria-label={label}
        aria-describedby={id}
        onClick={() => {
          ubicarAyuda()
          setAbierto((a) => !a)
        }}
        onFocus={ubicarAyuda}
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
