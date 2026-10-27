const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyPassword, createSession, destroySession } = require('../services/auth');
const { getToken, requireAdmin } = require('../middleware/auth');

// Public: login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }
    const admin = db.prepare('SELECT id, email, name, password_hash FROM admin_users WHERE email = ?').get(email.trim().toLowerCase());
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!admin.password_hash) {
      return res.status(401).json({ error: 'Account not yet set up. Run the create-admin script or set a password.' });
    }
    let passwordOk = false;
    try {
      passwordOk = verifyPassword(password, admin.password_hash);
    } catch (_) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const session = createSession(admin.id);
    if (!session) {
      console.error('Admin login: createSession failed (check admin_sessions table exists)');
      return res.status(500).json({ error: 'Login failed. Please try again.' });
    }
    res.json({
      token: session.token,
      expiresAt: session.expiresAt,
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (e) {
    console.error('Admin login error:', e);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Public: logout (optional; client can just discard token)
router.post('/logout', (req, res) => {
  const token = getToken(req);
  if (token) destroySession(token);
  res.json({ ok: true });
});

// Protected routes below
router.use(requireAdmin);

// Accommodation alerts
router.get('/accommodation-alerts', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT a.id, a.report_id, a.admin_notified_at, a.acknowledged,
             r.severity, r.created_at, r.report_type
      FROM accommodation_alerts a
      JOIN reports r ON r.id = a.report_id
      ORDER BY a.admin_notified_at DESC
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch accommodation alerts.' });
  }
});

router.patch('/accommodation-alerts/:id/acknowledge', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE accommodation_alerts SET acknowledged = 1 WHERE id = ?').run(id);
    res.json({ acknowledged: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to acknowledge.' });
  }
});

// List reports (admin can read list)
router.get('/reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT r.id, r.report_type, r.submission_type, r.severity, r.needs_accommodation,
             r.created_at, r.updated_at,
             m.location_place, m.location_campus, m.category
      FROM reports r
      LEFT JOIN report_metadata m ON m.report_id = r.id
      ORDER BY r.created_at DESC
    `).all();
    res.json(reports);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// Read single report (full detail including content and identifiers for signed reports)
router.get('/reports/:id', (req, res) => {
  try {
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    const identifiers = db.prepare('SELECT * FROM report_identifiers WHERE report_id = ?').get(req.params.id);
    const metadata = db.prepare('SELECT * FROM report_metadata WHERE report_id = ?').get(req.params.id);
    res.json({ ...report, identifiers: identifiers || null, metadata: metadata || null });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
});

// Download transcript document for a report (authenticated)
router.get('/reports/:id/transcript', (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    const row = db.prepare('SELECT id, transcript_path FROM reports WHERE id = ?').get(req.params.id);
    if (!row || !row.transcript_path) return res.status(404).json({ error: 'Transcript not found.' });
    const file = path.join(__dirname, '..', 'uploads', 'transcripts', path.basename(row.transcript_path));
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Transcript file missing.' });
    res.download(file, `transcript-${row.id}${path.extname(file)}`);
  } catch (e) {
    res.status(500).json({ error: 'Failed to download transcript.' });
  }
});

module.exports = router;
