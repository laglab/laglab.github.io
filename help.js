'use strict';

// Hilfe, erreichbar über das „i“ im Fenster Einstellungen. Kurz wie ein Spickzettel, ohne Bilder.
// Jede Zeile: links Symbol oder Name des Knopfs, rechts ein kurzer Satz. Nur Symbole, die es in der App gibt.
// Sie werden aus den echten Knöpfen geholt, damit sie gleich aussehen: <i data-ico="Selektor"></i>.
// Vorerst nur Deutsch. Der Text ist von der Übersetzung ausgenommen (data-notr am Fenster).

const HELP_HTML = `
<section id="h-start">
  <h3><span class="no">01</span>Einrichten</h3>
  <dl>
    <dt>Fernseher</dt><dd>Über einen Adapter von USB-C auf HDMI anschließen</dd>
    <dt>USB-Kamera</dt><dd>Anschließen und unter „02 Kamera“ USB wählen</dd>
    <dt>05 Bildschirm</dt><dd>Passt die App an den Fernseher an, wenn das Bild abgeschnitten ist oder einen Rand hat</dd>
  </dl>
</section>

<section id="h-live">
  <h3><span class="no">02</span>Live</h3>
  <dl>
    <dt>01 Verzögerung</dt><dd>1 bis 30 s, bis das Bild auf dem Fernseher erscheint</dd>
    <dt>02 Kamera</dt><dd>Rückseite, Vorderseite oder USB</dd>
    <dt>03 Zoom</dt><dd>Bis zu 4-fache Vergrößerung</dd>
    <dt>04 Belichtung</dt><dd>Auto oder Manuell mit Regler für die Helligkeit</dd>
    <dt>05 Fokus</dt><dd>Auto oder Manuell von nah bis fern. Nur bei Kameras mit einstellbarem Fokus</dd>
    <dt>Start</dt><dd>Startet den Betrieb. Zoom, Belichtung und Fokus gelten je Kamera</dd>
  </dl>
</section>

<section id="h-run">
  <h3><span class="no">03</span>Betrieb</h3>
  <dl>
    <dt><i data-ico="#saveBtn"></i></dt><dd>1 s halten speichert den Puffer. Danach innerhalb 5 s antippen öffnet das Video</dd>
    <dt><i data-ico="#slowBtn"></i></dt><dd>1 s halten startet oder beendet die Zeitlupe. Das Tempo steht unter „06 Zeitlupe“</dd>
    <dt>Bild</dt><dd>1 s auf eine freie Stelle drücken beendet die Wiedergabe</dd>
  </dl>
</section>

<section id="h-list">
  <h3><span class="no">04</span>Analyse</h3>
  <dl>
    <dt>Videos | Bilder</dt><dd>Wechselt zwischen gespeicherten Videos und Bildern</dd>
    <dt>Tage</dt><dd>Ansicht nach Tagen, Wochen oder Monaten</dd>
    <dt>Kachel</dt><dd>Tippen führt eine Stufe tiefer, unter Tage öffnet es Video oder Bild</dd>
    <dt><span class="hStar on">★</span></dt><dd>Nur Einträge mit Stern anzeigen</dd>
    <dt>Name, Stichwort</dt><dd>Nur Einträge mit diesem Namen oder Stichwort anzeigen</dd>
    <dt>vs</dt><dd>Nur Bilder aus Vergleichen anzeigen</dd>
    <dt><i data-ico="#fReset"></i></dt><dd>Setzt alle Filter zurück</dd>
  </dl>
</section>

<section id="h-player">
  <h3><span class="no">05</span>Player</h3>
  <dl>
    <dt>‹ Übersicht</dt><dd>Zurück zur Übersicht</dd>
    <dt>Video | Bilder</dt><dd>Wechselt zu den Bildern dieses Videos</dd>
    <dt><span class="hStar">☆</span> Name Stichwort</dt><dd>Stern, Name und Stichwort des Eintrags. Frühere Einträge werden vorgeschlagen</dd>
    <dt><i data-ico="#pDown"></i></dt><dd>Speichert die Datei im Download-Ordner</dd>
    <dt>Löschen</dt><dd>Zweimal tippen</dd>
    <dt>‹ ›</dt><dd>Nächster Eintrag der Übersicht. Bilder eines Videos laufen im Kreis</dd>
    <dt><i data-ico="#pPrev"></i><i data-ico="#pNext"></i></dt><dd>Ein Bild zurück oder vor, gehalten fortlaufend</dd>
    <dt><i data-ico="#pPlay .i-play"></i></dt><dd>Abspielen und anhalten</dd>
    <dt>1×</dt><dd>Geschwindigkeit 1×, ½, ¼ oder ⅛</dd>
  </dl>
</section>

<section id="h-tools">
  <h3><span class="no">06</span>Werkzeuge</h3>
  <dl>
    <dt><i data-ico="#dZoom"></i></dt><dd>Zeigt wieder das ganze Bild. Zoomen und Verschieben mit zwei Fingern</dd>
    <dt><i data-ico="[data-tool=free]"></i></dt><dd>Freies Zeichnen</dd>
    <dt><i data-ico="[data-tool=line]"></i></dt><dd>Gerade vom Aufsetzen bis zum Loslassen</dd>
    <dt><i data-ico="[data-tool=arc]"></i></dt><dd>Erst eine Linie ziehen, dann an den zwei Griffen wölben</dd>
    <dt><i data-ico="[data-tool=angle]"></i></dt><dd>Drei Punkte tippen, der mittlere ist der Scheitel</dd>
    <dt><i data-ico="[data-tool=circle]"></i></dt><dd>Mitte setzen und nach außen ziehen</dd>
    <dt><i data-ico="[data-tool=plumb]"></i><i data-ico="[data-tool=level]"></i></dt><dd>Senkrechte und waagerechte Linie über das ganze Bild</dd>
    <dt><i data-ico="#dGrid"></i></dt><dd>Hilfslinien ein und aus</dd>
    <dt><i data-ico="#dColor"></i></dt><dd>Gelb, Rot, Grün, Türkis, Weiß</dd>
    <dt><i data-ico="#dCut"></i></dt><dd>Zu behaltenden Teil anwählen und schneiden. Lässt sich nicht rückgängig machen</dd>
    <dt><i data-ico="#dUndo"></i><i data-ico="#dClear"></i></dt><dd>Letzte Form entfernen oder alle</dd>
    <dt><i data-ico="#dSave"></i></dt><dd>Bild mit Zeichnung speichern</dd>
  </dl>
</section>

<section id="h-cmp">
  <h3><span class="no">07</span>Vergleich</h3>
  <dl>
    <dt>Vergleichen</dt><dd>2 bis 4 Videos antippen, dann Öffnen</dd>
    <dt>Regler</dt><dd>Jedes Video auf den gleichen Moment stellen</dd>
    <dt><i data-ico="#dStart"></i></dt><dd>Setzt den gemeinsamen Anfang und blendet die Regler aus</dd>
    <dt><i data-ico="#dSave"></i></dt><dd>Speichert ein Vergleichsbild, etwa vs1.1</dd>
  </dl>
</section>

<section id="h-star">
  <h3><span class="no">08</span>Sterne</h3>
  <dl>
    <dt><span class="hStar on">★</span> Video</dt><dd>Wird nicht automatisch gelöscht</dd>
    <dt><span class="hStar">☆</span> Video</dt><dd>Wird nach der Frist unter „07 Videos“ gelöscht, mit seinen Bildern</dd>
    <dt><span class="hStar on">★</span> Bild</dt><dd>Setzt auch den Stern am Video</dd>
    <dt><span class="hStar on">★</span> unter Bilder</dt><dd>Zeigt nur Bilder mit eigenem Stern</dd>
  </dl>
</section>

<section id="h-set">
  <h3><span class="no">09</span>Einstellungen</h3>
  <dl>
    <dt>01 Farbe</dt><dd>Akzentfarbe. Der bunte Kreis wählt eine eigene Farbe</dd>
    <dt>02 Sprache</dt><dd>Jedes Tippen wechselt die Sprache</dd>
    <dt>03 Modus</dt><dd>Dunkel, Mittel oder Hell</dd>
    <dt>04 Größe</dt><dd>Größe von Buttons und Schrift</dd>
    <dt>05 Bildschirm</dt><dd>Breite, Höhe und Lage auf dem Fernseher</dd>
    <dt>06 Zeitlupe</dt><dd>Tempo der Zeitlupe im Betrieb, ½, ¼ oder ⅛</dd>
    <dt>07 Videos</dt><dd>Frist für Videos ohne Stern, 1 bis 30 Tage oder nie</dd>
  </dl>
</section>
`;

