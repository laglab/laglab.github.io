# Übergabe LagLab

Stand 04.10.2026. Seit diesem Tag liegen die beiden Apps in zwei getrennten Projekten mit eigener Herkunft, siehe „Aufteilung in zwei Projekte“. Normale App v1.3 im Projekt `LagLab` (`laglab.github.io`), gleich mit Test-App Stand 94 bis auf Name, Schild „TEST“, Speicherorte und Versionsnummer. Test-App Stand 104 im Projekt `LagLab-Test` (`laglab-test.github.io`). Beide gibt es auch als Android-App. Die Geschichte bis Stand 94 und v1.3 liegt im alten Projekt `tiefenrausch4711-stack/turm-delay` (Ordner `DelayAnwendung`), das nur noch auf die neuen Adressen verweist.

Für einen neuen Chat zuerst `EINSTIEG.md` lesen, sie fasst den aktuellen Stand vollständig zusammen. Diese Datei ist das ausführliche Nachschlagewerk zu allen Ständen. Lies zuerst diese Datei und danach `PLAN.md`. `PLAN.md` enthält die vollständige, abgestimmte Planung, die Testergebnisse des Tablets und die Regeln für die Kommunikation mit dem Nutzer.

## Kurzfassung

LagLab ist eine Progressive Web App für das Training im Turmspringen. Ein Samsung Galaxy Tab Active Pro (SM-T545, Android 11, Chrome 154) filmt den Sprung. Die App zeigt das Bild mit einstellbarer Verzögerung. Die Ausgabe geht per USB-C auf HDMI an einen 22-Zoll-Fernseher. Der Springer sieht seinen Sprung, nachdem er aus dem Becken gestiegen ist.

## Zusammenarbeit

- Antworten auf Deutsch, sachlich und ohne Floskeln. Die genauen Stilregeln stehen in `PLAN.md` unter „Kommunikation mit dem Nutzer“.
- Der Nutzer programmiert nicht. Claude schreibt den gesamten Code, der Nutzer testet auf dem Tablet und schickt Fotos.
- Claude committet lokal im Projektordner. Der Nutzer lädt mit GitHub Desktop über „Push origin“ hoch. „Fetch origin“ reicht dafür nicht.
- Ob eine Version online ist, prüft Claude selbst, indem es `https://laglab.github.io/app.js` und `https://laglab-test.github.io/app.js` abruft und `APP_VERSION` liest.
- Anleitungen für GitHub oder Android brauchen genaue Klickwege.

## Orte

- Projektordner der normalen App, auch Android-Teil, Symbole und diese Übergabe: `C:\Users\Hilde\Desktop\Cload_Projekte\LagLab`, Repository `laglab/laglab.github.io`, Branch `main`
- Projektordner der Test-App: `C:\Users\Hilde\Desktop\Cload_Projekte\LagLab-Test`, Repository `laglab-test/laglab-test.github.io`, Branch `main`
- Normale App: `https://laglab.github.io/`
- Test-App: `https://laglab-test.github.io/`
- Android-App „LagLab“: `https://laglab.github.io/apk/laglab.apk`
- Android-Test-App „LagLab Test“: `https://laglab-test.github.io/apk/laglab-test.apk`
- Testseiten für das Tablet und für USB-Kameras: `https://laglab-test.github.io/test.html` und `https://laglab-test.github.io/usb.html`, dazu die Android-App „LagLab USB-Test“ unter `https://laglab-test.github.io/apk/laglab-usbtest.apk`
- Altes Projekt, nur noch Verweise: `C:\Users\Hilde\Desktop\Cload_Projekte\DelayAnwendung`, Repository `tiefenrausch4711-stack/turm-delay`
- Signierschlüssel für Android außerhalb der Projekte: `C:\Users\Hilde\LagLab-Schluessel`, Angaben in `~/.gradle/gradle.properties`. Niemals in ein Repository.

## Dateien

| Ort | Inhalt |
|---|---|
| `LagLab/` Hauptordner | Normale App: `index.html`, `app.js`, `analysis.js`, `draw.js`, `compare.js`, `i18n.js`, `native.js`, `style.css`, `sw.js`, `manifest.webmanifest`, Symbole |
| `LagLab/apk/laglab.apk` | Android-App der normalen App |
| `LagLab/android/` | Gradle-Projekt mit den Modulen `laglab` (beide Varianten) und `usbtest` |
| `LagLab/icon.py` | Erzeugt die Symbole, Befehle bei „Test-App Stand 94“ |
| `LagLab/uebernahme.py` | Übernimmt die Test-App in die normale App |
| `LagLab/UEBERGABE.md`, `LagLab/PLAN.md` | Übergabe und Planung |
| `LagLab/grafik/` | Entwürfe und Bilder, nicht im Repository |
| `LagLab-Test/` Hauptordner | Test-App mit denselben Dateien wie die normale App |
| `LagLab-Test/apk/` | `laglab-test.apk` und `laglab-usbtest.apk` |
| `LagLab-Test/test.html`, `LagLab-Test/usb.html` | Testseiten für das Tablet und für USB-Kameras |

## Aufteilung in zwei Projekte

Seit dem 04.10.2026 liegen die Apps in zwei GitHub-Organisationen, damit sie sauber getrennt sind und nebeneinander installiert werden können.

- Jede Organisation hat eine eigene Herkunft (`laglab.github.io` und `laglab-test.github.io`). Damit hat jede App eigenen Speicher, eine eigene Kamera-Erlaubnis und eine eigene Installation. Vorher lagen beide unter `tiefenrausch4711-stack.github.io/turm-delay/` und teilten sich das alles.
- Videos und Einstellungen der Web-Apps unter der alten Adresse wurden nicht übertragen, das war so gewollt. Die Android-Apps behalten ihre Daten, weil sie ihre Dateien aus der APK laden.
- Die Namen der Speicher blieben gleich, damit die Android-Apps ihre Daten behalten: normale App `turmdelay.settings.v1`, IndexedDB `lagtime`, Offline-Speicher `turm-delay-rN`. Test-App `lagcam.test.settings`, `lagcam-test`, `lagcam-test-sN`.
- Als Autor der Commits steht in beiden Projekten „LagLab“, nicht der Kontoname.
- Der Android-Bau liest die Web-Apps aus `LagLab` (normal) und `../LagLab-Test` (labtest). Vor jedem Bau kopiert er nur die Dateien der Web-App nach `android/laglab/build/web/<Variante>`, siehe `WEB` und `WEB_FILES` in `android/laglab/build.gradle`.

Ablauf bei einer Änderung an der Test-App:

1. Änderung in `LagLab-Test`, `APP_VERSION` in `app.js` und `VERSION` in `sw.js` erhöhen.
2. In dieser Übergabe einen Abschnitt „Test-App Stand NN“ ergänzen.
3. Android bauen: im Ordner `LagLab/android` `JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" ./gradlew :laglab:assembleLabtestRelease -q`, dann die APK nach `LagLab-Test/apk/laglab-test.apk` kopieren.
4. In `LagLab-Test` committen und `stand-NN` taggen. Die geänderte Übergabe in `LagLab` ebenfalls committen.
5. Der Nutzer pusht in GitHub Desktop beide Projekte, die sich geändert haben.

Ablauf bei einer Übernahme in die normale App:

1. Im Ordner `LagLab` `python uebernahme.py <Version> <Service-Worker-Zähler>` aufrufen, etwa `python uebernahme.py 1.4 r21`.
2. Bei neuem Symbol `icon.py` für `.` und `android normal` laufen lassen.
3. Android bauen mit `:laglab:assembleNormalRelease`, APK nach `LagLab/apk/laglab.apk`.
4. Übergabe ergänzen, committen und `vX.Y` taggen.

## Normale App und Test-App

Seit dem 30.09.2026 gibt es zwei Apps nebeneinander.

- Die normale App „LagLab“ liegt seit v1.2 im Ordner `app/`, vorher im Hauptordner. Am 01.10.2026 wurde der Inhalt der Test-App Stand 1 übernommen und als `v1` veröffentlicht, Git-Tag `v1`. Der alte Stand ist unter `v0` gesichert. Sie wird im Training genutzt und nur bei Fehlern oder bei einer neuen Übernahme aus der Test-App geändert.
- Unterschiede der normalen App zur Test-App: Titel und Logo ohne „Test“, Anzeige `v` + `APP_VERSION`, `STORE_KEY` `turmdelay.settings.v1` ohne Übernahme anderer Einstellungen, IndexedDB `lagtime` statt `lagcam-test`, Offline-Speicher `turm-delay-r1` mit Zählung `r1`, `r2` und so fort, blaues Symbol, Manifest mit Bereich `./index.html`.
- Die Test-App „LagLab Test“ liegt im Ordner `test/`. Neue Funktionen kommen nur dorthin. Sie hat ein oranges Symbol und in der App ein oranges Schild „Test“. Oben rechts steht „Stand“ mit ihrer Nummer.
- Beide teilen sich die Adresse von GitHub Pages, sind aber getrennt installiert. Die Test-App speichert ihre Einstellungen unter `lagcam.test.settings` und übernimmt beim ersten Start die Einstellungen der normalen App. Ihr Offline-Speicher heißt `lagcam-test-vN`, der der normalen App `turm-delay-vN`. Jeder Service Worker löscht nur Speicher mit dem eigenen Präfix.
- Bei Änderungen an der Test-App `APP_VERSION` in `test/app.js` und `VERSION` in `test/sw.js` erhöhen. Am 01.10.2026 wurde die Zählung nach Stand 36 auf „Stand 1“ zurückgesetzt und mit dem Git-Tag `stand-1` gesichert. Der Offline-Speicher heißt seitdem `lagcam-test-s1`, weiter mit `s2`, `s3` und so fort, damit keine Verwechslung mit den alten Namen `v1` bis `v36` entsteht.
- Hat sich die Test-App bewährt, werden ihre Änderungen nach `app/` übernommen. Dabei `STORE_KEY`, `MAIN_STORE_KEY`, Präfix, Namen, Schild und Symbol der normalen App beibehalten. Danach den neuen Stand mit einem Tag wie `v1` sichern.
- Symbol der Test-App mit `python icon.py test c2570c` erzeugen.
- Beide Apps liegen seit v1.2 und Test-App Stand 2 als Geschwister in `app/` und `test/`, jede mit Bereich und `id` `./` im eigenen Ordner. Vorher lag die normale App im Hauptordner, ihr Bereich umfasste `test/`, und Chrome meldete die Test-App als schon installiert. Die Begrenzung auf `./index.html` ab Version 18 hat das auf dem Tablet nicht zuverlässig gelöst. Nach dem Umzug müssen beide Apps einmal deinstalliert und neu installiert werden. Einstellungen und Videos bleiben erhalten, weil sie an den Ursprung `tiefenrausch4711-stack.github.io` gebunden sind.

## Test-App, geplante Funktionen

Mit dem Nutzer am 30.09.2026 abgestimmt. Gebaut wird in drei Schritten, jeder wird auf dem Tablet geprüft.

1. Erledigt in Stand 2. Speicherknopf, Videoliste, Wiedergabe mit Zeitlupe und Einzelbildern, Schieberegler, Stern, Name, Löschen, Export, Löschen nach 7 Tagen. Seit Stand 18 ist die Frist unten in der Videoliste mit Minus- und Plustasten frei von 1 bis 30 Tagen einstellbar, seit Stand 19 mit „nie“ als Stufe nach 30, gespeichert als `settings.keepDays`, 0 bedeutet nie. Aufgeräumt wird 1,5 Sekunden nach dem letzten Tippen, eine kürzere Frist löscht dann sofort. Eine Auswahlliste mit festen Werten hatte der Nutzer abgelehnt. Teilen wurde in Stand 9 auf Wunsch des Nutzers entfernt, es bleibt nur Herunterladen.
2. Erledigt in Stand 4. Zeichnen im Standbild mit Freihand und geraden Linien, Winkel über drei Punkte messen, Zoom mit zwei Fingern, Schleife über einen Abschnitt. Zeichnungen sind nur vorübergehend und verschwinden, sobald das Video weiterläuft.
Zweiter Nutzertest in Stand 21. Geprüft ohne Befund: Kamerawechsel, Verzögerung 1 bis 30, Betrieb mit 30 Sekunden über mehrere Minuten mit stabil etwa 33 Sekunden Puffer, Speichern von 30 Sekunden, 42 Videos über fünf Tage, Sonderzeichen in Namen, schnelles Öffnen und Schließen, Schleife in Zeitlupe, Schnitt auf 4 Bilder, Export eines langen Videos. Behoben:
- Das Fenster „Darstellung“ legt einen Verlaufseintrag an. Die Zurück-Geste schließt es, statt die Seite zu wechseln.
- Vorschaubilder nutzen das Vollbild vor der Zielstelle, wenn es im sichtbaren Teil liegt, und einen gemeinsamen Decoder. 42 Bilder brauchen höchstens 10 statt etwa 55 Sekunden.
- Das Foto speichert bei Zoom nur den sichtbaren Ausschnitt in voller Größe und meldet „Foto gespeichert“. Der Knopf ist während des Speicherns gesperrt.
- Dateinamen enden nicht mehr auf „_“, wenn der Name nur aus Sonderzeichen besteht.
- Die Auswahl der Springer ist höchstens 280 Pixel breit.

Nutzertest in Stand 20, umgesetzt am 01.10.2026.
- Fällt die Kamera im Betrieb aus, bleibt der Puffer erhalten. Er läuft weiter auf den Fernseher und lässt sich speichern, die Anzeige ist dabei rot. Nach dem Neuverbinden kommen die neuen Bilder hinter die Lücke in denselben Puffer. Eine Lücke gilt nicht als Überlast, siehe `hasDueFrame`.
- Speichern im Countdown zeigt „Puffer füllt sich noch“ und speichert nichts.
- „Start“ ist gesperrt, solange die Kamera nicht läuft.
- Zurück-Taste und Zurück-Geste von Android über die History API. Wiedergabe führt zur Liste, Liste zu Live, im Betrieb wirkt sie nicht. Betrieb, Liste und Wiedergabe legen je einen Verlaufseintrag an, „‹ Liste“, „Live“ und Löschen nutzen `history.back()`.
- Die Liste behält ihre Position nach dem Zurückkehren aus einem Video.
- „Bild vor“ und „Bild zurück“ schalten beim Halten fortlaufend weiter.
- Das Werkzeug „Zurück“ heißt „Rückgängig“.
- Die Bildfolge ist auf die Bilder im Abschnitt begrenzt.
- Das Vorschaubild stammt nie aus dem Vorlauf vor einem Schnitt.
- Oben rechts in der Liste steht nur der Platz der Videos.
- „Nur mit Stern“ ist bei leerer Liste gesperrt.
- Bewusst nicht geändert, auf Wunsch des Nutzers: doppeltes Speichern, weil 1 Sekunde Halten genügt, und die dauerhaft laufende Kamera auf Live, weil das Tablet für den Fernseher an bleiben muss.

Designdurchsicht in Stand 16. Filter der Liste stehen oben. `--dim` ist in beiden Modi auf etwa 4,5 zu 1 Kontrast angehoben. Kleinschrift ist größer, also Werkzeugleiste 12,5 Pixel, Skala 12,5, Hinweise 14, Version 13. Akzentfarbe als Schrift läuft über `--acc-text`, im Hellmodus 55 Prozent Akzent mit Schwarz gemischt. Die Umschaltung Live und Analyse ist im aktiven Zustand neutral grau, damit „Start“ die einzige große Akzentfläche bleibt. Seit Stand 23 haben die Videokarten eigene Farben `--card` und `--card-line`, im Dunkelmodus deutlich heller als der Hintergrund, dazu ein leichter Schatten. Seit Stand 22 sind auch die Schalter `.seg` dezent, also gewählter Teil mit 16 Prozent Akzent, Rand in `--acc-text` und normaler Schrift. Der Name steht in der Kartenzeile neben Nummer und Uhrzeit. Der schwarze Speicherring hat einen schwachen hellen Schein per `drop-shadow`.

