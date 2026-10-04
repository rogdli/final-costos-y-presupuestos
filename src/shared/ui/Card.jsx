export default function Card({ title, actions, children }) {
  return (
    <section className="ui-card">
      {(title || actions) && (
        <header className="ui-card__header">
          {title && <h2 className="ui-card__title">{title}</h2>}
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  )
}