const helpEl = $('help');

function fillHelp() {
  const body = $('helpBody');
  if (body.childElementCount) return;
  body.innerHTML = HELP_HTML;
  // Symbole aus den echten Knöpfen
  for (const i of body.querySelectorAll('i[data-ico]')) {
    const src = document.querySelector(i.dataset.ico);
    const svg = src && (src.tagName === 'svg' ? src : src.querySelector('svg, .dot'));
    if (svg) i.append(svg.cloneNode(true));
    else i.remove();
  }
  // Inhaltsverzeichnis aus den Überschriften
  const nav = $('helpNav');
  for (const s of body.querySelectorAll('section')) {
    const b = document.createElement('button');
    b.dataset.to = s.id;
    b.innerHTML = s.querySelector('h3').innerHTML;
    nav.append(b);
  }
  nav.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    helpTarget = b.dataset.to;   // bleibt markiert, auch wenn das Kapitel nicht ganz nach oben kommt
    markHelpNav();
    $(b.dataset.to).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // Das gerade gelesene Kapitel ist im Verzeichnis hervorgehoben
  body.addEventListener('scroll', markHelpNav, { passive: true });
}

// Markiert ist das Kapitel, dessen Überschrift eine Marke oben im Text erreicht hat. Auf der letzten Bildschirmhöhe
// wandert die Marke bis nach unten, damit auch kurze Kapitel am Schluss an die Reihe kommen. Nach einem Tippen im
// Verzeichnis bleibt das angetippte Kapitel markiert, bis das Scrollen zur Ruhe kommt und man selbst weiterscrollt.
let helpTarget = null, helpHold = null, helpSettle = 0;
function markHelpNav() {
  const body = $('helpBody');
  const secs = [...body.querySelectorAll('section')];
  const top = body.getBoundingClientRect().top;
  const max = body.scrollHeight - body.clientHeight;
  const y = body.scrollTop;
  let cur = secs[0].id;
  if (helpTarget) {
    cur = helpTarget;
    // Erst wenn 150 ms kein Scrollen mehr kam, gilt die Stelle als erreicht
    clearTimeout(helpSettle);
    helpSettle = setTimeout(() => { helpHold = { id: helpTarget, y: body.scrollTop }; helpTarget = null; }, 150);
  } else if (helpHold && Math.abs(y - helpHold.y) < 3) cur = helpHold.id;
  else {
    helpHold = null;
    const tail = Math.min(1, Math.max(0, (y - (max - body.clientHeight)) / body.clientHeight));
    const line = top + 40 + tail * (body.clientHeight - 80);
    for (const s of secs) if (s.getBoundingClientRect().top <= line) cur = s.id;
  }
  for (const b of $('helpNav').children) b.classList.toggle('on', b.dataset.to === cur);
}

const helpOpen = () => !helpEl.classList.contains('hidden');

function openHelp() {
  fillHelp();
  helpEl.classList.remove('hidden');
  $('helpBody').scrollTop = 0;
  helpTarget = null;
  helpHold = null;
  markHelpNav();
  history.pushState({ v: 'help' }, '');
}

// Geschlossen wird über × oder die Zurück-Geste, danach sind die Einstellungen wieder da
function closeHelp() {
  helpEl.classList.add('hidden');
}

$('uiHelp').addEventListener('click', openHelp);
$('helpClose').addEventListener('click', () => history.back());
