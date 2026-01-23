# Dialektisches Geld – Canvas-Präsentation

Eine browserbasierte Präsentation, die ein großes Spielfeld-Bild (Canvas) als „Bühne“ nutzt:  
Per Pfeiltasten wird in vordefinierte Bereiche gezoomt, ein Sidepanel fährt ein, Stichpunkte erscheinen Schritt für Schritt – plus **Presenter Notes** in einem **separaten Browserfenster**, synchron zur Präsentation.

---

## Features

- **Canvas-Rendering eines hochauflösenden Spielfelds**
  - Bild wird **ohne Verzerrung** skaliert (Breite = Bildschirmbreite, oben/unten darf gecroppt werden).
  - **HiDPI / Retina**: nutzt `devicePixelRatio`, `imageSmoothingQuality = "high"`.
- **Folien-Flow per Pfeiltasten**
  - `→` zoomt rein → nächster Tastendruck: Panel fährt rein → danach Bullet für Bullet → Panel fährt raus → Zoom zurück.
  - `←` geht Bullets zurück / bricht Panel ab / zoomt zurück (je nach Zustand).
- **Sidepanel**
  - Titel + Bullet-Points.
  - Optional: **zusätzliches Bild** im Sidepanel (pro Slide konfigurierbar).
- **Presenter Notes (separates Fenster)**
  - Öffnet ein eigenes Browserfenster mit:
    - aktuellem Slide-Titel
    - Publikum-Bullets inkl. Markierung der bereits eingeblendeten Punkte
    - Sprechertext (Notes)
  - Steuerung mit `←/→` funktioniert auch **aus dem Presenter-Fenster heraus**.
- **Fullscreen Button** (falls im Startscreen/HTML vorhanden)
- **Spezialfolie: Bildwechsel**
  - Bei einer definierten Folie wird das Canvas-Bild **ohne Bewegung** getauscht.

---

## Projektstruktur (Beispiel)

```txt
.
├── index.html
├── style.css
├── script.js
└── images/
    ├── Spielfeld Neu.png
    ├── Regelwerk Neu.png
    ├── Scheibe.png
    ├── Privat.png
    ├── Gemeinschaft.png
    ├── Ereigniskarte.png
    ├── Gemeinschaftskarte.png
    └── Eingriffskarte.png
