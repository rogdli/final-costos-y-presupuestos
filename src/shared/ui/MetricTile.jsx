import InfoTip from './InfoTip'

export default function MetricTile({ label, value, tone = 'espresso', info }) {
  return (
    <div className="ui-metric-tile">
      <div className="ui-metric-tile__label">
        <span>{label}</span>
        {info && <InfoTip label={`Cómo se calcula ${label}`}>{info}</InfoTip>}
      </div>
      <p className={`ui-metric-tile__value ui-metric-tile__value--${tone}`}>{value}</p>
    </div>
  )
}