Einstellungen seit Stand 29. Seit Stand 32 ohne Knopf „Fertig“, geschlossen wird durch Tippen neben das Fenster oder die Zurück-Geste. Seit Stand 34 nummerierte Überschriften wie auf Live, also 01 Farbe, 02 Modus, 03 Videos. Videos ist ein Raster `.vidGrid` mit dezentem Text links und rechts einer Spalte von 190 Pixeln, in der die Tasten für die Tage und „Videos löschen …“ bündig abschließen. Das Zahnrad öffnet das Fenster „Einstellungen“ mit den Abschnitten Darstellung, also Farbe und Modus, und Videos, also Aufbewahrung ohne Stern, „Belegt … MB“ und „Videos löschen …“. Löschen läuft seit Stand 31 in drei Schritten. Nach „Videos löschen …“ folgt die Auswahl „Ohne Stern löschen (n)“, „Alle löschen (n)“ oder „Abbrechen“, danach die Rückfrage mit Anzahl und „Ja, löschen“ in Rot. Gelöscht wird in einer Transaktion. Die Aufbewahrung unten in der Liste und „Videos … MB“ oben in der Liste sind entfallen. Die Versionsnummer bleibt oben rechts auf Live. Seit Stand 30 gibt es keinen Hinweistext unter „Start“ mehr. Ein Hilfefenster mit „i“-Knopf hat der Nutzer abgelehnt, die App soll selbsterklärend sein. Einen Abschnitt „Über die App“ wollte der Nutzer nicht.

Navigation seit Stand 15. Die Seite mit Kamera und Einstellungen heißt „Live“. In der Kopfzeile von Live und Videoliste sitzt mittig an gleicher Stelle eine Umschaltung „Live | Analyse“. Der Knopf „Analyse“ neben Start und der Knopf „‹ Einstellungen“ in der Liste sind entfallen. In der Wiedergabe eines Videos bleibt „‹ Liste“.

Zusätzlich in Stand 6. Ein Zahnrad oben rechts in Einstellungen und Analyse öffnet das Fenster „Darstellung“. Dort gibt es seit Stand 7 vier Farbvorschläge, nämlich Türkis, Blau, Grün und Weiß, und links ein buntes Feld. Es öffnet sofort einen eigenen Farbwähler mit Fläche und Farbtonregler, der dem Hell- und Dunkelmodus folgt. Der Farbwähler von Android wird bewusst nicht genutzt. Dazu kommt die Wahl zwischen Dunkel und Hell. Der Betrieb bleibt immer schwarz. Gespeichert in `settings.ui`. Alle Türkistöne im CSS sind `color-mix` aus `--acc`. Die Schrift auf Akzentflächen `--acc-ink` wird nach Helligkeit dunkel oder weiß. Die hellen Werte gelten nur für `#settings`, `#analysis` und `#uiDlg`.
3. Erledigt in Stand 10, abgestimmt am 01.10.2026.
   - Foto. Entfallen in Stand 28.
   - Filter in der Liste nach Stern und nach Name. Seit Stand 23 heißt die Auswahl „Alle Namen“ statt „Alle Springer“, weil das allgemeiner ist.
   - Lot. Gestrichelte Senkrechte über die ganze Bildhöhe, mit Griff verschiebbar.
   - Schneiden. Rechts anwählen. Seit Stand 13 erscheinen auf dem normalen Zeitregler zwei zusätzliche Punkte, neutral weiß mit dunklem Rand, seit Stand 25 ohne Buchstaben und ohne Erklärung, mit markiertem Abschnitt dazwischen. Die Leiste darüber zeigt nur „Länge …“. Die Werkzeugleiste ist seit Stand 25 86 Pixel breit, damit „Rückgängig“ passt. Seit Stand 26 sitzt „Rückgängig“ ganz unten in der Werkzeugleiste unter „Bildfolge“, abgesetzt mit `margin-top: auto`. Seit Stand 27 steht „1:1“ zum Zurücksetzen des Zooms direkt unter „Ansehen“. Seit Stand 28 steht „Leeren“ unter „Rückgängig“ ganz unten, und das Werkzeug „Foto“ ist auf Wunsch des Nutzers entfallen. Farben wurden bewusst vermieden, weil sie mit der frei wählbaren Akzentfarbe kollidieren können. Eigene Regler gibt es nicht mehr. Darüber liegt eine schmale Leiste mit Länge, „Abbrechen“ und „Schneiden“. Das Original wird ersetzt und behält Nummer, Name und Stern. Neu kodiert wird nicht. Ab dem Keyframe vor dem Anfang bleibt ein unsichtbarer Vorlauf, gespeichert als `skip` im Datensatz `data`. Die Wiedergabe beginnt bei `pFirst`. Das MP4 überspringt den Vorlauf über eine Edit List `elst`.
   - Bildfolge. Abschnitt wie beim Schneiden mit den Punkten auf dem Zeitregler wählen, dazu 3 bis 16 Bilder, dann „Erstellen“. Ein eigener Decoder holt die Bilder in 1280 x 720. Der Hintergrund ist der Median der Helligkeit auf einem Raster von 4 Bildpunkten. Wo ein Bild deutlich abweicht, wird es eingesetzt, spätere Bilder liegen oben. Das Ergebnis ersetzt das Videobild, bis wieder ein Videobild erscheint. Man kann darauf zeichnen und es als Foto speichern.
   - Seit Stand 24 gibt es in der Wiedergabe neben „‹ Liste“ die Tasten „‹“ und „›“ für das vorherige und nächste Video, chronologisch und innerhalb des Filters der Liste, siehe `clipNeighbor`. Der Wechsel legt keinen Verlaufseintrag an. Zeitlupe bleibt, Zoom, Zeichnung, Schleife und Schnittauswahl werden zurückgesetzt.
   - Vergleich zweier Sprünge entfällt, weil von verschiedenen Brettern gesprungen wird. Zeitmessung und alle Vorschläge für den Betrieb wollte der Nutzer nicht.

Entscheidungen des Nutzers
- Kein Fernauslöser. Der Bildschirm wird auf den Fernseher gespiegelt.
- Während der Analyse ist die Kamera aus. Es gibt entweder Betrieb oder Analyse.
- Der Speicherknopf ist seit Stand 33 gestaltet wie der Kreis zum Zurückkehren. Seit Stand 35 hat er ein Viertel der Fläche, also den halben Durchmesser, mit einem unsichtbaren Rand zum leichteren Treffen. Innen ist er durchsichtig, nur der graue Ring ist zu sehen. Beim Drücken wird er innen dunkel getönt. Beim Halten füllt sich der Ring in 1 Sekunde in der Akzentfarbe, voll heißt gespeichert. Vorher war er von Stand 8 bis 32 ein schwarzer Ring ohne Füllung, seit Stand 12 mit dünner Linie unten links im 16:9-Bereich. Er muss 1 Sekunde gehalten werden. Dabei verschwindet der Ring von oben im Uhrzeigersinn. Ist er weg, kommt die Meldung „Gespeichert“, danach erscheint der Ring wieder.
- Die Sekundenanzeige oben rechts steht seit Version 22 und Stand 8 frei, ohne Hintergrund und Rahmen, nur mit weichem Textschatten. In der Test-App ist sie seit Stand 35 kleiner, 6 statt 8 Prozent der Bildhöhe.
- Gespeichert wird der Teil des Puffers, der noch gezeigt wird, also vom Bild auf dem Fernseher bis zum Moment des Drückens. Der Trainer drückt direkt nach dem Eintauchen.
- Videos werden nach Datum gruppiert und pro Tag durchnummeriert. Seit Stand 11 steht nur die Zahl, ohne „Nr.“.

Technik in `test/analysis.js`
- Die Videos liegen in IndexedDB `lagcam-test`. Der Speicher `clips` hält die Angaben für die Liste mit Vorschaubild, `data` die H.264-Daten als Blob mit einer Bildtabelle und der Decoder-Konfiguration.
- Gespeichert wird ohne neu zu kodieren. Beginn ist der Keyframe vor dem gezeigten Bild.
- Vorschaubilder entstehen erst in der Liste, etwa 2 Sekunden vor dem Ende.
- Die Wiedergabe dekodiert mit `VideoDecoder`. Ein Sprung auf ein Bild dekodiert ab dem Keyframe davor und endet mit `flush()`.
- Der Export verpackt die Daten mit einem eigenen kleinen MP4-Muxer. Dateiname `LagLab_<Datum>_<Nr>_<Name>.mp4`.
- `navigator.storage.persist()` wird beim Start angefordert.
- Zeichnen, Winkel und Zoom stehen in `test/draw.js`. Formen liegen in Bildpunkten des Videos. Die Zeichenfläche `pDraw` liegt deckungsgleich über `pOut` in `pView`, das per CSS-Transform gezoomt wird. Zwei Finger zoomen und verschieben in jedem Werkzeug. Im Werkzeug „Ansehen“ verschiebt ein Finger, Doppeltippen setzt den Zoom zurück. Punkte von Linien und Winkeln lassen sich nachträglich verschieben. `onPlayerFrameShown()` löscht die Zeichnung bei jedem neuen Bild. Der Zoom bleibt.
- Die Schleife setzt mit dem ersten Druck den Anfang, mit dem zweiten das Ende, mit dem dritten wird sie aufgehoben. Bei aktiver Schleife springt die Wiedergabe am Ende über `startFeed(loopA)` zurück.
- In der Vorschau im Claude-Desktop läuft `requestAnimationFrame` nicht, wenn das Fenster im Hintergrund liegt. Die Wiedergabe lässt sich dann durch direkte Aufrufe von `playerTick(performance.now())` prüfen.

## Test-App Stand 2 bis 4, seit v1.4 auch in der normalen App

Gearbeitet wird nur an der Test-App. Übertragen in die normale App wird erst, wenn der Nutzer nach dem Testen Bescheid gibt.

- Einstellungen. Tage in derselben dezenten Schrift wie „Belegter Speicher“. „Belegt“ heißt jetzt „Belegter Speicher“. Sechs Farbkreise, nämlich Farbwähler, vier mildere Vorschläge `#4fbfb3`, `#5b8fd6`, `#4caf7d`, `#e9edf0` und als sechster Kreis die eigene Farbe in `settings.ui.custom`. Der sechste Kreis ist gestrichelt leer, bis im Farbwähler eine Farbe gezogen wird. Frühere kräftige Werte werden beim Start auf die milderen umgestellt.
- Analyse. Der Sternfilter zeigt nur „★“, die Namensauswahl heißt „Filter“. In der Wiedergabe stehen „‹“ und „›“ rechts neben der Aufnahmezeit. „‹ Liste“ ist größer. Das Löschen eines einzelnen Videos fragt mit „Ja, löschen“.
- Das Schild „TEST“ bleibt in der Test-App.
- In die normale App übernommen mit v1.4 am 01.10.2026, Git-Tag `v1.4`. Der Startbildschirm ist dort blaugrau `#455a6f`.
- Seit Stand 4 ein eigener Startbildschirm `#splash` in der Symbolfarbe mit dem Symbol in der Mitte. Das Symbol ist seit Stand 9 128 Pixel groß wie bei Chromes eigenem Startbildschirm, vorher sprang es beim Übergang auf eine größere Fläche. Er steht ab dem Öffnen mindestens `SPLASH_MS` 1,3 Sekunden und blendet dann in 0,45 Sekunden aus, mit Sicherheitsabschaltung nach 6 Sekunden. Das Manifest hat dafür `background_color` in der Symbolfarbe, damit der Startbildschirm von Android ohne Farbsprung übergeht. Wirkt bei Android erst nach Aktualisierung oder Neuinstallation der App.

## Test-App Stand 5 bis 10, seit v2 auch in der normalen App

Abgestimmt am 02.10.2026. Am selben Tag mit Stand 10 als v2 in die normale App übernommen. Beim ersten Start von v2 wird die Videoablage `lagtime` von Version 1 auf 2 erweitert, vorhandene Videos bleiben erhalten, geprüft in der Vorschau.

- Jedes Video hat neben Name eine Eigenschaft `prop`, zum Beispiel „Kopfsprung“. Bereits vergebene Namen und Eigenschaften erscheinen beim Eintippen als Auswahl.
- Übersicht. Ganz links „Videos | Bilder“, entweder oder, nie gemischt. Daneben ★, „Name“ und „Eigenschaft“ als Filter, sie wirken zusammen und auch auf Bilder. Videokacheln zeigen die Zahl ihrer Bilder. Der leere Hinweis lautet nur „Noch keine Videos gespeichert.“
- Bilder. Neuer Speicher `images` in IndexedDB, Datenbankversion 2, Index `clipId`. Ein Bild hat `clipId`, Nummer `n`, Grundbild `base` als JPG ohne Zeichnung, die Zeichnung `shapes` getrennt, damit sie später bearbeitbar bleibt, und ein Vorschaubild `thumb`. Bilder gehören zu ihrem Video und werden mit ihm gelöscht.
- Werkzeugleiste in drei Gruppen ohne Linie, also Werkzeuge, dann „Rückgängig“ und „Leeren“, dann „Speichern“. „Speichern“ ist im Video nur aktiv, wenn gezeichnet wurde oder eine Bildfolge zu sehen ist. Bild, Zeichnung und Nummer werden im Moment des Tippens festgehalten.
- Fenster. Kopfzeile in drei Bereichen, links „‹ Übersicht“ und Titel, Mitte „Video | Bilder“, rechts ★, Name, Eigenschaft, „Herunterladen“, „Löschen“. Die Pfeile liegen oben links auf dem Bild. Unter „Video“ blättern sie durch die Videos der Übersicht mit Filter, unter „Bilder“ durch die Bilder dieses Videos. Ein Bild aus der Übersicht öffnet das Fenster direkt unter „Bilder“. Unter „Bilder“ gibt es keine Abspielleiste, kein Schneiden und keine Bildfolge. „Herunterladen“ lädt dort nur das Bild mit Zeichnung, „Löschen“ löscht nur das Bild.
- Dateinamen ohne „LagLab“, mit Eigenschaft, also `2026-10-02-Teo_Kopfsprung_V3.mp4` und `2026-10-02-Teo_Kopfsprung_V3_B1.jpg`. Fehlende Teile entfallen. In der Übersicht steht „V3“ und „V3_B1“, die Meldung im Betrieb lautet „Gespeichert · V3“.
- Die Schleife ist entfallen. „Ansehen“ heißt „Zoom“, „‹ Liste“ heißt „‹ Übersicht“.
- Zweiter großer Nutzertest Stand 8 am 02.10.2026. Ohne Befund: leere Zustände, Zoom, Belichtung und Fokus pro Kamera, Kameraausfall mit Speichern, Zusammenführen von Namen mit doppelten Leerzeichen, Bilder aus geschnittenen Videos, Bildfolge mit Zeichnung, automatisches Speichern, Stern-Filter für Bilder, Löschen von Bildern und Videos, Offline-Speicher mit allen neun Dateien. Behoben: „Wird gespeichert …“ erscheint sofort beim Tippen auf „Speichern“, `playerMsg` mit `keep`. Die Rückfrage beim Löschen lautet jetzt zum Beispiel „3 Videos ohne Stern mit 1 Bild wirklich löschen?“, bei einem einzigen Video ohne „alle“.
- Seit Stand 7 fordert die App als installierte App keinen zusätzlichen Vollbildmodus mehr an, siehe `installedApp`. Vorher zeigte Chrome beim ersten Wechsel zur Analyse und zurück den Hinweis zum Herauswischen aus dem Vollbild.
- Nutzertest Stand 6 am 02.10.2026, behoben: Name und Eigenschaft übernehmen eine vorhandene Schreibweise unabhängig von Groß- und Kleinschreibung. Änderungen an einem gespeicherten Bild werden beim Verlassen automatisch gespeichert, siehe `flushImageEdits`. „Speichern“ bleibt grau, solange sich seit dem letzten Speichern nichts geändert hat, siehe `saveSig`. Bild, Zeichnung und Nummer werden beim Tippen sofort erfasst, wer ein Bild öffnet, wartet auf ein laufendes Speichern. Videonummern eines Tages werden nie wieder vergeben, gemerkt in `settings.lastNr`. Bilder eines Videos stehen aufsteigend. Nach dem Löschen eines Bildes folgt das nächste Bild desselben Videos, ohne weitere Bilder das Video. Die Rückfrage beim Löschen in den Einstellungen nennt auch die Zahl der Bilder.

## Test-App Stand 14, Videoseite direkt aus dem Betrieb

- Die Meldung „Gespeichert · V7“ im Betrieb ist kleiner und dünner, `#toast` mit `400 3.2cqh`.
- Nach dem Speichern bleibt der Speicher-Knopf grau (`#saveBtn.recent`), 5 Sekunden ab dem fertigen Speichern (`RECENT_MS`). Ein Tippen darauf öffnet sofort die Videoseite des eben gespeicherten Videos (`enterReview` in `analysis.js`).
- Auf dieser Videoseite gibt es alle üblichen Funktionen, aber keine Pfeile (`#aPlayer.review .clipNav`). Der Knopf heißt „‹ Wiedergabe“. Er, die Zurück-Geste und das Löschen führen zurück in die verzögerte Wiedergabe (`leaveReview`).
- Dabei bleibt `mode` gleich `run`, nur `reviewing` ist wahr. Die Kamera kodiert weiter in den Puffer. `tick` kürzt dann nur den Puffer und zeigt nichts. Beim Wechsel setzt `restartRunPlayback` den Decoder zurück, der Puffer bleibt, und die Wiedergabe setzt am passenden Keyframe wieder ein.
- Fehler gefunden und behoben: `writeClip` gab das Video ohne `id` zurück. Jetzt setzt es `meta.id`.
- Ergebnis Tablet mit Stand 13: Live-Bild nach Wechseln, Belichtung und Fokus bei USB funktionieren. Mit manueller Belichtung liefert die C920 29,3 B/s. Die Bildqualität der C920 ist sichtbar schlechter als die der Rückkamera.

