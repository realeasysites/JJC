const nodemailer = require('nodemailer');

const configured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFY_EMAIL);

const transporter = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : null;

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function notifyNewBooking(b) {
  if (!transporter) {
    console.log('[mailer] SMTP not configured — booking saved to dashboard only.');
    return;
  }
  const rows = [
    ['Name', b.name], ['Phone', b.phone], ['Email', b.email || '—'],
    ['Request', b.service], ['Event date', b.event_date || '—'],
    ['Location', b.location || '—'], ['Guests', b.guest_count || '—'],
    ['Details', b.message || '—']
  ].map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:bold">${k}</td><td style="padding:6px 12px">${esc(v)}</td></tr>`).join('');

  await transporter.sendMail({
    from: `"Jeff's Jamaican Cuisine Website" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    replyTo: b.email || undefined,
    subject: `New ${b.service} request — ${b.name}`,
    html: `<h2 style="font-family:sans-serif">New request from the website</h2>
           <table style="font-family:sans-serif;border-collapse:collapse">${rows}</table>
           <p style="font-family:sans-serif">Manage it in the dashboard: /admin</p>`
  });
}

module.exports = { notifyNewBooking };
