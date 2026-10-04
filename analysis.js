'use strict';

// Gespeicherte Videos und Analysemodus. Nutzt Hilfen aus app.js wie $, clamp und mode.

const DB_NAME = 'lagtime';   // eigene Videoablage, getrennt von der Test-App
const THUMB_BEFORE_END_US = 2e6;   // Vorschaubild etwa 2 Sekunden vor dem Ende, dort liegt meist der Sprung

// ---------- Datenbank ----------

let dbPromise = null;
function db() {
  if (!dbPromise) dbPromise = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 2);
    r.onupgradeneeded = () => {
      // clips enthält die kleinen Angaben für die Liste, data das eigentliche Video,
      // images die gespeicherten Bilder, jedes einem Video zugeordnet
      const d = r.result;
      if (!d.objectStoreNames.contains('clips')) d.createObjectStore('clips', { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains('data')) d.createObjectStore('data', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('images')) d.createObjectStore('images', { keyPath: 'id', autoIncrement: true }).createIndex('clipId', 'clipId');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbPromise;
}

const reqP = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

async function inTx(stores, txMode, fn) {
  const t = (await db()).transaction(stores, txMode);
  const done = new Promise((res, rej) => { t.oncomplete = res; t.onerror = t.onabort = () => rej(t.error || new Error('Abbruch')); });
  const result = await fn(t);
  await done;
  return result;
}

const allClips = () => inTx(['clips'], 'readonly', t => reqP(t.objectStore('clips').getAll()));
const getData = id => inTx(['data'], 'readonly', t => reqP(t.objectStore('data').get(id)));
const putClip = c => inTx(['clips'], 'readwrite', t => reqP(t.objectStore('clips').put(c)));
const allImages = () => inTx(['images'], 'readonly', t => reqP(t.objectStore('images').getAll()));
const putImage = im => inTx(['images'], 'readwrite', t => reqP(t.objectStore('images').put(im)));
const deleteImage = id => inTx(['images'], 'readwrite', t => { t.objectStore('images').delete(id); });

// Mit dem Video verschwinden auch seine Bilder
const deleteClip = id => inTx(['clips', 'data', 'images'], 'readwrite', async t => {
  t.objectStore('clips').delete(id);
  t.objectStore('data').delete(id);
  const keys = await reqP(t.objectStore('images').index('clipId').getAllKeys(id));
  for (const k of keys) t.objectStore('images').delete(k);
});

// Videos und Vergleichsbilder, die bei dieser Frist fällig sind. Nur ein Stern schützt.
// Mit einem Video verschwinden auch seine Bilder. Ein Stern an einem Bild gibt auch seinem Video einen Stern.
async function keepVictims(days) {
  if (!days) return { clips: [], imgs: [] };   // nie löschen
  const limit = Date.now() - days * 864e5;
  const images = await allImages();
  return {
    clips: (await allClips()).filter(c => !c.star && c.created < limit),
    imgs: images.filter(im => isCmp(im) && !im.star && im.created < limit),
  };
}

async function cleanupOld() {
  await migrateImageStars();
  const v = await keepVictims(settings.keepDays);
  for (const c of v.clips) await deleteClip(c.id);
  for (const im of v.imgs) await deleteImage(im.id);
}

// Bis Stand 58 schützten gespeicherte Bilder ihr Video auch ohne Stern. Seit Stand 59 zählt nur der Stern.
// Damit beim Update nichts verloren geht, bekommen solche Videos einmalig einen Stern.
let migrating = null;
function migrateImageStars() {
  if (settings.imgStarMig) return Promise.resolve();
  if (!migrating) migrating = (async () => {
    const ids = new Set((await allImages()).filter(im => !isCmp(im)).map(im => im.clipId));
    for (const c of await allClips()) if (!c.star && ids.has(c.id)) { c.star = true; await putClip(c); }
    settings.imgStarMig = true;
    saveSettings();
  })();
  return migrating;
}

// Vergleichsbilder gehören zu keinem Video. Sie tragen Tag, Nummer, Name, Stichwort und Stern selbst.
const isCmp = im => im && im.kind === 'cmp';
let cmp = null;   // offener Vergleich, siehe compare.js

// ---------- Speichern aus dem Betrieb ----------

const pad2 = n => String(n).padStart(2, '0');
const dayKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function copyBuf(src) {
  if (ArrayBuffer.isView(src)) return src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength);
  return src.slice(0);
}

// Speichervorgänge laufen nacheinander, damit die Nummern lückenlos steigen
let saveChain = Promise.resolve();
function saveClip(snap) {
  const p = saveChain.then(() => writeClip(snap));
  saveChain = p.catch(() => {});
  return p;
}

async function writeClip({ config, entries }) {
  const t0 = entries[0].ts;
  const parts = [], frames = [];
  let off = 0;
  for (const e of entries) {
    const u = new Uint8Array(e.chunk.byteLength);
    e.chunk.copyTo(u);
    parts.push(u);
    // Zeitstempel in Mikrosekunden ab dem ersten Bild, Keyframe, Lage in den Daten, Länge
    frames.push([Math.round((e.ts - t0) * 1000), e.key ? 1 : 0, off, u.byteLength]);
    off += u.byteLength;
  }
  const n = frames.length;
  const dur = n > 1 ? frames[n - 1][0] / 1000 * n / (n - 1) : 33;
  const now = new Date();
  const day = dayKey(now);
  // Nummern eines Tages steigen nur. Auch nach dem Löschen wird keine Nummer wieder vergeben,
  // damit heruntergeladene Dateien eindeutig bleiben.
  const used = (await allClips()).filter(c => c.day === day).reduce((m, c) => Math.max(m, c.nr), 0);
  const last = settings.lastNr && settings.lastNr.day === day ? settings.lastNr.nr : 0;
  const nr = Math.max(used, last) + 1;
  settings.lastNr = { day, nr };
  saveSettings();
  const cfg = {
    codec: config.codec, codedWidth: config.codedWidth, codedHeight: config.codedHeight,
    description: config.description ? copyBuf(config.description) : undefined,
  };
  const meta = { day, nr, created: now.getTime(), dur, w: config.codedWidth, h: config.codedHeight, star: false, name: '', prop: '', thumb: null };
  await inTx(['clips', 'data'], 'readwrite', async t => {
    const id = await reqP(t.objectStore('clips').add(meta));
    meta.id = id;
    t.objectStore('data').add({ id, cfg, frames, data: new Blob(parts) });
  });
  return meta;
}

// ---------- MP4 für den Export ----------

// Die Daten liegen bereits als H.264 vor. Sie werden nur verpackt, nicht neu kodiert.
function makeMp4(cfg, frames, bytes, skip = 0) {
  const TS = 90000;
  const n = frames.length;
  const avgUs = n > 1 ? frames[n - 1][0] / (n - 1) : 33333;
  const durs = frames.map((f, i) => Math.max(1, Math.round((i < n - 1 ? frames[i + 1][0] - f[0] : avgUs) * TS / 1e6)));
  const total = durs.reduce((a, b) => a + b, 0);
  // Vorlauf nach dem Schneiden, den Player über die Edit List überspringen
  const pre = durs.slice(0, skip).reduce((a, b) => a + b, 0);
  const shown = total - pre;

  const u32 = v => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  const u16 = v => [(v >>> 8) & 255, v & 255];
  const str = s => [...s].map(c => c.charCodeAt(0));
  const zeros = k => new Array(k).fill(0);
  const box = (type, ...parts) => {
    let len = 8;
    for (const p of parts) len += p.length;
    const out = new Uint8Array(len);
    out.set(u32(len), 0);
    out.set(str(type), 4);
    let o = 8;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  };
  const full = (type, ver, flags, ...parts) => box(type, [ver, (flags >> 16) & 255, (flags >> 8) & 255, flags & 255], ...parts);
  const matrix = [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000].flatMap(u32);
  const w = cfg.codedWidth, h = cfg.codedHeight;

  // Gleich lange Bilddauern werden zusammengefasst
  const stts = [];
  for (const d of durs) {
    if (stts.length && stts[stts.length - 1][1] === d) stts[stts.length - 1][0]++;
    else stts.push([1, d]);
  }
  const keys = [];
  frames.forEach((f, i) => { if (f[1]) keys.push(i + 1); });

  const ftyp = box('ftyp', str('isom'), u32(0x200), str('isomiso2avc1mp41'));
  const moov = dataOffset => box('moov',
    full('mvhd', 0, 0, u32(0), u32(0), u32(TS), u32(shown), u32(0x10000), u16(0x100), zeros(10), matrix, zeros(24), u32(2)),
    box('trak',
      full('tkhd', 0, 3, u32(0), u32(0), u32(1), u32(0), u32(shown), zeros(8), u16(0), u16(0), u16(0), u16(0), matrix, u32(w << 16), u32(h << 16)),
      box('edts', full('elst', 0, 0, u32(1), u32(shown), u32(pre), u16(1), u16(0))),
      box('mdia',
        full('mdhd', 0, 0, u32(0), u32(0), u32(TS), u32(total), u16(0x55c4), u16(0)),
        full('hdlr', 0, 0, u32(0), str('vide'), zeros(12), str('VideoHandler'), [0]),
        box('minf',
          full('vmhd', 0, 1, zeros(8)),
          box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
          box('stbl',
            full('stsd', 0, 0, u32(1),
              box('avc1', zeros(6), u16(1), zeros(16), u16(w), u16(h), u32(0x480000), u32(0x480000), u32(0), u16(1), zeros(32), u16(0x18), u16(0xffff),
                box('avcC', new Uint8Array(cfg.description)))),
            full('stts', 0, 0, u32(stts.length), stts.flatMap(([c, d]) => [...u32(c), ...u32(d)])),
            full('stss', 0, 0, u32(keys.length), keys.flatMap(u32)),
            full('stsc', 0, 0, u32(1), u32(1), u32(n), u32(1)),
            full('stsz', 0, 0, u32(0), u32(n), frames.flatMap(f => u32(f[3]))),
            full('stco', 0, 0, u32(1), u32(dataOffset)))))));
  const moovLen = moov(0).length;
  const mdatHead = new Uint8Array([...u32(bytes.length + 8), ...str('mdat')]);
  return new Blob([ftyp, moov(ftyp.length + moovLen + 8), mdatHead, bytes], { type: 'video/mp4' });
}

