// script.js
// ------------------------------------------------------------
// Dialektisches Geld – Präsentations-Canvas + Startscreen
// + Presenter Notes als separates Browserfenster (synchron)
// + Sprechertext (notes) ist getrennt von bullets
// ------------------------------------------------------------

/* ============================================================
   1) DOM / STARTSCREEN / BUTTONS
   ============================================================ */

const startScreen = document.getElementById("startScreen");
const btnStart = document.getElementById("btnStart");
const btnFullscreen = document.getElementById("btnFullscreen");
const btnNotes = document.getElementById("btnNotes");

/** Solange false: Pfeiltasten steuern NICHT die Präsentation */
let presentationStarted = false;

/* ============================================================
   2) CANVAS / PANEL SETUP
   ============================================================ */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const panel = document.getElementById("panel");
const slideTitleEl = document.getElementById("slideTitle");
const bulletsEl = document.getElementById("bullets");

/* ============================================================
   3) ASSETS / WELTGRÖSSE
   ============================================================ */

// --- Canvas Images (A = Standard, B = Austausch) ---

const imageA = new Image();
imageA.src = "images/Spielfeld Neu.png";

// 👉 HIER: Dateiname für das zweite Bild eintragen (muss im images/ Ordner liegen)
const imageB = new Image(); 
imageB.src = "images/Regelwerk Neu.png"; // <-- bitte anpassen!

// aktives Bild (wird von draw() gerendert)
let activeImage = imageA;


const IMG_W = 9600;
const IMG_H = 9600;

/* ============================================================
   4) VIEWPORT (CSS-PX) + BASISZOOM
   ============================================================ */

let baseZoom = 1;
let viewWidth = window.innerWidth;
let viewHeight = window.innerHeight;

/* ============================================================
   5) KAMERA
   ============================================================ */

const camera = { x: IMG_W / 2, y: IMG_H / 2, zoom: 1 };
let target = { ...camera };

/* ============================================================
   6) PRESENTATION STATE MACHINE
   ============================================================ */

const MODE = {
  RESET: "reset",
  ZOOMING_IN: "zooming_in",
  ZOOMED: "zoomed",
  PANEL_OPENING: "panel_opening",
  PANEL: "panel",
  PANEL_CLOSING: "panel_closing",
  ZOOMED_AFTER: "zoomed_after",
  ZOOMING_OUT: "zooming_out",

  // 👇 neu
  SWAP_READY: "swap_ready",
  SWAPPED: "swapped"
};


let mode = MODE.RESET;

/* ============================================================
   7) TIMING (ANPASSBAR)
   ============================================================ */

const ZOOM_DURATION = 520;
const PANEL_DURATION = 360;

// ============================================================
// SLIDES – Dialektisches Geld (12 Folien)
// bullets = Text im Sidepanel (step-by-step)
// notes  = Sprechertext (nur im Presenter Window)
// panelImage (optional) = Bild unten im Sidepanel (z.B. Folie 2)
// ============================================================

