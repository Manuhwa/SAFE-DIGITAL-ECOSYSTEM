const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'harassment.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Safe migrations: add transcript columns if missing
function migrateTranscripts() {
try {
  const hasReports = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reports'").get();
  if (hasReports) {
    const cols = db.prepare('PRAGMA table_info(reports)').all().map((c) => c.name);
    if (!cols.includes('transcribed_text')) db.exec('ALTER TABLE reports ADD COLUMN transcribed_text TEXT');
    if (!cols.includes('transcript_path')) db.exec('ALTER TABLE reports ADD COLUMN transcript_path TEXT');
    if (!cols.includes('transcript_language')) db.exec('ALTER TABLE reports ADD COLUMN transcript_language TEXT');
  }
} catch (e) {
  console.error('Transcript column migration failed:', e.message);
}
}
migrateTranscripts();
db.migrateTranscripts = migrateTranscripts;

module.exports = db;
