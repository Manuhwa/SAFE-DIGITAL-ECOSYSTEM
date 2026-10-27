const { verifySession } = require('../services/auth');

function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

function requireAdmin(req, res, next) {
  const token = getToken(req);
  const admin = token ? verifySession(token) : null;
  if (!admin) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  req.admin = admin;
  next();
}

module.exports = { getToken, requireAdmin };
