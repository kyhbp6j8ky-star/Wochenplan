(() => {
  const DB = 'FamilyHubWorkspaceDB';
  const STORE = 'handles';
  const HANDLE_KEY = 'workspace';
  const MASTER_FILE = 'FamilyHub_MenuMaster.json';
  const PLAN_FILE = 'FamilyHub_Plan.json';

  const $ = id => document.getElementById(id);
  let dirHandle = null;

  function supported() { return 'showDirectoryPicker' in window && window.isSecureContext; }
  function db() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function saveHandle(handle) {
    const d = await db();
    await new Promise((res, rej) => { const tx=d.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(handle,HANDLE_KEY); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); });
    d.close();
  }
  async function getHandle() {
    const d = await db();
    const value = await new Promise((res, rej) => { const r=d.transaction(STORE).objectStore(STORE).get(HANDLE_KEY); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
    d.close(); return value;
  }
  async function permission(handle, write=false) {
    const opts = {mode: write ? 'readwrite' : 'read'};
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    return (await handle.requestPermission(opts)) === 'granted';
  }
  function status(text, ok=false) {
    const el=$('workspaceStatus'); if (!el) return; el.textContent=text; el.style.color=ok?'#177245':'#6b7280';
  }
  async function readJson(name) {
    const h=await dirHandle.getFileHandle(name); const f=await h.getFile(); return JSON.parse((await f.text()).replace(/^\uFEFF/,'').trim());
  }
  async function writeJson(name, value) {
    if (!dirHandle || !(await permission(dirHandle,true))) throw new Error('Kein Schreibzugriff auf den FamilyHub-Ordner.');
    const h=await dirHandle.getFileHandle(name,{create:true});
    const w=await h.createWritable(); await w.write(JSON.stringify(value,null,2)); await w.close();
  }
  async function loadAll(showMessage=true) {
    if (!dirHandle || !(await permission(dirHandle,false))) return;
    const loaded=[];
    try {
      const m = typeof normalizeMaster === 'function' ? normalizeMaster(await readJson(MASTER_FILE)) : await readJson(MASTER_FILE);
      master=m; localStorage.setItem('fh84_master',JSON.stringify(master)); loaded.push('Menümaster');
    } catch (e) { if (e.name !== 'NotFoundError') console.warn(e); }
    try {
      const p=await readJson(PLAN_FILE);
      if (p.start) $('startDate').value=p.start;
      if (p.plan) { plan=p.plan; localStorage.setItem('fh84_plan',JSON.stringify(plan)); }
      loaded.push('Plan');
    } catch (e) { if (e.name !== 'NotFoundError') console.warn(e); }
    if (typeof ensurePlan==='function') ensurePlan();
    if (typeof renderAll==='function') renderAll();
    status(`Verbunden: ${dirHandle.name} · ${loaded.length ? loaded.join(' + ')+' geladen' : 'noch keine Datendateien'}`,true);
    if (showMessage && !loaded.length) alert(`Ordner verbunden. Beim ersten Speichern werden ${MASTER_FILE} und ${PLAN_FILE} erstellt.`);
  }
  async function choose() {
    try { dirHandle=await window.showDirectoryPicker({id:'familyhub-workspace',mode:'readwrite'}); await saveHandle(dirHandle); await loadAll(); }
    catch(e) { if (e.name!=='AbortError') alert('Ordner konnte nicht verbunden werden: '+e.message); }
  }
  async function saveMaster() {
    await writeJson(MASTER_FILE, master);
    localStorage.setItem('fh84_master',JSON.stringify(master));
    status(`Verbunden: ${dirHandle.name} · Menümaster gespeichert`,true);
  }
  async function savePlanFile() {
    await writeJson(PLAN_FILE,{start:$('startDate').value,plan});
    localStorage.setItem('fh84_plan',JSON.stringify(plan));
    status(`Verbunden: ${dirHandle.name} · Plan gespeichert`,true);
  }
  function wrap(id, action, fallbackClickId) {
    const el=$(id); if (!el) return;
    el.onclick=async()=>{ try { if (dirHandle && await permission(dirHandle,true)) await action(); else if (fallbackClickId) $(fallbackClickId).click(); else throw new Error('Bitte zuerst den FamilyHub-Ordner verbinden.'); } catch(e) { alert(e.message); } };
  }
  async function boot() {
    if (!supported()) {
      status('Direkter Ordnerzugriff wird hier nicht unterstützt. Import/Export bleibt verfügbar.');
      $('chooseWorkspace').style.display='none'; $('loadWorkspace').style.display='none'; return;
    }
    $('chooseWorkspace').onclick=choose;
    $('loadWorkspace').onclick=()=>loadAll(false);
    try { dirHandle=await getHandle(); if (dirHandle) { status(`Arbeitsordner gemerkt: ${dirHandle.name} · zum Laden anklicken`); if (await permission(dirHandle,false)) await loadAll(false); } } catch(e) { console.warn(e); }
    wrap('exportMaster',saveMaster);
    wrap('exportPlan',savePlanFile);
    $('exportMaster').textContent='Menümaster speichern';
    $('exportPlan').textContent='Plan speichern';
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
