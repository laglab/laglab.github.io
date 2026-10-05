# LagLab – Einstieg für einen neuen Chat

Stand 05.10.2026. Normale App **v1.5**, Test-App **Stand 109**. Beide sind inhaltlich gleich.

Diese Datei enthält alles, um ohne Vorwissen weiterzuarbeiten. Reihenfolge zum Lesen:
1. Diese Datei.
2. `PLAN.md` für die ursprünglichen Anforderungen, das Zielgerät und die Testergebnisse.
3. `UEBERGABE.md` nur bei Bedarf. Sie beschreibt jeden Stand einzeln mit Gründen und Fehlerbehebungen und ist das Nachschlagewerk zur Geschichte.

---

## 1. Worum es geht

LagLab ist eine Web-App (PWA) für das Training im Turmspringen. Ein Tablet filmt den Sprung. Die App zeigt das Bild mit einstellbarer Verzögerung auf einem Fernseher. Der Springer steigt aus dem Becken und sieht seinen Sprung. Dazu kommt eine Analyse. Gespeicherte Videos lassen sich in Zeitlupe abspielen, bemalen, als Bilder sichern und miteinander vergleichen.

- Zielgerät: Samsung Galaxy Tab Active Pro SM-T545, Android 11, Chrome. Ausgabe per USB-C auf HDMI an einen 22-Zoll-Fernseher.
- Untertitel der App: „Bewegungsanalyse“, englisch „Motion Analysis“.
- Es gibt die App zweimal, als normale App „LagLab“ und als Test-App „LagLab Test“. Beide gibt es als Web-App und als Android-App. Die Android-App ist eine Hülle um dieselbe Web-App und kann zusätzlich USB-Webcams nutzen.

## 2. Zusammenarbeit mit dem Nutzer

- **Sprache und Stil:** Deutsch, sachlich, direkt, kurze vollständige Sätze. Keine Floskeln, kein unnötiges Lob, keine Emojis. Keine Gedankenstriche, Doppelpunkte oder Semikolons zur Gliederung innerhalb von Sätzen. Aufzählungen nur, wenn der Inhalt sie braucht. Nichts erfinden, bei Unklarheit nachfragen.
- **Der Nutzer programmiert nicht.** Claude schreibt den gesamten Code. Der Nutzer testet auf dem Tablet oder am Laptop in Chrome und schickt Fotos oder Bildschirmfotos.
- **Fragt der Nutzer „verstanden?“, „was denkst du?“, „wie würdest du das umsetzen?“ oder „hast du Ideen?“**, dann erst erklären, Vorschläge machen und Rückfragen stellen. Nicht sofort bauen. Gebaut wird nach einem klaren „ok“, „setz um“ oder „mach“.
- **Erst Test-App, dann normale App.** Neues kommt nur in die Test-App. In die normale App kommt etwas nur, wenn der Nutzer es ausdrücklich sagt, etwa „pack das in die normale App“.
- **Gestaltungsregeln:**
  - Keine kombinierten Einstellungen. Jede Einstellung hat einen eigenen nummerierten Abschnitt. Abschnitte dürfen nebeneinander stehen.
  - Stern-Regel: Jedes Bild hat einen eigenen Stern. Ein Stern am Bild setzt auch den Stern am Video. Über das automatische Löschen entscheidet nur der Stern des Videos, und mit dem Video verschwinden seine Bilder. Der Filter ★ unter „Bilder“ zeigt nur Bilder mit eigenem Stern.
- **Anleitungen für GitHub, GitHub Desktop oder Android** brauchen genaue Klickwege.
- **Nach jeder Änderung** dem Nutzer in drei Schritten sagen, wie die neue Version aufs Tablet kommt (siehe Abschnitt 5).

## 3. Projekte, Ordner und Adressen

