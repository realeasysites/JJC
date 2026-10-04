const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db/database');
const { notifyNewBooking } = require('../lib/mailer');

const router = express.Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });

const SERVICES = [
  'Catering (drop-off / pickup)',
  'Food truck at my event',
  'Whole fish pre-order',
  'Large / party order',
  'Something else'
];

const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

router.post('/', limiter, async (req, res) => {
  // Honeypot: real people never fill this hidden field
  if (clean(req.body.website)) return res.json({ ok: true });

  const b = {
    name: clean(req.body.name, 120),
    phone: clean(req.body.phone, 40),
    email: clean(req.body.email, 160),
    service: clean(req.body.service, 80),
    event_date: clean(req.body.event_date, 40),
    location: clean(req.body.location, 200),
    guest_count: clean(req.body.guest_count, 40),
    message: clean(req.body.message, 2000)
  };

  if (!b.name || !b.phone) return res.status(400).json({ error: 'Please add your name and phone number.' });
  if (!/[0-9]{7,}/.test(b.phone.replace(/\D/g, ''))) return res.status(400).json({ error: 'That phone number looks off — mind checking it?' });
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return res.status(400).json({ error: 'That email looks off — mind checking it?' });
  if (!SERVICES.includes(b.service)) b.service = 'Something else';

  const info = db.prepare(`
    INSERT INTO bookings (name, phone, email, service, event_date, location, guest_count, message)
    VALUES (@name, @phone, @email, @service, @event_date, @location, @guest_count, @message)
  `).run(b);

  notifyNewBooking(b).catch(err => console.error('[mailer] failed:', err.message));

  res.json({ ok: true, id: info.lastInsertRowid });
});

module.exports = router;
