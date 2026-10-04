export default function Button({ variant = 'amber', type = 'button', children, ...props }) {
  return (
    <button type={type} className={`ui-button ui-button--${variant}`} {...props}>
      {children}
    </button>
  )
}