const slides = [
  {
    // Folie 1 – Ausgangspunkt
    camera: { x: IMG_W / 2 , y: IMG_H / 2, zoomMul: 1},
    title: "Ausgangspunkt",
    bullets: [
      "Geld erscheint neutral",
      "Geld ermöglicht Freiheit",
      "Geld erzeugt zugleich Abhängigkeit",
      "Diese Spannung ist der Kern des Spiels"
    ],
    notes: [
      "Geld begegnet uns im Alltag meist als etwas Neutrales: als Mittel zum Bezahlen, zum Sparen, zum Planen.",
      "Gleichzeitig erleben wir aber, dass Geld mehr ist: Es schafft Möglichkeiten – und setzt Grenzen.",
      "Genau diese Spannung, dass Geld gleichzeitig befreit und bindet, ist der Ausgangspunkt meines Spiels."
    ]
  },

  {
    // Folie 2 – Was bedeutet Dialektik im Spiel?
    camera: { x: IMG_W / 2, y: IMG_H / 2, zoomMul: 2.0 },
    title: "Was bedeutet Dialektik im Spiel?",
    bullets: [
      "Zwei gegensätzliche Wirkungen",
      "Beide entstehen aus derselben Handlung",
      "Keine richtige oder falsche Nutzung",
      "Konsequenzen zeigen sich erst später"
    ],
    notes: [
      "Dialektik bedeutet hier nicht Theorie, sondern eine einfache Beobachtung: Dieselbe Handlung hat zwei Seiten.",
      "Wenn ich Geld nutze, um schneller voranzukommen, erhöhe ich gleichzeitig den Druck auf das System.",
      "Das Spiel bewertet diese Entscheidung nicht – es macht nur sichtbar, was sie bewirkt."
    ]
  },

  {
    // Folie 3 – Die kippbare Scheibe
    camera: { x: IMG_W / 2, y: IMG_H / 2, zoomMul: 3.0 },
    title: "Die kippbare Scheibe",
    bullets: [
      "Zentrales Spielelement",
      "Geld hat Gewicht",
      "Ungleichgewicht führt zum Kippen",
      "Kippen = sofortiger Sieg"
    ],
    notes: [
      "Im Zentrum des Spiels liegt eine kippbare Scheibe.",
      "Jedes Geld, das eingesetzt wird, landet auf dieser Scheibe.",
      "Geld ist hier nicht abstrakt – es hat physisches Gewicht.",
      "Wird eine Seite zu stark belastet, kippt die Scheibe. Der Spieler, zu dem alles rutscht, gewinnt sofort."
    ],
    // 👉 Bild im Sidepanel (unten, zentriert)
    panelImage: "images/Scheibe.png",
    panelImageAlt: "Scheibe"
  },

  {
    // Folie 4 – Zwei Wege zum Sieg
    camera: { x: IMG_W / 2, y: IMG_H / 2, zoomMul: 1.8 },
    title: "Zwei Wege zum Sieg",
    bullets: [
      "Sieg durch Kippen der Scheibe",
      "Sieg durch Stabilität und Zeit",
      "Beide Wege nutzen Geld",
      "Beide Wege haben Risiken"
    ],
    notes: [
      "Das Spiel kennt zwei gleichwertige Strategien:",
      "Erstens: Ich nutze Geld offensiv, beschleunige meinen Fortschritt und riskiere, dass die Scheibe zu mir kippt.",
      "Zweitens: Ich versuche, das System stabil zu halten und gewinne über Zeit, indem ich den äußeren Ring umrunde.",
      "Geld ist in beiden Fällen das zentrale Werkzeug – aber mit völlig unterschiedlichen Konsequenzen."
    ]
  },

  {
    // Folie 5 – Der äußere Ring: Alltag & Fortschritt
    camera: { x: IMG_W / 2 + 900, y: IMG_H / 2 - 900, zoomMul: 3.0 },
    title: "Der äußere Ring: Alltag & Fortschritt",
    bullets: [
      "Bewegung steht für Handlungsspielraum",
      "Fortschritt ist nicht automatisch positiv",
      "Ereignisse greifen in den Alltag ein"
    ],
    notes: [
      "Der äußere Ring steht für den alltäglichen Lebensverlauf: Arbeit, Konsum, Entscheidungen, Zufälle.",
      "Wer schneller vorankommt, hat mehr Handlungsspielraum – aber dieser Fortschritt ist nie ohne Nebenwirkungen.",
      "Ereignis- und Gemeinschaftsfelder greifen immer wieder ein und verändern individuelle und kollektive Bedingungen."
    ]
  },

  {
    // Folie 6 – Private Güter
    camera: { x: IMG_W / 2 + 1600, y: IMG_H / 2+1200, zoomMul: 3.0 },
    title: "Private Güter",
    bullets: [
      "Immobilien, Mobilität, Status",
      "Jeder Kauf verstärkt Vorteile",
      "Gleichzeitig wachsen Einschränkungen",
      "Akkumulation wird sichtbar"
    ],
    notes: [
      "Private Güter stehen für individuelle Entscheidungen: zum Beispiel Immobilien, Mobilität oder Status.",
      "Mit jeder Stufe wird der Vorteil größer – mehr Einkommen, mehr Bewegung, mehr Einfluss.",
      "Gleichzeitig nehmen auch die Einschränkungen zu: weniger Flexibilität, mehr Verpflichtung, mehr systemischer Druck.",
      "Der Spieler sieht seinen Fortschritt – aber auch, wie er sich selbst festlegt."
    ],
    // 👉 Bild im Sidepanel (unten, zentriert)
    panelImage: "images/Privat.png",
    panelImageAlt: "Privates Gut"
  },

  {
    // Folie 7 – Gemeinschaftsgüter
    camera: { x: IMG_W / 2 + 1800, y: IMG_H / 2+1200, zoomMul: 3.0 },
    title: "Gemeinschaftsgüter",
    bullets: [
      "Bildung, Infrastruktur, soziale Absicherung",
      "Wirken für alle Spieler",
      "Vorteile und Nachteile zugleich",
      "Keine rein positiven Lösungen"
    ],
    notes: [
      "Gemeinschaftsgüter liegen nicht bei einzelnen Spielern, sondern bei der Bank – sie betreffen alle.",
      "Sie verbessern Chancen, gleichen Unterschiede aus oder stabilisieren das Spiel.",
      "Gleichzeitig erzeugen sie neue Belastungen: geringere Beweglichkeit, geringeres Einkommen, neue Abhängigkeiten.",
      "Das Spiel zeigt: Gemeinsame Lösungen sind notwendig – aber nie neutral."
    ],
    // 👉 Bild im Sidepanel (unten, zentriert)
    panelImage: "images/Gemeinschaft.png",
    panelImageAlt: "Gemeinschaftsgut"
  },

  {
    // Folie 8 – Ereigniskarten: Mikroebene
    camera: { x: IMG_W / 2 -200, y: IMG_H / 2, zoomMul: 3.0 },
    title: "Ereigniskarten: Mikroebene",
    bullets: [
      "Karrieresprung",
      "Erbe",
      "Jobverlust",
      "Persönliche Brüche & Chancen"
    ],
    notes: [
      "Ereigniskarten greifen individuelle Lebenssituationen auf: Karrieresprünge, Erbschaften, Jobverlust.",
      "Diese Karten bringen Vorteile – aber immer mit einer zusätzlichen Belastung oder Einschränkung.",
      "So wird sichtbar: Persönlicher Erfolg und persönliches Scheitern wirken immer auch auf das Gesamtsystem zurück."
    ],
    // 👉 Bild im Sidepanel (unten, zentriert)
    panelImage: "images/Ereigniskarte.png",
    panelImageAlt: "Ereigniskarte"
  },

  {
    // Folie 9 – Gemeinschaftskarten: Makroebene
    camera: { x: IMG_W / 2, y: IMG_H / 2 - 1200, zoomMul: 3.0 },
    title: "Gemeinschaftskarten: Makroebene",
    bullets: [
      "Bildungsoffensive",
      "Wirtschaftliche Öffnung",
      "Krise",
      "Systemische Veränderungen"
    ],
    notes: [
      "Gemeinschaftskarten stehen für große wirtschaftliche Entwicklungen: Wachstum, Liberalisierung, Krisen.",
      "Sie verändern die Regeln für alle gleichzeitig.",
      "Das Spiel zeigt: Makroentscheidungen schaffen neue Freiheiten – und verteilen Lasten neu."
    ],
    // 👉 Bild im Sidepanel (unten, zentriert)
    panelImage: "images/Gemeinschaftskarte.png",
    panelImageAlt: "Gemeinschaftskarte"
  },

  {
    // Folie 10 – Eingriffskarten
    camera: { x: IMG_W / 2 -200, y: IMG_H / 2 + 1500, zoomMul: 3.0 },
    title: "Eingriffskarten",
    bullets: [
      "Abschöpfung",
      "Transfer",
      "Intervention",
      "Eingriff kostet persönlichen Fortschritt"
    ],
    notes: [
      "Eingriffskarten sind bewusste Unterbrechungen.",
      "Wer eingreift, verzichtet auf Bewegung und auf Käufe.",
      "Dafür kann Gewicht entfernt, umverteilt oder gezielt auf andere Seiten gelegt werden.",
      "Eingriffe sind kein Vorteil – sie sind der Versuch, das System zu stabilisieren."
    ],
    // 👉 Bild im Sidepanel (unten, zentriert)
    panelImage: "images/Eingriffskarte.png",
    panelImageAlt: "Eingriffskarte"
  },

  {
    // Folie 11 – Was das Spiel vermittelt
    camera: { x: IMG_W / 2 , y: IMG_H / 2, zoomMul: 1.5 },
    title: "Was das Spiel vermittelt",
    bullets: [
      "Geld ist kein neutrales Werkzeug",
      "Freiheit und Zwang entstehen gleichzeitig",
      "Akkumulation ist sichtbar",
      "Verantwortung ist relational"
    ],
    notes: [
      "Das Spiel erklärt nicht, was man tun sollte.",
      "Es zeigt, was passiert, wenn Geld genutzt wird.",
      "Freiheit entsteht – aber immer in Beziehung zu anderen.",
      "Der zentrale Moment ist nicht der Sieg, sondern die Erkenntnis, warum er möglich war."
    ]
  },

  {
    // Folie 12 – Abschluss
    camera: { x: IMG_W / 2 , y: IMG_H / 2, zoomMul: 1 },
    title: "Abschluss",
    bullets: [
      "Spielen statt Belehren",
      "Verstehen durch Handeln",
      "Dialektik wird erfahrbar"
    ],
    notes: [
      "Dieses Spiel ist kein Moralsimulator.",
      "Es lädt dazu ein, Geld zu benutzen – so wie wir es im Alltag tun.",
      "Die Dialektik entsteht nicht durch Regeln, sondern durch Erfahrung.",
      "Man gewinnt – und versteht erst danach, was dieser Gewinn bedeutet hat."
    ]
  },
  {

      // Folie 13 – Abschluss
    camera: { x: IMG_W / 2 , y: IMG_H / 2, zoomMul: 1 },
    title: "Was ist noch geplant?",
    bullets: [
      "Grafiküberarbeitung",
      "Spielbrett als physisches Objekt umsetzen",
      "Testen Testen Testen!"
    ],
    notes: [
      "Ich werde noch mehr an der Grafik arbeiten, um das Spiel optisch ansprechender und einheitlicher zu machen.",
      "Ich werde mehr Karten entwerfen und das Spielbrett als physisches Objekt umsetzen.",
      "Ich muss in der nächsten Zeit vor allem testen, testen, testen!"
    ]
  },

  {
  // Folie 14 – Bildtausch (Special)
  camera: { x: IMG_W / 2, y: IMG_H / 2, zoomMul: 4.5 }, // wie Folie 1
  title: "Folie 14 – Bildwechsel",
  bullets: [], // keine Bullets
  notes: [
    "Hier wird das Canvas-Bild gewechselt, ohne dass sich Zoom/Position ändern.",
    "Danach wird wieder rausgezoomt."
  ],

  // 👇 SPECIAL:
  special: "swapImage",
  swapTo: "B" // "B" = imageB, "A" = imageA
}

];


