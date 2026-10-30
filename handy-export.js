(() => {
  const COLORS = ['#95d5a4','#ffd54f','#7cc5f7','#b69cff','#ff8f8f','#ffb56b','#7ddfd0'];

  const esc = (value = '') => String(value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  function buildMobileHtml() {
    // Use the already-rendered FamilyHub plan as the source of truth.
    if (typeof renderFridge === 'function') renderFridge();

    const sourceCards = [...document.querySelectorAll('#weekGrid .weekCard')];
    if (!sourceCards.length) {
      throw new Error('Im Kühlschrankplan wurden keine Tageskarten gefunden.');
    }

    const title = document.getElementById('weekTitle')?.textContent?.trim() || 'Menüplan';
    const dates = document.getElementById('weekDates')?.textContent?.trim() || '';

    const cards = sourceCards.map((card, index) => {
      const heading = card.querySelector('h3')?.innerHTML || '';
      const events = card.querySelector('.weekEvents')?.innerHTML || '&nbsp;';
      const meal = card.querySelector('.weekMeal')?.innerHTML || '&nbsp;';
      return `<article class="day" style="--day:${COLORS[index % 7]}">
        <header>${heading}</header>
        <section class="events">${events}</section>
        <section class="meal">${meal}</section>
      </article>`;
    });

    const week1 = cards.slice(0, 7).join('');
    const week2 = cards.slice(7, 14).join('');

    return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1f4e79">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="FamilyHub">
<title>FamilyHub – ${esc(title)}</title>
<style>
*{box-sizing:border-box}html{background:#eef5fb}body{max-width:760px;margin:0 auto;padding:env(safe-area-inset-top) 12px calc(24px + env(safe-area-inset-bottom));font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033;background:#eef5fb}.top{position:sticky;top:0;z-index:2;padding:14px 3px 10px;background:rgba(238,245,251,.94);backdrop-filter:blur(12px)}.top h1{margin:0;color:#1f4e79;font-size:27px}.top h2{margin:4px 0 0;font-size:16px}.top p{margin:3px 0 0;color:#53657a;font-weight:650}.week-title{margin:16px 3px 8px;color:#1f4e79;font-size:16px}.week{display:grid;gap:11px}.day{background:var(--day);border:1px solid rgba(31,78,121,.22);border-radius:20px;padding:13px;box-shadow:0 8px 24px rgba(32,56,78,.10)}.day header{color:#174d78;font-size:20px;font-weight:850;line-height:1.15}.day header small{font-size:13px}.events{min-height:52px;margin:10px 0;padding:10px;border-radius:13px;background:rgba(255,255,255,.78)}.weekEvent{margin:3px 0;line-height:1.28}.meal{min-height:48px;padding:11px;border-radius:13px;background:rgba(255,255,255,.88);color:#173b60;font-size:17px;font-weight:850;line-height:1.25}@media(min-width:700px){.week{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
  <div class="top"><h1>FamilyHub</h1><h2>${esc(title)}</h2><p>${esc(dates)}</p></div>
  <h3 class="week-title">Woche 1</h3><main class="week">${week1}</main>
  <h3 class="week-title">Woche 2</h3><main class="week">${week2}</main>
</body>
</html>`;
  }

  function exportMobileHtml() {
    try {
      const html = buildMobileHtml();
      const blob = new Blob([html], {type:'text/html;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mobile.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (error) {
      alert('Handyplan konnte nicht exportiert werden: ' + error.message);
    }
  }

  function addButton() {
    const toolbar = document.querySelector('#plan .toolbar');
    if (!toolbar || document.getElementById('exportMobileHtml')) return;
    const button = document.createElement('button');
    button.id = 'exportMobileHtml';
    button.type = 'button';
    button.textContent = '📱 Handyplan HTML';
    button.addEventListener('click', exportMobileHtml);
    toolbar.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
  } else {
    addButton();
  }
})();
