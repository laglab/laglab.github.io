// Bildschirmfotos für die Hilfe. Startet Chrome ohne Fenster, spielt eine künstliche Kamera ein und nimmt die Ansichten auf.
// Aufruf bei laufender Vorschau der Test-App auf Port 8766: node hilfe_fotos.mjs ../LagLab-Test/hilfe
// Braucht Node ab Version 22 und Chrome. Die Fotos kommen als JPEG in den angegebenen Ordner.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2];
const URL0 = 'http://localhost:8766/';
const PROFILE = join(process.env.TEMP, 'laglab-shots-profile');
rmSync(PROFILE, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${PROFILE}`,
  '--window-size=1280,800', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
  '--use-fake-ui-for-media-stream', 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, seq = 0;
const pending = new Map();
function send(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 800));
  return r.result.value;
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
  writeFileSync(join(OUT, name + '.jpg'), Buffer.from(r.data, 'base64'));
  console.log('Foto', name);
}

// Künstliche Kamera: Turm links, Wasser unten, ein Springer im roten Anzug fliegt alle 3 Sekunden ins Becken
const FAKE = `
(() => {
  const W = 1920, H = 1080, P = 3000;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const pos = t => {   // t von 0 bis 1
    if (t < 0.2) return { x: 455, y: 262, a: 0 };
    if (t < 0.8) { const u = (t - 0.2) / 0.6; return { x: 455 + u * 520, y: 262 - 260 * u + 860 * u * u, a: u * Math.PI * 2.5 }; }
    return null;
  };
  function figure(x, y, a) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.lineCap = 'round'; g.lineWidth = 16; g.strokeStyle = '#e8c4a0';
    g.beginPath(); g.moveTo(0, -40); g.lineTo(-38, -95); g.moveTo(0, -40); g.lineTo(38, -95); g.stroke();   // Arme
    g.beginPath(); g.moveTo(-10, 40); g.lineTo(-14, 115); g.moveTo(10, 40); g.lineTo(14, 115); g.stroke(); // Beine
    g.fillStyle = '#e53935'; g.fillRect(-20, -50, 40, 95);                                                    // Anzug
    g.fillStyle = '#e8c4a0'; g.beginPath(); g.arc(0, -78, 20, 0, 7); g.fill();                               // Kopf
    g.restore();
  }
  function draw() {
    const t = (Date.now() % P) / P;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9fc8e6'); sky.addColorStop(1, '#dceaf2');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = '#d7d2c8'; g.fillRect(0, 900, W, 180);                 // Beckenrand hinten
    g.fillStyle = '#2f8fc4'; g.fillRect(0, 930, W, 150);                 // Wasser
    g.fillStyle = '#8b8f94'; g.fillRect(180, 380, 120, 560);             // Turm
    g.fillStyle = '#b3b7bb'; g.fillRect(180, 362, 330, 22);              // Plattform
    const p = pos(t);
    if (p) figure(p.x, p.y, p.a);
    else { g.fillStyle = 'rgba(255,255,255,0.85)'; const s = (t - 0.8) / 0.2; g.beginPath(); g.ellipse(975, 935, 60 + 80 * s, 18 + 10 * s, 0, 0, 7); g.fill(); }
    requestAnimationFrame(draw);
  }
  draw();
  const stream = cv.captureStream(30);
  navigator.mediaDevices.getUserMedia = async () => new MediaStream([stream.getVideoTracks()[0].clone()]);
  navigator.mediaDevices.enumerateDevices = async () => [{ kind: 'videoinput', deviceId: 'cam', label: 'Kamera', groupId: 'g' }];
  try { if (!localStorage.getItem('lagcam.test.settings')) localStorage.setItem('lagcam.test.settings', JSON.stringify({ delay: 5 })); } catch (e) {}
})();
`;

// Sucht im Bild den roten Anzug und gibt seine Lage zurück, um ein Bild mitten im Flug zu finden
const FIND = `
window.__red = (src, rect) => {
  const c = document.createElement('canvas'); c.width = 192; c.height = 108;
  const x = c.getContext('2d', { willReadFrequently: true });
  const r = rect || { x: 0, y: 0, w: src.width, h: src.height };
  x.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, 192, 108);
  const d = x.getImageData(0, 0, 192, 108).data;
  let n = 0, sx = 0, sy = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] > 180 && d[i + 1] < 90 && d[i + 2] < 90) { n++; sx += (i / 4) % 192; sy += Math.floor(i / 4 / 192); }
  return n > 3 ? { x: sx / n / 192, y: sy / n / 108 } : null;
};
window.__w = ms => new Promise(r => setTimeout(r, ms));
`;

(async () => {
  let info;
  for (let i = 0; i < 50; i++) {
    try { info = await (await fetch('http://127.0.0.1:9333/json/list')).json(); if (info.length) break; } catch (e) {}
    await sleep(200);
  }
  const page = info.find(p => p.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', m => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); }
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: FAKE + FIND });
  await send('Page.navigate', { url: URL0 });
  await sleep(6000);

  // 1 Live
  await shot('live');

  // 2 Betrieb, warten bis der Springer im Flug ist
  await ev(`document.getElementById('start').click(); await __w(7500);
    for (let i = 0; i < 80; i++) { const p = __red(canvas); if (p && p.y > 0.35 && p.y < 0.55) break; await __w(40); }`);
  await shot('betrieb');

  // Drei Videos speichern, mit Namen und Sternen
  await ev(`for (let k = 0; k < 3; k++) { await saveNow(); await __w(3500); }`);
  await ev(`enterSettings(); history.back(); await __w(800);
    [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Analyse').click(); await __w(1500);
    const cs = [...listClips].sort((a, b) => a.nr - b.nr);
    const meta = [['Teo', 'Salto vorwärts', true], ['Mia', 'Kopfsprung', true], ['Teo', 'Salto vorwärts', false]];
    cs.forEach((c, i) => { [c.name, c.prop, c.star] = meta[i] || meta[0]; });
    for (const c of cs) await saveMeta(c);
    await showList(); await __w(1500);`);

  // 3 Player mit Zeichnung auf einem Bild mitten im Flug
  await ev(`await openClip(listClips.find(c => c.nr === 1)); await __w(1500);
    let best = null;
    for (let i = pFirst; i < pCount(); i += 3) { await seek(i); await __w(120); const p = __red(pCanvas); if (p && p.y > 0.4 && p.y < 0.6) { best = i; break; } }
    if (best !== null) { await seek(best); await __w(400); }
    const W = pCanvas.width / 1920, H = pCanvas.height / 1080;
    const P = (x, y) => [x * W, y * H];
    const par = u => P(455 + u * 520, 262 - 260 * u + 860 * u * u);
    setShapes([
      { type: 'level', pts: [P(960, 362)], color: '#ffffff' },
      { type: 'arc', pts: [par(0), par(1), par(1 / 3), par(2 / 3)], color: '#ffd21f' },
      { type: 'circle', pts: [P(975, 930), P(1055, 930)], color: '#3ee05a' },
    ]);
    await __w(500);`);
  await shot('player');

  // 4 Übersicht, gespeicherte Bilder dazu
  await ev(`document.getElementById('dSave').click(); await __w(1500); history.back(); await __w(1500);`);
  await shot('analyse');

  // 5 Vergleich, beide Videos auf einen Moment im Flug ausgerichtet
  await ev(`await openCompare(listClips.filter(c => c.nr <= 2).map(c => c.id)); await __w(2500);
    for (const t of cmp.tiles) {
      for (let i = t.first; i < t.frames.length; i += 3) { alignTile(t, i); await __w(160); const p = __red(pCanvas, t.rect); if (p && p.y > 0.3 && p.y < 0.5) break; }
    }
    await __w(600);`);
  await shot('vergleich');

  // 6 Einstellungen
  await ev(`closeCompare(); await showList(); await __w(1500); [...document.querySelectorAll('[data-ui]')].find(e => e.offsetParent).click(); await __w(800);`);
  await shot('einstellungen');

  ws.close();
  chrome.kill();
  process.exit(0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