let slideIndex = 0;
let bulletIndex = 0;

/* ============================================================
   9) ANIMATION RUNTIME STATE
   ============================================================ */

let zoomAnim = null;
let panelAnim = null;

/* ============================================================
   10) PRESENTER WINDOW (separates Browserfenster, synchron)
   ============================================================ */

let presenterWin = null;

function openPresenterWindow() {
  if (presenterWin && !presenterWin.closed) {
    presenterWin.focus();
    return;
  }

  presenterWin = window.open(
    "",
    "presenterNotes",
    "popup=yes,width=560,height=780,left=40,top=40"
  );

  if (!presenterWin) {
    alert("Popup wurde blockiert. Bitte Popups erlauben.");
    return;
  }

  presenterWin.document.open();
  presenterWin.document.write(`
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Presenter Notes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
<style>
  html, body { margin:0; padding:0; background:#111; color:#FFF9F3; font-family:"Rubik", sans-serif; }
  .wrap { padding:18px; }
  .head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
  .title { font-weight:800; font-size:14px; opacity:.95; }
  .pill { border:1px solid rgba(255,249,243,.25); padding:6px 10px; border-radius:999px; font-size:12px; opacity:.9; }
  .card { border:1px solid rgba(255,249,243,.18); padding:14px; background: rgba(230, 90, 86, 0.08); margin-bottom:12px; }
  .slideTitle { font-weight:800; font-size:16px; line-height:1.2; margin:0 0 10px; }
  .meta { font-size:12px; opacity:.85; margin-bottom:10px; line-height:1.4; }
  .sectionTitle { font-weight:800; font-size:12px; letter-spacing:.02em; text-transform:uppercase; opacity:.9; margin:0 0 8px; }
  ul { margin:0; padding-left:18px; line-height:1.55; }
  li { margin:0 0 8px; opacity:.35; }
  li.shown { opacity:1; }
  .notes { font-size:13px; line-height:1.6; opacity:.95; }
  .notes p { margin:0 0 10px; }
  .notes ul { margin:0; padding-left:18px; }
  .notes li { opacity:1; margin:0 0 8px; }
  .hint { margin-top:10px; font-size:12px; opacity:.7; line-height:1.5; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div class="title">Presenter View</div>
      <div class="pill" id="pillState">—</div>
    </div>

    <div class="card">
      <div class="meta" id="metaLine">—</div>
      <h1 class="slideTitle" id="slideTitle">—</h1>

      <div class="sectionTitle">Publikums-Bullets</div>
      <ul id="bulletList"></ul>
    </div>

    <div class="card">
      <div class="sectionTitle">Sprechertext</div>
      <div class="notes" id="notesBox">—</div>

      <div class="hint">
        Steuerung: <code>←</code>/<code>→</code> (sendet an Präsentation).
      </div>
    </div>
  </div>

<script>
  function renderNotes(notes) {
    const box = document.getElementById("notesBox");
    box.innerHTML = "";

    if (!notes || notes.length === 0) {
      box.textContent = "—";
      return;
    }

    // notes als Liste rendern
    const ul = document.createElement("ul");
    notes.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  window.addEventListener("message", (ev) => {
    const msg = ev.data;
    if (!msg || msg.type !== "PRESENTER_UPDATE") return;

    document.getElementById("pillState").textContent = msg.mode || "—";
    document.getElementById("metaLine").textContent =
      "Slide " + msg.slideNumber + " / " + msg.totalSlides +
      " · Bullets: " + msg.bulletsShown + "/" + msg.totalBullets +
      (msg.presentationStarted ? "" : " · (noch nicht gestartet)");

    document.getElementById("slideTitle").textContent = msg.title || "—";

    const ul = document.getElementById("bulletList");
    ul.innerHTML = "";
    (msg.bullets || []).forEach((b, idx) => {
      const li = document.createElement("li");
      li.textContent = b;
      if (idx < msg.bulletsShown) li.classList.add("shown");
      ul.appendChild(li);
    });

    renderNotes(msg.notes || []);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type:"PRESENTER_KEY", key: e.key }, "*");
        e.preventDefault();
      }
    }
  });
</script>
</body>
</html>
  `);
  presenterWin.document.close();

  sendPresenterUpdate();
}