// 2026-10-02_v3_Teo_Kopfsprung.mp4 und 2026-10-02_v3.1_Teo_Kopfsprung.jpg.
// Fehlen Name oder Stichwort, entfällt der jeweilige Teil.
const cleanPart = v => (v || '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
function fileName(c, label, ext) {
  const parts = [c.day, label.replace(/\s+/g, '-'), cleanPart(c.name), cleanPart(c.prop)].filter(Boolean);
  return parts.join('_') + ext;
}
const clipLabel = c => 'v' + c.nr;
const imageLabel = (c, im) => (isCmp(im) ? `vgl${im.nr}.${im.n}` : `v${c.nr}.${im.n}`);
const clipFileName = c => fileName(c, clipLabel(c), '.mp4');
const imageFileName = (c, im) => fileName(c, imageLabel(c, im), '.jpg');

// ---------- Ein- und Ausstieg ----------

// Die Kamera läuft in der Analyse noch eine Weile weiter. Dann ist das Bild beim Zurückkehren
// sofort da. Die USB-Kamera der Android-App braucht einen Decoder, den der Player braucht.
// Sie geht deshalb gleich aus.
const ANALYSIS_CAM_MS = 3 * 60 * 1000;
let analysisCamTimer = 0;

function enterAnalysis() {
  mode = 'analysis';
  // Jedes Öffnen beginnt mit allen Videos, ohne Filter und oben in der Liste
  Object.assign(listFilter, { kind: 'videos', star: false, name: '', prop: '', cmp: false });
  cmpSelect = null;
  listScroll = null;
  $('aGrid').scrollTop = 0;
  history.pushState({ v: 'list' }, '');
  clearTimeout(analysisCamTimer);
  const stopCam = () => { if (mode === 'analysis') camOp(async () => { stopCamera(); }); };
  if (NATIVE && settings.facing === 'external') stopCam();
  else analysisCamTimer = setTimeout(stopCam, ANALYSIS_CAM_MS);
  $('settings').classList.add('hidden');
  $('analysis').classList.remove('hidden');
  showList();
}

// ---------- Videoseite direkt aus dem Betrieb ----------
// Die Kamera nimmt weiter in den Puffer auf. Zurück geht es in die verzögerte Wiedergabe.

async function enterReview(p) {
  if (reviewing || mode !== 'run') return;
  const saved = await p.catch(() => null);
  if (!saved || reviewing || mode !== 'run') return;
  clearRecent();
  cancelPress();
  reviewing = true;
  slow = null;   // eine laufende Zeitlupe endet, zurück geht es in die normale Verzögerung
  renderSlow();
  releaseRunDecoder();
  history.pushState({ v: 'review' }, '');
  listClips = await allClips();
  listImages = (await allImages()).filter(im => isCmp(im) || clipById(im.clipId));
  $('pBack').textContent = tr('‹ Wiedergabe');
  $('aPlayer').classList.add('review');
  $('run').classList.add('hidden');
  $('analysis').classList.remove('hidden');
  try { await openClip(clipById(saved.id) || saved); }
  catch (e) { console.warn(e); }
  // Ohne Video zurück in die Wiedergabe
  if (!pc && reviewing) history.back();
}

async function leaveReview() {
  await flushImageEdits();
  closePlayer();
  closeRange();
  $('aPlayer').classList.add('hidden');
  $('aPlayer').classList.remove('review');
  $('analysis').classList.add('hidden');
  $('pBack').textContent = tr('‹ Übersicht');
  restartRunPlayback();
  reviewing = false;
  $('run').classList.remove('hidden');
}

function leaveAnalysis() {
  closePlayer();
  closeThumbDecoder();
  $('analysis').classList.add('hidden');
  clearTimeout(analysisCamTimer);
  const live = camState === 'ok' && track && track.readyState === 'live';
  enterSettings();
  if (!live) restartCamera();
}

// ---------- Liste ----------

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const hhmm = t => { const d = new Date(t); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const fmtSec = us => dc((us / 1e6).toFixed(2)) + ' s';

function dayLabel(day) {
  const now = new Date();
  if (day === dayKey(now)) return tr('Heute');
  if (day === dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))) return tr('Gestern');
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(LOCALE[lang], { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
}

let listUrls = [];
let listGen = 0;
let listScroll = null;   // Position der Liste, bevor ein Video geöffnet wurde
let listClips = [];
let listImages = [];
const listFilter = { kind: 'videos', star: false, name: '', prop: '', cmp: false };   // cmp: unter „Bilder“ nur Vergleichsbilder

// Gilt für Videos und für Bilder, Bilder übernehmen Stern, Name und Stichwort von ihrem Video
const passesFilter = c => (!listFilter.star || c.star) && (!listFilter.name || c.name === listFilter.name) && (!listFilter.prop || c.prop === listFilter.prop);
const clipById = id => listClips.find(c => c.id === id);

async function showList() {
  await flushImageEdits();
  closePlayer();
  $('aPlayer').classList.add('hidden');
  $('aList').classList.remove('hidden');
  const gen = ++listGen;
  try { await cleanupOld(); } catch (e) { console.warn(e); }
  const clips = await allClips();
  const images = await allImages();
  if (gen !== listGen) return;
  listClips = clips;
  listImages = images.filter(im => isCmp(im) || clipById(im.clipId));
  // Vorhandene Namen und Stichwörter gelten als je eingetragen
  rememberTerms('name', clips.map(c => c.name));
  rememberTerms('prop', clips.map(c => c.prop));
  renderList(clips);
  if (listScroll !== null) { $('aGrid').scrollTop = listScroll; listScroll = null; }
  renderStorage();
  makeMissingThumbs(clips, gen);
}

function renderList(clips) {
  // Alte Vorschaubilder erst freigeben, wenn die neuen Kacheln stehen, sonst laden sie ins Leere
  const old = listUrls;
  setTimeout(() => old.forEach(u => URL.revokeObjectURL(u)), 3000);
  listUrls = [];
  const grid = $('aGrid');
  grid.textContent = '';
  renderFilter(clips);
  const images = listFilter.kind === 'images';
  // Einträge sind Videos oder Bilder, nie gemischt
  const items = images ? listImageItems() : sortItems(clips.filter(passesFilter).map(c => ({ c })));
  const all = images ? listImages.length : clips.length;
  $('aEmpty').classList.toggle('hidden', items.length > 0);
  $('aEmpty').textContent = images
    ? tr(all ? 'Keine Bilder für diese Auswahl.' : 'Noch keine Bilder gespeichert.')
    : tr(all ? 'Keine Videos für diese Auswahl.' : 'Noch keine Videos gespeichert.');
  let day = null, row = null;
  for (const x of items) {
    if (x.c.day !== day) {
      day = x.c.day;
      grid.append(el('h3', 'day', dayLabel(day)));
      row = el('div', 'cards');
      grid.append(row);
    }
    row.append(x.im ? imageCard(x.c, x.im) : clipCard(x.c));
  }
  renderCmpSelect();   // Auswahl für den Vergleich bleibt beim Neuzeichnen sichtbar
}

// Neueste Videos zuerst, die Bilder eines Videos in ihrer Reihenfolge v3.1, v3.2, v3.3.
// Bilder eines Vergleichs stehen zusammen wie die Bilder eines Videos, vgl1.1 vor vgl1.2.
function sortItems(items) {
  const groupKey = x => (isCmp(x.im) ? 'vgl' + x.im.day + '#' + x.im.nr : 'clip' + x.c.id);
  const groupTime = new Map();
  for (const x of items) groupTime.set(groupKey(x), Math.max(groupTime.get(groupKey(x)) || 0, x.c.created));
  return items.sort((a, b) => groupTime.get(groupKey(b)) - groupTime.get(groupKey(a)) || (a.im ? (a.im.n || 0) - (b.im.n || 0) : 0));
}

// Bilder so, wie die Liste „Bilder“ sie zeigt. Name und Stichwort kommen vom Video, der Stern vom Bild selbst.
// keepId bleibt immer dabei, damit das offene Bild seine Nachbarn behält, auch wenn es nicht mehr zum Filter passt.
function listImageItems(keepId = null) {
  const items = listImages
    .map(im => ({ im, c: isCmp(im) ? im : clipById(im.clipId) }))
    .filter(x => x.c && (x.im.id === keepId || ((!listFilter.cmp || isCmp(x.im)) && (!listFilter.star || x.im.star)
      && (!listFilter.name || x.c.name === listFilter.name) && (!listFilter.prop || x.c.prop === listFilter.prop))));
  return sortItems(items);
}

function fillSelect(sel, label, values, current) {
  sel.textContent = '';
  sel.append(new Option(label, ''));
  for (const v of values) sel.append(new Option(v, v));
  sel.value = current;
  sel.disabled = !values.length;
}

const sortedValues = (clips, key) => [...new Set(clips.map(c => c[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));

function renderFilter(clips) {
  // Auch Vergleichsbilder haben Name und Stichwort
  const src = [...clips, ...listImages.filter(isCmp)];
  const names = sortedValues(src, 'name'), props = sortedValues(src, 'prop');
  if (listFilter.name && !names.includes(listFilter.name)) listFilter.name = '';
  if (listFilter.prop && !props.includes(listFilter.prop)) listFilter.prop = '';
  fillSelect($('fName'), tr('Name'), names, listFilter.name);
  fillSelect($('fProp'), tr('Stichwort'), props, listFilter.prop);
  $('fStar').classList.toggle('on', listFilter.star);
  $('fStar').disabled = !clips.length && !listImages.length;
  // Vergleiche ist unter „Bilder“ ein Filter neben dem Stern, ausgegraut, solange es kein Vergleichsbild gibt
  const images = listFilter.kind === 'images', hasCmp = listImages.some(isCmp);
  if (!hasCmp) listFilter.cmp = false;
  $('fCmpF').classList.toggle('hidden', !images);
  $('fCmpF').classList.toggle('on', listFilter.cmp);
  $('fCmpF').disabled = !hasCmp;
  // Zurücksetzen ist ausgegraut, solange kein Filter gewählt ist
  $('fReset').disabled = !(listFilter.star || listFilter.name || listFilter.prop || (images && listFilter.cmp));
  for (const b of $('fKind').querySelectorAll('button')) b.classList.toggle('on', b.dataset.k === listFilter.kind);
}

// Aufbewahrung der Videos ohne Stern, 1 bis 30 Tage oder nie, einstellbar unten in der Liste.
// Nie ist intern 0 und folgt als Stufe auf 30.
const KEEP_MIN = 1, KEEP_MAX = 30;
const keepRaw = Math.round(+settings.keepDays);
settings.keepDays = keepRaw === 0 ? 0 : clamp(keepRaw || 7, KEEP_MIN, KEEP_MAX);
// Angezeigte Frist. Sie gilt erst, wenn feststeht, dass dabei nichts gelöscht wird, oder nach der Rückfrage.
// So löscht eine kürzere Frist nie ohne Nachfrage.
let keepShown = settings.keepDays;
let keepTimer = 0;

function renderKeep() {
  const d = keepShown;
  $('keepAfter').classList.toggle('hidden', !d);   // bei „nie“ ohne „nach“
  $('keepDays').textContent = !d ? tr('nie') : d === 1 ? tr('1 Tag') : tr('{0} Tagen', d);
  $('keepMinus').disabled = d === KEEP_MIN;
  $('keepPlus').disabled = d === 0;
}

function stepKeep(delta) {
  const d = keepShown || KEEP_MAX + 1;   // nie liegt eine Stufe über 30
  const next = clamp(d + delta, KEEP_MIN, KEEP_MAX + 1);
  keepShown = next > KEEP_MAX ? 0 : next;
  renderKeep();
  // Erst kurz nach dem letzten Tippen prüfen
  clearTimeout(keepTimer);
  keepTimer = setTimeout(checkKeep, 1500);
}

function commitKeep() {
  settings.keepDays = keepShown;
  saveSettings();
}

// Übernimmt eine geänderte Frist. Würde sie sofort Videos löschen, kommt vorher eine Rückfrage.
async function checkKeep() {
  clearTimeout(keepTimer);
  keepTimer = 0;
  if (keepShown === settings.keepDays) return;
  const victims = await keepVictims(keepShown);
  const nc = victims.clips.length, ni = victims.imgs.length, n = nc + ni;
  if (!n) { commitKeep(); return; }
  if (mode === 'run') { keepShown = settings.keepDays; renderKeep(); return; }
  // Ist das Fenster schon zu, öffnet es sich für die Rückfrage noch einmal
  if ($('uiDlg').classList.contains('hidden')) {
    $('uiDlg').classList.remove('hidden');
    history.pushState({ v: 'dlg' }, '');
    renderStorage();
  }
  closePicker();
  askKind = 'keep';
  const d = keepShown;
  const parts = [];
  if (nc) parts.push(nc === 1 ? tr('1 Video ohne Stern') : tr('{0} Videos ohne Stern', nc));
  if (ni) parts.push(ni === 1 ? tr('1 Vergleichsbild ohne Stern') : tr('{0} Vergleichsbilder ohne Stern', ni));
  const days = d === 1 ? tr('1 Tag') : tr('{0} Tagen', d);
  $('delQuestion').textContent = n === 1
    ? tr('Bei {0} wird {1} sofort gelöscht, weil es älter ist. Das lässt sich nicht rückgängig machen.', days, parts.join(tr(' und ')))
    : tr('Bei {0} werden {1} sofort gelöscht, weil sie älter sind. Das lässt sich nicht rückgängig machen.', days, parts.join(tr(' und ')));
  $('delChoose').classList.add('hidden');
  $('delAsk').classList.remove('hidden');
  $('uiMain').classList.add('hidden');
  $('uiDel').classList.remove('hidden');
}
$('keepMinus').addEventListener('click', () => stepKeep(-1));
$('keepPlus').addEventListener('click', () => stepKeep(1));
renderKeep();

$('fStar').addEventListener('click', () => { listFilter.star = !listFilter.star; renderList(listClips); });
$('fCmpF').addEventListener('click', () => { listFilter.cmp = !listFilter.cmp; renderList(listClips); });
$('fReset').addEventListener('click', () => {
  Object.assign(listFilter, { star: false, name: '', prop: '', cmp: false });
  renderList(listClips);
});
$('fName').addEventListener('change', e => { listFilter.name = e.target.value; renderList(listClips); });
$('fProp').addEventListener('change', e => { listFilter.prop = e.target.value; renderList(listClips); });
$('fKind').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.dataset.k === listFilter.kind) return;
  listFilter.kind = b.dataset.k;
  cmpSelect = null;   // verglichen werden nur Videos
  renderCmpSelect();
  $('aGrid').scrollTop = 0;
  renderList(listClips);
});

function setThumb(box, blob) {
  const u = URL.createObjectURL(blob);
  listUrls.push(u);
  let img = box.querySelector('img');
  if (!img) { img = new Image(); box.prepend(img); }
  img.src = u;
}

function starText(on) { return on ? '★' : '☆'; }

function clipCard(c) {
  const card = el('div', 'card');
  card.dataset.id = c.id;
  const th = el('div', 'th');
  th.append(el('span', 'dur', Math.round(c.dur / 1000) + ' s'));
  if (c.thumb) setThumb(th, c.thumb);
  const info = el('div', 'info');
  const star = el('button', 'star' + (c.star ? ' on' : ''), starText(c.star));
  star.setAttribute('aria-label', tr('Stern'));
  star.addEventListener('click', async e => {
    e.stopPropagation();
    c.star = !c.star;
    star.textContent = starText(c.star);
    star.classList.toggle('on', c.star);
    await saveMeta(c);
    if (listFilter.star) renderList(listClips);
  });
  info.append(el('b', '', clipLabel(c)), el('span', 'time', hhmm(c.created)));
  const who = [c.name, c.prop].filter(Boolean).join(' · ');
  if (who) info.append(el('span', 'nm', who));
  info.append(star);
  const n = listImages.filter(im => im.clipId === c.id).length;
  if (n) th.append(el('span', 'imgs', n === 1 ? tr('1 Bild') : tr('{0} Bilder', n)));
  card.append(th, info);
  card.addEventListener('click', () => {
    if (cmpSelect) { toggleCmpSelect(c.id); return; }
    listScroll = $('aGrid').scrollTop;
    history.pushState({ v: 'player' }, '');
    openClip(c);
  });
  return card;
}

function imageCard(c, im) {
  const card = el('div', 'card');
  const th = el('div', 'th');
  if (im.thumb) setThumb(th, im.thumb);
  const info = el('div', 'info');
  info.append(el('b', '', imageLabel(c, im)), el('span', 'time', hhmm(c.created)));
  const who = [c.name, c.prop].filter(Boolean).join(' · ');
  if (who) info.append(el('span', 'nm', who));
  if (im.star) info.append(el('span', 'star on', '★'));
  card.append(th, info);
  card.addEventListener('click', () => {
    listScroll = $('aGrid').scrollTop;
    history.pushState({ v: 'player' }, '');
    openImage(im, 'list');   // aus der Liste geöffnet blättern die Pfeile durch alle Bilder der Liste
  });
  return card;
}

// Zeigt nur den Platz der Videos, nicht den der Offline-Dateien
async function renderStorage() {
  try {
    const recs = await inTx(['data'], 'readonly', t => reqP(t.objectStore('data').getAll()));
    const imgs = await allImages();
    const mb = (recs.reduce((s, r) => s + (r.data ? r.data.size : 0), 0)
      + imgs.reduce((s, im) => s + (im.base ? im.base.size : 0) + (im.thumb ? im.thumb.size : 0), 0)) / 1048576;
    $('uiStore').textContent = tr('Belegter Speicher {0} MB', !mb ? '0' : mb < 10 ? dc(mb.toFixed(1)) : Math.round(mb));
  } catch (e) { $('uiStore').textContent = ''; }
}

// Vorschaubilder entstehen erst in der Liste, damit das Speichern im Betrieb nichts dekodieren muss
async function makeMissingThumbs(clips, gen) {
  for (const c of clips) {
    if (c.thumb) continue;
    if (gen !== listGen || !$('aPlayer').classList.contains('hidden')) return;
    try {
      c.thumb = await makeThumb(c.id);
      await putClip(c);
      const box = document.querySelector(`.card[data-id="${c.id}"] .th`);
      if (box && gen === listGen) setThumb(box, c.thumb);
    } catch (e) { console.warn(e); }
  }
}

// Ein gemeinsamer Decoder für alle Vorschaubilder, sie entstehen nacheinander
let thumbDec = null, thumbOut = null, thumbChain = Promise.resolve();

function thumbDecoder() {
  if (!thumbDec || thumbDec.state === 'closed') {
    thumbDec = new VideoDecoder({
      output: f => { if (thumbOut) thumbOut(f); f.close(); },
      error: e => { console.warn(e); thumbDec = null; },
    });
  }
  return thumbDec;
}

function closeThumbDecoder() {
  if (thumbDec && thumbDec.state !== 'closed') { try { thumbDec.close(); } catch (e) {} }
  thumbDec = null;
}

function makeThumb(id) {
  const p = thumbChain.then(() => makeThumbNow(id));
  thumbChain = p.catch(() => {});
  return p;
}

async function makeThumbNow(id) {
  const d = await getData(id);
  const fr = d.frames, skip = d.skip || 0;
  const end = fr[fr.length - 1][0];
  // Bild etwa 2 Sekunden vor dem Ende, aber nie aus dem Vorlauf vor einem Schnitt.
  // Liegt das Vollbild davor im sichtbaren Teil, reicht es allein, dann muss nur ein Bild dekodiert werden.
  let t = fr.length - 1;
  while (t > skip && fr[t][0] > end - THUMB_BEFORE_END_US) t--;
  let k = t;
  while (k > 0 && !fr[k][1]) k--;
  if (k >= skip) t = k;
  const base = fr[k][2];
  const bytes = new Uint8Array(await d.data.slice(base, fr[t][2] + fr[t][3]).arrayBuffer());
  const cv = document.createElement('canvas');
  cv.width = 384; cv.height = 216;
  const dec = thumbDecoder();
  thumbOut = f => { if (f.timestamp === fr[t][0]) cv.getContext('2d').drawImage(f, 0, 0, cv.width, cv.height); };
  try {
    dec.configure(d.cfg);
    for (let i = k; i <= t; i++) {
      const [ts, key, off, len] = fr[i];
      dec.decode(new EncodedVideoChunk({ type: key ? 'key' : 'delta', timestamp: ts, data: bytes.subarray(off - base, off - base + len) }));
    }
    await dec.flush();
  } finally { thumbOut = null; }
  return canvasBlob(cv, 0.75);
}

// ---------- Wiedergabe ----------

const pCanvas = $('pOut');
const pctx = pCanvas.getContext('2d', { alpha: false });
let pc = null;             // geöffnetes Video { meta, cfg, frames, bytes }
let pIndex = new Map();    // Zeitstempel zu Bildnummer
let pdec = null, pGen = 0;
let pPos = 0;              // angezeigtes Bild
let pTarget = -1;          // Bild, das gerade gesucht wird
let pPending = -1;         // nächstes Ziel, falls beim Wischen schon ein neues kommt
let pPlaying = false, pSpeed = 1;
let pQueue = [];           // dekodierte Bilder während der Wiedergabe
let pFeed = 0, pStartIdx = 0, pClock = null;
let seekDragging = false;
let viewMode = null;        // video oder image, solange ein Fenster offen ist
let pimg = null;            // geöffnetes Bild { rec, clip }
let pFirst = 0;             // erstes sichtbares Bild, davor liegt nach dem Schneiden ein Vorlauf
let pStill = false;         // eine Bildfolge ersetzt gerade das Videobild


const pCount = () => (pc ? pc.frames.length : 0);

function keyBefore(i) {
  while (i > 0 && !pc.frames[i][1]) i--;
  return i;
}

function chunkAt(i) {
  const [ts, key, off, len] = pc.frames[i];
  return new EncodedVideoChunk({ type: key ? 'key' : 'delta', timestamp: ts, data: pc.bytes.subarray(off, off + len) });
}

// Scheitert der Hardware-Decoder, etwa weil alle belegt sind, dekodiert die App das Video in Software
let pSoft = false;
function resetDecoder() {
  pGen++;
  pQueue.forEach(q => q.frame.close());
  pQueue = [];
  if (!pdec || pdec.state === 'closed') {
    pdec = new VideoDecoder({
      output: onPlayerFrame,
      error: e => {
        console.warn(e);
        pdec = null;
        if (pSoft || !pc) return;
        pSoft = true;
        const i = pTarget >= 0 ? pTarget : pPos;
        setTimeout(() => { if (!pc) return; pTarget = -1; pPending = -1; seek(i); }, 0);
      },
    });
  } else {
    pdec.reset();
  }
  pdec.configure(pSoft ? { ...pc.cfg, hardwareAcceleration: 'prefer-software' } : pc.cfg);
}

function drawPlayer(f) {
  const w = f.displayWidth, h = f.displayHeight;
  if (pCanvas.width !== w || pCanvas.height !== h) { pCanvas.width = w; pCanvas.height = h; layoutView(); }
  pctx.drawImage(f, 0, 0, w, h);
  if (pStill) { pStill = false; $('pStill').classList.add('hidden'); renderSaveBtn(); }
  onPlayerFrameShown();
}

function onPlayerFrame(frame) {
  const i = pIndex.get(frame.timestamp);
  if (pPlaying) { pQueue.push({ i, frame }); return; }
  if (i === pTarget) { drawPlayer(frame); pPos = i; updatePlayerUi(); }
  frame.close();
}

// Springt auf ein Bild. Dekodiert wird ab dem Keyframe davor, also höchstens etwa eine Sekunde.
function seek(i) {
  if (!pc) return;
  i = clamp(i, pFirst, pCount() - 1);
  if (pPlaying) pause();
  if (pTarget >= 0) { pPending = i; return; }
  pTarget = i;
  try {
    resetDecoder();
    for (let k = keyBefore(i); k <= i; k++) pdec.decode(chunkAt(k));
  } catch (e) { console.warn(e); pdec = null; }
  const gen = pGen;
  // Kommt nach 1,5 s kein Bild, hängt der Hardware-Decoder. Dann in Software noch einmal.
  setTimeout(() => {
    if (gen !== pGen || pTarget !== i || pSoft || !pc) return;
    pSoft = true;
    if (pdec) { try { pdec.close(); } catch (e) {} }
    pdec = null;
    pTarget = -1; pPending = -1;
    seek(i);
  }, 1500);
  const done = () => {
    if (gen !== pGen) return;
    pTarget = -1;
    if (pPending >= 0) {
      const j = pPending;
      pPending = -1;
      if (j !== pPos) seek(j);
    }
  };
  if (pdec) pdec.flush().then(done, done);
  else done();
}

const playEnd = () => pCount() - 1;

function startFeed(i) {
  resetDecoder();
  pFeed = keyBefore(i);
  pStartIdx = i;
  pClock = null;
}

function play() {
  if (!pc || pPlaying) return;
  if (pPos >= pCount() - 1) pPos = pFirst;   // am Ende beginnt die Wiedergabe von vorn
  pTarget = -1; pPending = -1;
  pPlaying = true;
  startFeed(pPos);
  requestAnimationFrame(playerTick);
  updatePlayerUi();
}

function pause() {
  if (!pPlaying) return;
  pPlaying = false;
  pQueue.forEach(q => q.frame.close());
  pQueue = [];
  updatePlayerUi();
}

function playerTick(now) {
  if (!pPlaying || !pc) return;
  requestAnimationFrame(playerTick);
  const last = playEnd();
  try {
    while (pdec && pFeed <= last && pdec.decodeQueueSize < 4 && pQueue.length < 6) {
      pdec.decode(chunkAt(pFeed++));
      if (pFeed === last + 1) pdec.flush().catch(() => {});
    }
  } catch (e) { console.warn(e); pause(); return; }
  while (pQueue.length && pQueue[0].i < pStartIdx) pQueue.shift().frame.close();
  if (!pQueue.length) return;
  if (!pClock) pClock = { wall: now, ts: pc.frames[pQueue[0].i][0] };
  const mediaNow = pClock.ts + (now - pClock.wall) * 1000 * pSpeed;
  let show = null;
  while (pQueue.length && pc.frames[pQueue[0].i][0] <= mediaNow) {
    if (show) show.frame.close();
    show = pQueue.shift();
  }
  if (show) {
    drawPlayer(show.frame);
    pPos = show.i;
    show.frame.close();
    updatePlayerUi();
  }
  if (pPos >= last) {
    // Mit Wiederholung geht es ohne Halt am Anfang weiter
    if (settings.loop) startFeed(pFirst);
    else pause();
  }
}

// Wiederholung für alle Videos und den Vergleich, gemerkt in den Einstellungen
function renderLoop() {
  $('pLoop').classList.toggle('on', !!settings.loop);
  $('pLoop').setAttribute('aria-pressed', settings.loop ? 'true' : 'false');
}
$('pLoop').addEventListener('click', () => {
  settings.loop = !settings.loop;
  saveSettings();
  renderLoop();
});
renderLoop();

function setSpeed(s) {
  if (pPlaying && pClock) pClock = { wall: performance.now(), ts: pc.frames[pPos][0] };
  if (cmp && cmp.playing) cmp.clock = { wall: performance.now(), m: cmp.m };
  pSpeed = s;
  if (viewMode === 'compare') cmpUi(); else updatePlayerUi();
}

function updatePlayerUi() {
  if (!pc) return;
  const n = pCount();
  if (!seekDragging) $('pSeek').value = pPos;
  fillRange($('pSeek'));
  $('pTime').textContent = fmtSec(pc.frames[pPos][0] - pc.frames[pFirst][0]) + ' / ' + fmtSec(pc.meta.dur * 1000);
  $('pPlay').classList.toggle('playing', pPlaying);
  $('pPlay').setAttribute('aria-label', tr(pPlaying ? 'Anhalten' : 'Abspielen'));
  renderSpeed();
  $('pPrev').disabled = pPos <= pFirst;
  $('pNext').disabled = pPos >= n - 1;
  renderSaveBtn();   // ein anderes Bild lässt sich wieder speichern
}

async function openClip(c) {
  const d = await getData(c.id);
  if (!d) return;
  closePlayer();
  pc = { meta: c, cfg: d.cfg, frames: d.frames, bytes: new Uint8Array(await d.data.arrayBuffer()) };
  pIndex = new Map(pc.frames.map((f, i) => [f[0], i]));
  pFirst = clamp(d.skip || 0, 0, pc.frames.length - 1);
  pPos = pFirst; pTarget = -1; pPending = -1; pPlaying = false; pStill = false;
  pSoft = false;   // jedes Video versucht es zuerst mit der Hardware
  $('pStill').classList.add('hidden');
  closeRange();
  viewMode = 'video';
  savedSig = null;
  $('aPlayer').classList.remove('imgMode');
  $('aList').classList.add('hidden');
  $('aPlayer').classList.remove('hidden');
  resetDrawing();
  $('pTitle').textContent = `${dayLabel(c.day)} · ${clipLabel(c)} · ${hhmm(c.created)}`;
  fillClipFields(c);
  renderClipNav();
  resetDelete();
  $('pSeek').min = pFirst;
  $('pSeek').max = pCount() - 1;
  pctx.fillStyle = '#000';
  pctx.fillRect(0, 0, pCanvas.width, pCanvas.height);
  updatePlayerUi();
  seek(pFirst);
}

// Stern, Name und Stichwort gehören zum Video, auch wenn ein Bild offen ist
const curClip = () => (viewMode === 'image' ? pimg && pimg.clip : viewMode === 'compare' ? cmp && cmp.meta : pc && pc.meta);

// Speichert Stern, Name und Stichwort dorthin, wo sie hingehören. Im Vergleich gelten sie für alle dort gespeicherten Bilder.
function saveMeta(c) {
  if (cmp && c === cmp.meta) {
    return Promise.all(cmp.saved.map(im => { Object.assign(im, { name: c.name, prop: c.prop, star: c.star }); return putImage(im); }));
  }
  return isCmp(c) ? putImage(c) : putClip(c);
}

function fillClipFields(c) {
  hideSuggest();
  $('pName').value = c.name || '';
  $('pProp').value = c.prop || '';
  renderStar();
  renderClipNav();
  resetDelete();
}

// Was noch im Feld für Name oder Stichwort steht, wird vor jedem Wechsel übernommen.
// Bei der Zurück-Geste behält das Feld sonst den Fokus, und die Eingabe ginge verloren.
function commitFields() {
  const a = document.activeElement;
  if (a && (a.id === 'pName' || a.id === 'pProp')) a.blur();
}

function closePlayer() {
  commitFields();
  closeCompare();
  $('aPlayer').classList.remove('cmpImg');
  drawTiles = null;
  viewMode = null;
  pimg = null;
  if (!pc) return;
  pause();
  pGen++;
  if (pdec && pdec.state !== 'closed') { try { pdec.close(); } catch (e) {} }
  pdec = null;
  pc = null;
  pTarget = -1; pPending = -1;
}

// ---------- Bildfenster ----------

async function openImage(im, scope = null) {
  await savePromise;
  const c = isCmp(im) ? im : clipById(im.clipId);
  if (!c) return;
  closePlayer();
  $('aPlayer').classList.toggle('cmpImg', isCmp(im));
  closeRange();
  viewMode = 'image';
  pimg = { rec: im, clip: c, scope };
  pStill = false;
  $('pStill').classList.add('hidden');
  $('aPlayer').classList.add('imgMode');
  $('aList').classList.add('hidden');
  $('aPlayer').classList.remove('hidden');
  const bmp = await createImageBitmap(im.base);
  pCanvas.width = bmp.width;
  pCanvas.height = bmp.height;
  pctx.drawImage(bmp, 0, 0);
  bmp.close();
  resetDrawing();
  drawTiles = im.tiles || null;   // Felder eines Vergleichs, das Lot bleibt in seinem Feld
  setShapes(im.shapes);
  savedSig = saveSig();   // frisch geöffnet gilt als gespeichert
  renderSaveBtn();
  $('pTitle').textContent = `${dayLabel(c.day)} · ${imageLabel(c, im)}`;
  fillClipFields(c);
}

// Die Pfeile folgen der Übersicht: › zur nächsten Karte rechts davon oder in der nächsten Reihe, ‹ zur Karte davor.
// Es gilt der Filter der Liste. Das geöffnete Video zählt mit, auch wenn es durch eine Namensänderung nicht mehr passt.
function clipNeighbor(dir) {
  if (!pc) return null;
  const id = pc.meta.id;
  const list = sortItems(listClips.filter(c => c.id === id || passesFilter(c)).map(c => ({ c }))).map(x => x.c);
  const i = list.findIndex(c => c.id === id);
  return i < 0 ? null : list[i + dir] || null;
}

// Bei Bildern genauso in der Reihenfolge der Liste „Bilder“, auch wenn das Bild über „Video | Bilder“ geöffnet wurde
const imagesOf = clipId => listImages.filter(im => im.clipId === clipId).sort((a, b) => a.n - b.n);
function imageNeighbor(dir) {
  if (!pimg) return null;
  const list = listImageItems(pimg.rec.id).map(x => x.im);
  const i = list.findIndex(im => im.id === pimg.rec.id);
  return i < 0 ? null : list[i + dir] || null;
}

// Nachbar innerhalb desselben Videos, für das Löschen eines Bildes, das über „Video | Bilder“ geöffnet wurde
function sameClipImage(dir) {
  if (!pimg || isCmp(pimg.rec)) return null;   // ein Vergleichsbild steht für sich
  const list = imagesOf(pimg.clip.id);
  const i = list.findIndex(im => im.id === pimg.rec.id);
  return list[i + dir] || null;
}
const neighbor = dir => (viewMode === 'image' ? imageNeighbor(dir) : clipNeighbor(dir));

function renderClipNav() {
  $('pPrevClip').disabled = !neighbor(-1);
  $('pNextClip').disabled = !neighbor(1);
  // Umschaltung „Video | Bilder“, Bilder nur wählbar, wenn das Video welche hat
  const c = curClip();
  const n = c ? imagesOf(c.id).length : 0;
  for (const b of $('pKind').querySelectorAll('button')) b.classList.toggle('on', (b.dataset.pk === 'images') === (viewMode === 'image'));
  $('pKind').querySelector('[data-pk="images"]').disabled = !n;
}

$('pKind').addEventListener('click', async e => {
  const b = e.target.closest('button');
  if (!b || b.disabled || navBusy) return;
  await savePromise;
  const c = curClip();
  if (!c) return;
  navBusy = true;
  try {
    await flushImageEdits();
    if (b.dataset.pk === 'images' && viewMode !== 'image') { const first = imagesOf(c.id)[0]; if (first) await openImage(first); }
    else if (b.dataset.pk === 'video' && viewMode !== 'video') await openClip(c);
  } finally { navBusy = false; }
});

// Wechsel ohne neuen Verlaufseintrag, die Zurück-Geste führt weiter direkt zur Liste.
// Zeitlupe bleibt, Zoom, Zeichnung, Schleife und Schnittauswahl beginnen neu.
let navBusy = false;   // schnelles Doppeltippen öffnet nicht zwei Videos gleichzeitig
async function showNeighbor(dir) {
  const x = neighbor(dir);
  if (!x || navBusy) return;
  navBusy = true;
  try {
    await flushImageEdits();
    await (viewMode === 'image' ? openImage(x, pimg && pimg.scope) : openClip(x));
  } finally { navBusy = false; }
}
$('pPrevClip').addEventListener('click', () => showNeighbor(-1));
$('pNextClip').addEventListener('click', () => showNeighbor(1));

// Im Bildfenster gilt der Stern des Bildes, sonst der des Videos oder Vergleichs
const starTarget = () => (viewMode === 'image' ? pimg && pimg.rec : curClip());

function renderStar() {
  const c = starTarget();
  const on = !!(c && c.star);
  $('pStar').textContent = starText(on);
  $('pStar').classList.toggle('on', on);
}

// Löschen braucht einen zweiten Druck innerhalb von 3 Sekunden
let delTimer = 0;
function resetDelete() {
  clearTimeout(delTimer);
  $('pDel').classList.remove('armed');
  $('pDel').textContent = tr('Löschen');
}

// ---------- Bedienung ----------

// Umschaltung oben zwischen Live und Analyse
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tab]');
  if (!b) return;
  if (b.dataset.tab === 'analyse' && mode === 'settings') { goFullscreen(); enterAnalysis(); }
  else if (b.dataset.tab === 'live' && mode === 'analysis') history.back();
});

