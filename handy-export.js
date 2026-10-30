(() => {
  const VIEWER_KEY = 'familyhub_viewer_plan_v2';
  const COLORS = ['#95d5a4','#ffd54f','#7cc5f7','#b69cff','#ff8f8f','#ffb56b','#7ddfd0'];
  const isPhone = () => window.matchMedia('(max-width: 700px)').matches;

  function compactExport() {
    if (typeof renderFridge === 'function') renderFridge();
    const days = [...document.querySelectorAll('#weekGrid .weekCard')].map((card, index) => ({
      day: card.querySelector('h3')?.childNodes[0]?.textContent?.trim() || DAYS[index] || '',
      date: card.querySelector('h3 small')?.textContent?.trim() || '',
      eventsHtml: card.querySelector('.weekEvents')?.innerHTML || '&nbsp;',
      mealHtml: card.querySelector('.weekMeal')?.innerHTML || '&nbsp;'
    }));
    return {
      format: 'FamilyHubViewer',
      version: 2,
      exportedAt: new Date().toISOString(),
      title: document.getElementById('weekTitle')?.textContent?.trim() || 'Wochenplan',
      dates: document.getElementById('weekDates')?.textContent?.trim() || '',
      days
    };
  }

  function downloadViewerPlan() {
    const data = compactExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FamilyHub-Wochenplan.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function addDesktopButton() {
    const toolbar = document.querySelector('#plan .toolbar');
    if (!toolbar || document.getElementById('exportViewerPlan')) return;
    const b = document.createElement('button');
    b.id = 'exportViewerPlan';
    b.type = 'button';
    b.textContent = '📱 Für Handys speichern';
    b.addEventListener('click', downloadViewerPlan);
    toolbar.appendChild(b);
  }

  function viewerShell() {
    if (document.getElementById('phoneViewer')) return;
    const root = document.createElement('div');
    root.id = 'phoneViewer';
    root.innerHTML = `
      <div class="viewerTop">
        <div><h1>FamilyHub</h1><p id="viewerSubtitle">Noch keine Woche geladen</p></div>
        <button id="viewerImportBtn" type="button">📂 Neue Woche laden</button>
        <input id="viewerImport" type="file" accept="application/json,.json" hidden>
      </div>
      <div id="viewerStatus" class="viewerStatus">Wähle einmal eure gemeinsame <b>FamilyHub-Wochenplan.json</b>. Danach bleibt der Plan auf diesem iPhone gespeichert.</div>
      <main id="viewerDays" class="viewerDays"></main>`;
    document.body.appendChild(root);
    document.getElementById('viewerImportBtn').onclick = () => document.getElementById('viewerImport').click();
    document.getElementById('viewerImport').onchange = importViewerPlan;
  }

  function importViewerPlan(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result).replace(/^\uFEFF/, '').trim());
        if (data.format !== 'FamilyHubViewer' || !Array.isArray(data.days)) throw new Error('Keine gültige FamilyHub-Handydatei.');
        localStorage.setItem(VIEWER_KEY, JSON.stringify(data));
        renderViewer(data);
      } catch (error) {
        alert('Wochenplan konnte nicht geladen werden: ' + error.message);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function renderViewer(data) {
    const subtitle = document.getElementById('viewerSubtitle');
    const status = document.getElementById('viewerStatus');
    const grid = document.getElementById('viewerDays');
    if (!data) {
      subtitle.textContent = 'Noch keine Woche geladen';
      status.style.display = 'block';
      grid.innerHTML = '';
      return;
    }
    subtitle.textContent = `${data.title || 'Wochenplan'} · ${data.dates || ''}`;
    status.style.display = 'none';
    grid.innerHTML = data.days.map((d, i) => `
      ${i === 0 || i === 7 ? `<h2 class="viewerWeek">Woche ${i === 0 ? 1 : 2}</h2>` : ''}
      <article class="viewerDay" style="--day:${COLORS[i % 7]}">
        <header><h2>${escapeHtml(d.day)}</h2><span>${escapeHtml(d.date)}</span></header>
        <section class="viewerEvents">${d.eventsHtml || '&nbsp;'}</section>
        <section class="viewerMeal">${d.mealHtml || '&nbsp;'}</section>
      </article>`).join('');
  }

  function escapeHtml(value='') {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function startPhoneViewer() {
    document.documentElement.classList.add('phone-viewer-mode');
    viewerShell();
    try { renderViewer(JSON.parse(localStorage.getItem(VIEWER_KEY) || 'null')); }
    catch { renderViewer(null); }
  }

  function boot() {
    if (isPhone()) startPhoneViewer();
    else addDesktopButton();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