function sendPresenterUpdate() {
  if (!presenterWin || presenterWin.closed) return;

  const s = slides[slideIndex] || { title: "—", bullets: [], notes: [] };

  presenterWin.postMessage(
    {
      type: "PRESENTER_UPDATE",
      mode,
      slideNumber: slideIndex + 1,
      totalSlides: slides.length,
      title: s.title,
      bullets: s.bullets,
      bulletsShown: bulletIndex,
      totalBullets: (s.bullets || []).length,
      notes: s.notes || [],
      presentationStarted
    },
    "*"
  );
}

window.addEventListener("message", (ev) => {
  const msg = ev.data;
  if (!msg || msg.type !== "PRESENTER_KEY") return;

  if (msg.key === "ArrowRight") handleRight();
  if (msg.key === "ArrowLeft") handleLeft();
});

/* ============================================================
   11) FULLSCREEN + START
   ============================================================ */

function isFullscreen() {
  return !!document.fullscreenElement;
}

async function toggleFullscreen() {
  try {
    if (!isFullscreen()) {
      await document.documentElement.requestFullscreen();
      btnFullscreen.textContent = "Fullscreen verlassen";
    } else {
      await document.exitFullscreen();
      btnFullscreen.textContent = "Fullscreen";
    }
  } catch (err) {
    console.warn("Fullscreen konnte nicht geändert werden:", err);
  }
}

