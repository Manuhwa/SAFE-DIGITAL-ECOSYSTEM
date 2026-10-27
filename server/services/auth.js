const crypto = require('crypto');
const db = require('../db');

const SALT_LEN = 16;
const KEY_LEN = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };
const TOKEN_BYTES = 32;
const SESSION_DAYS = 7;

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LEN).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTIONS).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const derived = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTIONS).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

function createSession(adminId) {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  try {
    db.prepare(
      'INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)'
    ).run(crypto.createHash('sha256').update(token).digest('hex'), adminId, expiresAt);
  } catch (e) {
    return null;
  }
  return { token, expiresAt };
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const row = db.prepare(
    'SELECT s.admin_id, a.email, a.name FROM admin_sessions s JOIN admin_users a ON a.id = s.admin_id WHERE s.token_hash = ? AND s.expires_at > datetime(\'now\')'
  ).get(tokenHash);
  return row || null;
}

function destroySession(token) {
  if (!token) return;
  const tokenHash = crypto.createHash('sha256').update(String(token).trim()).digest('hex');
  db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
}

module.exports = { hashPassword, verifyPassword, createSession, verifySession, destroySession };