// Zurück-Taste und Zurück-Geste von Android. Wiedergabe führt zur Liste, Liste zu Live.
// Im Betrieb bleibt sie wirkungslos, damit ein versehentliches Wischen den Betrieb nicht beendet.
window.addEventListener('popstate', () => {
  if (!$('tvCal').classList.contains('hidden')) { closeTvCal(); return; }   // zuerst Bildschirm anpassen, zurück in die Einstellungen
  if (!$('uiDlg').classList.contains('hidden')) {
    // Aus Farbwähler und Löschen zuerst zurück in die Einstellungen, erst dann zu
    if (!$('uiPick').classList.contains('hidden') || !$('uiDel').classList.contains('hidden')) {
      closePicker();
      closeDelete();   // eine offene Rückfrage zur Frist gilt als Abbrechen
      history.pushState({ v: 'dlg' }, '');
      return;
    }
    closeUi();
    checkKeep();   // eine noch nicht geprüfte Frist, notfalls mit Rückfrage
    return;
  }   // zuerst das Fenster Darstellung
  if (mode === 'run') {
    if (reviewing) { leaveReview(); return; }   // von der Videoseite zurück in die Wiedergabe
    history.pushState({ v: 'run' }, '');
    return;
  }
  if (mode !== 'analysis') return;
  if (!$('aPlayer').classList.contains('hidden')) showList();
  else leaveAnalysis();
});
$('pBack').addEventListener('click', () => history.back());

