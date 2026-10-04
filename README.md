# Jeff's Jamaican Cuisine — Website

Authentic Jamaican food truck · 940 Lisbon Street, Lewiston, ME · (207) 815-9506
Built by Real Easy Sites on the standard TBLC pattern (Node/Express + SQLite + admin dashboard).

## Run locally
```bash
npm install
cp .env.example .env   # then edit values
npm start              # http://localhost:3000
```

## Deploy on Render
- New **Web Service** from the GitHub repo · Build: `npm install` · Start: `npm start`
- Node is pinned to **20.x** (`.node-version` + `package.json` engines) — better-sqlite3 needs it.
- Set env vars from `.env.example` (ADMIN_PASSWORD, SESSION_SECRET, NOTIFY_EMAIL, SMTP_USER/PASS).
- Add a persistent disk mounted at `/opt/render/project/src/db` if you want booking history to survive redeploys.

## Folder layout
```
server.js          thin entry point
db/database.js     SQLite setup (bookings table)
lib/mailer.js      email notification on new requests
lib/auth.js        admin login check
routes/booking.js  POST /api/booking (catering/event form)
routes/admin.js    /admin dashboard + API (status tracking: new → contacted → booked → completed / declined)
views/             admin login + dashboard pages
public/            the website (index.html, css, js, images, audio)
```

## Easy edits (no coding)
| What | Where |
|---|---|
| Fair/festival stops list | `public/js/site-data.js` → `stops` |
| Gallery photos | drop files in `public/images/gallery/`, list them in `public/js/site-data.js` → `gallery` |
| Hours | `public/index.html` (Find the Truck card + footer) and the open/closed check in `public/js/main.js` |
| Menu items | `public/index.html` → `#menu` section |

## Background music
The site has an opt-in **"Play the vibes"** button (bottom-left on desktop, round button on phones).
It stays hidden until a track exists. To turn it on, add **`public/audio/vibes.mp3`** — that's it.
Music never autoplays (browsers block that anyway, and it's bad for customers on their phones).

**Licensing:** only use a track Jeff has the rights to (own recording, a royalty-free license, or a
licensed track). Popular commercial songs (e.g., Bob Marley) require licenses from the label and
publisher — playing them on a business site without one can bring takedowns or claims.

## Admin dashboard
`/admin` → log in with ADMIN_USER / ADMIN_PASSWORD. **Change the default password before launch.**
