const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'harassment.db');
const db = new Database(dbPath);

db.exec(`
  -- Reports: anonymous or signed, text or audio (transcribed)
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    report_type TEXT NOT NULL CHECK(report_type IN ('anonymous', 'signed')),
    submission_type TEXT NOT NULL CHECK(submission_type IN ('text', 'audio')),
    content_text TEXT,
    audio_path TEXT,
    transcribed_text TEXT,
    severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    needs_accommodation INTEGER DEFAULT 0,
    accommodation_notified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Signed report personal details (only when report_type = 'signed')
  CREATE TABLE IF NOT EXISTS report_identifiers (
    report_id TEXT PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
    student_id TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    faculty TEXT,
    year_of_study TEXT
  );

  -- Cross-reference: locations, categories, keywords for pattern analysis
  CREATE TABLE IF NOT EXISTS report_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    location_place TEXT,
    location_campus TEXT,
    category TEXT,
    keywords TEXT,
    perpetrator_relation TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Admin users and accommodation alerts
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS accommodation_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    admin_notified_at TEXT NOT NULL DEFAULT (datetime('now')),
    acknowledged INTEGER DEFAULT 0
  );

  -- Pattern analysis cache (AI-generated)
  CREATE TABLE IF NOT EXISTS pattern_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_type TEXT NOT NULL,
    summary TEXT,
    insights TEXT,
    data_snapshot TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
  CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports(severity);
  CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
  CREATE INDEX IF NOT EXISTS idx_metadata_report ON report_metadata(report_id);
  CREATE INDEX IF NOT EXISTS idx_metadata_location ON report_metadata(location_place);
  CREATE INDEX IF NOT EXISTS idx_metadata_category ON report_metadata(category);
`);

// Migrations: admin auth (password + sessions)
try {
  db.exec(`ALTER TABLE admin_users ADD COLUMN password_hash TEXT`);
} catch (_) { /* column may already exist */ }
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT UNIQUE NOT NULL,
      admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
  `);
} catch (_) {}

console.log('Database initialized at', dbPath);
db.close();
