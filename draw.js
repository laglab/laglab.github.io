'use strict';

// Zeichnen, Winkel messen und Zoom im Standbild der Analyse. Nutzt pc, pCanvas und Hilfen aus analysis.js.
// Zeichnungen liegen in Bildpunkten des Videos und bleiben so auch beim Zoomen an ihrer Stelle.

const COLORS = ['#ffd21f', '#ff4d4d', '#3ee05a', '#37d3c4', '#ffffff'];   // Gelb, Rot, Grün, Türkis, Weiß
const HANDLE_PX = 30;       // so nah muss ein Finger an einem Punkt sein, um ihn zu verschieben
const LINE_PX = 4;          // Strichstärke auf dem Bildschirm, unabhängig vom Zoom
const MAX_ZOOM = 8;
const DOUBLE_TAP_MS = 300;

const dStage = $('pStage'), dView = $('pView'), dCanvas = $('pDraw');
const dctx = dCanvas.getContext('2d');
let tool = 'view';          // view (kein Werkzeug), free, line, arc, angle, circle, plumb oder level
let colorIdx = 0;
let shapes = [];            // { type: 'free' | 'line' | 'arc' | 'angle' | 'circle' | 'plumb' | 'level', pts: [[x, y], ...], color }
let pending = null;         // Form, die gerade entsteht
let placing = false;        // der letzte Punkt von pending folgt noch dem Finger
let drag = null;            // verschobener Punkt { shape, idx }
let vz = { z: 1, x: 0, y: 0 };            // Zoom und Verschiebung
let vbox = { x: 0, y: 0, w: 1, h: 1 };    // Lage des Videos in der Bühne ohne Zoom
let drawTiles = null;       // Felder eines Vergleichs { x, y, w, h }, sonst null
const pointers = new Map();
let pinch = null, pan = null, gestureDone = false, lastTap = 0;

// ---------- Lage und Zoom ----------

function layoutView() {
  const st = dStage.getBoundingClientRect();
  const W = pCanvas.width || 1920, H = pCanvas.height || 1080;
  const s = Math.min(st.width / W, st.height / H) || 1;
  vbox = { w: W * s, h: H * s, x: (st.width - W * s) / 2, y: (st.height - H * s) / 2 };
  Object.assign(dView.style, { left: vbox.x + 'px', top: vbox.y + 'px', width: vbox.w + 'px', height: vbox.h + 'px' });
  if (dCanvas.width !== W || dCanvas.height !== H) { dCanvas.width = W; dCanvas.height = H; }
  applyViewZoom();
}

function applyViewZoom() {
  vz.z = clamp(vz.z, 1, MAX_ZOOM);
  vz.x = clamp(vz.x, vbox.w * (1 - vz.z), 0);
  vz.y = clamp(vz.y, vbox.h * (1 - vz.z), 0);
  dView.style.transform = `translate(${vz.x}px, ${vz.y}px) scale(${vz.z})`;
  $('dZoom').disabled = vz.z <= 1.001;
  renderDrawing();
}

function resetViewZoom() {
  vz = { z: 1, x: 0, y: 0 };
  applyViewZoom();
}

// Punkt in der Bühne relativ zum ungezoomten Video
function stagePoint(e) {
  const r = dStage.getBoundingClientRect();
  return [e.clientX - r.left - vbox.x, e.clientY - r.top - vbox.y];
}

// Punkt in Bildpunkten des Videos
function videoPoint(e) {
  const [x, y] = stagePoint(e);
  return [(x - vz.x) / vz.z * dCanvas.width / vbox.w, (y - vz.y) / vz.z * dCanvas.height / vbox.h];
}

// Bildpunkte des Videos je Bildschirmpunkt
const pxScale = () => dCanvas.width / vbox.w / vz.z;

// ---------- Zeichnen ----------