$('pPlay').addEventListener('click', () => {
  if (viewMode === 'compare') { if (cmp.playing) cmpPause(); else cmpPlay(); return; }
  if (pPlaying) pause(); else play();
});
// Ein Bild vor oder zurück. Gehalten schaltet die Taste fortlaufend weiter.
const stepBase = () => (pPending >= 0 ? pPending : pTarget >= 0 ? pTarget : pPos);
function holdRepeat(btn, fn) {
  let timer = 0;
  const stop = () => { clearTimeout(timer); timer = 0; };
  btn.addEventListener('pointerdown', () => {
    stop();
    fn();
    const loop = () => { fn(); timer = setTimeout(loop, 110); };
    timer = setTimeout(loop, 450);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) btn.addEventListener(type, stop);
}
holdRepeat($('pPrev'), () => (viewMode === 'compare' ? cmpStep(-1) : seek(stepBase() - 1)));
holdRepeat($('pNext'), () => (viewMode === 'compare' ? cmpStep(1) : seek(stepBase() + 1)));
// Geschwindigkeit im Video und im Vergleich: 1×, ½, ¼, ⅛, dann wieder 1×
const SPEED_STEPS = [1, 0.5, 0.25, 0.125];
const SPEED_LABEL = { 1: '1×', 0.5: '½', 0.25: '¼', 0.125: '⅛' };
function renderSpeed() {
  $('pSpeed').textContent = SPEED_LABEL[pSpeed];
  $('pSpeed').classList.toggle('slow', pSpeed < 1);
}
$('pSpeed').addEventListener('click', () => setSpeed(SPEED_STEPS[(SPEED_STEPS.indexOf(pSpeed) + 1) % SPEED_STEPS.length]));

const pSeek = $('pSeek');
pSeek.addEventListener('pointerdown', () => { seekDragging = true; });
for (const type of ['pointerup', 'pointercancel']) pSeek.addEventListener(type, () => { seekDragging = false; });
pSeek.addEventListener('input', () => { fillRange(pSeek); if (viewMode === 'compare') cmpSetM(+pSeek.value); else seek(+pSeek.value); });
pSeek.addEventListener('change', () => { seekDragging = false; });

$('pStar').addEventListener('click', async () => {
  if (viewMode === 'image' && !isCmp(pimg.rec)) {
    // Ein Bild hat seinen eigenen Stern. Bekommt es einen, bekommt ihn auch sein Video, damit beide bleiben.
    const { rec, clip } = pimg;
    rec.star = !rec.star;
    renderStar();
    await putImage(rec);
    if (rec.star && !clip.star) { clip.star = true; await putClip(clip); }
    return;
  }
  const c = curClip();
  if (!c) return;
  c.star = !c.star;
  renderStar();
  renderClipNav();
  await saveMeta(c);
});

for (const [id, key] of [['pName', 'name'], ['pProp', 'prop']]) {
  $(id).addEventListener('change', async () => {
    const c = curClip();
    if (!c) return;
    // Doppelte Leerzeichen entfernen und eine vorhandene Schreibweise übernehmen, damit „teo“ und „Teo“ ein Name bleiben
    let v = $(id).value.replace(/\s+/g, ' ').trim();
    const known = knownTerms(key).find(k => k.toLocaleLowerCase('de') === v.toLocaleLowerCase('de'));
    if (known) v = known;
    $(id).value = v;
    rememberTerms(key, [v]);
    c[key] = v;
    renderClipNav();
    await saveMeta(c);
  });
  $(id).addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
  $(id).addEventListener('input', () => showSuggest($(id), key));
  $(id).addEventListener('focus', () => showSuggest($(id), key));
  $(id).addEventListener('blur', () => setTimeout(hideSuggest, 150));
}

// ---------- Vorschläge für Name und Stichwort ----------
// Erst ab dem ersten Buchstaben. Passend ist der Anfang des Begriffs, danach der Anfang eines Wortes darin.
// Jeder je eingetragene Begriff bleibt in den Einstellungen gemerkt, auch wenn sein Video gelöscht ist.

const lc = s => s.toLocaleLowerCase('de');

function knownTerms(key) {
  const seen = new Map();
  const saved = (settings.terms && settings.terms[key]) || [];
  for (const t of [...saved, ...listClips.map(c => c[key]), ...listImages.filter(isCmp).map(im => im[key])]) if (t && !seen.has(lc(t))) seen.set(lc(t), t);
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'de'));
}

