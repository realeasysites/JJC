(() => {
  const cards = document.getElementById('cards');
  const tpl = document.getElementById('cardTpl');
  const empty = document.getElementById('empty');
  let current = '';

  async function api(url, opts = {}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    if (res.status === 401) { location.href = '/admin/login'; return null; }
    return res.json();
  }

  async function load() {
    const data = await api('/admin/api/bookings' + (current ? `?status=${current}` : ''));
    if (!data) return;
    const total = Object.values(data.counts).reduce((a, b) => a + b, 0);
    document.getElementById('c-all').textContent = total;
    Object.entries(data.counts).forEach(([k, v]) => {
      const el = document.getElementById('c-' + k);
      if (el) el.textContent = v;
    });
    cards.innerHTML = '';
    empty.hidden = data.bookings.length > 0;
    data.bookings.forEach(render);
  }

  function render(b) {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.card');
    card.dataset.status = b.status;
    node.querySelector('.c-name').textContent = b.name;
    node.querySelector('.c-service').textContent = b.service;
    const meta = node.querySelector('.c-meta');
    [['Phone', b.phone], ['Email', b.email], ['Event date', b.event_date], ['Location', b.location], ['Guests', b.guest_count]]
      .filter(([, v]) => v)
      .forEach(([k, v]) => {
        const dt = document.createElement('dt'); dt.textContent = k;
        const dd = document.createElement('dd'); dd.textContent = v;
        meta.append(dt, dd);
      });
    node.querySelector('.c-message').textContent = b.message || '';
    node.querySelector('.c-notes').value = b.notes || '';
    node.querySelector('.c-date').textContent = 'Received ' + new Date(b.created_at.replace(' ', 'T') + 'Z').toLocaleString();
    node.querySelector('.c-call').href = 'tel:' + b.phone.replace(/[^\d+]/g, '');
    const email = node.querySelector('.c-email');
    if (b.email) email.href = 'mailto:' + b.email; else email.remove();

    const sel = node.querySelector('.c-status');
    sel.value = b.status;
    sel.addEventListener('change', async () => {
      await api('/admin/api/bookings/' + b.id, { method: 'PATCH', body: JSON.stringify({ status: sel.value }) });
      load();
    });
    const notes = node.querySelector('.c-notes');
    const saveBtn = node.querySelector('.c-save');
    saveBtn.addEventListener('click', async () => {
      await api('/admin/api/bookings/' + b.id, { method: 'PATCH', body: JSON.stringify({ notes: notes.value }) });
      saveBtn.textContent = 'Saved ✓';
      setTimeout(() => { saveBtn.textContent = 'Save notes'; }, 1500);
    });
    node.querySelector('.c-del').addEventListener('click', async () => {
      if (!confirm(`Delete the request from ${b.name}? This can't be undone.`)) return;
      await api('/admin/api/bookings/' + b.id, { method: 'DELETE' });
      load();
    });
    cards.appendChild(node);
  }

  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b === btn));
    current = btn.dataset.status;
    load();
  });

  load();
  setInterval(load, 60000);
})();