| | Normale App | Test-App |
|---|---|---|
| Ordner | `C:\Users\Hilde\Desktop\Cload_Projekte\LagLab` | `C:\Users\Hilde\Desktop\Cload_Projekte\LagLab-Test` |
| GitHub | Organisation `laglab`, Repository `laglab.github.io` | Organisation `laglab-test`, Repository `laglab-test.github.io` |
| Web-App | https://laglab.github.io/ | https://laglab-test.github.io/ |
| Android-App | https://laglab.github.io/apk/laglab.apk | https://laglab-test.github.io/apk/laglab-test.apk |
| Android-Paket | `de.laglab.app`, Name „Lag Lab“ | `de.laglab.test`, Name „Lag Lab Test“ |
| Anzeige der Version | `v1.5` | `Stand 109` |

- Beide Organisationen haben eine eigene Herkunft. Jede App hat dadurch eigenen Speicher, eine eigene Kamera-Erlaubnis und eine eigene Installation.
- Der Ordner `LagLab` enthält außer der normalen App auch den Android-Teil (`android/`), das Symbol-Skript `icon.py`, das Übernahme-Skript `uebernahme.py`, `UEBERGABE.md`, `PLAN.md` und diese Datei. Der Ordner `grafik/` mit Entwürfen ist nicht im Repository.
- Der Ordner `LagLab-Test` enthält die Test-App, ihre APKs (`apk/laglab-test.apk`, `apk/laglab-usbtest.apk`) und zwei Testseiten (`test.html` für die Fähigkeiten des Tablets, `usb.html` für USB-Kameras).
- Altes Projekt bis 04.10.2026: Ordner `DelayAnwendung`, Repository `tiefenrausch4711-stack/turm-delay`. Es ist abgelöst und bei GitHub nicht mehr erreichbar. Der private Kontoname „tiefenrausch“ soll öffentlich nicht mehr auftauchen. In beiden neuen Repositories steht deshalb als Commit-Autor „LagLab“ (`git config user.name LagLab`, `user.email noreply@laglab.github.io`, schon eingestellt).
- Signierschlüssel für Android: `C:\Users\Hilde\LagLab-Schluessel\laglab-release.jks`, Alias `laglab`. Das Passwort steht in `LIESMICH.txt` daneben und in `~/.gradle/gradle.properties` (`LAGLAB_KEYSTORE`, `LAGLAB_STORE_PASSWORD`, `LAGLAB_KEY_ALIAS`, `LAGLAB_KEY_PASSWORD`). **Der Schlüssel und das Passwort dürfen nie in ein Repository oder zu GitHub.**

## 4. Veröffentlichen

- Claude committet lokal. Am Ende jeder Commit-Nachricht steht `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Der Nutzer lädt in GitHub Desktop mit „Push origin“ hoch. Über „Current repository“ oben links wechselt er zwischen `laglab.github.io` und `laglab-test.github.io`.
- Ob eine Version online ist, prüft Claude selbst, etwa mit `curl -s https://laglab-test.github.io/app.js | grep -m1 "APP_VERSION ="`. GitHub Pages braucht nach dem Push ein bis zwei Minuten.

## 5. Abläufe

### Änderung an der Test-App

1. Im Ordner `LagLab-Test` ändern.
2. `APP_VERSION` in `app.js` um eins erhöhen, etwa von `'109'` auf `'110'`. `VERSION` in `sw.js` passend erhöhen, etwa `PREFIX + 's110'`. Ohne beides bleibt das Tablet auf der alten Version.
3. In `LagLab/UEBERGABE.md` vor „## Neue Version veröffentlichen“ einen Abschnitt „## Test-App Stand 110“ einfügen und die Kopfzeile oben anpassen.
4. In der Vorschau prüfen (siehe Abschnitt 8).
5. Android bauen, im Ordner `LagLab/android`:
   `JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" ./gradlew :laglab:assembleLabtestRelease -q`
   Danach `LagLab/android/laglab/build/outputs/apk/labtest/release/laglab-labtest-release.apk` nach `LagLab-Test/apk/laglab-test.apk` kopieren.
6. In `LagLab-Test` committen und mit `git tag stand-110` markieren. Die geänderte Übergabe in `LagLab` ebenfalls committen.
7. Dem Nutzer die drei Schritte nennen:
   1. In GitHub Desktop „Push origin“ klicken, bei beiden Projekten, die sich geändert haben.
   2. Etwa eine Minute warten, dann die Web-App zweimal neu öffnen, bis unten die neue Nummer steht.
   3. Für Android die APK neu herunterladen und über die alte installieren.