## Test-App Stand 15

- Speicher-Knopf im Betrieb kleiner, `10.5cqh` statt `13.2cqh`. Zurück-Ring kleiner, 104 px statt 132 px. Die Meldung sitzt passend daneben.
- Name und Eigenschaft im Videofenster 160 px breit statt 112 px, damit etwa „Auerbach“ ganz zu sehen ist. Dafür ist „Herunterladen“ ein Symbol mit Pfeil nach unten (`.tool.icon`). „Video | Bilder“ bleibt genau mittig.

## Test-App Stand 16

- In den Einstellungen heißt es jetzt „Videos ohne Stern löschen nach“ statt „Ohne Stern löschen nach“. Das Fenster ist dafür 510 px breit statt 460 px, damit der Text in eine Zeile passt.

## Test-App Stand 17

- Farbkreise in den Einstellungen: Farbwähler, gleich daneben die eigene Farbe (`accSaved`), danach die vier festen Farben.

## Test-App Stand 18

- Bilder lassen sich im Videofenster jetzt immer speichern, auch ohne Zeichnung und ohne Bildfolge. Gesperrt ist nur dasselbe Bild ein zweites Mal. `updatePlayerUi` ruft dafür `renderSaveBtn` auf.
- „Wird gespeichert …“ erscheint nur, wenn das Speichern länger als 400 ms dauert. „Gespeichert als V4_B4“ steht 1,2 s statt 2,2 s. Großes Bild und Vorschau werden gleichzeitig umgewandelt.

## Test-App Stand 19

- Beim Öffnen der Analyse setzt `enterAnalysis` alle Filter zurück: „Videos“, kein Stern, kein Name, keine Eigenschaft, Liste oben. Innerhalb der Analyse bleiben die Filter erhalten, auch beim Öffnen eines Videos und der Rückkehr zur Übersicht.

## Test-App Stand 20

- Die Sekundenanzeige oben rechts im Betrieb ist kleiner und dünn, `#badge` mit `400 4.5cqh` statt `700 6cqh`.

## Test-App Stand 21

- Fehler vom Tablet: Die Videoseite direkt aus dem Betrieb blieb schwarz. Vermutete Ursache: zu wenige Hardware-Decoder, weil Aufnahme-Encoder und der ruhende Decoder der Wiedergabe belegt sind. In der Vorschau nicht nachstellbar.
- Abhilfe 1: `releaseRunDecoder` schließt beim Öffnen der Videoseite den Decoder der Wiedergabe ganz. `tick` legt beim Zurückkehren einen neuen an.
- Abhilfe 2: Der Decoder des Videofensters weicht auf Software aus (`pSoft`, `hardwareAcceleration: 'prefer-software'`), wenn er einen Fehler meldet oder nach 1,5 s kein Bild liefert. Jedes neu geöffnete Video versucht es zuerst wieder mit der Hardware. In der Vorschau mit nachgestelltem Fehler und nachgestelltem Hängen geprüft.

## Test-App Stand 22, Größe der Bedienung

- Neue Einstellung „03 Größe“ mit „Normal | Groß | Sehr groß“ (`settings.ui.size` 0, 1, 2), „Videos“ ist jetzt „04“. `applyUi` setzt `html[data-size]`, CSS-Variable `--z` ist 1, 1,25 oder 1,5.
- Umsetzung mit CSS `zoom: var(--z)` auf den Bedienteilen: `.bar`, `.filters`, `.delay`, `#panel`, `.dlg`, `#aGrid`, `#aEmpty`, `.pbar`, `.pctl`, `#pRange`, `#pTools`, `.clipNav`, `#pMsg`, `#pStill`, `#camMsg`. `.hud` wächst höchstens auf 1,15. Nicht vergrößert werden Bild- und Zeichenflächen und der Betrieb. Die rechte Spalte der Live-Seite wächst über `grid-template-columns` mit.
- Anpassungen ab „Groß“: Belichtung und Fokus nebeneinander in der rechten Spalte. Im Videofenster rücken Name und Eigenschaft in eine zweite Zeile rechts (`.pR::after` als Zeilenumbruch). Die Werkzeugleiste ist zweispaltig, Rückgängig und Speichern beginnen eine neue Reihe. Bei „Sehr groß“ sind Werkzeuge und Gruppenabstände etwas flacher und das Farbfeld im Farbwähler flacher.
- Für alle Stufen: Start bleibt unten sichtbar (`position: sticky`). Einträge der Infozeile im Kamerabild brechen nicht in sich um. Farbkreise höchstens 64 px. Das Einstellungsfenster rollt notfalls. Beim Schneiden und bei der Bildfolge sind die Werkzeugknöpfe flacher, das behebt auch ein Überlaufen bei „Normal“.
- Geprüft in 1280 × 800 mit einem Skript, das herausragende, abgeschnittene und überlappende Teile meldet: Live mit manueller Belichtung und manuellem Fokus, Einstellungsfenster mit Farbwähler und Löschen, Übersicht mit Videos und Bildern, Videofenster mit Video, Bild, Schneiden, Bildfolge und „‹ Wiedergabe“. Alle drei Stufen ohne Befund. Der Farbwähler trifft auch mit Zoom die richtige Stelle.

## Test-App Stand 23

- Nach dem Tablet-Test reicht 125 %. Die Stufen sind jetzt „Normal“ 100 %, „Groß“ 112,5 %, „Sehr groß“ 125 %. Die Sonderregeln, die nur für 150 % nötig waren, sind entfernt: flachere Werkzeuge, kleinere Gruppenabstände und flacheres Farbfeld. Alles andere aus Stand 22 gilt weiter, also ab „Groß“ zweite Zeile für Name und Eigenschaft, zwei Werkzeugspalten und Belichtung neben Fokus.
- Erneut mit dem Prüfskript in 1280 × 800 geprüft, alle Seiten und alle drei Stufen ohne Befund.

## Test-App Stand 24, Vorschläge für Name und Eigenschaft

- Die `datalist` ist weg, weil Chrome damit schon beim Antippen alle Namen zeigt. Stattdessen eigene Liste `#pSuggest` in `.pbar`, weiß mit dunkler Schrift, rechtsbündig unter dem Feld.
- Sie erscheint erst ab dem ersten Buchstaben. Zuerst Begriffe, die so beginnen, dann Begriffe mit einem Wort, das so beginnt, ohne Unterschied von Groß und Klein, höchstens 8. Jeder weitere Buchstabe schränkt ein. Antippen übernimmt den Begriff und speichert ihn.
- Gemerkt werden alle je eingetragenen Begriffe in `settings.terms.name` und `settings.terms.prop`, auch nach dem Löschen des Videos. Beim Laden der Übersicht kommen die vorhandenen Werte dazu. Die bestehende Regel bleibt: Eine vorhandene Schreibweise wird übernommen, aus „teo“ wird „Teo“.
- Noch offen: Es gibt keinen Weg, einen falsch gemerkten Begriff wieder zu entfernen.

## Test-App Stand 25, Größe als Schieberegler

- Statt „Normal | Groß | Sehr groß“ gibt es unter „03 Größe“ einen Schieberegler `#uiSize` mit vier Rastpunkten, links „klein“, rechts „groß“ im Stil von „Belegter Speicher“. Gestaltet wie alle Regler der App, dazu vier kleine Punkte als Rastmarken (`.sizeTicks`). Die Größe wechselt erst beim Loslassen (`change`), damit der Regler nicht unter dem Finger wächst.
- Stufen 0 bis 3 für 100 %, 116,7 %, 133,3 % und 150 %. `settings.ui.size` behält die Nummer, aus dem früheren 125 % wird damit 133 %.
- `applyUi` setzt `html[data-size]` und ab Stufe 1 die Klasse `big`. Alle Anordnungsregeln ab „Groß“ hängen an `html.big`. Für 150 % gelten zusätzlich flachere Werkzeuge, ein flacheres Farbfeld und knappere Abstände in der rechten Spalte der Live-Seite.
- Mit dem Prüfskript in 1280 × 800 alle Seiten in allen vier Stufen geprüft, ohne Befund.

## Test-App Stand 26

- Logo oben links: „LAG“ und „LAB“ enger zusammen, `.mark b` mit `margin-left: 0.06em` statt `0.35em`. Die Startseite im Hauptordner ist unverändert.

## Test-App Stand 27

- Start sitzt auf der Live-Seite in jeder Größe ganz unten. Ab Stufe 1 hat das Raster der rechten Spalte vier Zeilen, die letzte füllt den Rest, Start steht darin unten (`align-self: end`). Der Innenabstand oben an `.actions` aus Stand 22 ist entfernt.
- Hinweis für Prüfungen in der Vorschau: Die Einblend-Bewegung `rise` der Live-Seite bleibt im gedrosselten Vorschaufenster am Anfang stehen. Das verschiebt die Gruppen um 8 px und täuscht ein Überlaufen vor. Vor dem Messen mit `getAnimations().forEach(a => a.finish())` beenden.

## Test-App Stand 28, Fernseher anpassen

- Grund: Tablet 16:10, Video und Fernseher 16:9. Im Betrieb entstehen dadurch oben und unten Balken auf dem Tablet, die HDMI mitspiegelt. Mit Zoom am Fernseher verschwinden sie, aber der Fernseher schneidet zu viel ab.
- Neuer Abschnitt „05 Fernseher“ im Einstellungsfenster: Umschalter „Normal | Angepasst“ und Knopf „Anpassen …“. „Angepasst“ ohne frühere Einstellung öffnet gleich das Prüfbild.
- Prüfbild `#tvCal`: Rahmen `#tvFrame` mit Gitter, farbigen Eckwinkeln, Kreuz und halbdurchsichtigem Live-Bild. Regler mit „−“ und „+“ für Breite und Höhe (40 bis 100 % des Bildschirms) und für die Lage der Mitte waagerecht und senkrecht (−30 bis +30 %), Schritt 0,5. „Zurücksetzen“ stellt 16:9 über die volle Breite her, „Fertig“ schaltet auf „Angepasst“. Zurück-Geste schließt das Prüfbild.
- Werte in `settings.tv` = `{ on, set, w, h, x, y }`. `applyTv` setzt bei „Angepasst“ `#stage` auf diese Fläche, das Canvas füllt sie mit `object-fit: fill`. Sekundenanzeige und Speicher-Knopf sitzen in `#stage` und rücken mit.
- Damit das Fenster bei den Stufen 2 und 3 nicht rollt, stehen dort „Modus“ und „Größe“ nebeneinander (`.dlgPair`).
- Geprüft in 1280 × 800: Prüfbild, Werte, Fertig, Fläche im Betrieb genau gleich dem Rahmen, Fenster und Prüfbild in allen vier Größen ohne Befund.

## Test-App Stand 29

- Beim Start, nach einem Kamerawechsel (`restartCamera`) und nach einem Abbruch (`cameraLost`) zeigt die Live-Seite 10 s lang „Kamera wird verbunden …“ mit dem Zustand „Verbinde“ (`CONNECT_GRACE_MS`, `startConnecting`). Erst danach erscheint der Grund aus `failText`: keine USB-Kamera, kein erlaubter Zugriff mit Hinweis auf die Android- oder Chrome-Einstellungen, oder „Keine Verbindung zur Kamera. Die App versucht es weiter.“ Die frühere Anzeige „Start“ ohne Kamera entfällt.

## Test-App Stand 30, ganze App im Fernseher-Rahmen

- Wunsch des Nutzers: Bei „Angepasst“ liegt nicht nur der Betrieb, sondern die ganze App im eingestellten Rahmen, rundherum schwarz. Auf dem Fernseher füllt sie dann mit seinem Zoom genau den Bildschirm.
- Umsetzung: `#app` umschließt `#settings`, `#run`, `#analysis` und `#uiDlg`. Startbild und Prüfbild liegen außerhalb und nutzen den ganzen Bildschirm. `#app` hat `contain: layout paint` und ist damit Bezug für alle `position: fixed` darin, dazu `container-type: size` mit dem Namen `app`. Maße, die vorher `vw` und `vh` nutzten, nutzen jetzt `cqw` und `cqh`. `applyTv` setzt bei „Angepasst“ die Klasse `tvfit` und Lage und Größe von `#app`. Dann füllt `#stage` im Betrieb den ganzen Rahmen mit `object-fit: fill`. Der Haltekreis rechnet die Lage der App heraus.
- Für niedrige Rahmen gibt es `@container app (max-height: 760px)`: Belichtung und Fokus nebeneinander, Modus und Größe nebeneinander, knappere Abstände, flacheres Farbfeld, Werkzeuge in zwei Spalten und bei Stufe 2 und 3 in drei. Bei Stufe 3 sind die Beschriftungen der Werkzeuge während Schneiden und Bildfolge ausgeblendet.
- Ab „Groß“ teilen sich Name und Eigenschaft die zweite Zeile der Kopfzeile, auch bei wenig Platz.
- Geprüft in 1280 × 800 mit einem Rahmen 1203 × 676 und ohne Rahmen, alle vier Größen: Live mit Auto und Manuell, Fenster, Farbwähler, Löschen, Übersicht, Videofenster mit Video, Bild, Schneiden und Bildfolge, Betrieb, Haltekreis, Prüfbild. Ohne Befund.

## Test-App Stand 31, Zauberstab, in Stand 34 wieder entfernt

- Stand 31 hatte einen Zauberstab mit MediaPipe Pose Landmarker, der Hüftwinkel und Lot zeigte. Der Nutzer wollte ihn nicht und ließ ihn in Stand 34 vollständig entfernen: `pose.js`, Ordner `mp`, Werkzeug, Zeichnungsart `pose`, Speicher im Service Worker, Dateiarten in `MainActivity` und die Anpassungen der Werkzeugleiste für 13 Werkzeuge. Der Service Worker löscht auf den Geräten zusätzlich den alten Speicher `laglab-mp-…`. Die APK ist wieder etwa 11 MB groß.
- Erkenntnis aus dem Test, falls die Idee wiederkommt: Auf 22 Wettkampffotos fand die Erkennung den Körper in allen Fällen, gedrehte Versuche brachten nichts, mehrere Personen erfordern die Wahl der angetippten Person.

## Test-App Stand 32

- Speicher-Knopf im Betrieb halb so groß, `5.25cqh` mit Innenabstand `0.9cqh`, sichtbarer Kreis etwa 25 px auf dem Tablet. Beim Drücken (`.go`) wächst er mit `scale(4.2)` auf etwa 104 px, die Größe des Kreises beim Verlassen, und schrumpft beim Loslassen. Er sitzt bei `6cqh` von links und unten, damit der große Kreis ganz im Bild bleibt. Eine unsichtbare Fläche `::before` macht die Tippfläche größer. Die Meldung „Gespeichert“ sitzt daneben bei `13cqh`.

## Test-App Stand 33

- Im Einstellungsfenster heißt der Abschnitt jetzt „04 Bildschirm“ und steht unter „03 Größe“, „Videos“ ist „05“. Das Prüfbild heißt „Bildschirm anpassen“.
- Im Prüfbild gibt es „Abbrechen“ zwischen „Zurücksetzen“ und „Fertig“. `openTvCal` merkt sich den Stand beim Öffnen (`tvBefore`). Abbrechen und die Zurück-Geste stellen ihn wieder her, nur Fertig übernimmt (`tvKeep`).

## Test-App Stand 34

- Zauberstab vollständig entfernt, siehe oben.

## Test-App Stand 35, Review aus Anwendersicht

