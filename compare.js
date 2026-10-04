'use strict';

// Vergleich von 2 bis 4 Videos. Nutzt Player, Zeichnen und Speichern aus analysis.js und draw.js.
// Alle Videos erscheinen in einem gemeinsamen Bild pCanvas, jedes in seinem Feld. Zeichnen, Zoom und
// Speichern arbeiten deshalb wie bei einem einzelnen Video.
// Jedes Video hat einen eigenen Versatz. Die gemeinsame Zeit m läuft für alle gleich, ein Video zeigt
// das Bild zur Zeit Versatz plus m. Mit dem eigenen Regler setzt man den Versatz, etwa auf den Absprung.

const CMP_TW = 1280, CMP_TH = 720;   // Größe eines Feldes im gemeinsamen Bild
const CMP_GAP = 8;
const CMP_STEP_MS = 1000 / 30;        // ein Bild vor oder zurück
let cmpSelect = null;                 // Auswahl in der Übersicht als Liste von Video-Nummern, null heißt aus

// ---------- Auswahl in der Übersicht ----------

// „Vergleichen“ steht nur unter „Videos“ rechts und startet die Auswahl.
// Unter „Bilder“ filtert der eigene Knopf „Vergleiche“ neben dem Stern auf Vergleichsbilder, siehe renderFilter.
$('fCmp').addEventListener('click', () => {
  cmpSelect = cmpSelect ? null : [];
  renderCmpSelect();
});

function toggleCmpSelect(id) {
  const i = cmpSelect.indexOf(id);
  if (i >= 0) cmpSelect.splice(i, 1);
  else if (cmpSelect.length < 4) cmpSelect.push(id);
  renderCmpSelect();
}

// Ausgewählte Karten tragen ihre Nummer im Vergleich
function renderCmpSelect() {
  const on = !!cmpSelect;
  const images = listFilter.kind === 'images';
  $('fCmp').classList.toggle('hidden', images);
  $('fCmp').classList.toggle('on', on);
  $('fCmpGo').classList.toggle('hidden', !on);
  const n = on ? cmpSelect.length : 0;
  $('fCmpGo').textContent = tr('Öffnen ({0})', n);
  $('fCmpGo').disabled = n < 2;
  $('aGrid').classList.toggle('selecting', on);
  for (const card of document.querySelectorAll('#aGrid .card[data-id]')) {
    const k = on ? cmpSelect.indexOf(+card.dataset.id) : -1;
    card.classList.toggle('sel', k >= 0);
    let b = card.querySelector('.selNo');
    if (k >= 0) {
      if (!b) { b = el('span', 'selNo'); card.querySelector('.th').append(b); }
      b.textContent = k + 1;
    } else if (b) b.remove();
  }
}

$('fCmpGo').addEventListener('click', async () => {
  if (!cmpSelect || cmpSelect.length < 2) return;
  const ids = cmpSelect.slice();
  cmpSelect = null;
  renderCmpSelect();
  listScroll = $('aGrid').scrollTop;
  history.pushState({ v: 'player' }, '');
  await openCompare(ids);
});

// ---------- Öffnen und Schließen ----------