function drawShape(s, k, handles) {
  const pts = s.pts;
  if (!pts.length) return;
  dctx.lineCap = 'round';
  dctx.lineJoin = 'round';
  const stroke = path => {
    // dunkler Rand, damit die Linie auf hellem und dunklem Grund sichtbar bleibt
    dctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    dctx.lineWidth = (LINE_PX + 3) * k;
    dctx.stroke(path);
    dctx.strokeStyle = s.color;
    dctx.lineWidth = LINE_PX * k;
    dctx.stroke(path);
  };
  if (s.type === 'plumb') {
    // Lot, eine senkrechte Linie über die ganze Bildhöhe
    // Im Vergleich nur über die Höhe des Feldes, in dem es gesetzt wurde
    const [px, py] = pts[0];
    const tile = drawTiles && drawTiles.find(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
    const lot = new Path2D();
    lot.moveTo(px, tile ? tile.y : 0);
    lot.lineTo(px, tile ? tile.y + tile.h : dCanvas.height);
    dctx.setLineDash([16 * k, 10 * k]);
    stroke(lot);
    dctx.setLineDash([]);
  } else if (s.type === 'level') {
    // Waage, eine waagerechte Linie über die ganze Bildbreite, im Vergleich nur über die Breite des Feldes
    const [px, py] = pts[0];
    const tile = drawTiles && drawTiles.find(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
    const lev = new Path2D();
    lev.moveTo(tile ? tile.x : 0, py);
    lev.lineTo(tile ? tile.x + tile.w : dCanvas.width, py);
    dctx.setLineDash([16 * k, 10 * k]);
    stroke(lev);
    dctx.setLineDash([]);
  } else if (s.type === 'circle') {
    // Kreis um den ersten Punkt, der zweite liegt auf dem Rand und bestimmt die Größe
    const [c, e] = pts;
    const ring = new Path2D();
    ring.arc(c[0], c[1], Math.hypot(e[0] - c[0], e[1] - c[1]), 0, 2 * Math.PI);
    stroke(ring);
  } else if (s.type === 'arc' && pts.length === 4) {
    // Bogen mit zwei Griffen: glatte Kurve dritten Grades durch Anfang, beide Griffe und Ende.
    // Mit dem ersten Griff formt man den Steigflug, mit dem zweiten den Abflug. Wo die Kurve einen Griff trifft,
    // richtet sich nach den Abständen der Punkte. Begrenzt, damit die Kurve bei eng liegenden Punkten ruhig bleibt.
    const [a, b, p1, p2] = pts;
    const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const d1 = dist(a, p1), d2 = dist(p1, p2), L = d1 + d2 + dist(p2, b);
    const t1 = clamp(L ? d1 / L : 1 / 3, 0.1, 0.8);
    const t2 = clamp(L ? (d1 + d2) / L : 2 / 3, t1 + 0.1, 0.9);
    const w1 = t => 3 * (1 - t) * (1 - t) * t, w2 = t => 3 * (1 - t) * t * t;
    const rest = (p, t) => [0, 1].map(i => p[i] - (1 - t) ** 3 * a[i] - t ** 3 * b[i]);
    const r1 = rest(p1, t1), r2 = rest(p2, t2);
    const det = w1(t1) * w2(t2) - w2(t1) * w1(t2);
    const c1 = [0, 1].map(i => (r1[i] * w2(t2) - w2(t1) * r2[i]) / det);
    const c2 = [0, 1].map(i => (w1(t1) * r2[i] - r1[i] * w1(t2)) / det);
    const curve = new Path2D();
    curve.moveTo(a[0], a[1]);
    curve.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], b[0], b[1]);
    stroke(curve);
  } else if (s.type === 'arc' && pts.length === 3) {
    // Bogen aus Stand 86 bis 91 mit einem Griff, so in gespeicherten Bildern: Kreisbogen durch beide Enden und den mittleren Griff. Liegt der Griff auf der Geraden, bleibt es eine Linie.
    const [a, b, m] = pts;
    const d = 2 * (a[0] * (b[1] - m[1]) + b[0] * (m[1] - a[1]) + m[0] * (a[1] - b[1]));
    const bow = new Path2D();
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // Liegt der Griff weniger als einen Bildschirmpunkt neben der Geraden, wird es eine gerade Linie.
    // Sie reicht vom ersten bis zum letzten der drei Punkte, damit sie auch durch einen Griff außerhalb läuft.
    if (!len || Math.abs(d) / (2 * len) < k) {
      const u = len ? [(b[0] - a[0]) / len, (b[1] - a[1]) / len] : [1, 0];
      const along = p => (p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1];
      const ends = [a, b, m].sort((p, q) => along(p) - along(q));
      bow.moveTo(ends[0][0], ends[0][1]);
      bow.lineTo(ends[2][0], ends[2][1]);
    } else {
      const sq = p => p[0] * p[0] + p[1] * p[1];
      const cx = (sq(a) * (b[1] - m[1]) + sq(b) * (m[1] - a[1]) + sq(m) * (a[1] - b[1])) / d;
      const cy = (sq(a) * (m[0] - b[0]) + sq(b) * (a[0] - m[0]) + sq(m) * (b[0] - a[0])) / d;
      const r = Math.hypot(a[0] - cx, a[1] - cy);
      const ang = p => Math.atan2(p[1] - cy, p[0] - cx);
      const norm = x => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const a1 = ang(a), a2 = ang(b);
      // Richtung so wählen, dass der Bogen durch den mittleren Griff läuft
      const ccw = !(norm(ang(m) - a1) < norm(a2 - a1));
      bow.arc(cx, cy, r, a1, a2, ccw);
    }
    stroke(bow);
  } else {
    const line = new Path2D();
    line.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) line.lineTo(pts[i][0], pts[i][1]);
    if (s.type === 'free' && pts.length === 1) line.lineTo(pts[0][0] + 0.1, pts[0][1]);
    stroke(line);
  }
  if (s.type === 'free') return;

  if (s.type === 'angle' && pts.length === 3) {
    const [a, b, c] = pts;
    const a1 = Math.atan2(a[1] - b[1], a[0] - b[0]);
    let diff = Math.atan2(c[1] - b[1], c[0] - b[0]) - a1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff <= -Math.PI) diff += 2 * Math.PI;
    const arc = new Path2D();
    arc.arc(b[0], b[1], 42 * k, a1, a1 + diff, diff < 0);
    stroke(arc);
    const deg = Math.round(Math.abs(diff) * 180 / Math.PI) + '°';
    const mid = a1 + diff / 2;
    const tx = b[0] - Math.cos(mid) * 34 * k, ty = b[1] - Math.sin(mid) * 34 * k;
    dctx.font = `700 ${24 * k}px system-ui, Roboto, sans-serif`;
    dctx.textAlign = 'center';
    dctx.textBaseline = 'middle';
    const w = dctx.measureText(deg).width + 14 * k;
    dctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    dctx.fillRect(tx - w / 2, ty - 17 * k, w, 34 * k);
    dctx.fillStyle = s.color;
    dctx.fillText(deg, tx, ty + 1 * k);
  }
  // Griffe zum Verschieben der Punkte
  if (!handles) return;
  for (const p of pts) {
    dctx.beginPath();
    dctx.arc(p[0], p[1], 7 * k, 0, 2 * Math.PI);
    dctx.fillStyle = s.color;
    dctx.fill();
    dctx.lineWidth = 2 * k;
    dctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    dctx.stroke();
  }
}

