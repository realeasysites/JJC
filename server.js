// Jeff's Jamaican Cuisine — thin entry point. Logic lives in lib/ and routes/.
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');

const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // Render sits behind a proxy

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      mediaSrc: ["'self'"],
      frameSrc: ['https://www.google.com', 'https://www.facebook.com'],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use('/api/booking', bookingRoutes);
app.use('/admin', adminRoutes);

// Homepage: fill in absolute URLs for social-share previews (Facebook/iMessage need full URLs).
// Uses SITE_URL if set, otherwise the domain the visitor came in on — works on any domain automatically.
const fs = require('fs');
const INDEX_HTML = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
function sendHome(req, res) {
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.type('html').send(INDEX_HTML.replaceAll('{{SITE_URL}}', base));
}
app.get(['/', '/index.html'], sendHome);

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '7d', index: false }));

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`Jeff's Jamaican Cuisine running on port ${PORT}`));
