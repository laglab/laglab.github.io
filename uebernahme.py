"""Übernimmt den Stand der Test-App in die normale App.

Aufruf im Ordner LagLab:  python uebernahme.py <Version> <Service-Worker-Zähler>
Beispiel:                 python uebernahme.py 1.4 r21

Kopiert die Dateien der Web-App aus ../LagLab-Test hierher und passt danach an, was die normale App
von der Test-App unterscheidet: Versionsnummer mit „v“, eigener Speicherort ohne Übernahme aus einer
anderen App, eigene Videoablage, Titel „LagLab“ ohne Schild „Test“ und eigener Service Worker.
Die Symbole kommen nicht mit, sie entstehen mit icon.py (Befehle in UEBERGABE.md).
"""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TEST = os.path.join(HERE, '..', 'LagLab-Test')
FILES = ['analysis.js', 'app.js', 'compare.js', 'draw.js', 'help.js', 'i18n.js', 'native.js', 'style.css', 'index.html', 'sw.js']
DIRS = []   # Unterordner der Web-App, derzeit keine


def edit(name, pairs):
    p = os.path.join(HERE, name)
    s = open(p, encoding='utf-8').read()
    for pat, rep, count in pairs:
        s, n = re.subn(pat, rep, s)
        assert n == count, (name, pat, n)
    open(p, 'w', encoding='utf-8').write(s)


def main(version, sw):
    stand = re.search(r"APP_VERSION = '(\d+)'", open(os.path.join(TEST, 'app.js'), encoding='utf-8').read()).group(1)
    for f in FILES:
        shutil.copyfile(os.path.join(TEST, f), os.path.join(HERE, f))
    for d in DIRS:
        shutil.copytree(os.path.join(TEST, d), os.path.join(HERE, d), dirs_exist_ok=True)
    edit('app.js', [
        (r"const APP_VERSION = '\d+';.*",
         f"const APP_VERSION = '{version}';   // Version der normalen App, neue Zählung ab v1, entspricht Test-App Stand {stand}", 1),
        (r"const STORE_KEY = 'lagcam\.test\.settings';\nconst MAIN_STORE_KEY = .*\n",
         "const STORE_KEY = 'turmdelay.settings.v1';\n", 1),
        (r"localStorage\.getItem\(STORE_KEY\) \|\| localStorage\.getItem\(MAIN_STORE_KEY\)", "localStorage.getItem(STORE_KEY)", 1),
        (r"\$\('version'\)\.textContent = tr\('Stand'\) \+ ' ' \+ APP_VERSION", "$('version').textContent = 'v' + APP_VERSION", 1),
    ])
    edit('analysis.js', [
        (r"const DB_NAME = 'lagcam-test';", "const DB_NAME = 'lagtime';   // eigene Videoablage, getrennt von der Test-App", 1),
    ])
    edit('index.html', [
        (r"<title>LagLab Test</title>", "<title>LagLab</title>", 1),
        (r'<span class="tag">Test</span>', '', 3),
    ])
    edit('sw.js', [
        (r"// Test-App, .*", "// Normale App, laglab.github.io. Nur eigene Speicher werden gelöscht.", 1),
        (r"const PREFIX = 'lagcam-test-';", "const PREFIX = 'turm-delay-';", 1),
        (r"const VERSION = PREFIX \+ 's\d+';.*",
         f"const VERSION = PREFIX + '{sw}';   // Zählung seit 01.10.2026, bei jeder Übernahme eins weiter", 1),
        (r"\n *// laglab-mp war der Speicher.*", "", 1),
        (r"keys\.filter\(k => \(k\.startsWith\(PREFIX\) && k !== VERSION\) \|\| k\.startsWith\('laglab-mp-'\)\)",
         "keys.filter(k => k.startsWith(PREFIX) && k !== VERSION)", 1),
    ])
    print(f'Test-App Stand {stand} übernommen als v{version}, Service Worker {sw}')


if __name__ == '__main__':
    main(*sys.argv[1:3])