function rememberTerms(key, list) {
  settings.terms = settings.terms || {};
  const mine = settings.terms[key] || (settings.terms[key] = []);
  let added = false;
  for (const t of list) if (t && !mine.some(m => lc(m) === lc(t))) { mine.push(t); added = true; }
  if (added) saveSettings();
}

function showSuggest(input, key) {
  const q = lc(input.value.replace(/\s+/g, ' ').trimStart());
  if (!q) return hideSuggest();
  const terms = knownTerms(key).filter(t => lc(t) !== lc(input.value.trim()));
  const starts = terms.filter(t => lc(t).startsWith(q));
  const inWord = terms.filter(t => !lc(t).startsWith(q) && lc(t).split(/[\s-]+/).some(w => w.startsWith(q)));
  const hits = [...starts, ...inWord].slice(0, 8);
  if (!hits.length) return hideSuggest();
  const box = $('pSuggest');
  box.textContent = '';
  for (const t of hits) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = t;
    // pointerdown statt click, damit das Feld den Fokus erst nach der Wahl verliert
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      input.value = t;
      hideSuggest();
      input.dispatchEvent(new Event('change'));
      input.blur();
    });
    box.append(b);
  }
  // Rechtsbündig direkt unter dem Feld, in den Maßen der Kopfzeile
  const bar = box.parentElement;
  box.style.top = (input.offsetTop + input.offsetHeight + 4) + 'px';
  box.style.right = (bar.clientWidth - input.offsetLeft - input.offsetWidth) + 'px';
  box.style.minWidth = input.offsetWidth + 'px';
  box.classList.remove('hidden');
}

