import { useState, useRef, useEffect } from 'react';

const API = '/api';

// Read a fetch response safely: never crash on an empty or non-JSON body
async function readJson(res) {
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (_) { data = null; }
  }
  if (!res.ok) {
    let msg = data && data.error;
    if (!msg) {
      msg = res.status >= 500 || !text
        ? `The server did not respond properly (HTTP ${res.status}). Make sure the backend is running (run-backend.bat) and try again.`
        : `Request failed (HTTP ${res.status}).`;
    }
    throw new Error(msg);
  }
  if (!data) throw new Error('The server sent an empty response. Make sure the backend is running (run-backend.bat) and try again.');
  return data;
}

export default function Report() {
  const [reportType, setReportType] = useState('anonymous');
  const [submissionType, setSubmissionType] = useState('text');
  const [contentText, setContentText] = useState('');
  const [signed, setSigned] = useState({ studentId: '', fullName: '', email: '', phone: '', faculty: '', yearOfStudy: '' });
  const [meta, setMeta] = useState({ locationPlace: '', locationCampus: '', category: '', perpetratorRelation: '' });
  const [recording, setRecording] = useState(null);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef({ recorder: null, stream: null });

  // Live speech-to-text (Web Speech API, Chrome/Edge)
  const SpeechRec = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const speechSupported = !!SpeechRec;
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  const startTranscription = () => {
    if (!SpeechRec) return;
    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language;
      rec.onresult = (event) => {
        let finalText = '';
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interimText += r[0].transcript;
        }
        if (finalText) {
          setTranscript((t) => (t ? `${t.trimEnd()} ${finalText.trim()}` : finalText.trim()));
        }
        setInterim(interimText);
      };
      rec.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          listeningRef.current = false;
          setSpeechError('Live transcription was blocked. Your audio is still being recorded; you can type the transcript yourself.');
        } else if (e.error === 'network') {
          setSpeechError('Live transcription needs an internet connection. Your audio is still being recorded.');
        } else if (e.error === 'language-not-supported') {
          listeningRef.current = false;
          setSpeechError('This language is not supported for live transcription. Try English.');
        }
      };
      // Browsers stop recognition after silence; restart while still recording
      rec.onend = () => {
        setInterim('');
        if (listeningRef.current) {
          try { rec.start(); } catch (_) { /* ignore */ }
        }
      };
      recognitionRef.current = rec;
      listeningRef.current = true;
      setSpeechError(null);
      rec.start();
    } catch (e) {
      setSpeechError('Could not start live transcription. Your audio is still being recorded.');
    }
  };

  const stopTranscription = () => {
    listeningRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch (_) { /* ignore */ }
    }
    recognitionRef.current = null;
    setInterim('');
  };

  useEffect(() => () => stopTranscription(), []);

  // simple timer while recording
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
        setStatus({ error: 'Audio recording is not supported in this browser. Please use a modern browser like Chrome or Edge.' });
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingBlob(blob);
        setRecording(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        stopTranscription();
      };
      recorder.start();
      setTranscript('');
      setInterim('');
      startTranscription();
      mediaRecorderRef.current = { recorder, stream };
      setStatus(null);
      setRecording(null);
      setRecordingBlob(null);
      setRecordSeconds(0);
      setIsRecording(true);
    } catch (e) {
      setStatus({ error: 'Microphone access denied or unavailable.' });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const ref = mediaRecorderRef.current;
    if (ref && ref.recorder && ref.recorder.state === 'recording') {
      ref.recorder.stop();
    }
    stopTranscription();
  };

  const submitText = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          submissionType: 'text',
          contentText: contentText.trim(),
          ...(reportType === 'signed' ? signed : {}),
          locationPlace: meta.locationPlace || undefined,
          locationCampus: meta.locationCampus || undefined,
          category: meta.category || undefined,
          perpetratorRelation: meta.perpetratorRelation || undefined,
        }),
      });
      const data = await readJson(res);
      setStatus({ success: true, ...data });
      setContentText('');
    } catch (err) {
      setStatus({ error: err.message === 'Failed to fetch' ? 'Could not reach the server. Check your connection and that the backend is running.' : err.message });
    } finally {
      setLoading(false);
    }
  };

  const submitAudio = async (e) => {
    e.preventDefault();
    if (!recordingBlob) {
      setStatus({ error: 'Please record audio first.' });
      return;
    }
    setStatus(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('audio', recordingBlob, 'report.webm');
      form.append('reportType', reportType);
      form.append('transcript', transcript.trim());
      form.append('transcriptLanguage', language);
      if (reportType === 'signed') {
        Object.entries(signed).forEach(([k, v]) => v && form.append(k, v));
      }
      Object.entries(meta).forEach(([k, v]) => v && form.append(k, v));
      const res = await fetch(`${API}/reports/submit/audio`, { method: 'POST', body: form });
      const data = await readJson(res);
      setStatus({ success: true, ...data });
      setRecording(null);
      setRecordingBlob(null);
      setTranscript('');
    } catch (err) {
      setStatus({ error: err.message === 'Failed to fetch' ? 'Could not reach the server. Check your connection and that the backend is running.' : err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 className="page-title">Submit a Report</h1>
      <p className="page-subtitle">Choose anonymous or signed, then text or audio. All reports are timestamped.</p>

      <form onSubmit={submissionType === 'text' ? submitText : submitAudio} style={styles.form}>
        <section style={styles.section}>
          <h2 className="form-section-title">1. Report type</h2>
          <label style={styles.radioLabel}>
            <input type="radio" name="reportType" checked={reportType === 'anonymous'} onChange={() => setReportType('anonymous')} />
            <span>Anonymous – no personal details stored</span>
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="reportType" checked={reportType === 'signed'} onChange={() => setReportType('signed')} />
            <span>Signed – I will provide my details for follow-up</span>
          </label>
        </section>

        {reportType === 'signed' && (
          <section style={styles.section}>
            <h2 className="form-section-title">Your details (optional but helpful)</h2>
            <div className="report-grid">
              <input placeholder="Student ID" value={signed.studentId} onChange={(e) => setSigned((s) => ({ ...s, studentId: e.target.value }))} style={styles.input} />
              <input placeholder="Full name" value={signed.fullName} onChange={(e) => setSigned((s) => ({ ...s, fullName: e.target.value }))} style={styles.input} />
              <input type="email" placeholder="Email" value={signed.email} onChange={(e) => setSigned((s) => ({ ...s, email: e.target.value }))} style={styles.input} />
              <input placeholder="Phone" value={signed.phone} onChange={(e) => setSigned((s) => ({ ...s, phone: e.target.value }))} style={styles.input} />
              <input placeholder="Faculty" value={signed.faculty} onChange={(e) => setSigned((s) => ({ ...s, faculty: e.target.value }))} style={styles.input} />
              <input placeholder="Year of study" value={signed.yearOfStudy} onChange={(e) => setSigned((s) => ({ ...s, yearOfStudy: e.target.value }))} style={styles.input} />
            </div>
          </section>
        )}

        <section style={styles.section}>
          <h2 className="form-section-title">2. How to submit</h2>
          <label style={styles.radioLabel}>
            <input type="radio" name="submissionType" checked={submissionType === 'text'} onChange={() => setSubmissionType('text')} />
            <span>Text</span>
          </label>
          <label style={styles.radioLabel}>
            <input type="radio" name="submissionType" checked={submissionType === 'audio'} onChange={() => setSubmissionType('audio')} />
            <span>Audio (transcribed live as you speak)</span>
          </label>
        </section>

        {submissionType === 'text' && (
          <section style={styles.section}>
            <h2 className="form-section-title">3. Your report (text)</h2>
            <textarea
              placeholder="Describe what happened. Include time, place, and any details you are comfortable sharing. This will be timestamped."
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={6}
              required
              style={styles.textarea}
            />
          </section>
        )}

        {submissionType === 'audio' && (
          <section style={styles.section}>
            <h2 className="form-section-title">3. Record your report (audio)</h2>
            {!isRecording && !recordingBlob && (
              <div>
                <button type="button" onClick={startRecording} style={styles.btnRecord}>Start recording</button>
                <p style={styles.hint}>Click once to start. You&apos;ll see a timer while recording, then stop and submit.</p>
              </div>
            )}
            {isRecording && (
              <div>
                <p className="text-danger">Recording… {recordSeconds}s</p>
                <button type="button" onClick={stopRecording} style={styles.btnSecondary}>Stop recording</button>
              </div>
            )}
            {!isRecording && recordingBlob && (
              <div>
                <audio src={recording} controls style={{ width: '100%', marginBottom: '0.5rem' }} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={startRecording} style={styles.btnSecondary}>Record again</button>
                  <span style={styles.hint}>Now you can submit this recording below.</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <strong>Live transcript</strong>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                  Language
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isRecording} style={{ ...styles.input, width: 'auto', padding: '0.3rem 0.5rem' }}>
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="en-ZA">English (South Africa)</option>
                    <option value="en-ZW">English (Zimbabwe)</option>
                  </select>
                </label>
                {isRecording && speechSupported && !speechError && <span className="text-danger" style={{ fontSize: '0.9rem' }}>● Listening…</span>}
              </div>
              {!speechSupported && (
                <p style={styles.hint}>Live transcription isn&apos;t supported in this browser (use Chrome or Edge). Your audio will still be recorded, and you can type what you said below.</p>
              )}
              {speechError && <p style={styles.hint}>{speechError}</p>}
              <textarea
                placeholder={speechSupported ? 'Your words will appear here as you speak. You can correct them before submitting.' : 'Type a written version of your recording (optional).'}
                value={interim ? `${transcript}${transcript ? ' ' : ''}${interim}` : transcript}
                onChange={(e) => { setInterim(''); setTranscript(e.target.value); }}
                rows={6}
                style={styles.textarea}
              />
              <p style={styles.hint}>Shona and Ndebele are not supported by browser speech recognition yet, so speak in English for live transcription. The transcript is saved as a document together with your audio when you submit.</p>
            </div>
          </section>
        )}

        <section style={styles.section}>
          <h2 className="form-section-title">4. Optional context (used for pattern analysis)</h2>
          <div className="report-grid">
            <input placeholder="Location / place" value={meta.locationPlace} onChange={(e) => setMeta((m) => ({ ...m, locationPlace: e.target.value }))} style={styles.input} />
            <input placeholder="Campus / building" value={meta.locationCampus} onChange={(e) => setMeta((m) => ({ ...m, locationCampus: e.target.value }))} style={styles.input} />
            <input placeholder="Category (e.g. verbal, physical)" value={meta.category} onChange={(e) => setMeta((m) => ({ ...m, category: e.target.value }))} style={styles.input} />
            <input placeholder="Relation to perpetrator" value={meta.perpetratorRelation} onChange={(e) => setMeta((m) => ({ ...m, perpetratorRelation: e.target.value }))} style={styles.input} />
          </div>
        </section>

        <button type="submit" disabled={loading || (submissionType === 'text' && !contentText.trim()) || (submissionType === 'audio' && !recordingBlob)} style={styles.submit}>
          {loading ? 'Submitting…' : 'Submit report'}
        </button>
      </form>

      {status?.success && (
        <div className="alert-success">
          <strong>{status.message}</strong>
          <p>Report ID: {status.id}. Severity: {status.severity}. {status.needsAccommodation && 'An academic accommodation alert has been sent to admin.'} Timestamp: {status.timestamp}</p>
        </div>
      )}
      {status?.error && <div className="alert-error">{status.error}</div>}
    </div>
  );
}

const styles = {
  container: {},
  form: {},
  section: { marginBottom: '1.5rem' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' },
  input: { padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--input-border, var(--surface2))', background: 'var(--surface)', color: 'var(--text)', width: '100%' },
  textarea: { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--input-border, var(--surface2))', background: 'var(--surface)', color: 'var(--text)', resize: 'vertical' },
  btnRecord: { padding: '0.6rem 1rem', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 },
  btnSecondary: { padding: '0.6rem 1rem', background: 'var(--surface2)', color: 'var(--text)', border: 'none', borderRadius: 'var(--radius)' },
  submit: { padding: '0.75rem 1.5rem', background: 'var(--safe)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, marginTop: '0.5rem' },
  hint: { fontSize: '0.9rem', color: 'var(--textMuted)', marginTop: '0.5rem' },
};