Durchgang mit nachgestellter Kamera durch Start, Live, Einstellungen, Betrieb, Videoseite aus dem Betrieb, Übersicht, Videofenster, Bilder, Herunterladen, Löschen und hellen Modus. Gefunden und behoben:
- „−“ und „+“ der Verzögerung waren bei 1 und 30 aktiv, ohne etwas zu bewirken. Jetzt grau (`renderDelayButtons`).
- Die Zurück-Geste im Farbwähler und in der Rückfrage zum Löschen schloss das ganze Einstellungsfenster. Jetzt führt sie zurück in die Einstellungen.
- Eine sehr helle Akzentfarbe machte im hellen Modus Start, Regler und gewählte Knöpfe unsichtbar, eine sehr dunkle im dunklen Modus ebenso. Das betraf auch die feste hellgraue Farbe. `readableAcc` nutzt dann eine dunklere oder hellere Abstufung, gespeichert bleibt die gewählte Farbe.
- Ein Bild herunterzuladen dauert etwa eine Sekunde ohne Rückmeldung, und Löschen oder Wechseln in dieser Zeit führte zu einem Fehler. Jetzt „Bild wird vorbereitet …“, Name und Bild werden sofort festgehalten, doppeltes Tippen wird ignoriert.
Ohne Befund: Countdown, Speichern zu früh, Zurück-Geste im Betrieb, Videoseite ohne zweites Video, Kameraausfall im Betrieb, Verlassen per Halten, Filter, Stern, Bildschritte, Tempo, Suchen, Schneiden, Bildfolge, Bildmodus, Löschen in zwei Schritten, Schreibweise von Namen, Dateinamen mit Umlauten, Rückfragen beim Löschen mit Zahl der Bilder, heller Modus auf allen Seiten.

## Test-App Stand 36

- „Eigenschaft“ heißt jetzt „Stichwort“, im Feld des Videofensters und im Filter der Übersicht. Intern bleibt der Schlüssel `prop`, gespeicherte Werte bleiben erhalten.

## Test-App Stand 37

- Dritter Modus „Mittel“ zwischen Dunkel und Hell, `data-theme="mid"`: graublau mit weißer Schrift, Hintergrund `#3a434d`. Wie Hell gilt er für Einstellungen, Analyse und das Fenster, der Betrieb bleibt dunkel. `readableAcc` hellt die Akzentfarbe im mittleren Modus auf, wenn sie dunkler als 0,2 Helligkeit ist. Alle Seiten und das Fenster in allen Größen geprüft.

## Test-App Stand 38

- Symbol und Startbild der Test-App sind jetzt schiefergrau `#3a434d` statt orange, erzeugt mit `python icon.py test 3a434d`. Ebenso Startbild in `style.css`, `background_color` im Manifest und die Farbe `splash` der Android-Variante `labtest`. Das orange Schild „TEST“ im Logo bleibt.
- Beim ersten Öffnen gelten jetzt Modus „Mittel“ und 15 s Verzögerung (`DEFAULTS`). Im Browser übernimmt die Test-App beim ersten Start aber weiterhin die Einstellungen der normalen App, falls es sie dort gibt.

## Normale App v2.1

- Auf Wunsch des Nutzers direkt geändert, ohne Übernahme: Symbol und Startbild der normalen App sind schiefergrau `#3a434d` statt blaugrau, erzeugt mit `python icon.py app 3a434d`. Ebenso Manifest und die Farbe `splash` der Android-Variante `normal`. Damit sind die Symbole beider Apps gleich, sie unterscheiden sich nur im Namen und durch das Schild „TEST“ in der App.

## Test-App Stand 39

- Die Kamera bleibt in der Analyse an, damit das Bild beim Zurückkehren sofort da ist. Nach 3 Minuten in der Analyse geht sie aus (`ANALYSIS_CAM_MS` in `analysis.js`). Die USB-Kamera der Android-App geht wie bisher gleich aus, weil ihr Decoder sonst mit dem Player konkurriert. `leaveAnalysis` startet die Kamera nur neu, wenn sie nicht mehr läuft.
- `startCamera` zeigt das Bild jetzt sofort und stellt Zoom, Belichtung und Schärfe erst danach ein. Das verkürzt die Wartezeit beim Kamerawechsel.
- Neue Startgröße ist die zweitkleinste Stufe (`ui.size: 1`).
- Werkzeugleiste in zwei oder drei Spalten: „Leeren“ hat denselben Abstand nach oben wie „Rückgängig“ und steht auf gleicher Höhe. Der Abstand steckt in der Variablen `--grp` an `#pTools`.
- `android/laglab/build.gradle` liest jetzt auch Versionen mit Punkt. Die normale App v2.1 hat den versionCode 201.

## Test-App Stand 40

- Neue Beschriftung mit kleinem v und Punkt. Videos heißen „v3“, Bilder „v3.1“ statt „V3_B1“. Das gilt für Kacheln, die Meldung „Gespeichert · v3“ im Betrieb, Player-Überschrift, die Meldung nach dem Speichern und die Dateinamen beim Herunterladen, etwa `2026-10-02-Teo_Kopfsprung_v3.mp4` und `…_v3.1.jpg`.

## Test-App Stand 41

- Dateinamen beim Herunterladen mit der Nummer direkt hinter dem Datum, dann Name und Stichwort, alles mit Unterstrich getrennt. Also `2026-10-02_v3_Teo_Kopfsprung.mp4` und `2026-10-02_v3.1_Teo_Kopfsprung.jpg`. Fehlende Teile entfallen.

## Test-App Stand 42

- Bilder speichern ging spürbar langsam, „Wird gespeichert …“ stand lange da. Ursache ist `canvas.toBlob`. Chrome wandelt dabei erst in einer Leerlaufphase um und wartet sonst bis zu 1 s pro Aufruf. Bei laufender Kamera und Wiedergabe gibt es kaum Leerlauf. `canvasBlob` nutzt jetzt `toDataURL` und wandelt sofort um. Das gilt auch für die Vorschaubilder der Videoliste und das Herunterladen von Bildern. In der Vorschau dauerte ein Bild in voller Größe damit rund 40 ms statt rund 1000 ms.

## Test-App Stand 43

- Nur noch eine feste Akzentfarbe, helles Salbei `#8fb9ad`, zugleich Startwert. Die drei übrigen festen Kreise sind weg. Farbwähler und eigene Farbe bleiben. Wer eine frühere feste Farbe gewählt hatte, bekommt beim Start das Salbei (`OLD_ACCENTS`). Im hellen Modus dunkelt `readableAcc` das Salbei etwas ab.

## Test-App Stand 44, zweites Review aus Anwendersicht

Gefunden und behoben:
- Name oder Stichwort gingen verloren, wenn man das Feld mit der Zurück-Geste verließ, ohne vorher „Fertig“ zu tippen. Das Feld behält dabei den Fokus, und `change` kam nie. `commitFields` in `closePlayer` übernimmt die Eingabe vor jedem Wechsel. In der Vorschau mit echter Tastatureingabe nachgewiesen.
- Ein verweigerter Kamerazugriff erschien erst nach 10 s. Jetzt sofort, weil Warten daran nichts ändert.
- Nach der Rückkehr in die App wartete das Neuverbinden bis zu 3 s. Jetzt startet ein laufender Neuversuch sofort (`wakeReconnect`), die ersten Versuche danach im Abstand von 0,3 s. Eine Kamera, die von selbst weiterläuft, bekommt 1,5 s Ruhe vor der Überwachung. Im Hintergrund versucht die App keine Verbindung.
- Die Bildfolge hatte keinen Ausweg, wenn der Hardware-Decoder scheitert oder hängt. Jetzt wie im Player nach Fehler oder 8 s in Software.
- In der Android-App erzeugte doppeltes Tippen auf Herunterladen eine zweite Datei. `downBusy` gilt jetzt auch für Videos, `download` wartet auf Android.

Vom Nutzer entschieden:
- Im Bildfenster blättern die Pfeile weiter nur durch die Bilder desselben Videos. Wer mehr Bilder sehen will, geht in der Übersicht auf „Bilder“.
- Eine Zeichnung auf einem Videobild verschwindet weiter beim nächsten Bild. Speichern liegt direkt daneben.
- Die beiden Punkte zum automatischen Löschen kamen in Stand 45.

## Test-App Stand 45

- Ein Video mit gespeicherten Bildern wird wie eines mit Stern nie automatisch gelöscht (`keepVictims`). Die Beschriftung heißt jetzt „Videos ohne Stern und ohne Bild löschen nach“. Das Löschen über „Videos löschen …“ bleibt wie bisher und nennt die Zahl der Bilder.
- Eine kürzere Frist löscht nicht mehr ohne Rückfrage. Angezeigt wird `keepShown`, gespeichert in `settings.keepDays` erst, wenn bei der neuen Frist nichts fällig ist oder nach „Ja, löschen“. Die Prüfung läuft 1,5 s nach dem letzten Tippen oder beim Schließen des Fensters, das sich dafür notfalls wieder öffnet. Die Rückfrage nutzt `delAsk` mit `askKind = 'keep'`. Abbrechen und die Zurück-Geste stellen die bisherige Frist wieder her.

## Test-App Stand 46

- Startbildschirm: Symbol 168 statt 128 Pixel, darunter der Name „LAG LAB“ mit Schild „TEST“ im Stil von oben links, 26 Pixel, Farben wie im Modus Mittel (`.splashName`). Der nahtlose Übergang vom Startbildschirm von Chrome entfällt damit bewusst.
- Kamera im Symbol etwas größer, `SC` in `icon.py` 0.90 statt 0.84. Neu erzeugt nur für die Test-App, die normale App hat noch 0.84.
- Die Android-Variante `labtest` hat jetzt ein adaptives Symbol (`mipmap-anydpi-v26/ic_launcher.xml`). Vordergrund ist die Kamera ohne Hintergrund (`ic_launcher_foreground.png`, 432 Pixel), Hintergrund die Farbe `splash`. Vorher war es ein fertiges Quadrat, das Android verkleinert in seine Form setzte, dadurch wirkte die Kamera verloren. Erzeugt mit `python icon.py android labtest 3a434d`. Für die normale App bei der Übernahme `python icon.py android normal 3a434d` und die XML-Datei kopieren.

## Normale App v3, übernommen aus Test-App Stand 46

- Alle Dateien aus `test/` nach `app/` kopiert, dazu neu `native.js`. Unterschiede danach nur noch diese: `APP_VERSION = '3'` mit Anzeige „v3“, `STORE_KEY = 'turmdelay.settings.v1'` ohne Übernahme fremder Einstellungen, `DB_NAME = 'lagtime'`, Titel und Manifest „LagLab“, kein Schild „TEST“ in Kopfzeilen und Startbildschirm, Service Worker `turm-delay-r9` ohne das Aufräumen der früheren MediaPipe-Speicher. Ein `diff -r test app` zeigt genau diese Stellen.
- Gespeicherte Videos und Einstellungen der normalen App bleiben erhalten. Alte feste Farben werden zum Salbei, Größe und Bildschirm bekommen die Startwerte.
- Symbole mit `python icon.py app 3a434d` und `python icon.py android normal 3a434d`, adaptives Symbol auch für die Variante `normal`.
- Android-App der normalen App gebaut mit `./gradlew :laglab:assembleNormalRelease`, versionCode 300, liegt als `apk/laglab.apk`. Die Startseite verlinkt beide Android-Apps. Paket `de.laglab.app`, sie lässt sich neben der Test-App `de.laglab.test` installieren.
- Git-Tag `v3`.

## Test-App Stand 47

- Android-Symbol der Test-App umgekehrt: weißer Hintergrund (`icon_bg` in `labtest/res/values/colors.xml`), Kamera und Zeiger im Salbei `#8fb9ad`, das Objektiv weiß. Erzeugt mit `python icon.py android labtest ffffff 8fb9ad`. Das Symbol der Web-App und das Startbild bleiben schiefergrau mit weißer Kamera.

## Normale App v3.1

- Android-Symbol wie Test-App Stand 47, weiß mit Kamera in Salbei. `python icon.py android normal ffffff 8fb9ad`, dazu `icon_bg` in `normal/res/values/colors.xml` und die XML-Datei des adaptiven Symbols. Sonst unverändert, versionCode 301, Git-Tag `v3.1`.

## Test-App Stand 48 und normale App v3.2

- Auf Wunsch direkt in beide Apps: Im Startbildschirm sitzt der Name näher an der Kamera. Kein Abstand mehr zwischen Symbol und Name, dafür `margin-top: -27px` an `.splashName`, weil das Symbol unter der Kamera freie Fläche hat. Sichtbar bleiben etwa 18 Pixel. `style.css` ist in beiden Apps gleich.

## Test-App Stand 49

- Der Speicherknopf im Betrieb sitzt unten rechts statt unten links, weil er sich dort besser drücken lässt (`right: 6cqh`). Die Meldung „Gespeichert · v3“ steht links daneben (`right: 13cqh`).

## Test-App Stand 50, Zeitlupe im Betrieb

- Unten links im Betrieb ein runder Knopf `#slowBtn` mit den Uhrzeigern aus dem Symbol, gegenüber dem Speicherknopf. Ein Tippen startet die Zeitlupe, ein zweites beendet sie. Aktiv ist er innen dunkel, Ring und Zeiger in der Akzentfarbe.
- Die Zeitlupe spielt ab dem Bild auf dem Fernseher (`lastShownTs`) den Puffer bis zum Moment des Tippens langsamer ab. Dann oder beim zweiten Tippen geht es mit der eingestellten Verzögerung weiter, die Zeit dazwischen entfällt (`stopSlow` mit `restartRunPlayback`). Bei 15 s und ½ dauert sie 30 s.
- Technik: Nur die Anzeigeuhr ändert sich. `showT(now)` liefert die Stelle im Puffer und gilt für `tick`, `onDecoded`, `trim` und `snapshotBuffer`. Die Kamera kodiert unverändert weiter, kein zweiter Decoder. Speichern während der Zeitlupe nimmt ab dem Bild auf dem Fernseher. Der Wechsel auf die Videoseite, Verlassen und neuer Start beenden die Zeitlupe.
- Unter den Sekunden oben rechts steht während der Zeitlupe `#slowTag` mit Uhrsymbol und Geschwindigkeit.
- Einstellung `settings.slow` 0.5, 0.25 oder 0.125, Startwert 0.5. Im Fenster „Einstellungen“ als „05 Zeitlupe“ in einer Zeile mit „04 Bildschirm“ (`.dlgRow`), „Videos“ ist jetzt 06. Das Fenster passt bei 1280 × 720 und 1280 × 800 in allen Größen ohne Scrollen.

## Normale App v3.3, übernommen aus Test-App Stand 50

- Wie bei v3 alle Dateien aus `test/` nach `app/` kopiert und dieselben Stellen angepasst. Neu dabei sind der Speicherknopf unten rechts aus Stand 49 und die Zeitlupe aus Stand 50. `APP_VERSION = '3.3'`, versionCode 303, Service Worker `turm-delay-r12`, Git-Tag `v3.3`.

## Test-App Stand 51

- Android-Symbol der Test-App wieder mit weißer Kamera, Hintergrund jetzt kräftiges Stahlblau `#2f6690` (`icon_bg`), Objektiv in derselben Farbe. `python icon.py android labtest 2f6690 ffffff`. Web-Symbol und Startbild bleiben schiefergrau.

## Normale App v3.4, übernommen aus Test-App Stand 51

- Android-Symbol wie die Test-App, weiße Kamera auf Stahlblau `#2f6690`. `python icon.py android normal 2f6690 ffffff` und `colors.xml` aus `labtest`. Web-Dateien erneut aus `test/` übertragen, inhaltlich gleich wie v3.3. versionCode 304, Service Worker `turm-delay-r13`, Git-Tag `v3.4`.

## Test-App Stand 52

- Der Zeitlupenknopf sitzt über dem Speicherknopf unten rechts (`bottom: 17cqh`), weil links schlecht zu bedienen ist. Der Abstand hält die unsichtbaren Tippflächen getrennt.
- Bedienung wie beim Speichern: beim Drücken wächst er auf das 4,2-Fache, der Ring füllt sich in 1 s, dann startet oder endet die Zeitlupe (`slowPress`, `SAVE_PRESS_MS`). Loslassen vorher bricht ab. Läuft die Zeitlupe, füllt sich der Ring zum Beenden weiß.

## Test-App Stand 53

- Sekunden und Zeitlupen-Anzeige liegen gemeinsam in `#hudR`, einer Spalte oben rechts. Die Uhr mit ½ steht dadurch genau mittig unter den Sekunden statt rechtsbündig.

## Test-App Stand 54

- Android-Symbol der Test-App: weiße Kamera auf dunklem Schiefergrau `#2c333b` statt Stahlblau. `python icon.py android labtest 2c333b ffffff`.

## Normale App v3.5, übernommen aus Test-App Stand 54

- Zeitlupenknopf über dem Speicherknopf mit Halten wie beim Speichern (Stand 52), Zeitlupen-Anzeige mittig unter den Sekunden (Stand 53), Android-Symbol weiße Kamera auf dunklem Schiefergrau `#2c333b` (Stand 54, `python icon.py android normal 2c333b ffffff`). versionCode 305, Service Worker `turm-delay-r14`, Git-Tag `v3.5`.

## Test-App Stand 55