function hideSuggest() {
  $('pSuggest').classList.add('hidden');
}

async function download(file) {
  // In der Android-App speichert Android die Datei im Download-Ordner
  if (NATIVE) {
    playerMsg(tr('Wird gespeichert …'), true);
    const ok = await native.save(file).catch(() => false);
    playerMsg(tr(ok ? 'Im Download-Ordner gespeichert' : 'Speichern fehlgeschlagen'));
    return;
  }
  const u = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = u;
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 60000);
}

// Die Datei entsteht ohne Warten, damit Chrome das Herunterladen als Folge des Tippens erlaubt
function currentFile() {
  return new File([makeMp4(pc.cfg, pc.frames, pc.bytes, pFirst)], clipFileName(pc.meta), { type: 'video/mp4' });
}

// Video lädt das Video, ein Bild nur das Bild mit seiner Zeichnung.
// Bis eine Datei fertig ist, bleibt weiteres Tippen ohne Wirkung, sonst entstünde sie doppelt.
let downBusy = false;
$('pDown').addEventListener('click', async () => {
  if (downBusy) return;
  if (viewMode === 'image') {
    // Name und Bild werden sofort festgehalten, damit ein Wechsel oder Löschen nichts durcheinanderbringt
    if (!pimg) return;
    downBusy = true;
    const name = imageFileName(pimg.clip, pimg.rec);
    const snap = snapCanvas(pCanvas.width, pCanvas.height, true);
    try {
      const blob = await canvasBlob(snap, 0.92);
      await download(new File([blob], name, { type: 'image/jpeg' }));
    } finally { downBusy = false; }
    return;
  }
  if (!pc) return;
  pause();
  downBusy = true;
  try { await download(currentFile()); }
  finally { downBusy = false; }
});

$('pDel').addEventListener('click', async () => {
  if (!viewMode) return;
  const b = $('pDel');
  if (!b.classList.contains('armed')) {
    b.classList.add('armed');
    b.textContent = tr('Ja, löschen');
    delTimer = setTimeout(resetDelete, 3000);
    return;
  }
  resetDelete();
  if (viewMode === 'image') {
    // Danach das nächste Bild zeigen, aus der Liste geöffnet das nächste der Liste, sonst desselben Videos.
    // Ohne weitere Bilder geht es zur Liste oder zum Video.
    const { rec, clip } = pimg;
    const next = pimg.scope === 'list' ? imageNeighbor(1) || imageNeighbor(-1) : sameClipImage(1) || sameClipImage(-1);
    savedSig = saveSig();   // gelöschtes Bild nicht mehr speichern
    await deleteImage(rec.id);
    listImages = listImages.filter(im => im.id !== rec.id);
    const scope = pimg.scope;
    if (next) { await openImage(next, scope); return; }
    // Ein Vergleichsbild hat kein Video, aus der Liste geht es dorthin zurück
    if (isCmp(rec) || scope === 'list') { closePlayer(); history.back(); return; }
    await openClip(clip);
    return;
  }
  const id = pc.meta.id;
  closePlayer();
  await deleteClip(id);
  history.back();   // zurück zur Liste
});

// ---------- Abschnitt wählen für Schneiden und Bildfolge ----------

const STROBE_MIN = 3, STROBE_MAX = 16;
const MIN_RANGE = 3;          // so viele Bilder liegen mindestens zwischen Anfang und Ende
let rangeMode = null;         // cut oder strobe
let strobeCount = 8;
let selA = 0, selB = 0;       // gewählter Abschnitt, Anfang und Ende als Bildnummern

const selFrac = i => (i - pFirst) / Math.max(1, pCount() - 1 - pFirst);

function openRange(kind) {
  if (!pc) return;
  if (rangeMode === kind) { closeRange(); return; }
  pause();
  rangeMode = kind;
  const n = pCount();
  let a, b;
  if (kind === 'cut') { a = pFirst; b = n - 1; }
  else { a = Math.max(pFirst, pPos - 30); b = Math.min(n - 1, pPos + 30); }
  if (b - a < MIN_RANGE) { a = pFirst; b = n - 1; }
  selA = a; selB = b;
  for (const id of ['hA', 'hB', 'pSel']) $(id).classList.remove('hidden');
  $('rgCountBox').classList.toggle('hidden', kind !== 'strobe');
  $('rgOk').textContent = tr(kind === 'cut' ? 'Schneiden' : 'Erstellen');
  $('rgOk').disabled = false;
  $('dCut').classList.toggle('on', kind === 'cut');
  $('dStrobe').classList.toggle('on', kind === 'strobe');
  $('pRange').classList.remove('hidden');
  renderRange();
}

function closeRange() {
  rangeMode = null;
  $('pRange').classList.add('hidden');
  for (const id of ['hA', 'hB', 'pSel']) $(id).classList.add('hidden');
  $('dCut').classList.remove('on');
  $('dStrobe').classList.remove('on');
}

function renderRange() {
  $('hA').style.setProperty('--x', selFrac(selA));
  $('hB').style.setProperty('--x', selFrac(selB));
  $('pSel').style.setProperty('--a', selFrac(selA));
  $('pSel').style.setProperty('--w', selFrac(selB) - selFrac(selA));
  $('rgInfo').textContent = tr('Länge {0}', fmtSec(pc.frames[selB][0] - pc.frames[selA][0]));
  const cnt = strobeShown();
  $('rgCount').textContent = cnt;
  $('rgMinus').disabled = cnt <= STROBE_MIN;
  $('rgPlus').disabled = cnt >= Math.min(STROBE_MAX, selB - selA + 1);
}

// Die Punkte für Anfang und Ende liegen auf dem Zeitregler und können sich nicht überholen.
// Beim Ziehen zeigt das Video das gewählte Bild.
for (const [id, isA] of [['hA', true], ['hB', false]]) {
  const h = $(id);
  let drag = null;
  const moveTo = i => {
    if (isA) selA = clamp(i, pFirst, selB - MIN_RANGE);
    else selB = clamp(i, selA + MIN_RANGE, pCount() - 1);
    renderRange();
    seek(isA ? selA : selB);
  };
  h.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    drag = e.pointerId;
    try { h.setPointerCapture(e.pointerId); } catch (x) {}
    seek(isA ? selA : selB);
  });
  h.addEventListener('pointermove', e => {
    if (drag !== e.pointerId) return;
    const r = $('pSeek').getBoundingClientRect();
    const f = clamp((e.clientX - r.left - 13) / (r.width - 26), 0, 1);
    moveTo(Math.round(pFirst + f * (pCount() - 1 - pFirst)));
  });
  for (const type of ['pointerup', 'pointercancel']) h.addEventListener(type, e => { if (drag === e.pointerId) drag = null; });
}
// Die Bildfolge kann nicht mehr Bilder haben, als der Abschnitt enthält
const strobeShown = () => Math.min(strobeCount, selB - selA + 1);
$('rgMinus').addEventListener('click', () => { strobeCount = Math.max(STROBE_MIN, strobeShown() - 1); renderRange(); });
$('rgPlus').addEventListener('click', () => { strobeCount = Math.min(STROBE_MAX, strobeShown() + 1); renderRange(); });
$('rgCancel').addEventListener('click', closeRange);
$('dCut').addEventListener('click', () => openRange('cut'));
$('dStrobe').addEventListener('click', () => openRange('strobe'));

$('rgOk').addEventListener('click', async () => {
  if (!pc || !rangeMode) return;
  const a = selA, b = selB;
  const ok = $('rgOk');
  ok.disabled = true;
  ok.textContent = tr(rangeMode === 'cut' ? 'Wird geschnitten …' : 'Wird erstellt …');
  try {
    if (rangeMode === 'cut') await cutClip(a, b);
    else { await makeStrobe(a, b, strobeShown()); closeRange(); }
  } catch (e) {
    console.warn(e);
    ok.textContent = tr('Fehler');
    ok.disabled = false;
  }
});

// ---------- Schneiden ----------

// Das Original wird ersetzt. Ab dem Keyframe vor dem Anfang bleibt ein unsichtbarer Vorlauf,
// damit nichts neu kodiert werden muss.
async function cutClip(a, b) {
  const fr = pc.frames;
  const k = keyBefore(a);
  const base = fr[k][0], off0 = fr[k][2];
  const end = fr[b][2] + fr[b][3];
  const frames = fr.slice(k, b + 1).map(([ts, key, off, len]) => [ts - base, key, off - off0, len]);
  const skip = a - k;
  const shown = frames.length - skip;
  const meta = pc.meta;
  meta.dur = shown > 1 ? (frames[frames.length - 1][0] - frames[skip][0]) / 1000 * shown / (shown - 1) : 33;
  meta.thumb = null;
  const rec = { id: meta.id, cfg: pc.cfg, frames, skip, data: new Blob([pc.bytes.subarray(off0, end)]) };
  await inTx(['clips', 'data'], 'readwrite', t => {
    t.objectStore('clips').put(meta);
    t.objectStore('data').put(rec);
  });
  await openClip(meta);
}

// ---------- Bildfolge ----------
// Der Springer erscheint mehrmals auf einem einzigen Bild, wie bei einer Mehrfachbelichtung.
// 1. Ein ruhiger Hintergrund entsteht als Median aus bis zu 24 Bildern des ganzen Abschnitts. Was sich nur
//    kurz an einer Stelle aufhält, wie der Springer, Wasser oder vorbeigehende Leute, fällt dabei heraus.
// 2. In jedem Bild der Folge zählen nur zusammenhängende Flächen, die sich deutlich vom Hintergrund abheben.
//    Rauschen und Wasserflackern werden vorher geglättet und durch Öffnen der Maske entfernt.
// 3. Über alle Bilder wird die Fläche gewählt, die groß ist und eine zusammenhängende Bahn bildet. Das ist
//    der Springer. Kleine Bewegungen von Leuten im Hintergrund verlieren dabei gegen ihn.
// 4. Grundlage ist das erste Bild der Folge, unverändert. Darauf kommt der Springer aus jedem weiteren Bild
//    mit weichem Rand, spätere liegen oben. So entsteht kein Mosaik aus Rasterfeldern.

const STROBE_W = 1280, STROBE_H = 720;   // Arbeitsgröße, spart Speicher auf dem Tablet
const SW = 320, SH = 180;                // Größe für die Erkennung
const STROBE_BG_SAMPLES = 24;            // so viele Bilder höchstens für den Hintergrund

