const crypto = require('crypto');

function safeEqual(a = '', b = '') {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function checkCredentials(user, pass) {
  const u = process.env.ADMIN_USER || 'jeff';
  const p = process.env.ADMIN_PASSWORD || 'change-me-now';
  return safeEqual(user, u) && safeEqual(pass, p);
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  if (req.originalUrl.startsWith('/admin/api')) return res.status(401).json({ error: 'Not logged in' });
  return res.redirect('/admin/login');
}

module.exports = { checkCredentials, requireAdmin };