- Fehler behoben: Auf der Videoseite aus dem Betrieb waren die Pfeile ganz ausgeblendet, auch bei den Bildern dieses Videos. Jetzt gilt das Ausblenden nur im Video (`#aPlayer.review:not(.imgMode) .clipNav`). Durch die Bilder des Videos lässt sich blättern, zu anderen Videos weiterhin nicht.

## Test-App Stand 56, Vergleich von 2 bis 4 Videos

Neue Datei `test/compare.js`, im Service Worker und in `index.html` eingetragen. Stand 55 wurde zusammen mit Stand 56 committet.
- Auswahl: In der Übersicht „Vergleich“ (`#fCmp`). Dann markiert ein Tippen auf ein Video dieses mit 1 bis 4, statt es zu öffnen (`cmpSelect`). „Vergleichen (n)“ (`#fCmpGo`) öffnet ab zwei Videos. Wechsel zu „Bilder“ beendet die Auswahl.
- Anzeige: Alle Videos stehen in einem gemeinsamen Bild `pCanvas`, jedes in einem Feld von 1280 × 720 mit 8 Pixel Abstand. Zwei Videos übereinander, drei oder vier im Raster zwei mal zwei. Oben links in jedem Feld Nummer und Name, das erscheint auch im gespeicherten Bild. Zeichnen, Zoom und Speichern laufen dadurch unverändert über `draw.js`. Das Lot bleibt im Feld, in dem es gesetzt wurde (`drawTiles`).
- Zeit: Jedes Video hat einen Versatz `off`. Die gemeinsame Zeit `cmp.m` läuft für alle gleich, ein Video zeigt das Bild zur Zeit `off + m`. Der Hauptregler, Start, Bild für Bild und die Geschwindigkeiten bewegen `m`. Unter dem Bild steht je Video ein eigener Regler mit ‹ und › (`#cmpAlign`), er ändert nur den Versatz dieses Videos. Ein Video, das zu Ende ist oder noch nicht begonnen hat, zeigt sein letztes oder erstes Bild.
- Technik: ein `VideoDecoder` je Video mit Fallback auf Software bei Fehler oder 1,5 s Stillstand, wie im Player. Beim Abspielen dekodiert jedes Video höchstens 8 Bilder voraus.
- Im Vergleich gibt es kein Herunterladen, kein Löschen, kein Schneiden, keine Bildfolge und keinen Wechsel zu anderen Videos. Name, Stichwort und Stern gelten für die Bilder, die in diesem Vergleich gespeichert werden, auch nachträglich (`saveMeta`). Name und Stichwort stehen dort in der ersten Zeile der Kopfleiste.
- Vergleichsbilder: Datensatz in `images` mit `kind: 'cmp'`, `clipId: null`, eigene Felder `day`, `nr`, `n`, `name`, `prop`, `star`, dazu `clips` und `tiles`. Jeder Vergleich bekommt beim ersten Speichern seine Nummer des Tages (`settings.lastCmp`), die Bilder heißen `vgl1.1`, `vgl1.2`, Dateiname etwa `2026-10-04_vgl1.2_Teo_Salto.jpg`. Sie erscheinen unter „Bilder“, nach Vergleich gruppiert, und lassen sich nach Name, Stichwort und Stern filtern. Im Bildfenster fehlen „Video | Bilder“ und die Pfeile, Löschen führt zurück zur Liste.
- Aufbewahrung: Vergleichsbilder ohne Stern werden nach der eingestellten Frist gelöscht, mit Rückfrage wie bei Videos (`keepVictims` liefert `clips` und `imgs`). „Videos löschen …“ in den Einstellungen löscht keine Vergleichsbilder.
- Vorschaubilder mit anderem Seitenverhältnis bekommen schwarze Ränder (`thumbSnap`).
- Hinweis für Tests in der Vorschau: Der Python-Server sendet keine Cache-Angaben. Chrome hält Skripte dann im Speicher und lädt sie auch nach einem Neuladen nicht neu. Ein neuer Tab nach dem Abmelden des Service Workers hilft.
- Offen auf dem Tablet zu prüfen: ob vier Videos gleichzeitig flüssig laufen.

## Test-App Stand 57

- Karten in der Übersicht: Name und Stichwort stehen in einer eigenen Zeile unter Nummer und Uhrzeit und brechen auf höchstens zwei Zeilen um, statt mit „…“ abgeschnitten zu werden.
- Einstellungen, Bildschirm: nur noch der Knopf „Anpassen …“, ohne „Normal | Angepasst“. Er trägt die Akzentfarbe, solange das Bild angepasst ist. „Fertig“ schaltet die Anpassung ein, außer die Werte entsprechen dem Ausgangswert (`tvIsDefault`), dann ist sie aus. Nach „Zurücksetzen“ und „Fertig“ ist also alles normal.
- Einstellungen, Videos: Beschriftung nur „Videos ohne Stern löschen“. Zwischen − und + steht klein „nach“ über der Zahl der Tage, bei „nie“ ohne „nach“. Die Regel selbst ist unverändert, Videos mit Bildern und Vergleichsbilder mit Stern bleiben.

## Test-App Stand 58, Sprachen

- Sechs Sprachen: Deutsch, Englisch, Spanisch, Portugiesisch, Französisch, Italienisch. Neue Datei `test/i18n.js`, vor allen anderen Skripten geladen und im Service Worker eingetragen.
- Die deutschen Texte sind die Schlüssel. `TR_ROWS` hält je Zeile Deutsch und die fünf Übersetzungen. `tr('Gespeichert als {0}', 'v3.1')` übersetzt und setzt Werte ein. `dc()` setzt das Dezimalzeichen, Punkt im Englischen, sonst Komma. Datumsangaben nutzen `LOCALE[lang]`.
- Feste Texte in `index.html` übersetzt `translatePage()`. Sie merkt sich zu jedem Textknoten und jeder Beschriftung den deutschen Schlüssel, ein späterer Wechsel geht wieder davon aus. Bereiche mit Namen der Nutzer tragen `data-notr` und bleiben unberührt, etwa die Karten, die Filter und die Überschrift im Videofenster.
- Texte aus dem Code laufen durch `tr()`. Bei einem Wechsel zeichnet `applyLang()` in `app.js` alle betroffenen Teile neu.
- Einstellung `settings.lang`. Beim ersten Start gilt die Sprache des Geräts, wenn sie dabei ist, sonst Englisch (`deviceLang`). Umschalten im Fenster „Einstellungen“ rechts in der Zeile der Farben (`#langBtn`), die Überschrift heißt jetzt „Farbe und Sprache“. Der Knopf zeigt die Sprache in ihrem eigenen Namen, jedes Tippen wechselt zur nächsten.
- Neue Texte immer mit `tr()` schreiben und in `TR_ROWS` mit allen Sprachen ergänzen. Die Beschriftungen vgl und v bleiben in allen Sprachen gleich.
- In der Vorschau geprüft: Nach jedem Wechsel steht kein deutscher Text mehr sichtbar, und in keiner Sprache und Größe läuft eine Beschriftung über.
- Die Übersetzungen stammen von Claude. Vor einer Veröffentlichung im Play Store sollten Muttersprachler sie prüfen, besonders Fachbegriffe wie Lot, Bildfolge und Zeitlupe.
- Offen: Der Nutzer meldete, Speichern im Video gehe erst nach Wahl eines Werkzeugs. In der Vorschau ist „Speichern“ sofort aktiv. Rückfrage an den Nutzer läuft.

## Test-App Stand 59

- Pfeile im Bildfenster: Aus der Liste „Bilder“ geöffnet blättern sie durch alle Bilder der Liste, mit deren Filter und Reihenfolge, auch über Videos und Vergleiche hinweg (`openImage(im, 'list')`, `pimg.scope`, `listImageItems`). Über „Video | Bilder“ im Videofenster geöffnet bleiben sie wie bisher bei den Bildern dieses Videos. Löschen zeigt das nächste Bild, ohne weiteres geht es zur Liste oder zum Video.
- Sterne: Jedes Bild hat seinen eigenen Stern (`im.star`). Im Bildfenster schaltet der Stern nur das Bild. Bekommt ein Bild einen Stern, bekommt auch sein Video einen. Nimmt man ihn wieder weg, bleibt der Stern des Videos. Der Filter ★ unter „Bilder“ nutzt den Stern des Bildes, Name und Stichwort kommen weiter vom Video. Alte Bilder starten ohne Stern.
- Aufbewahrung: Nur noch der Stern zählt. Ein Video ohne Stern wird nach der Frist gelöscht, mit all seinen Bildern. Die Regel aus Stand 45, nach der Bilder ihr Video schützen, entfällt. Vergleichsbilder ohne Stern werden wie bisher gelöscht.

## Test-App Stand 60, drittes Review aus Anwendersicht

- Gefunden und behoben: Mit Stand 59 schützen Bilder ihr Video nicht mehr. Beim ersten Start hätte die App deshalb alle älteren Videos ohne Stern samt Bildern gelöscht, die bis dahin sicher waren. `migrateImageStars` gibt solchen Videos einmalig einen Stern, bevor aufgeräumt wird (`settings.imgStarMig`). Gilt später auch bei der Übernahme in die normale App.
- In der Vorschau auf Englisch durchgespielt ohne Befund: Live, Betrieb mit Zeitlupe und Speichern, Videoseite aus dem Betrieb mit Bild, Übersicht, Vergleich mit drei Videos samt Abspielen und Bild, Bilder mit Pfeilen durch die Liste, Löschen in zwei Schritten, kürzere Frist mit Rückfrage, „Videos löschen …“.
- Offen zur Entscheidung: Nimmt man einem Video den Stern, obwohl eines seiner Bilder einen hat, wird es mit diesem Bild nach der Frist gelöscht.
- Offen: Rückfrage zum Speichern im Video.

## Test-App Stand 61

- Einstellungen: „01 Farbe“ und „02 Sprache“ sind zwei eigene Bereiche mit eigener Überschrift, nebeneinander in einer `.dlgRow` wie Bildschirm und Zeitlupe. Der Nutzer will keine kombinierten Einstellungen. `#langBtn` steht jetzt in `index.html`, so hoch wie die Farbkreise. Die übrigen Bereiche heißen 03 Modus, 04 Größe, 05 Bildschirm, 06 Zeitlupe, 07 Videos.

## Test-App Stand 62

- Sprachen: Vorerst nur Deutsch und Englisch wählbar (`LANGS_ON` in `i18n.js`). Spanisch, Portugiesisch, Französisch und Italienisch bleiben in `TR_ROWS` erhalten und lassen sich durch Aufnahme ihres Kürzels wieder freischalten. Wer eine abgeschaltete Sprache eingestellt hatte, bekommt beim Start die Sprache des Geräts, sonst Englisch.
- Größe: Die vier Rastpunkte sitzen genau auf der Linie des Reglers. Links vom Regler in der Akzentfarbe, unter dem Regler ausgeblendet (`renderSizeTicks`). Der Regler ist `display: block`, sonst war sein Rahmen um eine Textzeile höher und die Punkte lagen darunter.
- Erklärt, nicht geändert: Beim Ausrichten eines Videos im Vergleich wandert der Hauptregler, weil sich mit dem Versatz der gemeinsame Zeitbereich ändert. Der Nutzer hat entschieden, dass das so bleibt.

## Test-App Stand 63

- Knopf `#fCmp` oben rechts in der Übersicht: Unter „Videos“ heißt er „Vergleichen“ und startet wie bisher die Auswahl. Der Knopf zum Starten heißt jetzt „Öffnen (n)“. Unter „Bilder“ heißt er „Vergleiche“ und ist ein Filter auf Vergleichsbilder (`listFilter.cmp`), statt zu „Videos“ zu springen. Der Filter gilt auch für die Pfeile im Bildfenster und wird beim Öffnen der Analyse zurückgesetzt.

## Test-App Stand 64

- Kopfzeile im Videofenster und im Bildfenster: Die zweite Zeile mit Name und Stichwort entsteht erst ab der dritten Größe (`html[data-size="2"]` und `"3"` statt `html.big`). In der zweitkleinsten Größe bleibt alles in einer Zeile. Name und Stichwort schrumpfen bei Platzmangel bis 90 Pixel (`flex: 0 1 160px`). Geprüft bei 1280 und 1100 Pixel Breite, Deutsch und Englisch.

## Test-App Stand 65, viertes Review aus Anwendersicht und Code-Review

Gefunden und behoben:
- Im Bildfenster aus der Liste waren beide Pfeile gesperrt, wenn das offene Bild nicht mehr zum Filter passte, etwa nach dem Entfernen seines Sterns bei aktivem Filter ★. `listImageItems(keepId)` behält das offene Bild in der Reihenfolge.
- Der Filter ★ war unter „Bilder“ gesperrt, wenn es nur Vergleichsbilder und keine Videos gab.
- Beim Verlassen des Betriebs während der Zeitlupe blieb der Zeitlupenknopf intern auf „an“. `enterSettings` ruft jetzt `renderSlow`.

Ohne Befund in der Vorschau: Zeitlupe mit Verlassen und Neustart, Speichern in der Zeitlupe, Videoseite aus dem Betrieb, Schneiden, Bildfolge mit Speichern, Vergleich mit geschnittenem Video, Grenzen der gemeinsamen Zeit, Lot im Vergleichsbild, Filter „Vergleiche“. Im Code geprüft: Freigabe aller VideoFrames im Vergleich, Fallback auf Software je Video, Versatz und Bereich der gemeinsamen Zeit, Speichern der Vergleichsbilder, Sterne und Aufbewahrung samt Umstellung beim Update, Übersetzung und Neuaufbau beim Sprachwechsel.

Wichtig für die nächste Übernahme in die normale App: Neben `analysis.js`, `app.js`, `draw.js`, `native.js`, `style.css`, `index.html` und `sw.js` müssen auch die neuen Dateien `compare.js` und `i18n.js` nach `app/` kopiert werden.

## Test-App Stand 66

- Symbol der Web-App wie das Android-Symbol: weiße Kamera auf dunklem Schiefergrau `#2c333b`, Objektiv in derselben Farbe (`python icon.py test 2c333b`).
- Damit Symbol und Startbildschirm wie vom Nutzer gewünscht dieselbe Farbe haben, ist auch der Startbildschirm jetzt `#2c333b`: `#splash` in `style.css`, `background_color` im Manifest und die Farbe `splash` der Android-Variante `labtest`. Der Modus „Mittel“ bleibt `#3a434d`.
- Der Ordner `grafik/` mit Symbol als JPEG und Kamera als PNG zum Experimentieren steht in `.gitignore`.

## Test-App Stand 67

- Wiederholung: Knopf mit Unendlich-Zeichen `#pLoop` in der unteren Leiste zwischen Zeitanzeige und Geschwindigkeit, eingeschaltet in der Akzentfarbe. Gilt als Einstellung `settings.loop` für alle Videos und den Vergleich. Am Ende geht es ohne Halt am Anfang weiter, im Video ab `pFirst`, im Vergleich ab dem Anfang der gemeinsamen Zeit.
- Vergleich, gemeinsamer Anfang: Werkzeug „Start“ (`#dStart`, nur im Vergleich sichtbar). Ein Tippen macht die aktuelle Stelle zum Anfang (`cmp.startM`). Der Hauptregler beginnt dort bei 0,00 s, alles davor ist ausgeblendet, die einzelnen Regler verschwinden und die Videos werden größer. Ein weiteres Tippen hebt den Anfang auf und zeigt die Regler wieder. Ein Knopf statt zwei, auf Wunsch des Nutzers.
- Reste der alten Schleife (`.loop`) aus `style.css` entfernt.

## Test-App Stand 68

- Werkzeugleiste in Spalten: „Schneiden“ beginnt wie „Rückgängig“ und „Speichern“ eine neue Reihe (`#dCut` mit `grid-column-start: 1`). So steht es neben „Bildfolge“, „Farbe“ steht allein. Gilt in allen Größen mit zwei oder drei Spalten. Im Vergleich, wo beide fehlen, steht „Start“ neben „Farbe“.

## Test-App Stand 69

- Zeitlupe in den Einstellungen und Geschwindigkeit im Video sind je ein einziger Knopf wie die Sprache. Er zeigt den aktuellen Wert, jedes Tippen schaltet weiter. Einstellungen „06 Zeitlupe“: `#slowSet`, ½ → ¼ → ⅛ → ½ (`SLOW_STEPS`). Video und Vergleich: `#pSpeed`, 1× → ½ → ¼ → ⅛ → 1× (`SPEED_STEPS`, `renderSpeed`). Langsamer als 1× trägt der Knopf die Akzentfarbe.

## Test-App Stand 70

- Android-Symbol der Test-App: weiße Kamera auf Salbei `#8fb9ad`, der Standard-Akzentfarbe, das Objektiv ebenfalls Salbei (`python icon.py android labtest 8fb9ad ffffff`, `icon_bg`). Web-Symbol und Startbildschirm bleiben dunkles Schiefergrau.