async function makeStrobe(a, b, count) {
  const idx = [...new Set(Array.from({ length: count }, (_, j) => Math.round(a + (b - a) * j / (count - 1))))];
  const want = new Map(idx.map((i, j) => [pc.frames[i][0], j]));
  // Bilder für den Hintergrund gleichmäßig über den Abschnitt, dazu alle Bilder der Folge
  const stride = Math.max(1, Math.ceil((b - a + 1) / STROBE_BG_SAMPLES));
  const sampleTs = new Set(idx.map(i => pc.frames[i][0]));
  for (let i = a; i <= b; i += stride) sampleTs.add(pc.frames[i][0]);
  const cvs = idx.map(() => {
    const c = document.createElement('canvas');
    c.width = STROBE_W; c.height = STROBE_H;
    return c;
  });
  const smallCv = document.createElement('canvas');
  smallCv.width = SW; smallCv.height = SH;
  const sctx = smallCv.getContext('2d', { willReadFrequently: true });
  let samples = [];
  const sIdx = new Array(idx.length).fill(-1);   // Stelle jedes Bildes der Folge in samples
  // Ein eigener Decoder läuft einmal durch den Abschnitt und behält nur die gewünschten Bilder.
  // Scheitert die Hardware oder hängt sie, weil alle Decoder belegt sind, rechnet die App in Software.
  let dec = null;
  const run = soft => new Promise((res, rej) => {
    samples = [];
    sIdx.fill(-1);
    dec = new VideoDecoder({
      output: f => {
        const j = want.get(f.timestamp);
        if (j !== undefined) cvs[j].getContext('2d').drawImage(f, 0, 0, STROBE_W, STROBE_H);
        if (sampleTs.has(f.timestamp)) {
          sctx.drawImage(f, 0, 0, SW, SH);
          const d = sctx.getImageData(0, 0, SW, SH).data;
          if (j !== undefined) sIdx[j] = samples.length;
          samples.push(d);
        }
        f.close();
      },
      error: rej,
    });
    dec.configure(soft ? { ...pc.cfg, hardwareAcceleration: 'prefer-software' } : pc.cfg);
    for (let i = keyBefore(a); i <= b; i++) dec.decode(chunkAt(i));
    dec.flush().then(res, rej);
  });
  const closeDec = () => { if (dec && dec.state !== 'closed') { try { dec.close(); } catch (e) {} } };
  try { await withTimeout(run(pSoft), 8000); }
  catch (e) {
    closeDec();
    if (pSoft) throw e;
    console.warn(e);
    await run(true);
  }
  closeDec();

  const out = composeStrobe(cvs, sIdx, samples);
  pCanvas.width = STROBE_W;
  pCanvas.height = STROBE_H;
  pctx.drawImage(out, 0, 0);
  layoutView();
  onPlayerFrameShown();
  pStill = true;
  $('pStill').textContent = tr('Bildfolge · {0} Bilder', cvs.length);
  $('pStill').classList.remove('hidden');
  renderSaveBtn();
}

// Bild aus RGBA auf 3 × 3 geglättetes RGB, das dämpft Rauschen und kleines Wasserflackern
function strobeBlur(d) {
  const out = new Uint8Array(SW * SH * 3);
  for (let y = 0; y < SH; y++) {
    const y0 = Math.max(0, y - 1), y1 = Math.min(SH - 1, y + 1);
    for (let x = 0; x < SW; x++) {
      const x0 = Math.max(0, x - 1), x1 = Math.min(SW - 1, x + 1);
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
        const p = (yy * SW + xx) * 4;
        r += d[p]; g += d[p + 1]; b += d[p + 2]; n++;
      }
      const q = (y * SW + x) * 3;
      out[q] = r / n; out[q + 1] = g / n; out[q + 2] = b / n;
    }
  }
  return out;
}

// Ausdehnen oder Abtragen einer Maske um ein Feld in alle acht Richtungen
function strobeMorph(m, grow) {
  const out = new Uint8Array(m.length);
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
    let v = grow ? 0 : 1;
    scan: for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx;
      const s = yy >= 0 && yy < SH && xx >= 0 && xx < SW ? m[yy * SW + xx] : 0;
      if (grow ? s : !s) { v = grow ? 1 : 0; break scan; }
    }
    out[y * SW + x] = v;
  }
  return out;
}

// Zusammenhängende Flächen einer Maske mit Größe und Mittelpunkt
function strobeBlobs(m, minArea, rgb) {
  const lab = new Int32Array(m.length).fill(-1);
  const blobs = [];
  const stack = new Int32Array(m.length);
  for (let s = 0; s < m.length; s++) {
    if (!m[s] || lab[s] >= 0) continue;
    const id = blobs.length;
    let top = 0, area = 0, sx = 0, sy = 0, sr = 0, sg = 0, sb = 0;
    stack[top++] = s; lab[s] = id;
    while (top) {
      const p = stack[--top];
      const x = p % SW, y = (p / SW) | 0;
      area++; sx += x; sy += y;
      sr += rgb[p * 3]; sg += rgb[p * 3 + 1]; sb += rgb[p * 3 + 2];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= SW || yy >= SH) continue;
        const q = yy * SW + xx;
        if (m[q] && lab[q] < 0) { lab[q] = id; stack[top++] = q; }
      }
    }
    blobs.push({ id, area, cx: sx / area, cy: sy / area, r: sr / area, g: sg / area, b: sb / area });
  }
  return { lab, blobs: blobs.filter(b => b.area >= minArea).sort((p, q) => q.area - p.area).slice(0, 8) };
}

// Bewegte Flächen eines verkleinerten Bildes gegenüber dem Hintergrund
function strobeDetect(f, bg) {
  const N = SW * SH;
  const diff = new Uint16Array(N);
  const hist = new Uint32Array(766);
  for (let p = 0; p < N; p++) {
    const q = p * 3;
    const v = Math.abs(f[q] - bg[q]) + Math.abs(f[q + 1] - bg[q + 1]) + Math.abs(f[q + 2] - bg[q + 2]);
    diff[p] = v; hist[v]++;
  }
  // Schwelle aus dem typischen Unterschied des Bildes, damit Licht und Rauschen nicht zählen
  let acc = 0, med = 0;
  while (acc + hist[med] < N / 2) acc += hist[med++];
  const thr = Math.max(48, med * 3 + 20);
  let m = new Uint8Array(N);
  for (let p = 0; p < N; p++) m[p] = diff[p] > thr ? 1 : 0;
  m = strobeMorph(strobeMorph(m, false), true);                      // Öffnen: Krümel weg
  m = strobeMorph(strobeMorph(strobeMorph(m, true), true), false);   // Schließen: Lücken im Körper füllen
  return strobeBlobs(m, Math.round(N * 0.0012), f);
}

// Setzt die Bildfolge zusammen. frames sind die großen Bilder der Folge, samples verkleinerte Bilder des
// ganzen Abschnitts in zeitlicher Reihenfolge, sIdx die Stelle jedes Bildes der Folge in samples.
// Liefert ein Canvas in Arbeitsgröße.
function composeStrobe(frames, sIdx, samples) {
  const n = frames.length, N = SW * SH;
  // 1. Hintergrund als Median je Bildpunkt und Farbe
  const blurred = samples.map(strobeBlur);
  const bg = new Uint8Array(N * 3);
  const tmp = new Uint8Array(blurred.length);
  for (let q = 0; q < N * 3; q++) {
    for (let k = 0; k < blurred.length; k++) tmp[k] = blurred[k][q];
    tmp.sort();
    bg[q] = tmp[tmp.length >> 1];
  }
  // 2. Bewegte Flächen in jedem verkleinerten Bild
  const found = blurred.map(f => strobeDetect(f, bg));
  // 3. Spuren: Flächen aufeinanderfolgender Bilder werden demselben Gegenstand zugeordnet, die nächstliegenden
  //    und ähnlichsten zuerst. Zwischen zwei dichten Bildern bewegt sich jeder nur ein Stück. Fehlt ein
  //    Gegenstand in einigen Bildern, etwa vor einem Hintergrund in ähnlicher Farbe, darf die Spur bis zu drei
  //    Bilder überspringen.
  const tracks = [];
  const lastT = tr => tr.items[tr.items.length - 1][0];
  found.forEach((fr, t) => {
    const pairs = [];
    for (const tr of tracks) {
      const gap = t - lastT(tr);
      if (gap < 1 || gap > 4) continue;
      const a = tr.items[tr.items.length - 1][1];
      for (const b of fr.blobs) {
        const d = Math.hypot(b.cx - a.cx, b.cy - a.cy);
        if (d > Math.max(15, 3 * Math.sqrt(a.area)) * gap) continue;
        const color = Math.abs(b.r - a.r) + Math.abs(b.g - a.g) + Math.abs(b.b - a.b);
        pairs.push([d / gap + 0.3 * color + 10 * Math.abs(Math.log(b.area / a.area)) + (gap - 1) * 20, tr, b]);
      }
    }
    pairs.sort((x, y) => x[0] - y[0]);
    const usedT = new Set(), usedB = new Set();
    for (const [, tr, b] of pairs) {
      if (usedT.has(tr) || usedB.has(b)) continue;
      usedT.add(tr); usedB.add(b);
      tr.items.push([t, b]);
    }
    for (const b of fr.blobs) if (!usedB.has(b)) tracks.push({ items: [[t, b]] });
  });
  // 4. Der Springer ist die Spur, die am weitesten vorankommt, und zwar gleichmäßig und ohne viele Lücken.
  //    Leute am Rand kommen kaum vom Fleck. Wasserflackern ergibt höchstens lückenhafte Spuren, die kreuz und
  //    quer springen. Bewertet wird deshalb der Weg vom Anfang zum Ende mal Geradlinigkeit mal Vollständigkeit.
  let best = null, bestScore = 0;
  for (const tr of tracks) {
    if (tr.items.length < 3) continue;
    const it = tr.items;
    const gain = Math.hypot(it[it.length - 1][1].cx - it[0][1].cx, it[it.length - 1][1].cy - it[0][1].cy);
    let path = 0;
    for (let k = 1; k < it.length; k++) path += Math.hypot(it[k][1].cx - it[k - 1][1].cx, it[k][1].cy - it[k - 1][1].cy);
    const straight = gain / Math.max(path, 1);
    const cover = Math.min(1, it.length / (0.6 * found.length));
    const score = gain * straight * cover;
    if (score > bestScore) { bestScore = score; best = tr; }
  }
  const pick = sIdx.map(t => {
    const it = best && best.items.find(([tt]) => tt === t);
    return it ? it[1] : null;
  });
  const labOf = j => found[sIdx[j]].lab;

  // 5. Erstes Bild als Grundlage, darauf der Springer aus jedem weiteren Bild mit weichem Rand
  const out = document.createElement('canvas');
  out.width = STROBE_W; out.height = STROBE_H;
  const octx = out.getContext('2d');
  octx.drawImage(frames[0], 0, 0);
  const maskCv = document.createElement('canvas');
  maskCv.width = SW; maskCv.height = SH;
  const mctx = maskCv.getContext('2d');
  const cut = document.createElement('canvas');
  cut.width = STROBE_W; cut.height = STROBE_H;
  const cctx = cut.getContext('2d');
  for (let j = 1; j < n; j++) {
    const blob = pick[j];
    if (!blob) continue;
    // Maske der gewählten Fläche, um ein Feld erweitert, damit Arme und Haare nicht fehlen
    let m = new Uint8Array(N);
    const lab = labOf(j);
    for (let p = 0; p < N; p++) m[p] = lab[p] === blob.id ? 1 : 0;
    m = strobeMorph(m, true);
    const img = mctx.createImageData(SW, SH);
    for (let p = 0; p < N; p++) { img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = 255; img.data[p * 4 + 3] = m[p] ? 255 : 0; }
    mctx.putImageData(img, 0, 0);
    cctx.globalCompositeOperation = 'source-over';
    cctx.clearRect(0, 0, STROBE_W, STROBE_H);
    cctx.drawImage(frames[j], 0, 0);
    cctx.globalCompositeOperation = 'destination-in';
    cctx.filter = 'blur(3px)';
    cctx.drawImage(maskCv, 0, 0, STROBE_W, STROBE_H);
    cctx.filter = 'none';
    octx.drawImage(cut, 0, 0);
  }
  return out;
}

