export default function Table({ children }) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">{children}</table>
    </div>
  )
}
