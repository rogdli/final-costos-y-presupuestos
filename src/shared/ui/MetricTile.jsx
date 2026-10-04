export default function MetricTile({ label, value, tone = 'espresso' }) {
  return (
    <div className="ui-metric-tile">
      <p className="ui-metric-tile__label">{label}</p>
      <p className={`ui-metric-tile__value ui-metric-tile__value--${tone}`}>{value}</p>
    </div>
  )
}