// ---------- Bilder speichern ----------

// Chrome wandelt bei toBlob erst um, wenn die Seite gerade nichts zu tun hat, und wartet sonst bis zu
// einer Sekunde. Bei laufender Kamera und Wiedergabe ist das fast immer so. toDataURL wandelt sofort um.
function canvasBlob(cv, q) {
  const url = cv.toDataURL('image/jpeg', q);
  const bin = atob(url.slice(url.indexOf(',') + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return Promise.resolve(new Blob([bytes], { type: 'image/jpeg' }));
}

// Bild mit oder ohne Zeichnung, ohne Griffe und ohne Zoom, in der gewünschten Größe.
// Läuft ohne Warten, damit genau das Bild im Moment des Tippens erfasst wird.
function snapCanvas(w, h, withDrawing) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.drawImage(pCanvas, 0, 0, w, h);
  if (withDrawing) {
    renderDrawing(false);
    x.drawImage(dCanvas, 0, 0, w, h);
    renderDrawing();
  }
  return c;
}
const composeImage = (w, h, q) => canvasBlob(snapCanvas(w, h, true), q);

let playerMsgTimer = 0;
// keep lässt die Meldung stehen, bis die nächste kommt. ms bestimmt sonst die Dauer.
function playerMsg(text, keep, ms = 2200) {
  $('pMsg').textContent = text;
  $('pMsg').classList.remove('hidden');
  clearTimeout(playerMsgTimer);
  if (!keep) playerMsgTimer = setTimeout(() => $('pMsg').classList.add('hidden'), ms);
}

// Fingerabdruck des aktuellen Standes. Ist er seit dem letzten Speichern unverändert, bleibt der Knopf grau,
// damit kein doppeltes Bild entsteht.
const saveSig = () => JSON.stringify([viewMode, viewMode === 'image' ? pimg && pimg.rec.id : viewMode === 'compare' ? cmpSig() : pPos, pStill, shapes]);

// Vorschaubild 384 × 216. Ein Vergleich mit anderem Seitenverhältnis bekommt schwarze Ränder statt verzerrt zu werden.
function thumbSnap() {
  const W = pCanvas.width, H = pCanvas.height;
  const s = Math.min(384 / W, 216 / H), w = Math.round(W * s), h = Math.round(H * s);
  if (w >= 383 && h >= 215) return snapCanvas(384, 216, true);
  const c = document.createElement('canvas');
  c.width = 384; c.height = 216;
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.fillRect(0, 0, 384, 216);
  x.drawImage(snapCanvas(w, h, true), Math.round((384 - w) / 2), Math.round((216 - h) / 2));
  return c;
}
let savedSig = null;

function renderSaveBtn() {
  const b = $('dSave');
  if (!b) return;
  // Jedes Bild lässt sich speichern, auch ohne Zeichnung. Nur dasselbe Bild nicht zweimal.
  b.disabled = !viewMode || saveSig() === savedSig;
}

let saveBusy = false;
let savePromise = Promise.resolve();   // wer ein Bild öffnet, wartet, bis ein laufendes Speichern fertig ist
$('dSave').addEventListener('click', () => {
  if (saveBusy || !viewMode) return;
  saveBusy = true;
  savePromise = saveNowImage();
});

async function saveNowImage() {
  let slow = 0;
  try {
    if (viewMode === 'video') pause();
    if (viewMode === 'compare') cmpPause();
    // Zuerst alles im Moment des Tippens festhalten, danach in Ruhe umwandeln
    const W = pCanvas.width, H = pCanvas.height;
    const thumbCv = thumbSnap();
    const shapesNow = getShapes();
    const sig = saveSig();
    // Der Hinweis erscheint nur, wenn das Umwandeln merklich dauert
    slow = setTimeout(() => playerMsg(tr('Wird gespeichert …'), true), 400);
    if (viewMode === 'image') {
      // Änderungen gehen in dasselbe Bild, das Bild bleibt seinem Video zugeordnet
      const rec = pimg.rec;
      rec.shapes = shapesNow;
      rec.thumb = await canvasBlob(thumbCv, 0.8);
      await putImage(rec);
      savedSig = sig;
      clearTimeout(slow);
      playerMsg(tr('Gespeichert'), false, 1200);
      return;
    }
    if (viewMode === 'compare') {
      const rec = newCmpImage(W, H, shapesNow);
      listImages.push(rec);
      try {
        [rec.base, rec.thumb] = await Promise.all([canvasBlob(snapCanvas(W, H, false), 0.92), canvasBlob(thumbCv, 0.8)]);
        rec.id = await putImage(rec);
      } catch (e) {
        listImages.splice(listImages.indexOf(rec), 1);
        throw e;
      }
      if (cmp) cmp.saved.push(rec);
      savedSig = sig;
      clearTimeout(slow);
      playerMsg(tr('Gespeichert als {0}', imageLabel(rec, rec)), false, 1200);
      return;
    }
    const c = pc.meta;
    const baseCv = snapCanvas(W, H, false);
    const still = pStill;
    // Nummer sofort vergeben, damit zwei schnelle Speichervorgänge nie dieselbe bekommen
    const n = imagesOf(c.id).reduce((m, im) => Math.max(m, im.n), 0) + 1;
    const rec = { clipId: c.id, n, created: Date.now(), w: W, h: H, shapes: shapesNow, strobe: still };
    listImages.push(rec);
    try {
      [rec.base, rec.thumb] = await Promise.all([canvasBlob(baseCv, 0.92), canvasBlob(thumbCv, 0.8)]);
      rec.id = await putImage(rec);
    } catch (e) {
      listImages.splice(listImages.indexOf(rec), 1);
      throw e;
    }
    savedSig = sig;
    renderClipNav();
    clearTimeout(slow);
    playerMsg(tr('Gespeichert als {0}', imageLabel(c, rec)), false, 1200);
  } catch (e) {
    console.warn(e);
    clearTimeout(slow);
    playerMsg(tr('Speichern fehlgeschlagen'));
  } finally {
    saveBusy = false;
    renderSaveBtn();
  }
}

// Änderungen an einem gespeicherten Bild gehen beim Verlassen nicht verloren
async function flushImageEdits() {
  await savePromise;
  if (viewMode !== 'image' || saveSig() === savedSig) return;
  saveBusy = true;
  savePromise = saveNowImage();
  await savePromise;
}

// ---------- Videos löschen in den Einstellungen ----------

// Drei Schritte, damit nichts aus Versehen verloren geht: Knopf, Auswahl mit Anzahl, Rückfrage.
let delOnlyNoStar = true;
let askKind = null;   // many beim Löschen über den Knopf, keep bei einer kürzeren Frist

$('delOpen').addEventListener('click', async () => {
  const clips = await allClips();
  const noStar = clips.filter(c => !c.star).length;
  $('delNoStar').textContent = tr('Ohne Stern löschen ({0})', noStar);
  $('delNoStar').disabled = !noStar;
  $('delAll').textContent = tr('Alle löschen ({0})', clips.length);
  $('delAll').disabled = !clips.length;
  $('delChoose').classList.remove('hidden');
  $('delAsk').classList.add('hidden');
  $('uiMain').classList.add('hidden');
  $('uiDel').classList.remove('hidden');
});

function closeDelete() {
  // Abbrechen der Rückfrage zur Frist stellt die bisherige Frist wieder her
  if (askKind === 'keep') { keepShown = settings.keepDays; renderKeep(); }
  askKind = null;
  $('uiDel').classList.add('hidden');
  $('uiMain').classList.remove('hidden');
}

async function askDelete(onlyNoStar) {
  delOnlyNoStar = onlyNoStar;
  askKind = 'many';
  const clips = await allClips();
  const hit = onlyNoStar ? clips.filter(c => !c.star) : clips;
  const n = hit.length;
  const ids = new Set(hit.map(c => c.id));
  const nImg = (await allImages()).filter(im => ids.has(im.clipId)).length;
  const vids = n === 1 ? tr('1 Video') : tr('{0} Videos', n);
  const imgs = nImg ? (nImg === 1 ? tr(' mit 1 Bild') : tr(' mit {0} Bildern', nImg)) : '';
  $('delQuestion').textContent = onlyNoStar
    ? tr('{0} ohne Stern{1} wirklich löschen? Das lässt sich nicht rückgängig machen.', vids, imgs)
    : n === 1
      ? tr('{0}{1} wirklich löschen, auch mit Stern? Das lässt sich nicht rückgängig machen.', vids, imgs)
      : tr('Wirklich alle {0}{1} löschen, auch die mit Stern? Das lässt sich nicht rückgängig machen.', vids, imgs);
  $('delChoose').classList.add('hidden');
  $('delAsk').classList.remove('hidden');
}

async function deleteMany(onlyNoStar) {
  const ids = new Set((await allClips()).filter(c => !onlyNoStar || !c.star).map(c => c.id));
  const imgIds = (await allImages()).filter(im => ids.has(im.clipId)).map(im => im.id);
  await inTx(['clips', 'data', 'images'], 'readwrite', t => {
    for (const id of ids) { t.objectStore('clips').delete(id); t.objectStore('data').delete(id); }
    for (const id of imgIds) t.objectStore('images').delete(id);
  });
  closeDelete();
  renderStorage();
  if (mode === 'analysis' && !viewMode) showList();
}
$('delNoStar').addEventListener('click', () => askDelete(true));
$('delAll').addEventListener('click', () => askDelete(false));
$('delCancel').addEventListener('click', closeDelete);
$('delYes').addEventListener('click', async () => {
  if (askKind !== 'keep') { deleteMany(delOnlyNoStar); return; }
  askKind = null;
  commitKeep();
  await cleanupOld();
  closeDelete();
  renderStorage();
  if (mode === 'analysis' && !viewMode) showList();
});
$('delNo').addEventListener('click', closeDelete);

// ---------- Start ----------

// Chrome soll die Videos auch bei knappem Speicher nicht selbst löschen
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
cleanupOld().catch(e => console.warn(e));
