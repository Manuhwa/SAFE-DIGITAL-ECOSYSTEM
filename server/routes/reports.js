const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { detectSeverity, needsAcademicAccommodation } = require('../services/severity');
const { getCrossReferences } = require('../services/patternAnalysis');

const uploadDir = path.join(__dirname, '..', 'uploads', 'audio');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${path.extname(file.originalname) || '.webm'}`)
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

const transcriptDir = path.join(__dirname, '..', 'uploads', 'transcripts');
if (!fs.existsSync(transcriptDir)) fs.mkdirSync(transcriptDir, { recursive: true });

let docxLib = null;
try { docxLib = require('docx'); } catch (_) { docxLib = null; }

const NO_TRANSCRIPT = '[No live transcript was captured. Admin may listen to the audio file.]';

// Writes the transcript as .docx (falls back to .txt if the docx package is unavailable).
// Returns the stored filename (relative to uploads/transcripts) or null.
async function saveTranscriptDocument({ id, createdAt, category, reportType, language, text }) {
  const body = text && text.trim() ? text.trim() : NO_TRANSCRIPT;
  if (docxLib) {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docxLib;
      const line = (label, value) => new Paragraph({ children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(String(value))] });
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: 'Safe Digital Ecosystem - Audio Report Transcript', heading: HeadingLevel.HEADING_1 }),
            line('Report ID', id),
            line('Date', new Date(createdAt).toLocaleString()),
            line('Report type', reportType),
            line('Category', category || '-'),
            line('Transcription language', language || '-'),
            new Paragraph({ text: 'Transcript', heading: HeadingLevel.HEADING_2 }),
            ...body.split(/\r?\n/).map((t) => new Paragraph({ text: t })),
          ],
        }],
      });
      const buf = await Packer.toBuffer(doc);
      const name = `${id}.docx`;
      fs.writeFileSync(path.join(transcriptDir, name), buf);
      return name;
    } catch (e) {
      console.error('DOCX transcript failed, falling back to .txt:', e.message);
    }
  }
  const name = `${id}.txt`;
  const txt = `Safe Digital Ecosystem - Audio Report Transcript\nReport ID: ${id}\nDate: ${createdAt}\nReport type: ${reportType}\nCategory: ${category || '-'}\nTranscription language: ${language || '-'}\n\nTranscript:\n${body}\n`;
  fs.writeFileSync(path.join(transcriptDir, name), txt, 'utf8');
  return name;
}

router.post('/submit', (req, res) => {
  try {
    const { reportType, submissionType, contentText, transcribedText, studentId, fullName, email, phone, faculty, yearOfStudy, locationPlace, locationCampus, category, perpetratorRelation } = req.body;
    const id = uuidv4();
    const reportTypeVal = reportType === 'signed' ? 'signed' : 'anonymous';
    const submissionTypeVal = submissionType === 'audio' ? 'audio' : 'text';

    if (!contentText && !transcribedText) {
      return res.status(400).json({ error: 'Either content text or transcribed text is required.' });
    }

    const text = (contentText || transcribedText || '').trim();
    const severity = detectSeverity(text);
    const needsAccommodation = needsAcademicAccommodation(severity) ? 1 : 0;

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO reports (id, report_type, submission_type, content_text, transcribed_text, severity, needs_accommodation, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, reportTypeVal, submissionTypeVal, submissionTypeVal === 'text' ? text : null, submissionTypeVal === 'audio' ? text : null, severity, needsAccommodation, now, now);

    if (reportTypeVal === 'signed' && (studentId || fullName || email)) {
      db.prepare(`
        INSERT INTO report_identifiers (report_id, student_id, full_name, email, phone, faculty, year_of_study)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, studentId || null, fullName || null, email || null, phone || null, faculty || null, yearOfStudy || null);
    }

    const keywords = text ? require('../services/patternAnalysis').extractKeywords(text).slice(0, 15).join(',') : null;
    db.prepare(`
      INSERT INTO report_metadata (report_id, location_place, location_campus, category, keywords, perpetrator_relation)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, locationPlace || null, locationCampus || null, category || null, keywords, perpetratorRelation || null);

    if (needsAccommodation) {
      db.prepare(`
        INSERT INTO accommodation_alerts (report_id, admin_notified_at, acknowledged)
        VALUES (?, ?, 0)
      `).run(id, now);
    }

    res.status(201).json({
      id,
      message: 'Report submitted successfully. Your voice matters.',
      severity,
      needsAccommodation: needsAccommodation === 1,
      timestamp: now
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

router.post('/submit/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file received.' });
    const { reportType, studentId, fullName, email, phone, faculty, yearOfStudy, locationPlace, locationCampus, category, perpetratorRelation, transcript, transcriptLanguage } = req.body;
    const id = uuidv4();
    const reportTypeVal = reportType === 'signed' ? 'signed' : 'anonymous';
    // Rename audio to match report id so audio + transcript share the same id
    let audioFile = req.file.path;
    try {
      const renamed = path.join(uploadDir, `${id}${path.extname(req.file.path) || '.webm'}`);
      fs.renameSync(req.file.path, renamed);
      audioFile = renamed;
    } catch (_) { /* keep original name */ }
    const audioPath = `/uploads/audio/${path.basename(audioFile)}`;
    const liveTranscript = typeof transcript === 'string' ? transcript.trim().slice(0, 100000) : '';
    const transcribedText = liveTranscript || NO_TRANSCRIPT;
    const lang = typeof transcriptLanguage === 'string' ? transcriptLanguage.slice(0, 20) : null;

    const text = transcribedText;
    const severity = detectSeverity(text);
    const needsAccommodation = needsAcademicAccommodation(severity) ? 1 : 0;
    const now = new Date().toISOString();

    let transcriptFile = null;
    try {
      transcriptFile = await saveTranscriptDocument({ id, createdAt: now, category, reportType: reportTypeVal, language: lang, text: liveTranscript });
    } catch (e) {
      console.error('Saving transcript document failed:', e.message);
    }
    const transcriptPath = transcriptFile ? `/uploads/transcripts/${transcriptFile}` : null;

    db.prepare(`
      INSERT INTO reports (id, report_type, submission_type, content_text, audio_path, transcribed_text, transcript_path, transcript_language, severity, needs_accommodation, created_at, updated_at)
      VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, reportTypeVal, 'audio', audioPath, transcribedText, transcriptPath, lang, severity, needsAccommodation, now, now);

    if (reportTypeVal === 'signed' && (studentId || fullName || email)) {
      db.prepare(`
        INSERT INTO report_identifiers (report_id, student_id, full_name, email, phone, faculty, year_of_study)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, studentId || null, fullName || null, email || null, phone || null, faculty || null, yearOfStudy || null);
    }

    const keywords = text ? require('../services/patternAnalysis').extractKeywords(text).slice(0, 15).join(',') : null;
    db.prepare(`
      INSERT INTO report_metadata (report_id, location_place, location_campus, category, keywords, perpetrator_relation)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, locationPlace || null, locationCampus || null, category || null, keywords, perpetratorRelation || null);

    if (needsAccommodation) {
      db.prepare(`INSERT INTO accommodation_alerts (report_id, admin_notified_at, acknowledged) VALUES (?, ?, 0)`).run(id, now);
    }

    res.status(201).json({
      id,
      message: 'Audio report submitted successfully.',
      transcriptSaved: !!transcriptFile,
      severity,
      needsAccommodation: needsAccommodation === 1,
      timestamp: now
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit audio report.' });
  }
});

router.get('/cross-reference/:id', (req, res) => {
  try {
    const data = getCrossReferences(req.params.id);
    if (!data) return res.status(404).json({ error: 'Report not found.' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch cross-reference data.' });
  }
});

module.exports = router;
