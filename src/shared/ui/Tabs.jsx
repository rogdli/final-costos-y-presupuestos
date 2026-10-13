import { useId, useState } from 'react'

/**
 * Pestañas con ícono. tabs: [{ id, label, Icon, content }].
 * La activa se marca con una línea ámbar que crece desde el centro.
 */
export default function Tabs({ tabs, label }) {
  const [activa, setActiva] = useState(tabs[0].id)
  const prefijo = useId()
  const actual = tabs.find((t) => t.id === activa)

  return (
    <>
      <div className="ui-tabs" role="tablist" aria-label={label}>
        {tabs.map(({ id, label: texto, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${prefijo}-tab-${id}`}
            aria-selected={activa === id}
            aria-controls={`${prefijo}-panel-${id}`}
            className={`ui-tab ${activa === id ? 'ui-tab--active' : ''}`}
            onClick={() => setActiva(id)}
          >
            <Icon size={18} strokeWidth={1.5} />
            {texto}
          </button>
        ))}
      </div>

      <div
        key={actual.id}
        role="tabpanel"
        id={`${prefijo}-panel-${actual.id}`}
        aria-labelledby={`${prefijo}-tab-${actual.id}`}
        className="ui-tab-panel"
      >
        {actual.content}
      </div>
    </>
  )
}
