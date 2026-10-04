export default function Tag({ tone = 'linen', children }) {
  return <span className={`ui-tag ui-tag--${tone}`}>{children}</span>
}