## Test-App Stand 71

- Fehler behoben: Manchmal blieb die App nach dem Startbild auf einem dunklen Bildschirm stehen, ohne Symbol und ohne Live-Seite. Ursache: `init` in `app.js` lief nach dem ersten `await` weiter, bevor `analysis.js` und `compare.js` geladen waren. Seit Stand 58 ruft `applyLang` beim Start `renderKeep`, `renderStorage` und `renderCmpSelect` aus diesen Dateien auf. Fehlten sie noch, brach der Start mit einem Fehler ab, das Startbild verschwand nach 6 s und `#settings` blieb verborgen. In der Android-App lädt die WebView die Dateien über den Asset-Loader langsamer, dort trat es auf. `init` wartet jetzt auf `DOMContentLoaded`. Zusätzlich zeigt ein `try` mit `finally` die Live-Seite auch bei einem unerwarteten Fehler. Die normale App v3.5 ist nicht betroffen, ihr Start nutzt nur `app.js`.

## Test-App Stand 72

- Aus dem Cloud-Review (`/ultrareview`) zu Stand 71, beide als Kleinigkeit eingestuft und behoben: Die Absicherung in `init` frischt bei einem Fehler auch Texte und Kamerastatus samt Startknopf auf (`translatePage`, `renderCamInfo`, je für sich abgesichert). Die Suche nach einer neuen Version startet wieder sofort und läuft parallel zum Laden der Skripte, erst danach wartet `init` auf `DOMContentLoaded`.
- Größe hat nur noch drei Stufen: klein (0), mittel (1, Startwert), groß (2, die frühere zweitgrößte). Gespeicherte Stufe 3 gilt als groß. Unter dem Regler stehen „klein“, „mittel“ und „groß“ unter den drei Rastpunkten, die gewählte ist hervorgehoben, ein Tippen auf ein Wort wählt die Stufe (`.sizeNames`).
- Kopfzeile im Video- und Bildfenster auch bei „groß“ einzeilig. Die Spalten sind dort `minmax(200px, 1fr) auto minmax(0, max-content)`: Der Titel links behält mindestens etwas Platz, Name und Stichwort schrumpfen bis 80 Pixel. Geprüft bei 1280 und 1100 Pixel Breite.
- Die Regeln für Stufe 3 in `style.css` sind ohne Wirkung und können bei Gelegenheit entfernt werden.

## Test-App Stand 73

- Einstellungen: Die Knöpfe für Sprache und Zeitlupe sind genau so breit wie „Videos löschen …“ und stehen bündig darüber. Gemeinsame Breite in `--dlgBtnW` (190 Pixel vor dem Zoom der Größe).

## Test-App Stand 74

- Android-Symbol der Test-App: Fläche Salbei `#8fb9ad`, Kamera weiß, Objektiv dunkles Schiefergrau `#2c333b` mit weißen Zeigern. `icon.py` hat für Android dafür ein fünftes Argument für das Objektiv: `python icon.py android labtest 8fb9ad ffffff 2c333b`.

## Test-App Stand 75

- Betrieb, Sichtbarkeit auf jedem Bild: Speicherknopf, Zeitlupenknopf, Sekunden und Zeitlupen-Anzeige haben eine Kontur wie Untertitel. Ringe und Zeiger sind weiß auf einem etwas breiteren, halbdurchsichtigen dunklen Strich (`.halo`, `.handsHalo` im SVG), innen bleiben die Knöpfe durchsichtig. Die Schrift hat einen dunklen Rand (`-webkit-text-stroke` mit `paint-order: stroke fill`), die Zahl steht weiter ohne Hintergrund. Die Meldung „Gespeichert“ hat schon einen dunklen Hintergrund.

## Test-App Stand 76, neue Bildfolge

Die alte Bildfolge setzte das Bild aus Rasterfeldern von 4 × 4 Bildpunkten aus verschiedenen Bildern zusammen. Wasser, Leute und Rauschen erzeugten dabei verstreute Pixel, die Ränder waren kantig. Neu in `analysis.js` (`makeStrobe`, `composeStrobe`, `strobeDetect`, `strobeBlobs`, `strobeMorph`, `strobeBlur`):
- Erkennung auf 320 × 180. Neben den Bildern der Folge werden bis zu 24 gleichmäßig verteilte Bilder des Abschnitts verkleinert mitgenommen (`STROBE_BG_SAMPLES`).
- Hintergrund: Median je Bildpunkt und Farbe über alle diese Bilder, nach 3 × 3 Glättung.
- Je Bild bewegte Flächen: Farbabstand zum Hintergrund, Schwelle aus dem Median des Abstands (`max(48, 3 · Median + 20)`), Öffnen gegen Krümel, Schließen gegen Lücken, zusammenhängende Flächen ab 0,12 % der Bildfläche mit Mittelpunkt, Größe und mittlerer Farbe.
- Spuren: Flächen aufeinanderfolgender Bilder werden nach Abstand, Farbe und Größe demselben Gegenstand zugeordnet, Lücken bis zu drei Bildern erlaubt.
- Springer: die Spur mit der besten Wertung aus Weg vom ersten zum letzten Punkt mal Geradlinigkeit mal Vollständigkeit. Leute am Rand kommen kaum voran, Wasserflackern springt kreuz und quer.
- Zusammensetzen: erstes Bild der Folge unverändert als Grundlage, darauf der Springer aus jedem weiteren Bild mit seiner Maske, um ein Feld erweitert, hochskaliert und weichgezeichnet (`blur(3px)`, `destination-in`). Spätere Bilder liegen oben.
- Geprüft mit nachgestellten Szenen in 48 Durchläufen: drei bis vier gehende Personen, große schnelle Personen nah an der Kamera, rennende Person, Schwimmer, Wasserflackern, Rauschen, wackelnde Kamera, kleiner Springer, Springer, der zuerst still steht, Springer, der einige Bilder lang verschwindet, 3 bis 16 Bilder. Der Springer wurde in jedem Bild richtig gewählt. Rechenzeit in der Vorschau etwa 0,3 s, mit Dekodieren eines Videos von 4 s etwa 1 s.
- Grenzen: Die Kamera sollte ruhig stehen. Steht der Springer mehr als die Hälfte des Abschnitts still, gehört er zum Hintergrund. Den Abschnitt also kurz vor dem Absprung beginnen lassen.

## Test-App Stand 77

- Kopfzeile im Video-, Bild- und Vergleichsfenster: Name und Stichwort stehen ganz rechts, Reihenfolge Stern, Herunterladen, Löschen, Name, Stichwort. Fehler behoben: Im Vergleich und bei Vergleichsbildern ist „Video | Bilder“ ausgeblendet, die rechte Gruppe rutschte dadurch in die mittlere Spalte des Rasters und stand fast 400 Pixel vom rechten Rand. `.pR` hat jetzt `grid-column: 3`.
- Android-Symbol der Test-App mit umgekehrten Farben: außen dunkles Schiefergrau `#2c333b`, Kamera weiß, Objektiv Salbei `#8fb9ad` mit dunklen Zeigern. `icon.py` hat dafür ein sechstes Argument für die Zeiger: `python icon.py android labtest 2c333b ffffff 8fb9ad 2c333b`.

## Test-App Stand 78

- Neues Symbol, Variante H4.5 aus den Vorschlägen im Ordner `grafik/`: dunkle Fläche `#2c333b`, Kamera helles Salbei `#b9d6cd`, Uhr dunkel, Zeiger Bernstein `#f5a623`, Objektiv mittel (Radius 86 statt 96), Zeiger lang (0,72 und 0,5 des Radius). Gilt für das Android-Symbol und das Symbol der Web-App der Test-App, damit auch für das Startbild in der App. `icon.py` kennt dafür Optionen `cam=`, `hands=`, `R=`, `mf=`, `hf=`, die Befehle stehen im Kopf der Datei.

## Test-App Stand 79

- Oben links vor „LAG LAB“ steht statt der kleinen gezeichneten Uhr (`.glyph`) das Symbol der App als kleines abgerundetes Quadrat (`.mark .logo`, `icon-192.png`, 28 Pixel vor dem Zoom der Größe). Mit seiner eigenen dunklen Fläche ist es in jedem Modus gut zu sehen.

## Test-App Stand 80

Der Speicherknopf hat jetzt einen weißen Punkt in der Mitte, wie ein Aufnahmeknopf. Der Punkt hat einen dunklen Rand wie Ring und Zeiger und bleibt so auf hellem und dunklem Bild sichtbar. Nach dem Speichern wird er für 5 Sekunden grau wie der Ring. Sonst ist alles gleich.

## Normale App v3.6, übernommen aus Test-App Stand 80

- Alles aus Test-App Stand 55 bis 80, darunter Vergleiche (`compare.js`), Sprachwahl (`i18n.js`), eigene Sterne für Bilder, neue Bildfolge, Kontur für Knöpfe im Betrieb, Symbol H4.5 und Punkt im Speicherknopf.
- Bei der Übernahme kopiert werden `analysis.js`, `app.js`, `compare.js`, `draw.js`, `i18n.js`, `native.js`, `style.css`, `index.html` und `sw.js`. Angepasst werden danach Versionsnummer mit „v“, Speicherort `turmdelay.settings.v1` ohne Übernahme aus einer anderen App, Videoablage `lagtime`, Titel „LagLab“ ohne Schild „Test“ und Service Worker `turm-delay-` ohne Löschen von `laglab-mp-`.
- Symbole: `python icon.py app 2c333b cam=b9d6cd hands=f5a623 R=86 mf=0.72 hf=0.5` und `python icon.py android normal 2c333b b9d6cd 2c333b f5a623 R=86 mf=0.72 hf=0.5`. Startbild und Manifest `#2c333b`.
- versionCode 306, Service Worker `turm-delay-r15`, Git-Tag `v3.6`.

## Normale App v1.3, übernommen aus Test-App Stand 94

- Kamera und USB bei nur einer Kamera, Pfeile oben links klickbar und in der Richtung der Übersicht, Bogen mit zwei Griffen, Untertitel „Bewegungsanalyse“, Symbol mit Blitzfenster (Web und Android, Befehle wie bei Stand 94 mit `app` und `android normal`). versionCode 1103, Service Worker `turm-delay-r20`, Git-Tag `v1.3`.

## Normale App v1.2, übernommen aus Test-App Stand 89

- LAG LAB mit orangem LAB, Anpassen im Fenster der Einstellungen, Kopfzeile im Player mit mittigem Titel, Bogen statt Zoom, Start im Vergleich unten in der Werkzeugleiste, Raster statt Bildfolge, dazu die Fehlerbehebungen aus Stand 88. versionCode 1102, Service Worker `turm-delay-r19`, Git-Tag `v1.2`.

## Normale App v1.1, übernommen aus Test-App Stand 85

- Umschalter Live und Analyse mittig, geöffnete Seite in Akzentfarbe, Name oben links enger, „Video | Bilder“ links neben „‹ Übersicht“. Android-Name jetzt „Lag Lab“ mit Leerzeichen. versionCode 1101, Service Worker `turm-delay-r18`, Git-Tag `v1.1`.

## Normale App v1, neue Zählung

- Die normale App heißt jetzt v1 statt v3.7, der Inhalt ist gleich mit v3.7 und Test-App Stand 81. Weiter geht es mit v1.1, v1.2 und so fort.
- Damit Android die neue Zählung über der alten installiert, rechnet `webCode` in `android/laglab/build.gradle` für die normale App 1000 dazu. v1 hat den versionCode 1100, v1.1 den Code 1101. Bis v3.7 galt 307.
- Service Worker `turm-delay-r17`. Git-Tag `v1.0`, weil es den alten lokalen Tag `v1` schon gibt.

## Normale App v3.7, übernommen aus Test-App Stand 81

- Kopfzeile rechts, Werkzeug „Waage“, Filter „Vergleiche“ unter „Bilder“ und Knopf zum Zurücksetzen der Filter. Übernahme wie bei v3.6. versionCode 307, Service Worker `turm-delay-r16`, Git-Tag `v3.7`.

## Test-App Stand 81

- Kopfzeilen: Links stehen nur Logo oder „‹ Übersicht“ mit dem Titel. Alles andere steht rechts, auch „Live | Analyse“ und „Video | Bilder“. Der Titel im Player hat 10 px mehr Abstand zum Zurück-Knopf.
- Neues Werkzeug „Waage“ (`data-tool="level"`), eine waagerechte gestrichelte Linie über die ganze Bildbreite, im Vergleich über die Breite des Feldes. In Spalten stehen Lot und Waage in einer Reihe, Farbe rückt dafür per CSS `order` neben Winkel.
- Übersicht: Unter „Bilder“ ist „Vergleiche“ ein eigener Filterknopf `#fCmpF` direkt hinter dem Stern, ausgegraut ohne Vergleichsbild. „Vergleichen“ `#fCmp` gibt es nur unter „Videos“, weiter rechts.
- Neuer Knopf `#fReset` mit Kreuz direkt rechts neben „Stichwort“. Er setzt Stern, Name, Stichwort und Vergleiche zurück und ist ausgegraut, solange kein Filter gewählt ist.

## Test-App Stand 82

- „Live | Analyse“ steht wieder genau in der Mitte der Kopfzeile.
- Alle Umschalter zwischen Seiten (`.tabs`, also „Live | Analyse“, „Videos | Bilder“ und „Video | Bilder“) zeigen die geöffnete Seite in der Akzentfarbe mit dunkler Schrift wie der Startknopf. Die andere Seite bleibt gedämpft grau. Die Wahlknöpfe in den Einstellungen (`.seg`) sind unverändert.

## Test-App Stand 83

- Name oben links enger: „LAG“ und „LAB“ stehen wie auf dem Startbild nur durch einen schmalen Abstand getrennt. Vorher kam der Abstand von 10 px zwischen Symbol und Text auch zwischen die beiden Wörter, weil `.mark` ein Flex-Container mit `gap` ist. `.mark b` gleicht das mit `margin-left: calc(0.06em - 10px)` aus.

## Test-App Stand 84

- Name der Android-Test-App unter dem Symbol jetzt „Lag Lab Test“ mit Leerzeichen (`app_name` in `android/laglab/build.gradle`). Die normale App heißt in Android noch „LagLab“, bis sie übernommen wird.

## Test-App Stand 85

- Kopfzeile im Player: „Video | Bilder“ steht jetzt links direkt neben „‹ Übersicht“, rechts daneben der Titel. Alle drei im Bereich `.pL` mit demselben Abstand von 8 px wie die Knöpfe rechts, der Extraabstand vor dem Titel ist weg. Die Kopfzeile hat nur noch zwei Spalten, links mindestens so breit wie Zurück und Umschalter, nur der Titel wird gekürzt.

## Test-App Stand 86

- Name: „LAG LAB“ mit schmalem Leerzeichen, oben links und auf dem Startbild. LAB in Bernstein `--lab` wie die Uhrzeiger im Symbol, im Hellmodus dunkler. Das Schild „TEST“ ist nur noch Schrift in der Textfarbe, ohne orange Fläche.
- „Anpassen“ unter Bildschirm öffnet sich wie der Farbwähler im Fenster der Einstellungen (`#tvCal` neben `#uiPick`). Das große Kamerabild ist weg. Die App selbst schrumpft beim Verschieben sofort in den Rahmen, ein Rand in der Akzentfarbe (`html.tvcal #app::after`) zeigt die Ecken. `applyTv` zeigt den Rahmen, solange `tvBefore` gesetzt ist. `tvBefore` steht deshalb vor `applyTv`.
- Player: Titel mittig zwischen „Video | Bilder“ und Stern. Rechts von links nach rechts Stern, Name, Stichwort, Herunterladen, Löschen.
- Werkzeug „Zoom“ entfernt. Beim Öffnen ist kein Werkzeug gewählt, ein Finger verschiebt dann. Zwei Finger zoomen in jedem Werkzeug. „1:1“ bleibt.
- Neues Werkzeug „Bogen“ (`arc`) unter „Linie“: erst eine Linie ziehen, beim Loslassen kommt ein Griff in die Mitte. Zieht man ihn, wird es ein Kreisbogen durch beide Enden und den Griff.

## Test-App Stand 87

- Vergleich: Die Werkzeugleiste reicht bis zum Hauptregler. Die Regler der einzelnen Videos (`#cmpAlign`) stehen nur noch unter dem Bild. Rechts daneben steht unten in der Werkzeugleiste „Start“ (`#cmpStart`), die Linie über den Reglern läuft durch. Ist „Start“ gesetzt, verschwinden die Regler, die Videos werden größer, „Start“ bleibt unten unter seiner Linie. Nochmal tippen holt die Regler mit ihrer Ausrichtung zurück.
- `#pMain` ist dafür ein Raster mit zwei Spalten und zwei Reihen. Die Breite der Werkzeugleiste steht jetzt als `width` statt `flex-basis` bei `#pTools`.

