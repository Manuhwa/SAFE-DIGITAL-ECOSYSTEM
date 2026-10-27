import { useState, useEffect, useCallback } from 'react';
import AnalysisSummary from '../components/AnalysisSummary';
import ReportDetailTable from '../components/ReportDetailTable';

const API = '/api';

function SeverityBadge({ severity }) {
  const s = (severity || 'unknown').toLowerCase();
  return <span className={`severity-badge severity-badge--${s}`}>{severity || '—'}</span>;
}
const ADMIN_TOKEN_KEY = 'safe_admin_token';

function getToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Admin() {
  const [token, setTokenState] = useState(getToken());
  const [admin, setAdmin] = useState(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);

  const isLoggedIn = !!token;

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/admin/accommodation-alerts`, { headers: authHeaders() }).then((r) => (r.status === 401 ? null : r.json())),
      fetch(`${API}/admin/reports`, { headers: authHeaders() }).then((r) => (r.status === 401 ? null : r.json())),
      fetch(`${API}/analysis/latest`, { headers: authHeaders() }).then((r) => (r.status === 401 ? null : r.json())),
    ])
      .then(([a, r, an]) => {
        if (a === null || r === null) {
          setTokenState(null);
          setToken(null);
          return;
        }
        setAlerts(Array.isArray(a) ? a : []);
        setReports(Array.isArray(r) ? r : []);
        setAnalysis(an && (an.summary || an.insights) ? an : null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  useEffect(() => {
    if (!selectedReportId || !token) {
      setReportDetail(null);
      return;
    }
    fetch(`${API}/admin/reports/${selectedReportId}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then(setReportDetail)
      .catch(() => setReportDetail(null));
  }, [selectedReportId, token]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    fetch(`${API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginUsername.trim(), password: loginPassword }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setLoginError(data.error);
          return;
        }
        setToken(data.token);
        setTokenState(data.token);
        setAdmin(data.admin || {});
        setLoginPassword('');
      })
      .catch(() => setLoginError('Login failed.'))
      .finally(() => setLoginLoading(false));
  };

  const handleLogout = () => {
    fetch(`${API}/admin/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
    setToken(null);
    setTokenState(null);
    setAdmin(null);
    setSelectedReportId(null);
    setReportDetail(null);
  };

  const runAnalysis = () => {
    setAnalysisRunning(true);
    fetch(`${API}/analysis/run`, { method: 'POST', headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then(() => load())
      .finally(() => setAnalysisRunning(false));
  };

  const acknowledge = (id) => {
    fetch(`${API}/admin/accommodation-alerts/${id}/acknowledge`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then(() => load());
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <h1 className="page-title">Admin login</h1>
        <p className="page-subtitle">Sign in to view reports and manage accommodation alerts.</p>
        <form onSubmit={handleLogin} style={styles.loginForm}>
          <input
            type="text"
            placeholder="Username"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
            className="form-input-full"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            className="form-input-full"
            autoComplete="current-password"
          />
          {loginError && <p className="alert-error">{loginError}</p>}
          <button type="submit" disabled={loginLoading} style={styles.submitBtn}>
            {loginLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="admin-header-row">
        <div>
          <h1 className="page-title">Admin</h1>
          <p className="page-subtitle">
            {admin?.email && <span>Signed in as {admin.email}</span>}
            {' · '}
            Accommodation alerts, reports, and pattern analysis.
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="logout-btn">
          Sign out
        </button>
      </div>

      {loading && !alerts.length && !reports.length ? (
        <p style={{ color: 'var(--textMuted)' }}>Loading…</p>
      ) : (
        <>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Academic accommodation alerts</h2>
            <p style={styles.hint}>Reports where severity indicates the student may need academic accommodation.</p>
            {alerts.length === 0 ? (
              <p style={styles.empty}>No accommodation alerts.</p>
            ) : (
              <div className="modern-table-wrap">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Severity</th>
                      <th>Notified</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((a) => (
                      <tr key={a.id}>
                        <td className="mono-cell">{a.report_id?.slice(0, 8)}…</td>
                        <td><SeverityBadge severity={a.severity} /></td>
                        <td>{new Date(a.admin_notified_at).toLocaleString()}</td>
                        <td>
                          <span className={`status-pill ${a.acknowledged ? 'status-pill--ok' : 'status-pill--pending'}`}>
                            {a.acknowledged ? 'Acknowledged' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {!a.acknowledged && (
                            <button type="button" onClick={() => acknowledge(a.id)} className="btn-table">
                              Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Reports</h2>
            <p style={styles.hint}>Click a report to read full details (content and, for signed reports, reporter details).</p>
            {reports.length === 0 ? (
              <p style={styles.empty}>No reports yet.</p>
            ) : (
              <div className="modern-table-wrap">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Submission</th>
                      <th>Severity</th>
                      <th>Accommodation</th>
                      <th>Created</th>
                      <th>Location</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        className={selectedReportId === r.id ? 'modern-table-row--active' : ''}
                      >
                        <td className="mono-cell">{r.id.slice(0, 8)}…</td>
                        <td>{r.report_type}</td>
                        <td>{r.submission_type}</td>
                        <td><SeverityBadge severity={r.severity} /></td>
                        <td>
                          <span className={`status-pill ${r.needs_accommodation ? 'status-pill--warn' : 'status-pill--muted'}`}>
                            {r.needs_accommodation ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>{new Date(r.created_at).toLocaleString()}</td>
                        <td>{r.location_place || r.location_campus || '—'}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelectedReportId(selectedReportId === r.id ? null : r.id)}
                            className="btn-table"
                          >
                            {selectedReportId === r.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {reportDetail && <ReportDetailTable report={reportDetail} authHeaders={authHeaders} />}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>AI pattern analysis</h2>
            <p style={styles.hint}>Analyse patterns from report data. Requires admin login.</p>
            <button type="button" onClick={runAnalysis} disabled={analysisRunning} style={styles.runBtn}>
              {analysisRunning ? 'Running…' : 'Run pattern analysis'}
            </button>
            {analysis && <AnalysisSummary analysis={analysis} />}
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {},
  loginForm: { maxWidth: 400, width: '100%' },
  submitBtn: { padding: '0.6rem 1.25rem', background: 'var(--safe)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 },
  section: { marginBottom: '2rem' },
  sectionTitle: { marginBottom: '0.5rem', color: 'var(--text)' },
  hint: { color: 'var(--textMuted)', fontSize: '0.9rem', marginBottom: '0.75rem' },
  empty: { color: 'var(--textMuted)', fontStyle: 'italic' },
  runBtn: { padding: '0.6rem 1rem', background: 'var(--safe)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, minHeight: 44 },
};