### Übernahme in die normale App

1. Im Ordner `LagLab`: `python uebernahme.py <Version> <Service-Worker-Zähler>`, etwa `python uebernahme.py 1.6 r23`. Das Skript kopiert die Web-Dateien aus `../LagLab-Test` und setzt Version, Speicherorte, Titel ohne „Test“ und Service Worker der normalen App. Die aktuelle Zählung ist v1.5 mit `r22`.
2. Hat sich das Symbol geändert, `icon.py` laufen lassen (siehe unten).
3. Im Browser unter `LagLab` prüfen, dass die App ohne Fehler startet und unten die neue Version zeigt.
4. Android bauen mit `:laglab:assembleNormalRelease` und `laglab-normal-release.apk` nach `LagLab/apk/laglab.apk` kopieren. Mit `aapt2 dump badging` lassen sich Name und Version prüfen (`C:\Users\Hilde\AppData\Local\Android\Sdk\build-tools\37.0.0\aapt2.exe`).
5. Übergabe ergänzen, committen, `git tag v1.6`.

### Versionsnummern in Android

`android/laglab/build.gradle` liest `APP_VERSION` aus den beiden `app.js`. Test-App: versionCode = Stand, etwa 109. Normale App: versionCode = 1000 + Hauptnummer × 100 + Unternummer, also v1.5 = 1105. Der Zuschlag von 1000 kam beim Neubeginn der Zählung bei v1 nach v3.7 (307), damit Android neue Versionen immer über alten installiert.

Der Bau kopiert vor jedem Lauf nur die Web-Dateien (`index.html`, `*.js`, `*.css`, `manifest.webmanifest`, `icon-*.png`) nach `android/laglab/build/web/<Variante>`. Die normale App kommt aus `LagLab`, die Test-App aus `../LagLab-Test`. Beide Ordner müssen deshalb nebeneinander liegen.

### Symbol

Kamera in hellem Salbei `#b9d6cd` mit einer Uhr als Objektiv, Zeiger in Bernstein `#f5a623`, Hintergrund dunkles Schiefergrau `#2c333b`, dazu ein dunkles, leicht abgerundetes Blitzfenster mittig im Höcker. Im Ordner `LagLab`:

- Web-App normale App: `python icon.py . 2c333b cam=b9d6cd hands=f5a623 R=86 mf=0.72 hf=0.5 flash=206,136,270,166,8,2c333b`
- Web-App Test-App: dasselbe mit `../LagLab-Test` statt `.`
- Android normale App: `python icon.py android normal 2c333b b9d6cd 2c333b f5a623 R=86 mf=0.72 hf=0.5 flash=206,136,270,166,8,2c333b`
- Android Test-App: dasselbe mit `labtest` statt `normal`

Die Hintergrundfarbe der Android-Symbole und des Startbilds steht in `android/laglab/src/<Variante>/res/values/colors.xml` (`icon_bg`, `splash`).

## 6. Aufbau der Web-App

Reines HTML, CSS und JavaScript ohne Build-Werkzeuge. `index.html` lädt die Skripte in dieser Reihenfolge, alle teilen sich einen globalen Bereich: `i18n.js`, `native.js`, `app.js`, `analysis.js`, `draw.js`, `compare.js`, `help.js`. `$` ist `document.getElementById`. Die Klasse `.hidden` blendet mit `!important` aus.

