import InfoTip from './InfoTip'

export default function Card({ title, info, actions, children }) {
  return (
    <section className="ui-card">
      {(title || info || actions) && (
        <header className="ui-card__header">
          {(title || info) && (
            <div className="ui-card__title-row">
              {title ? (
                <h2 className="ui-card__title">{title}</h2>
              ) : (
                <span className="ui-card__help-label">¿Cómo se calcula?</span>
              )}
              {info && <InfoTip label={`Ayuda: ${title ?? 'cómo se calcula'}`}>{info}</InfoTip>}
            </div>
          )}
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  )
}
