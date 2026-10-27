import { useState } from 'react';

function DetailRow({ label, value, children }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{children ?? value ?? '—'}</td>
    </tr>
  );
}

function SeverityBadge({ severity }) {
  const s = (severity || 'unknown').toLowerCase();
  return <span className={`severity-badge severity-badge--${s}`}>{severity}</span>;
}

export default function ReportDetailTable({ report, authHeaders }) {
  const [dlError, setDlError] = useState(null);
  if (!report) return null;

  const downloadTranscript = async () => {
    setDlError(null);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}/transcript`, { headers: authHeaders ? authHeaders() : {} });
      if (!res.ok) throw new Error('Transcript not available.');
      const blob = await res.blob();
      const ext = (report.transcript_path || '').toLowerCase().endsWith('.txt') ? '.txt' : '.docx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${report.id}${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setDlError(e.message);
    }
  };

  const meta = report.metadata;
  const ids = report.identifiers;

  return (
    <div className="table-card report-detail-card">
      <h3 className="table-card-title">Report detail</h3>
      <div className="modern-table-wrap">
        <table className="modern-table modern-table--detail">
          <tbody>
            <DetailRow label="Report ID" value={report.id} />
            <DetailRow label="Type" value={report.report_type} />
            <DetailRow label="Submission" value={report.submission_type} />
            <DetailRow label="Severity">
              <SeverityBadge severity={report.severity} />
            </DetailRow>
            <DetailRow
              label="Created"
              value={new Date(report.created_at).toLocaleString()}
            />
            {meta && (
              <>
                <DetailRow
                  label="Location"
                  value={meta.location_place || meta.location_campus || '—'}
                />
                <DetailRow label="Category" value={meta.category || '—'} />
                <DetailRow
                  label="Perpetrator relation"
                  value={meta.perpetrator_relation || '—'}
                />
              </>
            )}
          </tbody>
        </table>
      </div>

      {report.submission_type === 'audio' && report.audio_path && (
        <div className="report-detail-block">
          <h4 className="table-card-subtitle">Audio recording</h4>
          <audio src={report.audio_path} controls className="report-audio" />
        </div>
      )}

      {report.submission_type === 'audio' && (
        <div className="report-detail-block">
          <h4 className="table-card-subtitle">
            Transcript{report.transcript_language ? ` (${report.transcript_language})` : ''}
          </h4>
          <div className="report-content-box" style={{ whiteSpace: 'pre-wrap' }}>
            {report.transcribed_text || '—'}
          </div>
          {report.transcript_path ? (
            <button type="button" onClick={downloadTranscript} className="btn-secondary" style={{ marginTop: '0.5rem' }}>
              Download transcript ({report.transcript_path.toLowerCase().endsWith('.txt') ? '.txt' : '.docx'})
            </button>
          ) : (
            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>No transcript document for this report.</p>
          )}
          {dlError && <p className="text-danger">{dlError}</p>}
        </div>
      )}

      {report.submission_type !== 'audio' && (
      <div className="report-detail-block">
        <h4 className="table-card-subtitle">Content / transcribed text</h4>
        <div className="report-content-box">
          {report.content_text || report.transcribed_text || '—'}
        </div>
      </div>
      )}

      {ids && (
        <div className="report-detail-block">
          <h4 className="table-card-subtitle">Reporter (signed)</h4>
          <div className="modern-table-wrap">
            <table className="modern-table modern-table--detail">
              <tbody>
                <DetailRow label="Student ID" value={ids.student_id} />
                <DetailRow label="Full name" value={ids.full_name} />
                <DetailRow label="Email" value={ids.email} />
                <DetailRow label="Phone" value={ids.phone} />
                <DetailRow label="Faculty" value={ids.faculty} />
                <DetailRow label="Year of study" value={ids.year_of_study} />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