| Datei | Inhalt |
|---|---|
| `i18n.js` | Übersetzungen. `TR_ROWS` mit Spalten de, en, es, pt, fr, it. `tr(key, ...)` übersetzt, `translatePage()` übersetzt die Seite, `data-notr` schließt Nutzertexte aus. Wählbar sind vorerst nur Deutsch und Englisch (`LANGS_ON`). |
| `native.js` | Brücke zur Android-Hülle. Ist `window.laglab` da, gilt `NATIVE`. USB-Kamera als normale Videospur, Speichern in den Download-Ordner, Vibration. Im Browser ohne Wirkung. |
| `app.js` | Einstellungen, Kamera, Betrieb mit Verzögerung, Einstellungsfenster, Größe, Farbe, Sprache, Bildschirm anpassen, Zeitlupe im Betrieb, Start und Updates. |
| `analysis.js` | Analyse: Übersicht mit Filtern, Player für Videos und Bilder, Speichern, Löschen, Sterne, Fristen, Schneiden, Bildfolge. |
| `draw.js` | Zeichenwerkzeuge, Zoom mit zwei Fingern, Raster. |
| `compare.js` | Vergleich von 2 bis 4 Videos. |
| `help.js` | Hilfe über das „i“ in den Einstellungen. Text vom Nutzer, je Zeile Symbol oder Name und ein kurzer Satz ohne Punkt am Ende. Symbole aus den echten Knöpfen, keine Bilder, vorerst nur Deutsch. |
| `style.css` | Gestaltung. Drei Farbmodi (dunkel, mittel, hell, Vorgabe mittel), Akzentfarbe, drei Größen der Bedienung über `--z`. |
| `sw.js` | Service Worker. Speichert alle Dateien mit `cache: 'reload'`. Eine neue Version lädt im Hintergrund und gilt ab dem nächsten Start. |

**Speicherorte.** Sie sind absichtlich alt benannt, damit die Android-Apps ihre Daten behalten.

| | Normale App | Test-App |
|---|---|---|
| Einstellungen (localStorage) | `turmdelay.settings.v1` | `lagcam.test.settings` |
| Videos und Bilder (IndexedDB) | `lagtime` | `lagcam-test` |
| Offline-Speicher | `turm-delay-rN` | `lagcam-test-sN` |

**Technik des Betriebs.** Die Kamerabilder kommen über `MediaStreamTrackProcessor` und werden mit `VideoEncoder` in H.264 per Hardware kodiert, etwa jede Sekunde mit Schlüsselbild. Ein Ringpuffer hält die Daten, `VideoDecoder` zeichnet sie verzögert auf ein Canvas. Gespeicherte Videos sind eigene MP4-Dateien (eigener Muxer). Eine Überwachung verbindet die Kamera neu, wenn länger als 2 Sekunden kein Bild kommt.

## 7. Funktionsumfang heute

**Startbild.** Symbol, darunter „LAG LAB“ mit orangem „LAB“, darunter „BEWEGUNGSANALYSE“. In der Test-App steht „TEST“ in weißer Schrift neben dem Namen. Es steht immer 3,3 s.

**Kopfzeile.** Links Symbol, „LAG LAB“ und darunter klein der Untertitel. In der Mitte „Live | Analyse“, die geöffnete Seite in der Akzentfarbe. Rechts Versionsnummer und Zahnrad.

**Live-Seite.** Links das Kamerabild als Sucher, darunter „01 Verzögerung“ von 1 bis 30 s. Rechts:
- „02 Kamera“ mit „Rückseite | Vorderseite | USB“. Bei nur einer Kamera, etwa am Laptop, steht dort „Kamera | USB“.
- „03 Zoom“.
- „04 Belichtung“ und „05 Fokus“. Fokus erscheint nur, wenn die Kamera einen einstellbaren Fokus meldet. Laptops melden das meist nicht.
- Darunter „Start“.

**Einstellungen (Zahnrad).** Alle Knöpfe so hoch wie „Videos | Bilder“ in der Analyse. Oben rechts ein rundes „i“ für die Hilfe.
- 01 Farbe und 02 Sprache nebeneinander.
- 03 Modus.
- 04 Größe mit klein, mittel und groß. Vorgabe ist mittel.
- 05 Bildschirm und 06 Zeitlupe nebeneinander. „Anpassen …“ öffnet im selben Fenster die Regler für Breite, Höhe, Links/rechts und Oben/unten. Vorgabe ist 100 % Breite und Höhe. Die App selbst schrumpft live in den Rahmen und zeigt einen Rand in der Akzentfarbe. Das Fenster liegt dabei außerhalb von `#app`, damit es stehen bleibt. Ein Tippen neben das Fenster verwirft die Änderung, das ist gewollt.
- 07 Videos mit „Videos ohne Stern löschen nach N Tagen“. Eine Verkürzung löscht nie ohne Rückfrage.