function startPresentation() {
  presentationStarted = true;
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  setResetImmediate();
  sendPresenterUpdate();
}

btnStart.addEventListener("click", startPresentation);
btnFullscreen.addEventListener("click", toggleFullscreen);
btnNotes.addEventListener("click", openPresenterWindow);

document.addEventListener("fullscreenchange", () => {
  btnFullscreen.textContent = isFullscreen() ? "Fullscreen verlassen" : "Fullscreen";
});

/* ============================================================
   12) UTILITY / RESIZE / CLAMPING
   ============================================================ */

function resize() {
  const dpr = window.devicePixelRatio || 1;

  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;

  canvas.style.width = viewWidth + "px";
  canvas.style.height = viewHeight + "px";

  canvas.width = Math.round(viewWidth * dpr);
  canvas.height = Math.round(viewHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  baseZoom = viewWidth / IMG_W;

  if (mode === MODE.RESET) {
    setResetImmediate();
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function clampToImage(t) {
  const halfViewW = (viewWidth / t.zoom) / 2;
  const halfViewH = (viewHeight / t.zoom) / 2;

  if (halfViewW >= IMG_W / 2) t.x = IMG_W / 2;
  else t.x = clamp(t.x, halfViewW, IMG_W - halfViewW);

  if (halfViewH >= IMG_H / 2) t.y = IMG_H / 2;
  else t.y = clamp(t.y, halfViewH, IMG_H - halfViewH);

  return t;
}

function setActiveCanvasImage(which) {
  // which: "A" oder "B"
  activeImage = (which === "B") ? imageB : imageA;
}


/* ============================================================
   13) EASING / INTERPOLATION
   ============================================================ */

function cubicBezierY(p1x, p1y, p2x, p2y, t) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  function x(u) { return ((ax * u + bx) * u + cx) * u; }
  function dx(u) { return (3 * ax * u + 2 * bx) * u + cx; }
  function y(u) { return ((ay * u + by) * u + cy) * u; }

  let u = t;
  for (let i = 0; i < 7; i++) {
    const xu = x(u) - t;
    const d = dx(u);
    if (Math.abs(xu) < 1e-7 || d === 0) break;
    u = u - xu / d;
    u = Math.max(0, Math.min(1, u));
  }
  return y(u);
}

function easeCss(t) {
  return cubicBezierY(0.25, 0.1, 0.25, 1.0, t);
}

function lerp(a, b, p) {
  return a + (b - a) * p;
}

/* ============================================================
   14) CAMERA TARGETS
   ============================================================ */

function resetTarget() {
  return clampToImage({
    x: IMG_W / 2,
    y: IMG_H / 2,
    zoom: baseZoom * 1.0
  });
}

function slideTarget(i) {
  const s = slides[i].camera;
  return clampToImage({
    x: s.x,
    y: s.y,
    zoom: baseZoom * s.zoomMul
  });
}

function setResetImmediate() {
  const t = resetTarget();
  camera.x = t.x;
  camera.y = t.y;
  camera.zoom = t.zoom;

  target = { ...t };

  setPanelProgress(0);
  panel.setAttribute("aria-hidden", "true");
}



function panelCouplingDeltaWorld(zoom) {
  const screenShiftPx = canvas.width * 0.25;
  return screenShiftPx / zoom;
}

/* ============================================================
   15) PANEL UI (TITEL + BULLETS)
   ============================================================ */

function preparePanel(i) {
  slideTitleEl.textContent = slides[i].title;
  bulletsEl.innerHTML = "";
  bulletIndex = 0;

  for (const text of slides[i].bullets) {
    const li = document.createElement("li");
    li.textContent = text;
    bulletsEl.appendChild(li);
  }
  setPanelImageForSlide(i);
  sendPresenterUpdate();
}

function setPanelProgress(p) {
  const xPercent = -100 + 100 * p;
  panel.style.transform = `translateX(${xPercent}%)`;
  panel.setAttribute("aria-hidden", p === 0 ? "true" : "false");
}

function showNextBullet() {
  const items = bulletsEl.querySelectorAll("li");
  if (bulletIndex >= items.length) return false;
  items[bulletIndex].classList.add("shown");
  bulletIndex++;
  sendPresenterUpdate();
  return true;
}

function hidePrevBullet() {
  const items = bulletsEl.querySelectorAll("li");
  if (bulletIndex <= 0) return false;
  bulletIndex--;
  items[bulletIndex].classList.remove("shown");
  sendPresenterUpdate();
  return true;
}

function allBulletsShown() {
  return bulletIndex >= slides[slideIndex].bullets.length;
}

// ---------- Panel Media (optional image per slide) ----------

let panelMediaEl = null;

function ensurePanelMediaContainer() {
  if (panelMediaEl) return;

  panelMediaEl = document.createElement("div");
  panelMediaEl.id = "panelMedia";

  // WICHTIG: relativ zum PANEL, nicht zur Textbox
  panelMediaEl.style.position = "absolute";
  panelMediaEl.style.left = "0";
  panelMediaEl.style.right = "0";

  // 👉 Abstand zum Footer (Footer-Höhe 64px + etwas Luft)
  panelMediaEl.style.bottom = "84px";

  panelMediaEl.style.display = "none";
  panelMediaEl.style.justifyContent = "center";
  panelMediaEl.style.pointerEvents = "none";

  panel.appendChild(panelMediaEl);
}


function setPanelImageForSlide(i) {
  ensurePanelMediaContainer();
  if (!panelMediaEl) return;

  const s = slides[i];
  const src = s.panelImage;

  if (!src) {
    panelMediaEl.innerHTML = "";
    panelMediaEl.style.display = "none";
    return;
  }

  const img = document.createElement("img");
  // encodeURI hilft bei Leerzeichen/Unicode im Dateinamen
  img.src = encodeURI(src);
  img.alt = s.panelImageAlt || "";

  // Bild im Panel sauber skalieren, nicht verzerren
  img.style.maxWidth = "calc(100% - 72px)"; // berücksichtigt ca. textbox padding (36px links/rechts)
  img.style.maxHeight = "34vh";             // damit es nicht zu riesig wird
  img.style.height = "auto";
  img.style.width = "auto";
  img.style.display = "block";

  panelMediaEl.innerHTML = "";
  panelMediaEl.appendChild(img);
  panelMediaEl.style.display = "flex";
}


/* ============================================================
   16) ANIMATIONS (ZOOM / PANEL)
   ============================================================ */

function startZoomTo(toCam, nextModeOnEnd) {
  zoomAnim = {
    start: performance.now(),
    duration: ZOOM_DURATION,
    from: { x: camera.x, y: camera.y, zoom: camera.zoom },
    to: { x: toCam.x, y: toCam.y, zoom: toCam.zoom },
    nextModeOnEnd
  };
}

function startPanelAnim(kind) {
  const base = slideTarget(slideIndex);
  const delta = panelCouplingDeltaWorld(base.zoom);

  panelAnim = {
    kind,
    start: performance.now(),
    duration: PANEL_DURATION,
    base,
    delta
  };

  setPanelProgress(kind === "in" ? 0 : 1);
  sendPresenterUpdate();
}

function applyZoomAnimation() {
  const now = performance.now();
  const raw = (now - zoomAnim.start) / zoomAnim.duration;
  const t = Math.max(0, Math.min(1, raw));
  const p = easeCss(t);

  camera.x = lerp(zoomAnim.from.x, zoomAnim.to.x, p);
  camera.y = lerp(zoomAnim.from.y, zoomAnim.to.y, p);
  camera.zoom = lerp(zoomAnim.from.zoom, zoomAnim.to.zoom, p);

  if (t >= 1) {
    camera.x = zoomAnim.to.x;
    camera.y = zoomAnim.to.y;
    camera.zoom = zoomAnim.to.zoom;

    mode = zoomAnim.nextModeOnEnd;
    zoomAnim = null;
    sendPresenterUpdate();
  }
}

function applyPanelAnimation() {
  const now = performance.now();
  const raw = (now - panelAnim.start) / panelAnim.duration;
  const t = Math.max(0, Math.min(1, raw));
  const p = easeCss(t);

  const panelP = panelAnim.kind === "in" ? p : (1 - p);
  setPanelProgress(panelP);

  const coupled = panelAnim.kind === "in" ? p : (1 - p);
  camera.x = panelAnim.base.x - panelAnim.delta * coupled;
  camera.y = panelAnim.base.y;
  camera.zoom = panelAnim.base.zoom;

  if (t >= 1) {
    const endP = panelAnim.kind === "in" ? 1 : 0;
    setPanelProgress(endP);

    if (mode === MODE.PANEL_OPENING) mode = MODE.PANEL;
    if (mode === MODE.PANEL_CLOSING) mode = MODE.ZOOMED_AFTER;

    panelAnim = null;
    sendPresenterUpdate();
  }
}

/* ============================================================
   17) RENDERING
   ============================================================ */

function draw() {
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  ctx.save();
  ctx.translate(viewWidth / 2, viewHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  ctx.drawImage(activeImage, 0, 0, IMG_W, IMG_H);

  ctx.restore();
}

function loop() {
  if (zoomAnim) applyZoomAnimation();
  if (panelAnim) applyPanelAnimation();

  draw();
  requestAnimationFrame(loop);
}

/* ============================================================
   18) PRESENTATION FLOW (ARROWTASTEN)
   ============================================================ */

function handleRight() {
  if (!presentationStarted) return;
  if (zoomAnim || panelAnim) return;

  if (mode === MODE.RESET) {
  mode = MODE.ZOOMING_IN;
  const to = slideTarget(slideIndex);

  const s = slides[slideIndex];
  const next = (s.special === "swapImage") ? MODE.SWAP_READY : MODE.ZOOMED;

  startZoomTo(to, next);
  sendPresenterUpdate();
  return;
}


  if (mode === MODE.ZOOMED) {
    mode = MODE.PANEL_OPENING;
    preparePanel(slideIndex);
    startPanelAnim("in");
    sendPresenterUpdate();
    return;
  }

  // --- Special Slide: swapImage ---
// Reihenfolge:
// 1) (nach Zoom) mode = SWAP_READY
// 2) → Bild tauschen (ohne Movement) => mode = SWAPPED
// 3) → rauszoomen => RESET + next slide

if (mode === MODE.SWAP_READY) {
  const s = slides[slideIndex];
  if (s.special === "swapImage") {
    setActiveCanvasImage(s.swapTo || "B"); // default B
    mode = MODE.SWAPPED;
    sendPresenterUpdate();
    return;
  }
}

if (mode === MODE.SWAPPED) {
  mode = MODE.ZOOMING_OUT;
  const to = resetTarget();
  startZoomTo(to, MODE.RESET);

  // nächste Folie vorbereiten
  slideIndex = (slideIndex + 1) % slides.length;
  bulletIndex = 0;

  sendPresenterUpdate();
  return;
}



  if (mode === MODE.PANEL) {
    const didShow = showNextBullet();
    if (didShow) return;

    if (allBulletsShown()) {
      mode = MODE.PANEL_CLOSING;
      startPanelAnim("out");
      sendPresenterUpdate();
      return;
    }
  }

  if (mode === MODE.ZOOMED_AFTER) {
    mode = MODE.ZOOMING_OUT;
    const to = resetTarget();
    startZoomTo(to, MODE.RESET);

    // nächste Folie
    slideIndex = (slideIndex + 1) % slides.length;
    bulletIndex = 0;
    sendPresenterUpdate();
    return;
  }
}

function handleLeft() {
  if (!presentationStarted) return;
  if (zoomAnim || panelAnim) return;

  if (mode === MODE.PANEL) {
    const didHide = hidePrevBullet();
    if (didHide) return;

    mode = MODE.PANEL_CLOSING;
    startPanelAnim("out");
    sendPresenterUpdate();
    return;
  }

  if (mode === MODE.ZOOMED || mode === MODE.ZOOMED_AFTER) {
    mode = MODE.ZOOMING_OUT;
    const to = resetTarget();
    startZoomTo(to, MODE.RESET);
    sendPresenterUpdate();
    return;
  }
}

/* ============================================================
   19) INPUT
   ============================================================ */

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") handleRight();
  if (e.key === "ArrowLeft") handleLeft();

  // Komfort: ENTER startet Präsentation
  if (e.key === "Enter" && !presentationStarted) startPresentation();
});

/* ============================================================
   20) INIT
   ============================================================ */

let loadedCount = 0;
function onAnyImageLoaded() {
  loadedCount++;
  if (loadedCount < 1) return; // mindestens imageA muss da sein

  // Init nur einmal starten
  if (onAnyImageLoaded.started) return;
  onAnyImageLoaded.started = true;

  resize();
  setResetImmediate();
  loop();
  sendPresenterUpdate();
}

imageA.onload = onAnyImageLoaded;
imageB.onload = onAnyImageLoaded;

// falls ein Bild nicht geladen wird: Fehlermeldung in Console
imageA.onerror = () => console.error("Konnte imageA nicht laden:", imageA.src);
imageB.onerror = () => console.error("Konnte imageB nicht laden:", imageB.src);

window.addEventListener("resize", resize);


window.addEventListener("resize", resize);
