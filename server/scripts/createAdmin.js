/**
 * Create or update an admin user. Run from project root:
 *   node server/scripts/createAdmin.js
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in env, or pass as args:
 *   node server/scripts/createAdmin.js admin@example.com YourSecurePassword
 */
require('./initDb');
const db = require('../db');
const { hashPassword } = require('../services/auth');

const email = process.env.ADMIN_EMAIL || process.argv[2];
const password = process.env.ADMIN_PASSWORD || process.argv[3];

if (!email || !password) {
  console.error('Usage: node server/scripts/createAdmin.js <manuhwamichealn@gmail.com> <1234>');
  console.error('   or set ADMIN_EMAIL and ADMIN_PASSWORD');
  process.exit(1);
}

const emailNorm = email.trim().toLowerCase();
let admin = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(emailNorm);
const passwordHash = hashPassword(password);

if (admin) {
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(passwordHash, admin.id);
  console.log('Admin password updated for', emailNorm);
} else {
  db.prepare('INSERT INTO admin_users (email, name, role, password_hash) VALUES (?, ?, ?, ?)').run(emailNorm, emailNorm, 'admin', passwordHash);
  console.log('Admin created:', emailNorm);
}

process.exit(0);