async function openCompare(ids) {
  const metas = ids.map(clipById).filter(Boolean);
  if (metas.length < 2) return;
  const datas = await Promise.all(metas.map(c => getData(c.id)));
  closePlayer();
  closeRange();
  const n = metas.length;
  // Zwei Videos übereinander, drei oder vier im Raster aus zwei mal zwei Feldern
  const cols = n <= 2 ? 1 : 2, rows = 2;
  const W = cols * CMP_TW + (cols - 1) * CMP_GAP, H = rows * CMP_TH + (rows - 1) * CMP_GAP;
  const tiles = [];
  for (let k = 0; k < n; k++) {
    const d = datas[k];
    if (!d) continue;
    const frames = d.frames;
    const t = {
      no: k + 1, meta: metas[k], cfg: d.cfg, frames,
      bytes: new Uint8Array(await d.data.arrayBuffer()),
      first: clamp(d.skip || 0, 0, frames.length - 1),
      idx: new Map(frames.map((f, i) => [f[0], i])),
      rect: { x: (k % cols) * (CMP_TW + CMP_GAP), y: Math.floor(k / cols) * (CMP_TH + CMP_GAP), w: CMP_TW, h: CMP_TH },
      dec: null, soft: false, gen: 0, target: -1, pending: -1, pos: -1,
      queue: [], feed: 0, startIdx: 0, off: 0,
    };
    t.off = tMs(t, t.first);   // zu Beginn stehen alle Videos am Anfang
    tiles.push(t);
  }
  if (tiles.length < 2) return;
  viewMode = 'compare';
  cmp = {
    tiles, m: 0, mMin: 0, mMax: 0, playing: false, clock: null, saved: [], nr: 0,
    startM: null,   // gemeinsamer Anfang, solange gesetzt sind die einzelnen Regler ausgeblendet
    meta: { name: '', prop: '', star: false },   // gilt für alle Bilder, die in diesem Vergleich entstehen
  };
  cmpRange();
  savedSig = null;
  pStill = false;
  $('pStill').classList.add('hidden');
  $('aPlayer').classList.remove('imgMode', 'cmpImg');
  $('aPlayer').classList.add('cmpMode');
  $('aList').classList.add('hidden');
  $('aPlayer').classList.remove('hidden');
  pCanvas.width = W;
  pCanvas.height = H;
  pctx.fillStyle = '#26292d';
  pctx.fillRect(0, 0, W, H);
  if (n === 3) {   // freies viertes Feld
    pctx.fillStyle = '#000';
    pctx.fillRect(CMP_TW + CMP_GAP, CMP_TH + CMP_GAP, CMP_TW, CMP_TH);
  }
  for (const t of tiles) { pctx.fillStyle = '#000'; pctx.fillRect(t.rect.x, t.rect.y, t.rect.w, t.rect.h); }
  resetDrawing();
  drawTiles = tiles.map(t => t.rect);
  $('pTitle').textContent = tr('Vergleich · {0}', tiles.map(t => clipLabel(t.meta)).join(' · '));
  fillClipFields(cmp.meta);
  buildAlign();
  for (const t of tiles) seekTile(t, tileIndexAt(t, t.off));
  cmpUi();
}

function closeCompare() {
  if (!cmp) return;
  cmp.playing = false;
  for (const t of cmp.tiles) {
    t.gen++;
    t.queue.forEach(q => q.f.close());
    t.queue = [];
    if (t.dec && t.dec.state !== 'closed') { try { t.dec.close(); } catch (e) {} }
    t.dec = null;
  }
  cmp = null;
  $('aPlayer').classList.remove('cmpMode');
  $('cmpAlign').classList.add('hidden');
  $('cmpAlign').textContent = '';
}

// ---------- Zeit und Bilder eines Videos ----------

const tMs = (t, i) => t.frames[i][0] / 1000;

// Letztes Bild bis zur Zeit ms, begrenzt auf den sichtbaren Teil
function tileIndexAt(t, ms) {
  const us = ms * 1000, fr = t.frames;
  let lo = t.first, hi = fr.length - 1;
  if (us <= fr[lo][0]) return lo;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (fr[mid][0] <= us) lo = mid; else hi = mid - 1;
  }
  return lo;
}

function tileKeyBefore(t, i) {
  while (i > 0 && !t.frames[i][1]) i--;
  return i;
}

function tileChunk(t, i) {
  const [ts, key, off, len] = t.frames[i];
  return new EncodedVideoChunk({ type: key ? 'key' : 'delta', timestamp: ts, data: t.bytes.subarray(off, off + len) });
}

// Bereich der gemeinsamen Zeit: vom frühesten Anfang bis zum spätesten Ende aller Videos,
// bei gesetztem Anfang erst ab dort
function cmpRange() {
  cmp.mMin = cmp.startM != null ? cmp.startM : Math.min(...cmp.tiles.map(t => tMs(t, t.first) - t.off));
  cmp.mMax = Math.max(...cmp.tiles.map(t => tMs(t, t.frames.length - 1) - t.off));
  cmp.m = clamp(cmp.m, cmp.mMin, cmp.mMax);
}

