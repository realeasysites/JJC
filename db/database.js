const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'jeffs.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    phone        TEXT NOT NULL,
    email        TEXT,
    service      TEXT NOT NULL,
    event_date   TEXT,
    location     TEXT,
    guest_count  TEXT,
    message      TEXT,
    status       TEXT NOT NULL DEFAULT 'new',
    notes        TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
`);

module.exports = db;
