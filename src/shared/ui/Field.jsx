export default function Field({ label, className = '', children }) {
  return (
    <label className={`ui-field ${className}`.trim()}>
      <span className="ui-field__label">{label}</span>
      {children}
    </label>
  )
}