// Raster zur Orientierung: dezente Linien in quadratischen Feldern, eine Linie läuft genau durch die Mitte.
// Zwölf Felder über die Breite, im Vergleich in jedem Feld für sich. Es landet nicht im gespeicherten Bild.
const GRID_COLS = 12;
let gridOn = !!settings.grid;

function drawGrid(k) {
  const areas = drawTiles || [{ x: 0, y: 0, w: dCanvas.width, h: dCanvas.height }];
  const grid = new Path2D();
  for (const r of areas) {
    const step = r.w / GRID_COLS, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    for (let i = 1 - GRID_COLS / 2; i < GRID_COLS / 2; i++) {
      grid.moveTo(cx + i * step, r.y);
      grid.lineTo(cx + i * step, r.y + r.h);
    }
    const rows = Math.floor((r.h / 2 - 0.5) / step);
    for (let j = -rows; j <= rows; j++) {
      grid.moveTo(r.x, cy + j * step);
      grid.lineTo(r.x + r.w, cy + j * step);
    }
  }
  dctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
  dctx.lineWidth = 3 * k;
  dctx.stroke(grid);
  dctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  dctx.lineWidth = 1 * k;
  dctx.stroke(grid);
}

function renderGridBtn() {
  $('dGrid').classList.toggle('on', gridOn);
}

function renderDrawing(handles = true) {
  dctx.clearRect(0, 0, dCanvas.width, dCanvas.height);
  const k = pxScale();
  if (gridOn && handles) drawGrid(k);   // ohne Griffe heißt Speichern, dort bleibt das Raster weg
  for (const s of shapes) drawShape(s, k, handles);
  if (pending) drawShape(pending, k, handles);
  $('dUndo').disabled = !shapes.length && !pending;
  $('dClear').disabled = !shapes.length && !pending;
  renderSaveBtn();
}

