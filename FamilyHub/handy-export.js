(() => {
  const COLORS = ['#95d5a4','#ffd54f','#7cc5f7','#b69cff','#ff8f8f','#ffb56b','#7ddfd0'];

  function esc(value='') {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function mobileHtml() {
    const start = typeof dateAt === 'function' ? dateAt(0) : new Date();
    const end = typeof dateAt === 'function' ? dateAt((DAYS?.length || 14) - 1) : new Date();
    const startText = typeof fmt === 'function' ? fmt(start) : start.toLocaleDateString('de-CH');
    const endText = typeof fmt === 'function' ? fmt(end) : end.toLocaleDateString('de-CH');
    const kw = typeof isoWeek === 'function' ? isoWeek(start) : '';

    const cards = (DAYS || []).map((day, i) => {
      const p = plan?.[i] || {events:[],menuId:null};
      const m = typeof menuById === 'function' ? menuById(p.menuId) : null;
      const date = typeof dateAt === 'function' && typeof fmt === 'function' ? fmt(dateAt(i)) : '';
      const events = (p.events || []).filter(e => e && (e.type || e.title || e.time));
      const eventHtml = events.length
        ? events.map(e => `<div class="event"><span>${esc((typeof TYPES !== 'undefined' && TYPES[e.type]) || '📅')}</span><div>${esc(e.type === 'Sonstiges' ? '' : e.type)}${e.title ? ' '+esc(e.title) : ''}${e.time ? '<strong>'+esc(e.time)+'</strong>' : ''}</div></div>`).join('')
        : '<div class="empty-event">&nbsp;</div>';
      const meal = m ? `<div class="meal">🍽 ${esc(m.name)}</div>` : '<div class="meal empty">&nbsp;</div>';
      return `<article class="day" style="--day:${COLORS[i % 7]}"><header><h2>${esc(day)}</h2><span>${esc(date)}</span></header><section class="events">${eventHtml}</section>${meal}</article>`;
    }).join('');

    return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1f4e79">
<title>FamilyHub Menüplan ${kw ? 'KW '+kw : ''}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#eef5fb;color:#172033;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:env(safe-area-inset-top) 12px calc(22px + env(safe-area-inset-bottom))}.top{position:sticky;top:0;z-index:2;background:rgba(238,245,251,.94);backdrop-filter:blur(12px);padding:14px 2px 10px}.top h1{margin:0;color:#1f4e79;font-size:26px}.top p{margin:4px 0 0;color:#53657a;font-weight:650}.weeks{display:grid;gap:12px}.weekLabel{margin:14px 2px 2px;color:#1f4e79;font-size:15px}.day{background:var(--day);border-radius:22px;padding:13px;box-shadow:0 8px 24px #20384e18}.day header{display:flex;justify-content:space-between;gap:10px;align-items:baseline}.day h2{margin:0;color:#174d78;font-size:21px}.day header span{font-weight:750;color:#174d78;font-size:14px}.events{min-height:58px;margin:11px 0;background:rgba(255,255,255,.78);border-radius:14px;padding:10px}.event{display:grid;grid-template-columns:26px 1fr;gap:6px;line-height:1.3;margin:2px 0}.event strong{display:block;color:#385067;font-size:13px;margin-top:2px}.meal{background:rgba(255,255,255,.86);border-radius:14px;padding:11px;font-size:18px;font-weight:850;color:#173b60;min-height:48px}.meal.empty{background:rgba(255,255,255,.45)}.empty-event{min-height:24px}@media(min-width:760px){body{max-width:900px;margin:auto}.weeks{grid-template-columns:repeat(2,1fr)}.weekLabel{grid-column:1/-1}}@media print{body{background:#fff;padding:0}.top{position:static;background:#fff}.day{box-shadow:none;break-inside:avoid}}
</style>
</head>
<body>
<div class="top"><h1>FamilyHub</h1><p>${kw ? 'Menüplan KW '+esc(kw)+' · ' : ''}${esc(startText)} – ${esc(endText)}</p></div>
<div class="weeks"><h3 class="weekLabel">Woche 1</h3>${cards.slice(0, cards.length)} </div>
</body></html>`;
  }

  function exportMobile() {
    const html = mobileHtml();
    const blob = new Blob([html], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const start = typeof dateAt === 'function' && typeof fmt === 'function' ? fmt(dateAt(0)).replaceAll('.','-') : 'Plan';
    a.href = url;
    a.download = `FamilyHub_Handyplan_${start}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function addButton() {
    const toolbar = document.querySelector('#plan .toolbar');
    if (!toolbar || document.getElementById('exportMobileHtml')) return;
    const btn = document.createElement('button');
    btn.id = 'exportMobileHtml';
    btn.textContent = '📱 Handyplan HTML';
    btn.type = 'button';
    btn.addEventListener('click', exportMobile);
    toolbar.appendChild(btn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton);
  else addButton();
})();
