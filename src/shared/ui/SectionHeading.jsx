import InfoTip from './InfoTip'

export default function SectionHeading({ info, children }) {
  return (
    <h3 className="ui-section-heading">
      {children}
      {info && <InfoTip label={`Ayuda: ${children}`}>{info}</InfoTip>}
    </h3>
  )
}
