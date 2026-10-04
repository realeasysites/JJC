const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db/database');
const { checkCredentials, requireAdmin } = require('../lib/auth');

const router = express.Router();
const VIEWS = path.join(__dirname, '..', 'views');
const STATUSES = ['new', 'contacted', 'booked', 'completed', 'declined'];

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.sendFile(path.join(VIEWS, 'login.html'));
});

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (checkCredentials(username, password)) {
    req.session.regenerate(() => {
      req.session.isAdmin = true;
      res.redirect('/admin');
    });
  } else {
    res.redirect('/admin/login?error=1');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/', requireAdmin, (_req, res) => res.sendFile(path.join(VIEWS, 'admin.html')));

router.get('/api/bookings', requireAdmin, (req, res) => {
  const { status } = req.query;
  const rows = STATUSES.includes(status)
    ? db.prepare('SELECT * FROM bookings WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  const counts = Object.fromEntries(STATUSES.map(s => [s, 0]));
  db.prepare('SELECT status, COUNT(*) AS n FROM bookings GROUP BY status').all().forEach(r => { counts[r.status] = r.n; });
  res.json({ bookings: rows, counts });
});

router.patch('/api/bookings/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { status, notes } = req.body;
  if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ error: 'Bad status' });
  const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE bookings SET status = ?, notes = ? WHERE id = ?').run(
    status ?? existing.status,
    typeof notes === 'string' ? notes.slice(0, 2000) : existing.notes,
    id
  );
  res.json({ ok: true });
});

router.delete('/api/bookings/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