**Betrieb.** Das verzögerte Bild über die volle Fläche, oben rechts die Sekunden, darunter bei Zeitlupe ein Uhrsymbol. Unten rechts der Speicherknopf, ein Ring mit Punkt, 1 Sekunde halten speichert den Puffer. Darüber der Zeitlupenknopf mit Uhrzeigern, ebenfalls zum Halten. Ist lang genug gehalten, vibriert das Gerät kurz und der Fortschrittsring leuchtet heller auf. Eine Meldung „Gespeichert“ gibt es nicht mehr. Alle Knöpfe und Zahlen haben einen dunklen Rand, damit sie auf hellem Bild sichtbar bleiben. 1 Sekunde Drücken an einer freien Stelle führt zurück in die Einstellungen.

**Analyse, Übersicht.**
- Links „Videos | Bilder“, rechts „Vergleichen“ für die Auswahl von 2 bis 4 Videos. Unter „Bilder“ bleibt der Platz von „Vergleichen“ leer.
- Dazwischen mittig eine Gruppe: Ansicht „Tage“, Stern, Name, Stichwort, unter „Bilder“ „vs“ für Vergleichsbilder, dann × zum Zurücksetzen. „Tage“ und „Vergleichen“ im Grau der nicht gewählten Reiter.
- Name und Stichwort öffnen eine eigene graue Liste statt der weißen Liste von Android.
- Ansicht: jedes Tippen schaltet Tage, Wochen, Monate. Jahre wollte der Nutzer nicht. Überschriften wie „Heute“, „Montag, 05.10.“, „Diese Woche“, „KW 39 · 21.–27.09.“, „Dieser Monat“, „August 2026“, rechts die Anzahl. Die Kacheln werden kleiner. Ein Tippen führt eine Stufe tiefer zu diesem Eintrag, erst unter Tage öffnet sich das Video. Die Zurück-Geste führt eine Stufe hinauf. Beim Öffnen immer Tage.
- Karten tragen Namen wie `8`, Bilder `8.1`, Vergleichsbilder `vs3.1`. Gezählt wird pro Tag.

**Player.**
- Kopfzeile von links: „‹ Übersicht“, „Video | Bilder“, mittig der Titel. Rechts Stern, Name, Stichwort, Herunterladen und Löschen.
- Oben links im Bild die Pfeile ‹ ›. Sie folgen der Reihenfolge der Übersicht, › geht zur nächsten Karte rechts davon. Bilder, die über „Video | Bilder“ geöffnet wurden, laufen im Kreis innerhalb ihres Videos. Die Bildfläche lässt Berührungen auf den Pfeilen durch (`draw.js`, `pointerdown`).
- Unten: Bild zurück, Abspielen, Bild vor, Zeitregler, Zeit, Wiederholen (∞) und Geschwindigkeit (1×, ½, ¼, ⅛).

**Werkzeuge.**
- 1:1, Stift, Linie, Bogen, Winkel, Kreis, Lot, Waage, Raster, Farbe, Schneiden, Rückgängig, Leeren, Speichern.
- **Kreis:** Mitte setzen und nach außen ziehen. Der Griff in der Mitte verschiebt, der Griff am Rand ändert die Größe.
- **Farbe:** Gelb, Rot, Grün, Türkis, Weiß.
- Zoom und Verschieben gehen mit zwei Fingern in jedem Werkzeug. Ohne gewähltes Werkzeug verschiebt ein Finger.
- **Bogen:** Erst eine Linie ziehen, dann erscheinen zwei Griffe bei einem und zwei Dritteln. Die Kurve läuft durch alle vier Punkte und bildet etwa eine Flugbahn nach. Alte Bögen mit drei Punkten werden als Kreisbogen gezeichnet.
- **Lot und Waage** sind senkrechte und waagerechte gestrichelte Linien über das ganze Bild, im Vergleich über das eigene Feld.
- **Raster** schaltet dezente Linien mit zwölf quadratischen Feldern über die Breite ein und aus. Es bleibt gespeichert eingeschaltet und landet nicht in gespeicherten Bildern.
- **Bildfolge** ist ausgeblendet, ihr Code bleibt. Zum Wiedereinschalten in `style.css` die Regel `#dStrobe { display: none; }` entfernen.
- In mehreren Spalten stehen Lot und Waage in einer Reihe, Raster und Farbe ebenfalls. Lot und Raster beginnen je eine neue Reihe (`grid-column-start: 1`).

