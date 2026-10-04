(() => {
  const data = window.SITE_DATA || { stops: [], gallery: [] };

  // ---------- Mobile nav ----------
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }));

  // ---------- Header shadow on scroll ----------
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Open-now pill (local Maine time, season hours) ----------
  const pill = document.getElementById('openPill');
  try {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = now.getDay(); // 0 = Sunday
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = day !== 1 && mins >= 12 * 60 && mins < 19 * 60;
    pill.textContent = open ? 'Open now*' : 'Closed now';
    pill.classList.add(open ? 'pill-open' : 'pill-closed');
    pill.title = 'Based on season hours — check Facebook for sell-outs & fair days';
  } catch (_) { /* keep default */ }

  // ---------- Stops list ----------
  const stopList = document.getElementById('stopList');
  data.stops.forEach(s => {
    const li = document.createElement('li');
    const b = document.createElement('strong'); b.textContent = s.name;
    const span = document.createElement('span'); span.textContent = s.where;
    li.append(b, span);
    stopList.appendChild(li);
  });

  // ---------- Gallery ----------
  const grid = document.getElementById('gallery-grid');
  data.gallery.forEach(p => {
    const fig = document.createElement('figure');
    if (p.wide) fig.classList.add('wide');
    const img = document.createElement('img');
    img.src = p.src; img.alt = p.alt; img.loading = 'lazy';
    img.addEventListener('error', () => fig.remove()); // missing photo? just hide the tile
    fig.appendChild(img);
    grid.appendChild(fig);
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.section-head, .dish, .hours-card, .quote, .follow-card, .story-photo, .road-photo, .booking-form');
  if ('IntersectionObserver' in window) {
    revealEls.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // ---------- Booking form ----------
  const form = document.getElementById('bookingForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form-status';
    const fd = Object.fromEntries(new FormData(form).entries());
    if (!fd.name.trim() || !fd.phone.trim()) {
      status.textContent = 'Please add your name and phone number.';
      status.classList.add('err');
      return;
    }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch('/api/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Something went wrong.');
      form.reset();
      status.textContent = "Got it! Jeff's team will reach out soon. Need it faster? Call (207) 815-9506.";
      status.classList.add('ok');
    } catch (err) {
      status.textContent = err.message + ' You can also call (207) 815-9506.';
      status.classList.add('err');
    } finally {
      btn.disabled = false; btn.textContent = 'Send My Request';
    }
  });

  // ---------- Music toggle (opt-in only; shows only if a track is uploaded) ----------
  const musicBtn = document.getElementById('musicToggle');
  const audio = document.getElementById('vibes');
  const label = musicBtn.querySelector('.music-label');
  fetch(audio.getAttribute('src'), { method: 'HEAD' })
    .then(r => { if (r.ok) musicBtn.hidden = false; })
    .catch(() => {});
  audio.volume = 0.35;
  musicBtn.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        await audio.play();
        musicBtn.classList.add('playing');
        musicBtn.setAttribute('aria-pressed', 'true');
        label.textContent = 'Vibes on';
      } catch (_) { /* play blocked — leave as-is */ }
    } else {
      audio.pause();
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('aria-pressed', 'false');
      label.textContent = 'Play the vibes';
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