## Test-App Stand 88

Behebt Punkte aus der Prüfung von Stand 86 und 87.
- „Anpassen“: Das Fenster `#uiDlg` wandert beim Öffnen von Anpassen an das Ende von `body` und beim Schließen zurück als letztes Element in `#app`. So bleibt es in der Bildschirmmitte stehen, während sich die App dahinter verschiebt. Vorher lag es in `#app`, und der Regler „Links, rechts“ lief beim Ziehen vor dem Finger weg (ein Zug nach rechts ergab −6,5 %).
- Eine gerade geänderte Frist bei „Videos ohne Stern löschen“ wird vor dem Öffnen von Anpassen geprüft (`checkKeep`). Kommt dazu die Rückfrage, bleibt Anpassen zu. Vorher konnten Rückfrage und Anpassen gleichzeitig im Fenster stehen.
- Bogen: Liegt der mittlere Griff weniger als einen Bildschirmpunkt neben der Geraden, wird eine gerade Linie vom ersten bis zum letzten der drei Punkte gezeichnet. Vorher entstand bei fast geraden Lagen ein riesiger Kreis, oder der Griff lag neben der Linie.
- Startbild nutzt für LAB dieselbe Farbe `--lab` wie oben links.
- LAG und LAB stehen oben links in einem gemeinsamen `span`, der Abstand ist nur noch `margin-left: 0.25em` ohne Ausgleich der Lücke von `.mark`. Optisch gleich wie vorher.
- Ein Tippen neben das Fenster verwirft Anpassen weiter ohne Nachfrage, das ist so gewollt.

## Test-App Stand 89

- Neues Werkzeug „Raster“ (`#dGrid`) an der Stelle der Bildfolge. Es schaltet dezente Linien in quadratischen Feldern ein und aus, zwölf Felder über die Breite, eine Linie läuft genau durch die Mitte. Im Vergleich hat jedes Feld sein eigenes Raster. Gezeichnet in `drawGrid` in `draw.js` vor den Formen, nur wenn `renderDrawing` mit Griffen läuft. Beim Speichern bleibt das Raster deshalb weg. Der Zustand steht in `settings.grid` und bleibt über Videos und Neustarts erhalten.
- „Bildfolge“ (`#dStrobe`) ist per CSS ausgeblendet. Der ganze Code dazu bleibt, für eine spätere Rückkehr reicht es, die Regel `#dStrobe { display: none; }` zu entfernen.

## Test-App Stand 90

- Hat das Gerät nur eine Kamera, etwa ein Laptop, steht unter „02 Kamera“ nur „Kamera | USB“ statt „Rückseite | Vorderseite | USB“. `countCams` in `app.js` zählt die Kameras nach der Freigabe und bei `devicechange`. „Kamera“ steht intern für die Rückseite, eine gewählte Vorderseite wird dabei auf die Rückseite gesetzt. Die Anzeige im Betrieb heißt dann auch „Kamera“.
- „USB“ nimmt bei nur einer Kamera nicht mehr diese eingebaute Kamera, sondern meldet, dass keine USB-Kamera da ist.

## Test-App Stand 91

- Fehler behoben: Die Pfeile ‹ › oben links im Player reagierten bei echten Klicks und Berührungen nicht. Die Bildfläche `#pStage` fing im `pointerdown` jede Berührung ab und setzte die Zeigererfassung auf sich, dadurch kam der Klick nie beim Pfeil an. Der Handler in `draw.js` lässt Berührungen auf `.clipNav` jetzt durch. Bei früheren Tests wurden die Pfeile per Skript ausgelöst, deshalb fiel es nicht auf.
- Die Pfeile folgen jetzt der Reihenfolge der Übersicht: › zur nächsten Karte rechts oder in der nächsten Reihe, also bei Videos zum älteren Video. Vorher ging › zum neueren Video. `clipNeighbor` nutzt dafür `sortItems` wie die Liste. Bei Bildern gilt immer die Reihenfolge der Liste „Bilder“, auch wenn das Bild über „Video | Bilder“ geöffnet wurde. Nur beim Löschen eines so geöffneten Bildes geht es zum nächsten Bild desselben Videos (`sameClipImage`).

## Test-App Stand 92

- Bogen mit zwei Griffen: Beim Loslassen der Linie kommen zwei Griffe auf ein und zwei Drittel der Strecke. Die Kurve läuft als glatte Bezierkurve dritten Grades durch Anfang, beide Griffe und Ende. Wo sie die Griffe trifft, folgt aus den Abständen der Punkte, begrenzt auf 0,1 bis 0,9. So lässt sich eine schiefe Flugbahn nachbilden. Neue Bögen haben vier Punkte `[a, b, p1, p2]`.
- Bögen mit drei Punkten aus Stand 86 bis 91, etwa in gespeicherten Bildern, zeichnet `drawShape` weiter als Kreisbogen.

## Test-App Stand 93

- Untertitel „Bewegungsanalyse“, englisch „Motion Analysis“. Oben links in einer zweiten Zeile unter LAG LAB (`.markTxt` mit `.markSub`, klein, gesperrt, gedämpft), das Symbol ist dafür 32 px hoch. Auf dem Startbild mittig unter dem Namen (`.splashSub`). Übersetzung in `i18n.js`.
- Achtung: Die Klasse `.sub` ist schon für Beschriftungen in den Einstellungen vergeben (`flex: 0 0 72px`), deshalb heißt der Untertitel `.markSub`.

## Test-App Stand 94

- Symbol mit Blitzfenster: ein dunkles, leicht abgerundetes Rechteck mittig im Höcker der Kamera. `icon.py` hat dafür die Option `flash=x0,y0,x1,y1,Radius,Farbe`. Befehle:
  - `python icon.py test 2c333b cam=b9d6cd hands=f5a623 R=86 mf=0.72 hf=0.5 flash=206,136,270,166,8,2c333b`
  - `python icon.py android labtest 2c333b b9d6cd 2c333b f5a623 R=86 mf=0.72 hf=0.5 flash=206,136,270,166,8,2c333b`
- Das Symbol oben links in der App und auf dem Startbild nutzt dieselben Dateien `icon-192.png` und `icon-512.png`.

## Test-App Stand 95

- Neues Werkzeug „Kreis“ neben „Winkel“, etwa um Gelenke einzukreisen. Der Finger setzt die Mitte, Ziehen bestimmt die Größe. Der Kreis hat zwei Griffe. Der Griff in der Mitte verschiebt den ganzen Kreis, der Griff am Rand ändert die Größe. Gespeichert als `{ type: 'circle', pts: [Mitte, Randpunkt] }` in `draw.js`.
- Reihenfolge der Werkzeugleiste jetzt 1:1, Stift, Linie, Bogen, Winkel, Kreis, Lot, Waage, Raster, Farbe, Schneiden. Farbe steht damit neben Raster. In zwei und drei Spalten beginnen Lot und Raster je eine neue Reihe (`grid-column-start: 1`). Die früheren `order`-Regeln in `style.css` sind entfallen, die Reihenfolge kommt nur noch aus `index.html`.

## Test-App Stand 96

- Pfeile ‹ › bei Bildern. Wurde das Bild über „Video | Bilder“ im Player geöffnet, bleiben die Pfeile bei den Bildern dieses Videos und laufen im Kreis. Nach dem letzten Bild kommt mit › wieder das erste, vor dem ersten mit ‹ das letzte. Aus der Übersicht „Bilder“ geöffnet gehen sie wie bisher durch alle Bilder der Liste mit deren Filter und enden am Rand. Unterschieden wird über `pimg.scope` (`'list'`) in `imageNeighbor` in `analysis.js`. Vergleichsbilder folgen weiter der Liste.
- Eine Anzeige „2 von 5“ war im Gespräch und ist auf Wunsch des Nutzers entfallen.

## Test-App Stand 97

- Neue Namen. Videos heißen nur noch mit Zahl, etwa `4`, ihre Bilder `4.5`. Vergleichsbilder heißen `vs3.1` statt `vgl3.1`. „vs“ versteht man ohne Übersetzung in allen Sprachen. Buchstaben vor Videos und Bildern wollte der Nutzer ausdrücklich nicht mehr. Das gilt für Karten, Titel, Meldungen und Dateinamen, etwa `2026-10-02_3_Teo_Kopfsprung.mp4`. Gespeichert sind nur die Nummern (`nr`, `n`), alte Daten zeigen die neuen Namen deshalb von selbst. `clipLabel` und `imageLabel` in `analysis.js`.
- Die Nummern zählen weiter pro Tag. Ein Vergleich gehört zu dem Tag, an dem sein erstes Bild gespeichert wurde, auch wenn er Videos verschiedener Tage zeigt. Deshalb wurde ein Name aus den beteiligten Videos (`2+5`) verworfen.
- Im Vergleich steht über jedem Regler nur noch die Nummer des Videos, wie oben links im Feld. Vorher stand dort die Feldnummer davor (`1 · v4`). Ohne „v“ hätte sich `1 · 4` wie zwei Nummern gelesen.

## Test-App Stand 98

- Der Startbildschirm steht ab dem Öffnen immer 3,3 Sekunden (`SPLASH_MS = 3300` in `app.js`). Nach der Übernahme einer neuen Version kann der erste Start länger dauern, weil die Seite neu lädt.
- Einstellungen: alle Knöpfe 46 px hoch (mal `--z`), so hoch wie „Videos | Bilder“ in der Analyse. Bei Umschaltungen wie „03 Modus“ hat der ganze Rahmen diese Höhe. Sprache und Zeitlupe wachsen dafür nicht mehr in die Höhe der Farbkreise (`flex: 0 0 auto`). Die Regeln stehen am Ende von `style.css` unter `#uiMain`, damit sie die Regeln für Größen und niedrige Rahmen überstimmen. Die Farbkreise sind unverändert.
- Player: „‹ Übersicht“ und „Video | Bilder“ links in der Kopfzeile sind jetzt 44 px hoch wie die Knöpfe und Felder rechts.
- Neue Zeichenfarbe Grün `#3ee05a`. Reihenfolge beim Tippen auf „Farbe“: Gelb, Rot, Grün, Türkis, Weiß.
- „Anpassen“ beginnt beim ersten Öffnen und nach „Zurücksetzen“ mit 100 % Breite und 100 % Höhe. Vorher war die Höhe auf 16:9 gerechnet, auf dem Tablet 90 %. Schon gespeicherte Werte bleiben.
- Filter unter „Bilder“: aus „Vergleiche“ wird ein kleiner runder Knopf „vs“ zwischen Stichwort und ×.

## Test-App Stand 99

- Neuer Filter „Zeit“ in der Übersicht zwischen „Stichwort“ und „vs“, unter „Videos“ und „Bilder“. Er zeigt nur Monate, in denen es zu den übrigen Filtern (Stern, Name, Stichwort, vs) Einträge gibt, neueste zuerst, nach Jahren gruppiert (`optgroup`), etwa „Oktober 2025 (8)“. Ein gewählter Monat bleibt stehen, auch wenn er durch einen anderen Filter leer wird. Das × setzt ihn zurück, jedes Öffnen der Analyse beginnt ohne ihn. `listFilter.month` als „2025-10“, `inMonth` und `fillMonths` in `analysis.js`. Bilder zählen nach dem Tag ihres Videos oder Vergleichs.
- Grund: Über Jahre wird die Übersicht lang, und man will alte Sprünge mit neuen vergleichen. Die Auswahl für „Vergleichen“ bleibt beim Wechsel des Monats erhalten. So wählt man das heutige Video, stellt den alten Monat ein und wählt das alte dazu. Monate statt Wochen, weil Videos ohne Stern gelöscht werden und mit Stern etwa 15 pro Woche anfallen.

## Test-App Stand 100

- Hilfe. Im Fenster Einstellungen steht rechts neben der Überschrift ein rundes „i“ (`#uiHelp`). Es öffnet ein großes Fenster `#help` mit Verzeichnis links und Text rechts, neun Kapitel in der Reihenfolge der Benutzung. Schließen über × oder die Zurück-Geste (Verlaufseintrag `help`, zuerst geprüft im `popstate` in `analysis.js`), danach sind die Einstellungen wieder offen.
- Der Text steht in `help.js` (`HELP_HTML`), vorerst nur Deutsch und mit `data-notr` von der Übersetzung ausgenommen. Zielgruppe ist, wer filmt, mal Trainer, mal Springer. Symbole kommen zur Laufzeit aus den echten Knöpfen (`<i data-ico="Selektor">`), damit sie gleich aussehen.
- Sechs Bildschirmfotos in `hilfe/` (Live, Betrieb, Analyse, Player, Vergleich, Einstellungen), je etwa 50 KB, auch im Offline-Speicher (`FILES` in `sw.js`). Sie entstehen mit `LagLab/hilfe_fotos.mjs`. Das Skript startet Chrome ohne Fenster, spielt eine künstliche Kamera mit einem springenden Strichmännchen ein, speichert drei Videos und nimmt die Ansichten auf. Nach größeren Änderungen der Oberfläche neu aufnehmen: Vorschau der Test-App starten, dann `node hilfe_fotos.mjs ../LagLab-Test/hilfe`.
- Die Fotos zeigen „TEST“ und „Stand 100“. Vor einer Übernahme in die normale App sollten sie mit der normalen App neu entstehen, das Skript braucht dafür Port und Speicherschlüssel der normalen App.
- `android/laglab/build.gradle` nimmt `hilfe/*.jpg` in die APK auf, `uebernahme.py` kopiert `help.js` und den Ordner `hilfe`.

## Test-App Stand 101

- Rückmeldung im Betrieb. Wurde Speichern oder Zeitlupe eine Sekunde gehalten, vibriert das Gerät 40 ms und der Knopf leuchtet 350 ms groß in hellerer Akzentfarbe auf (`confirmPress` in `app.js`, Klasse `flash`, 60 % Akzent mit Weiß). Der Knopf bleibt dabei auf der Größe beim Halten und schrumpft erst danach. Die Meldung „Gespeichert · 1“ entfällt, Fehlermeldungen wie „Puffer füllt sich noch“ bleiben. Ob das Galaxy Tab Active Pro einen Vibrationsmotor hat, ist noch nicht geprüft. Ohne Motor bleibt nur das Aufleuchten.
- Im Browser über `navigator.vibrate`, in der Android-App über die Brücke (`native.buzz`, Nachricht `buzz`, `MainActivity.buzz` mit `VibrationEffect`). Dafür hat die Android-App neu die Erlaubnis `VIBRATE`, für die Android nicht nachfragt. Das gilt auch für die normale App beim nächsten Bau.
- Eigene Auswahllisten für Name, Stichwort und Zeit. Android zeichnet die Liste eines `select` selbst und immer weiß. Jetzt zeigt ein Knopf `.dd` den gewählten Wert, ein Tippen öffnet `.ddPop` direkt darunter im Grau der App, mit Jahresüberschriften bei „Zeit“ und dem gewählten Eintrag in der Akzentfarbe. Das `select` bleibt unsichtbar als Ablage der Werte und meldet `change` wie bisher, `syncDd` hält den Knopf aktuell. Ein Tippen daneben schließt die Liste.

## Test-App Stand 102

- Der Filter „Zeit“ ist entfallen. Ersetzt wird er durch eine Ansicht. Ein Knopf `#fView` rechts neben „Videos | Bilder“ schaltet bei jedem Tippen weiter: Tage, Wochen, Monate, Jahre. Beim Öffnen der Analyse steht er immer auf Tage, unter „Bilder“ gilt dasselbe.
- Überschriften mit Anzahl rechts. Tage: „Heute“, „Gestern“, sonst „Montag, 05.10.“ ohne Jahreszahl, so wollte es der Nutzer ausdrücklich. Wochen: „Diese Woche“, „Letzte Woche“, sonst „KW 39 · 21.–27.09.“ (ISO-Woche). Monate: „Dieser Monat“, „Letzter Monat“, sonst „August 2026“. Jahre: „Dieses Jahr“, „Letztes Jahr“, sonst „2024“.
- Kacheln werden von Stufe zu Stufe kleiner (`#aGrid[data-view]` in `style.css`). Wochen mit Nummer und Stern, Monate nur Vorschaubild mit kleinem Stern, Jahre eine Kachel je Monat mit Anzahl (`monthTile`).
- Ein Tippen auf eine Kachel führt eine Stufe tiefer zu genau diesem Eintrag (`drillTo`): Jahre zu Monate, Monate zu Wochen, Wochen zu Tage. Erst unter Tage öffnet sich das Video. Jeder Sprung legt einen Verlaufseintrag an, die Zurück-Geste führt eine Stufe hinauf an dieselbe Scrollstelle (`viewStack`, `viewBack`). Bei aktiver Auswahl für „Vergleichen“ wählt ein Tippen aus, außer bei den Monatskacheln unter Jahre.
- Filterzeile: Ansicht links, Stern, Name, Stichwort, vs und × in `.fMid` mittig bis „Vergleichen“. Unter „Bilder“ bleibt „Vergleichen“ unsichtbar mit Platz (`.invis`), damit die Filter nicht springen.
- Hilfe angepasst, das Foto `hilfe/analyse.jpg` neu aufgenommen.