// Zeichnung als Kopie lesen und setzen, für gespeicherte Bilder
function getShapes() { return JSON.parse(JSON.stringify(shapes)); }
function setShapes(list) {
  shapes = JSON.parse(JSON.stringify(list || []));
  pending = null;
  placing = false;
  drag = null;
  renderDrawing();
}
const hasDrawing = () => shapes.length > 0;

function findHandle(p) {
  const r = HANDLE_PX * pxScale();
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    if (s.type === 'free') continue;
    for (let j = 0; j < s.pts.length; j++) {
      if (Math.hypot(s.pts[j][0] - p[0], s.pts[j][1] - p[1]) <= r) return { shape: s, idx: j };
    }
  }
  return null;
}

function commit() {
  shapes.push(pending);
  pending = null;
  placing = false;
}

// Bricht nur das ab, was der Finger gerade zeichnet. Fertige Punkte eines Winkels bleiben.
function cancelStroke() {
  drag = null;
  if (!pending) return;
  if (pending.type === 'angle') {
    if (placing) pending.pts.pop();
    placing = false;
    if (!pending.pts.length) pending = null;
  } else {
    pending = null;
  }
  renderDrawing();
}

function drawDown(e) {
  const p = videoPoint(e);
  const h = findHandle(p);
  if (h && !(pending && pending.type === 'angle')) { drag = h; return; }
  const color = COLORS[colorIdx];
  if (tool === 'free') pending = { type: 'free', pts: [p], color };
  else if (tool === 'line') pending = { type: 'line', pts: [p, p.slice()], color };
  else if (tool === 'arc') pending = { type: 'arc', pts: [p, p.slice()], color };   // erst eine Linie, die zwei Griffe kommen beim Loslassen
  else if (tool === 'circle') pending = { type: 'circle', pts: [p, p.slice()], color };   // der Finger setzt die Mitte, Ziehen bestimmt die Größe
  else if (tool === 'plumb' || tool === 'level') { pending = { type: tool, pts: [p], color }; placing = true; }
  else if (tool === 'angle') {
    if (!pending) pending = { type: 'angle', pts: [], color };
    pending.pts.push(p);
    placing = true;
  }
  renderDrawing();
}

function drawMove(e) {
  const p = videoPoint(e);
  if (drag) {
    const s = drag.shape;
    // Der Griff in der Mitte verschiebt den ganzen Kreis, der Griff am Rand ändert die Größe
    if (s.type === 'circle' && drag.idx === 0) {
      const [c, e] = s.pts;
      s.pts = [p, [e[0] + p[0] - c[0], e[1] + p[1] - c[1]]];
    } else s.pts[drag.idx] = p;
    renderDrawing();
    return;
  }
  if (!pending) return;
  if (pending.type === 'free') {
    const last = pending.pts[pending.pts.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 2 * pxScale()) return;
    pending.pts.push(p);
  } else if (pending.type === 'line' || pending.type === 'arc' || pending.type === 'circle') {
    pending.pts[1] = p;
  } else if (pending.type === 'plumb' || pending.type === 'level') {
    pending.pts[0] = p;
  } else if (placing) {
    pending.pts[pending.pts.length - 1] = p;
  }
  renderDrawing();
}

function drawUp() {
  if (drag) { drag = null; return; }
  if (!pending) return;
  if (pending.type === 'free' || pending.type === 'plumb' || pending.type === 'level') commit();
  else if (pending.type === 'line' || pending.type === 'arc' || pending.type === 'circle') {
    const [a, b] = pending.pts;
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 10 * pxScale()) {
      // Beim Bogen kommen zwei Griffe auf die Linie, bei einem und bei zwei Dritteln. Zieht man sie, wölbt sich die Linie.
      if (pending.type === 'arc') {
        for (const f of [1 / 3, 2 / 3]) pending.pts.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      }
      commit();
    } else pending = null;
  } else {
    placing = false;
    if (pending.pts.length === 3) commit();
  }
  renderDrawing();
}

// ---------- Finger ----------

function startPinch() {
  const [a, b] = [...pointers.values()];
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  pinch = {
    d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1,
    z: vz.z,
    c: [(m[0] - vz.x) / vz.z, (m[1] - vz.y) / vz.z],   // Stelle im Bild unter der Fingermitte
  };
}

