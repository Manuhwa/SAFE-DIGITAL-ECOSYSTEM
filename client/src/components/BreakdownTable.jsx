/** Two-column breakdown table: label + count */
export default function BreakdownTable({ title, rows, emptyLabel = 'No data' }) {
  const sorted = [...(rows || [])].sort((a, b) => b[1] - a[1]);

  return (
    <div className="table-card">
      <h4 className="table-card-title">{title}</h4>
      <div className="modern-table-wrap">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="modern-table-num">Count</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={2} className="modern-table-empty">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              sorted.map(([label, count]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="modern-table-num">{count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