## Test-App Stand 103

- Das Aufleuchten nach dem Halten von Speichern und Zeitlupe war dem Nutzer zu kräftig. Jetzt leuchtet nur noch der dünne Fortschrittsring kurz in hellerer Akzentfarbe auf, die Fläche bleibt wie beim Halten. Vibration unverändert.

## Test-App Stand 104

- Der Knopf der Ansicht steht jetzt als Erstes in der Filtergruppe `.fMid`, links vor dem Stern. Die ganze Gruppe steht mittig zwischen „Videos | Bilder“ und „Vergleichen“.
- „Tage“ und „Vergleichen“ sind im Grau der nicht gewählten Reiter wie „Bilder“ oder „Live“ geschrieben (`var(--mut)`). „Vergleichen“ wird bei aktiver Auswahl weiter in der Akzentfarbe gezeigt.
- Hilfe-Fotos neu aufgenommen.

## Neue Version veröffentlichen

1. `APP_VERSION` in `app/app.js` oder `test/app.js` und `VERSION` im zugehörigen `sw.js` erhöhen. Das ist bei jeder Änderung Pflicht, sonst bleibt das Tablet auf der alten Version.
2. Committen, mit der Attribution `Co-Authored-By` aus den Systemhinweisen.
3. Der Nutzer klickt in GitHub Desktop auf „Push origin“.
4. Auf dem Tablet die App einmal öffnen. Die neue Version wird dabei im Hintergrund geladen. Beim nächsten Öffnen ist sie aktiv. Die Versionsnummer steht oben rechts im Einstellungsbildschirm.

## Aktueller Funktionsumfang

- Der Name ist „LagLab“ ohne Leerzeichen, für die Test-App „LagLab Test“. In der App steht oben links in Großbuchstaben LAG LAB mit Leerzeichen, „LAG“ grau und „LAB“ weiß und fett.

- Beim Öffnen erscheint immer der Einstellungsbildschirm.
- Die Vorschau ist gestaltet wie ein Kamerasucher, mit Eckmarken und Drittellinien. Unten stehen Auflösung, Belichtung, Fokus und die gemessene neben der eingestellten Bildrate.
- 01 Verzögerung von 1 bis 30 Sekunden, mit großer Anzeige, Plus- und Minustasten und Skala.
- 02 Kamera, Rückseite oder Vorderseite.
- 03 Zoom, bei beiden Kameras von 1 bis 8.
- 04 Belichtung, Auto oder Manuell. Bei Manuell gibt es einen Helligkeitsregler von stockdunkel bis weiß. Er verteilt die Helligkeit auf Zeit und ISO. Zuerst steigt die Zeit bis 1/250 s, dann der ISO-Wert, danach wieder die Zeit.
- 05 Fokus, Auto oder Manuell. Bei Manuell gibt es einen Regler von nah bis fern, linear über den gemeldeten Wert von `focusDistance`. Bei der Vorderseite ist der Bereich ausgeblendet.
- Zoom, Belichtung und Fokus werden pro Kamera gespeichert.
- Fest eingestellt sind 1080p, 30 Bilder pro Sekunde und keine Spiegelung. Schalter dafür wurden bewusst entfernt.
- Im Betrieb ist das Bild im Format 16:9 über die volle Breite. Oben rechts steht die Anzeige, zum Beispiel „20 s“. Weiß bedeutet normal. Gelb bedeutet Überlast oder weniger Bilder als eingestellt. Rot bedeutet Kameraausfall, dann läuft das Neuverbinden. Beim Start zeigt die Anzeige einen Countdown, der erst mit dem ersten Kamerabild beginnt.
- 1 Sekunde Drücken an beliebiger Stelle führt zurück in die Einstellungen, mit einem Fortschrittskreis in der Akzentfarbe. Seit Version 23 und Stand 20 ist es 1 Sekunde, vorher 3 und dann 2.
- Technik: Kamerabilder werden über `MediaStreamTrackProcessor` gelesen und mit `VideoEncoder` in H.264 per Hardware kodiert. Etwa jede Sekunde gibt es einen Keyframe. Ein Ringpuffer hält die Daten, `VideoDecoder` zeichnet sie auf ein Canvas. Wake Lock hält den Bildschirm an.
- Überwachung: Kommen länger als 2 Sekunden keine Bilder, gilt die Kamera als ausgefallen, und die App verbindet alle 3 Sekunden neu. Während eines Kamerastarts und bis 3 Sekunden nach jedem Kamerabefehl ruht die Überwachung. Jeder Kamerabefehl hat eine Zeitgrenze von 3 Sekunden.

## Android

Am 02.10.2026 ergab der Test mit einer Logitech C920 am USB-C-Hub, dass Chrome die Webcam nicht sieht. Android 11 auf dem Samsung-Tablet meldet USB-Kameras nicht als normale Kamera. WebUSB sperrt die Geräteklasse Video. Eine Android-App wie „USB Kamera“ aus dem Play Store kann die Webcam dagegen direkt über USB öffnen. Deshalb ist der Plan, LagLab in eine Android-App einzupacken.

Vereinbarter Ablauf: Erst der Machbarkeitstest, dann eine Android-Test-App „LagLab Test“ aus dem Code in `test/`, dann nach Freigabe die normale Android-App „LagLab“ aus `app/`. Beide mit eigener Paketkennung, also nebeneinander installierbar mit getrennten Daten. Die Web-Versionen laufen weiter. Play Store ist für später angedacht.

Machbarkeitstest `android/usbtest`, Paket `de.laglab.usbtest`, Java, Bibliothek `com.herohan:UVCAndroid:1.0.13` von Maven Central mit fertigen nativen Bibliotheken.
- `MainActivity` öffnet die Webcam über `USBMonitor` und `UVCCamera` in einem eigenen `HandlerThread`. Bevorzugt MJPEG 1920x1080 mit 30 B/s. Die Bibliothek startet die Vorschau nur mit einer Fläche, daher liegt unten rechts ein kleines `SurfaceView` als Direktbild.
- Die Bilder kommen als NV12 über `IFrameCallback`, werden in `MediaCodec` zu H.264 kodiert, jedes Schlüsselbild bekommt SPS und PPS vorangestellt.
- Die H.264-Stücke gehen per `addWebMessageListener` als ArrayBuffer an `assets/index.html`, geladen über `WebViewAssetLoader` von `https://appassets.androidplatform.net`. Die Seite dekodiert mit `VideoDecoder` und misst Bildraten und Verzögerung.
- Bauen auf dem PC mit Android Studio, JDK aus `C:\Program Files\Android\Android Studio\jbr`, Gradle 9.0 über den Wrapper, AGP 8.13.2: `JAVA_HOME=... ./gradlew :usbtest:assembleDebug` im Ordner `android`, danach die APK nach `apk/laglab-usbtest.apk` kopieren. Bisher mit dem Debug-Schlüssel signiert.
- In der Vorschau getestet ist nur die Webseite mit nachgestelltem Kamerastrom. Auf dem PC gibt es kein Android-Abbild für den Emulator.
- Ergebnis Fassung 1 am 02.10.2026 auf dem Tablet: Webcam öffnet über USB, MJPEG 1920x1080 kommt als H.264 in der Webseite an, Verzögerung 21 ms. Aber nur 14 B/s schon von der Kamera, Umwandlung 26 ms je Bild. Encoder `OMX.qcom.video.encoder.avc`. Die C920 meldet sich als 046d:08e5 und bietet kein H.264, nur YUV und MJPEG.
- Fassung 2 hat Schalter für 1080p und 720p und für die Belichtungspriorität der Kamera (UVC AE Priority, 0 hält die Bildrate). Dazu eine schnelle Zeilenkopie, wenn der Encoder NV12 erwartet. Ziel ist zu klären, ob Licht oder Rechenleistung die Bildrate begrenzt.
- Ergebnis: Im hellen Licht liefert die C920 etwa 30 B/s in 1080p. Die 14 B/s kamen vom schwachen Licht im Wohnzimmer, nicht von der Rechenleistung. Der Machbarkeitstest gilt damit als bestanden. Nächster Schritt ist die Android-Test-App.

### Android-App LagLab

Modul `android/laglab`, Paket `de.laglab`, zwei Varianten. Die Namen dürfen nicht mit „test“ beginnen, daher `labtest` und `normal`.
- `labtest`: Paket `de.laglab.test`, Name „LagLab Test“, Symbol und Farbe orange, Web-Dateien direkt aus `test/` als Assets. Bauen mit `./gradlew :laglab:assembleLabtestRelease`, dann `laglab/build/outputs/apk/labtest/release/laglab-labtest-release.apk` nach `apk/laglab-test.apk` kopieren.
- `normal`: Paket `de.laglab.app`, Name „LagLab“, blaugrau, Web-Dateien aus `app/`. Wird erst nach einer Übernahme gebaut, nach `apk/laglab.apk`.
- Versionsnummer liest Gradle aus `APP_VERSION` der jeweiligen `app.js`. In der Android-App zeigt die Web-App „Stand 12 · Android“.
- Schlüssel: `C:\Users\Hilde\LagLab-Schluessel\laglab-release.jks`, Alias `laglab`, Passwort in `LIESMICH.txt` daneben und in `~/.gradle/gradle.properties` (`LAGLAB_KEYSTORE` und so fort). Liegt bewusst nicht im Repository. Der Nutzer soll den Ordner sichern.
- `MainActivity`: WebView lädt `https://appassets.androidplatform.net/app/index.html` über `WebViewAssetLoader`. Vollbild ohne Systemleisten, Bildschirm bleibt an, Querformat. Kamera-Berechtigung beim Start, `onPermissionRequest` gibt getUserMedia frei. Zurück-Geste geht in der WebView zurück. Brücke `laglab` per `addWebMessageListener`.
- `UsbCam`: wie im Machbarkeitstest, aber nur auf Anforderung der Web-App. Belichtungspriorität fest 0, also 30 B/s auch bei wenig Licht. 12 Mbit/s, weil die Web-App noch einmal kodiert. Eine 2x2-Pixel-SurfaceView hinter der WebView ist die Pflichtfläche der Bibliothek. Im Hintergrund ruht die Kamera und meldet „lost“.
- Manifest mit `USB_DEVICE_ATTACHED` und Filter für Klasse 14. Android bietet beim Anstecken an, LagLab Test zu öffnen. Mit „Immer“ entfällt die Freigabe-Frage.
- `test/native.js`: Ist `window.laglab` vorhanden, gilt `NATIVE`. `native.usbStream()` dekodiert die H.264-Stücke mit `VideoDecoder` und gibt sie über `MediaStreamTrackGenerator` als normale Kameraspur an die App. Ohne Zoom, Belichtung und Fokus. Zustände der App: none, denied, error, lost. `native.save(file)` schickt die Datei in 1-MB-Stücken, Android legt sie per MediaStore in Download ab. Kein Service Worker in der Android-App, `installedApp()` gilt als wahr.
- Stand 13 nach dem ersten Tablet-Test: Die WebView zeigte nach Kamerawechsel und Rückkehr aus der Analyse ihr graues Wiedergabe-Symbol statt des Live-Bildes. Abhilfe ist `showLive()` mit ausdrücklichem `video.play()` und ein leeres `poster`. Die USB-Spur meldet jetzt Belichtung, ISO und Fokus. `native.js` übersetzt sie in UVC-Befehle (`t: 'ctl'`). Belichtungszeit in 100 µs wie bei Chrome, höchstens 330, Verstärkung erscheint als ISO 100 bis 800, Fokus als ungefähre Entfernung 0,1 bis 3 m, wobei bei der Webcam ein großer Wert nah bedeutet. Die Bereiche schickt `UsbCam` beim Start als `t: 'caps'`.
- In der Vorschau mit nachgestellter Brücke getestet: USB-Bild mit 30 B/s, Betrieb, Puffer, Abziehen und Wiederanstecken im Betrieb, Speichern und Herunterladen. Die echte Hülle ist nur auf dem Tablet prüfbar.

## Wichtige Erkenntnisse

- Chrome bietet auf dem Tablet höchstens 30 Bilder pro Sekunde an. 60 sind nicht möglich.
- Bei schwachem Licht senkt die Automatik die Bildrate. Im Wohnzimmer wurden nur 16,6 Bilder pro Sekunde gemessen. Eine kurze manuelle Belichtung hält 30.
- Hardware-Kodierung läuft stabil. Im Lasttest gingen keine Bilder verloren, und 30 Sekunden Puffer brauchen bei 1080p nur etwa 25 MB.
- Das Tablet hat 16:10, der Fernseher 16:9. Die Ränder lassen sich eventuell über eine Zoom-Einstellung am Fernseher (BSL-22112V) entfernen.
- Die Vorschau im Claude-Desktop hat keinen Kamerazugriff. Zum Testen wird per JavaScript eine künstliche Kamera eingespeist, ein Canvas mit `captureStream`, das `navigator.mediaDevices.getUserMedia` ersetzt. Vor jedem Test Service Worker und Caches löschen, sonst lädt die Vorschau eine alte Version. Werkzeugaufrufe mit langen `await` blockieren `requestAnimationFrame`, deshalb die Wiedergabe in getrennten Aufrufen prüfen.
- Test am 30.09.2026 mit Version 14. Bild, Zoom und Fokusregler funktionieren, die Richtung des Fokusreglers stimmt. Im Automatikmodus meldet Chrome über `getSettings()` nur die zuletzt manuell gesetzten Werte für Belichtung und Fokus. Seit Version 15 steht bei Automatik deshalb nur „Auto“ ohne Zahlen.
- Am 29.09.2026 gelöster Update-Fehler: Der Service Worker speichert Dateien mit `cache: 'reload'`, sonst landen alte Dateien aus dem Browser-Zwischenspeicher im Offline-Speicher.

## Offen und als Nächstes
- Entschieden am 02.10.2026: Es bleibt bei 30 B/s. Die C920 kann höchstens 30, Chrome bietet für die Rückkamera höchstens 30. Mehr wäre nur über eine eigene Camera2-Anbindung der Rückkamera in der Android-App denkbar, ob das Tablet 60 kann, ist ungeprüft. Der Nutzer will das nicht verfolgen.

- Test-App Stand 2 muss noch hochgeladen werden. Beide Apps auf dem Tablet prüfen. Wichtig ist, ob das Speichern im Betrieb das laufende Bild stört und ob Herunterladen auf Android funktioniert.
- Android-Test-App „LagLab Test“ Stand 12 auf dem Tablet testen, vor allem USB-Kamera, eingebaute Kameras, Herunterladen, Zurück-Geste und Vollbild.
- Früherer Stand vom 01.10.2026 zur externen Kamera: Besprochene Wege waren eine USB-Kamera, die auf Android 11 bei Samsung oft nicht erkannt wird und einen USB-C-Hub neben dem HDMI-Adapter bräuchte, ein zweites Handy als Funkkamera über WebRTC mit Kopplung per QR-Code, und eine allgemeine Kamerawahl über alle von `enumerateDevices` gemeldeten Kameras als ersten Schritt.
- `navigator.storage.persist()` steht in `analysis.js` und gilt seit v1 für beide Apps.
- Test in der Halle: Werden 30 Bilder pro Sekunde erreicht? Welche Belichtung passt? Gibt es Streifen durch das Hallenlicht?
- Prüfen, ob die Vorschau im Einstellungsbildschirm auf dem Tablet flüssig läuft. Der Nutzer hatte ein Hängen gemeldet. Das betraf wahrscheinlich die Vorschau im Claude-Desktop. Die möglichen Ursachen auf dem Tablet wurden in Version 12 behoben.
- Test über 3 Stunden, mit Blick auf Wärme und Stabilität. Falls das Tablet überhitzt, wieder 720p als Rückfall einbauen.
- Die Checkliste für das Tablet aus `PLAN.md` an den Nutzer übergeben. Sie betrifft „Nicht stören“, die Akkuoptimierung, die Helligkeit, das Ladekabel und die Wärme.
- Alte Symbole wie „Cam Delay“, „Turm Delay“, „Cam Time“, „Lag Time“, „LagCam“ oder „LagTime“ auf dem Tablet entfernen und die App neu als „LagLab“ installieren.
