import BreakdownTable from './BreakdownTable';

function parseSummary(summary) {
  if (!summary) return {};
  if (typeof summary === 'string') {
    try {
      return JSON.parse(summary);
    } catch {
      return {};
    }
  }
  return summary;
}

function SeverityBadge({ severity }) {
  const s = (severity || 'unknown').toLowerCase();
  return <span className={`severity-badge severity-badge--${s}`}>{severity}</span>;
}

export default function AnalysisSummary({ analysis }) {
  const summary = parseSummary(analysis?.summary);
  const insights = Array.isArray(analysis?.insights)
    ? analysis.insights.filter(Boolean)
    : typeof analysis?.insights === 'string' && analysis.insights
      ? [analysis.insights]
      : [];

  const {
    totalReports = 0,
    highSeverityCount = 0,
    bySeverity = {},
    byLocation = {},
    byCategory = {},
    byMonth = {},
    topKeywords = [],
  } = summary;

  return (
    <div className="analysis-dashboard">
      <div className="analysis-dashboard-header">
        <h3 className="analysis-dashboard-title">Latest analysis</h3>
        {analysis?.createdAt && (
          <span className="analysis-dashboard-date">
            {new Date(analysis.createdAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card-label">Total reports</span>
          <span className="stat-card-value">{totalReports}</span>
        </div>
        <div className="stat-card stat-card--warn">
          <span className="stat-card-label">High / critical</span>
          <span className="stat-card-value">{highSeverityCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Locations tracked</span>
          <span className="stat-card-value">{Object.keys(byLocation).length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Categories tracked</span>
          <span className="stat-card-value">{Object.keys(byCategory).length}</span>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="insights-panel">
          <h4 className="table-card-title">Insights</h4>
          <ul className="insights-list">
            {insights.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="breakdown-grid">
        <BreakdownTable title="By severity" rows={Object.entries(bySeverity)} />
        <BreakdownTable title="By location" rows={Object.entries(byLocation)} />
        <BreakdownTable title="By category" rows={Object.entries(byCategory)} />
        <BreakdownTable title="By month" rows={Object.entries(byMonth)} />
      </div>

      <div className="table-card">
        <h4 className="table-card-title">Top keywords</h4>
        <div className="modern-table-wrap">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="modern-table-num">#</th>
                <th>Keyword</th>
              </tr>
            </thead>
            <tbody>
              {topKeywords.length === 0 ? (
                <tr>
                  <td colSpan={2} className="modern-table-empty">
                    No keywords extracted
                  </td>
                </tr>
              ) : (
                topKeywords.map((word, i) => (
                  <tr key={`${word}-${i}`}>
                    <td className="modern-table-num">{i + 1}</td>
                    <td>
                      <span className="keyword-chip">{word}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <h4 className="table-card-title">Severity overview</h4>
        <div className="modern-table-wrap">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th className="modern-table-num">Reports</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bySeverity).length === 0 ? (
                <tr>
                  <td colSpan={3} className="modern-table-empty">
                    No severity data
                  </td>
                </tr>
              ) : (
                Object.entries(bySeverity)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sev, count]) => {
                    const pct = totalReports
                      ? `${Math.round((count / totalReports) * 100)}%`
                      : '—';
                    return (
                      <tr key={sev}>
                        <td>
                          <SeverityBadge severity={sev} />
                        </td>
                        <td className="modern-table-num">{count}</td>
                        <td>{pct}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