// Ein Decoder je Video. Scheitert oder hängt die Hardware, dekodiert dieses Video in Software.
function tileDecoder(t) {
  t.gen++;
  if (!t.dec || t.dec.state === 'closed') {
    t.dec = new VideoDecoder({
      output: f => onTileFrame(t, f),
      error: e => {
        console.warn(e);
        t.dec = null;
        if (t.soft || !cmp || !cmp.tiles.includes(t)) return;
        t.soft = true;
        setTimeout(() => {
          if (!cmp || !cmp.tiles.includes(t)) return;
          if (cmp.playing) startTileFeed(t);
          else { const i = t.target >= 0 ? t.target : t.pos; t.target = -1; t.pending = -1; seekTile(t, i); }
        }, 0);
      },
    });
  } else {
    t.dec.reset();
  }
  t.dec.configure(t.soft ? { ...t.cfg, hardwareAcceleration: 'prefer-software' } : t.cfg);
}

function onTileFrame(t, f) {
  const i = t.idx.get(f.timestamp);
  if (cmp && cmp.playing) {
    if (i >= t.startIdx) t.queue.push({ i, f }); else f.close();
    return;
  }
  if (i === t.target) { drawTile(t, f); t.pos = i; cmpUi(); }
  f.close();
}

// Bild ins Feld des Videos, im Seitenverhältnis des Videos, dazu oben links die Nummer
function drawTile(t, f) {
  const r = t.rect;
  const s = Math.min(r.w / f.displayWidth, r.h / f.displayHeight);
  const w = f.displayWidth * s, h = f.displayHeight * s;
  pctx.fillStyle = '#000';
  pctx.fillRect(r.x, r.y, r.w, r.h);
  pctx.drawImage(f, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
  const label = [clipLabel(t.meta), t.meta.name].filter(Boolean).join(' · ');
  pctx.font = '600 48px system-ui, Roboto, sans-serif';
  pctx.textBaseline = 'middle';
  const tw = pctx.measureText(label).width;
  pctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  pctx.fillRect(r.x + 16, r.y + 16, tw + 40, 72);
  pctx.fillStyle = '#fff';
  pctx.fillText(label, r.x + 36, r.y + 53);
  onPlayerFrameShown();   // ein neues Bild löscht die Zeichnung wie im einzelnen Video
}

// Springt in einem Video auf ein Bild, ab dem Keyframe davor. Kommt beim Wischen schon ein neues Ziel, wartet es.
function seekTile(t, i) {
  if (!cmp) return;
  i = clamp(i, t.first, t.frames.length - 1);
  if (t.target >= 0) { t.pending = i; return; }
  if (i === t.pos) return;
  t.target = i;
  try {
    tileDecoder(t);
    for (let k = tileKeyBefore(t, i); k <= i; k++) t.dec.decode(tileChunk(t, k));
  } catch (e) { console.warn(e); t.dec = null; }
  const gen = t.gen;
  setTimeout(() => {
    if (gen !== t.gen || t.target !== i || t.soft || !cmp) return;
    t.soft = true;
    if (t.dec) { try { t.dec.close(); } catch (e) {} }
    t.dec = null;
    t.target = -1; t.pending = -1;
    seekTile(t, i);
  }, 1500);
  const done = () => {
    if (gen !== t.gen) return;
    t.target = -1;
    if (t.pending >= 0) {
      const j = t.pending;
      t.pending = -1;
      if (j !== t.pos) seekTile(t, j);
    }
  };
  if (t.dec) t.dec.flush().then(done, done);
  else done();
}

// Alle Videos auf die gemeinsame Zeit m
function cmpSetM(m) {
  if (!cmp) return;
  if (cmp.playing) cmpPause();
  cmp.m = clamp(m, cmp.mMin, cmp.mMax);
  for (const t of cmp.tiles) seekTile(t, tileIndexAt(t, t.off + cmp.m));
  cmpUi();
}

function cmpStep(dir) {
  if (cmp) cmpSetM(cmp.m + dir * CMP_STEP_MS);
}

// ---------- Gemeinsam abspielen ----------

function startTileFeed(t) {
  t.queue.forEach(q => q.f.close());
  t.queue = [];
  t.target = -1; t.pending = -1;
  tileDecoder(t);
  t.startIdx = tileIndexAt(t, t.off + cmp.m);
  t.feed = tileKeyBefore(t, t.startIdx);
}

function cmpPlay() {
  if (!cmp || cmp.playing) return;
  if (cmp.m >= cmp.mMax - 1) cmp.m = cmp.mMin;   // am Ende beginnt die Wiedergabe von vorn
  cmp.playing = true;
  for (const t of cmp.tiles) startTileFeed(t);
  cmp.clock = { wall: performance.now(), m: cmp.m };
  requestAnimationFrame(cmpTick);
  cmpUi();
}

function cmpPause() {
  if (!cmp || !cmp.playing) return;
  cmp.playing = false;
  for (const t of cmp.tiles) {
    t.gen++;
    t.queue.forEach(q => q.f.close());
    t.queue = [];
    // Danach steht jedes Video genau auf dem Bild zur angehaltenen Zeit
    seekTile(t, tileIndexAt(t, t.off + cmp.m));
  }
  cmpUi();
}

function cmpTick(now) {
  if (!cmp || !cmp.playing) return;
  requestAnimationFrame(cmpTick);
  cmp.m = Math.min(cmp.clock.m + (now - cmp.clock.wall) * pSpeed, cmp.mMax);
  for (const t of cmp.tiles) {
    const last = t.frames.length - 1;
    const want = tileIndexAt(t, t.off + cmp.m);
    try {
      while (t.dec && t.feed <= last && t.feed <= want + 8 && t.dec.decodeQueueSize < 4 && t.queue.length < 6) {
        t.dec.decode(tileChunk(t, t.feed++));
        if (t.feed === last + 1) t.dec.flush().catch(() => {});
      }
    } catch (e) { console.warn(e); }
    let show = null;
    while (t.queue.length && t.queue[0].i <= want) {
      if (show) show.f.close();
      show = t.queue.shift();
    }
    if (show) {
      drawTile(t, show.f);
      t.pos = show.i;
      show.f.close();
    }
  }
  if (cmp.m >= cmp.mMax) {
    if (!settings.loop) { cmpPause(); return; }
    // Wiederholung: alle Videos ohne Halt zurück an den Anfang
    cmp.m = cmp.mMin;
    for (const t of cmp.tiles) startTileFeed(t);
    cmp.clock = { wall: now, m: cmp.m };
  }
  cmpUi();
}

// Start setzen: die Stelle, an der alle Videos ausgerichtet stehen, wird zum gemeinsamen Anfang.
// Davor liegt nichts mehr, die einzelnen Regler verschwinden und die Videos werden größer.
// Ein weiteres Tippen hebt den Anfang auf, die Regler kommen zurück und behalten ihre Ausrichtung.
// „Start“ steht unten in der Werkzeugleiste neben den Reglern, mit und ohne Regler unter derselben Linie.
$('dStart').addEventListener('click', () => {
  if (!cmp) return;
  if (cmp.playing) cmpPause();
  cmp.startM = cmp.startM == null ? cmp.m : null;
  cmpRange();
  $('cmpAlign').classList.toggle('hidden', cmp.startM != null);
  cmpUi();
});

// ---------- Ausrichten mit den Reglern der einzelnen Videos ----------

const alignDrag = new Set();   // Regler, die gerade gezogen werden

function buildAlign() {
  const box = $('cmpAlign');
  box.textContent = '';
  box.classList.toggle('two', cmp.tiles.length > 2);
  for (const t of cmp.tiles) {
    const row = el('div', 'caRow');
    row.append(el('b', '', `${t.no} · ${clipLabel(t.meta)}`));
    const minus = el('button', 'step sm', '‹');
    minus.setAttribute('aria-label', tr('Ein Bild zurück'));
    const range = document.createElement('input');
    range.type = 'range';
    range.min = t.first;
    range.max = t.frames.length - 1;
    range.step = 1;
    range.setAttribute('aria-label', tr('Stelle in {0}', clipLabel(t.meta)));
    const plus = el('button', 'step sm', '›');
    plus.setAttribute('aria-label', tr('Ein Bild vor'));
    row.append(minus, range, plus);
    box.append(row);
    t.range = range;
    range.addEventListener('pointerdown', () => alignDrag.add(range));
    for (const type of ['pointerup', 'pointercancel']) range.addEventListener(type, () => alignDrag.delete(range));
    range.addEventListener('change', () => alignDrag.delete(range));
    range.addEventListener('input', () => { fillRange(range); alignTile(t, +range.value); });
    const base = () => (t.pending >= 0 ? t.pending : t.target >= 0 ? t.target : t.pos);
    holdRepeat(minus, () => alignTile(t, base() - 1));
    holdRepeat(plus, () => alignTile(t, base() + 1));
  }
  box.classList.remove('hidden');
}

// Ein Video auf ein anderes Bild stellen. Die gemeinsame Zeit bleibt, der Versatz dieses Videos ändert sich.
function alignTile(t, i) {
  if (!cmp) return;
  if (cmp.playing) cmpPause();
  i = clamp(i, t.first, t.frames.length - 1);
  t.off = tMs(t, i) - cmp.m;
  cmpRange();
  seekTile(t, i);
  cmpUi();
}

// ---------- Anzeige ----------

function cmpUi() {
  if (!cmp) return;
  pSeek.min = Math.floor(cmp.mMin);
  pSeek.max = Math.ceil(cmp.mMax);
  pSeek.step = 1;
  if (!seekDragging) pSeek.value = Math.round(cmp.m);
  fillRange(pSeek);
  $('pTime').textContent = fmtSec((cmp.m - cmp.mMin) * 1000) + ' / ' + fmtSec((cmp.mMax - cmp.mMin) * 1000);
  $('pPlay').classList.toggle('playing', cmp.playing);
  $('pPlay').setAttribute('aria-label', tr(cmp.playing ? 'Anhalten' : 'Abspielen'));
  renderSpeed();
  $('pPrev').disabled = cmp.m <= cmp.mMin;
  $('pNext').disabled = cmp.m >= cmp.mMax;
  $('dStart').classList.toggle('on', cmp.startM != null);
  for (const t of cmp.tiles) {
    if (!t.range || alignDrag.has(t.range) || t.pos < 0) continue;
    t.range.value = t.pos;
    fillRange(t.range);
  }
  renderSaveBtn();
}

// Fingerabdruck für den Speicherknopf: dieselbe Stelle in allen Videos lässt sich nicht zweimal speichern
const cmpSig = () => (cmp ? [Math.round(cmp.m), ...cmp.tiles.map(t => t.pos)] : null);

// ---------- Bilder aus dem Vergleich ----------

// Neues Vergleichsbild. Der erste Speichervorgang gibt dem Vergleich seine Nummer des Tages,
// seine Bilder heißen dann vgl1.1, vgl1.2 und so fort.
function newCmpImage(W, H, shapesNow) {
  const now = new Date();
  const day = dayKey(now);
  if (!cmp.nr || cmp.day !== day) {
    const used = listImages.filter(im => isCmp(im) && im.day === day).reduce((m, im) => Math.max(m, im.nr), 0);
    const last = settings.lastCmp && settings.lastCmp.day === day ? settings.lastCmp.nr : 0;
    cmp.nr = Math.max(used, last) + 1;
    cmp.day = day;
    settings.lastCmp = { day, nr: cmp.nr };
    saveSettings();
  }
  const n = cmp.saved.length + 1;
  return {
    kind: 'cmp', clipId: null, clips: cmp.tiles.map(t => t.meta.id), day, nr: cmp.nr, n,
    created: now.getTime(), w: W, h: H, shapes: shapesNow, strobe: false,
    tiles: cmp.tiles.map(t => ({ ...t.rect })),
    name: cmp.meta.name, prop: cmp.meta.prop, star: cmp.meta.star,
  };
}