**Vergleich.**
- Bis zu 4 Videos in einem gemeinsamen Bild, immer im Raster aus zwei mal zwei Feldern. Zwei Videos stehen oben nebeneinander.
- Jedes Video hat unter dem Bild einen eigenen Regler zum Ausrichten. Daneben steht unten in der Werkzeugleiste „Start“. Er setzt den gemeinsamen Anfang, blendet die Regler aus und vergrößert die Videos. Nochmals tippen holt die Regler zurück.
- Gespeicherte Vergleichsbilder heißen `vs{nr}.{n}`, Nummer des Vergleichs am Tag und Nummer des Bildes. Der Titel „Vergleich · 1 · 3“ nennt die Videonummern des Tages, ohne Datum, so gewollt.

## 8. Testen in der Vorschau

- Vorschau-Server: `.claude/launch.json` startet `python -m http.server`, in `LagLab` auf Port 8765, in `LagLab-Test` auf 8766.
- **Alte Dateien:** Der Python-Server sendet keine Cache-Angaben. Vor jedem Test Service Worker abmelden, Caches löschen, die geänderten Dateien mit `fetch(datei, {cache: 'reload'})` neu holen und dann einen **neuen Tab** öffnen und den alten schließen. Ein Neuladen im selben Tab reicht oft nicht.
- Die Vorschau hat keine Kamera. Für den Betrieb eine künstliche Kamera über ein Canvas mit `captureStream` einspeisen.
- **Echte Klicks prüfen** (`computer` mit `left_click` oder `left_click_drag`), nicht nur `element.click()` per Skript. Die Pfeile im Player waren lange kaputt, weil Tests sie nur per Skript auslösten.
- Für Tablet-Größe die Ansicht auf 1280 × 800 stellen. Bildschirmfotos sind manchmal veraltet oder gezoomt, dann die Größe neu setzen und noch einmal aufnehmen.

## 9. Bekannte Fallstricke

- Die Klasse `.sub` ist in `style.css` schon vergeben (`flex: 0 0 72px`). Neue Klassennamen vorher mit `grep` prüfen.
- Oberste `let`- und `const`-Variablen gelten über alle Skripte. Werden sie vor ihrer Zeile benutzt, bricht der Start ab. Deshalb steht `tvBefore` vor `applyTv`.
- `#app` ist der Rahmen der ganzen App (`position: fixed`, `contain`, Container `app`). Fest positionierte Fenster darin bewegen sich mit, wenn „Bildschirm anpassen“ aktiv ist.
- Die Bildfläche `#pStage` fängt Berührungen für Zeichnen und Zoom ab. Neue Knöpfe auf der Bildfläche brauchen eine Ausnahme im `pointerdown` in `draw.js`.
- Git auf Windows wandelt Zeilenenden um (LF zu CRLF). Die Warnungen dazu sind harmlos.
- Edits per Python-Skript mit `assert s.count(alt) == 1` absichern, damit nichts doppelt oder gar nicht ersetzt wird.

## 10. Offene Punkte

- Das leere Projekt `laglab-test/laglab-test` bei GitHub kann gelöscht werden.
- Den alten Ordner `DelayAnwendung` archivieren oder löschen. Er wird nicht mehr gebraucht.
- APKs eventuell über GitHub Releases statt im Repository verteilen, damit die Projekte klein bleiben.
- Die Übersetzungen vor einem Play-Store-Start von Muttersprachlern prüfen lassen.
- Ungenutzte CSS-Regeln für die frühere vierte Größe (`data-size="3"`) entfernen.
- Play Store ist für später angedacht.