function movePinch() {
  const [a, b] = [...pointers.values()];
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  vz.z = clamp(pinch.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d, 1, MAX_ZOOM);
  vz.x = m[0] - pinch.c[0] * vz.z;
  vz.y = m[1] - pinch.c[1] * vz.z;
  applyViewZoom();
}

dStage.addEventListener('pointerdown', e => {
  // Die Pfeile oben links liegen auf der Bildfläche. Ohne diese Ausnahme finge die Bildfläche
  // die Berührung ab, und der Pfeil bekäme nie einen Klick.
  if (!viewMode || e.target.closest('.clipNav')) return;
  try { dStage.setPointerCapture(e.pointerId); } catch (x) {}
  pointers.set(e.pointerId, stagePoint(e));
  if (pointers.size === 2) {
    // Zwei Finger zoomen und verschieben, in jedem Werkzeug
    cancelStroke();
    pan = null;
    gestureDone = true;
    startPinch();
    return;
  }
  if (pointers.size > 2 || gestureDone) return;
  if (tool === 'view') {
    const now = performance.now();
    if (now - lastTap < DOUBLE_TAP_MS) { lastTap = 0; resetViewZoom(); return; }
    lastTap = now;
    pan = { p: stagePoint(e), x: vz.x, y: vz.y };
    return;
  }
  drawDown(e);
});

dStage.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, stagePoint(e));
  if (pinch) { if (pointers.size >= 2) movePinch(); return; }
  if (gestureDone) return;
  if (pan) {
    const p = stagePoint(e);
    vz.x = pan.x + p[0] - pan.p[0];
    vz.y = pan.y + p[1] - pan.p[1];
    applyViewZoom();
    return;
  }
  drawMove(e);
});

function pointerEnd(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.delete(e.pointerId);
  if (pinch) { if (pointers.size < 2) pinch = null; }
  else if (pan) pan = null;
  else if (!gestureDone) drawUp();
  // Nach einer Zwei-Finger-Geste zeichnet erst ein neuer Finger wieder
  if (!pointers.size) gestureDone = false;
}
dStage.addEventListener('pointerup', pointerEnd);
dStage.addEventListener('pointercancel', e => { if (!pinch && !pan) cancelStroke(); pointerEnd(e); });

// ---------- Werkzeuge ----------

function setTool(t) {
  if (pending && pending.type === 'angle' && t !== 'angle') { pending = null; placing = false; }
  tool = t;
  for (const b of $('pTools').querySelectorAll('[data-tool]')) b.classList.toggle('on', b.dataset.tool === t);
  renderDrawing();
}

function renderColor() {
  $('dColor').style.setProperty('--c', COLORS[colorIdx]);
}

$('pTools').addEventListener('click', e => {
  const b = e.target.closest('[data-tool]');
  if (b) setTool(b.dataset.tool);
});
$('dColor').addEventListener('click', () => {
  colorIdx = (colorIdx + 1) % COLORS.length;
  renderColor();
});
$('dUndo').addEventListener('click', () => {
  if (pending) { pending = null; placing = false; }
  else shapes.pop();
  renderDrawing();
});
$('dClear').addEventListener('click', () => {
  shapes = [];
  pending = null;
  placing = false;
  renderDrawing();
});
$('dZoom').addEventListener('click', resetViewZoom);
// Raster ein und aus. Es bleibt eingeschaltet, auch für das nächste Video und nach einem Neustart.
$('dGrid').addEventListener('click', () => {
  gridOn = !gridOn;
  settings.grid = gridOn;
  saveSettings();
  renderGridBtn();
  renderDrawing();
});
renderGridBtn();

// Zeichnungen verschwinden, sobald ein anderes Bild erscheint
function onPlayerFrameShown() {
  if (!shapes.length && !pending) return;
  shapes = [];
  pending = null;
  placing = false;
  drag = null;
  renderDrawing();
}

function resetDrawing() {
  shapes = [];
  pending = null;
  placing = false;
  drag = null;
  pointers.clear();
  pinch = null; pan = null; gestureDone = false;
  vz = { z: 1, x: 0, y: 0 };
  setTool('view');
  layoutView();
}

// Auch das Einblenden der Regler für Schneiden und Bildfolge ändert die Größe der Bühne
new ResizeObserver(() => { if (viewMode) layoutView(); }).observe(dStage);
renderColor();
