/* Shutter Captain – dashboard card.
 *
 * Add it like any card (Edit dashboard → Add card → Shutter Captain). Its visual editor picks the
 * shutters/groups (drag with the mouse to reorder) and the look:
 *
 *   type: custom:shutter-captain-card
 *   title: Wohnbereich
 *   entities: [cover.wohnbereich, cover.kuche]   # or all_shutters: true
 *   layout: grid            # grid | list | chips
 *   shape: soft             # rounded | soft | square
 *   color / background / text_color: amber | #rrggbb
 *   font: rounded           # theme | system | rounded | serif | mono | condensed
 *   background_image: /local/garten.jpg   image_dim: 30
 *   show_status_chips, show_header_controls, show_times, show_automation, show_slider, show_positions,
 *   show_vacation, show_auto_mode, show_manual_mode: true/false
 *
 * The card adapts to its own width (container queries), so it fits any column, phone or tablet.
 * Loaded automatically by the integration – no dashboard resource needed.
 */

const DOMAIN = "shutter_captain";
const CARD = "shutter-captain-card";
const EDITOR = "shutter-captain-card-editor";
const SINGLE = "shutter-captain-shutter-card";

const SINGLE_OVERRIDES = { show_header_controls: false, show_status_chips: false };
const CARD_DEFAULTS = {
  title: "", layout: "grid", entities: [], all_shutters: false, shape: "rounded", color: "", background: "",
  text_color: "", font: "theme", background_image: "", image_dim: 30,
  show_status_chips: true, show_header_controls: true, show_times: true, show_automation: true, show_slider: true, show_positions: true,
  show_vacation: false, show_auto_mode: false, show_manual_mode: false,
};

const TXT = {
  de: {
    name: "Shutter Captain",
    description: "Rollläden mit Status, Zeiten und Automatik steuern – Aussehen frei gestaltbar.",
    open: "Öffnen", close: "Schließen", stop: "Stopp",
    tomorrow: "morgen", up: "Auf", down: "Ab", sun: "Sonne",
    shutters_n: "{n} Rollläden",
    no_entities: "Keine Rollläden in dieser Karte.",
    unavailable: "nicht verfügbar",
    window_open: "Fenster offen", window_tilted: "gekippt",
    st_open: "{n} offen", st_closed: "{n} zu", st_sun: "{n} Sonnenschutz", st_window: "{n} Fenster offen",
    st_manual: "{n} manuell", st_alarm: "{n} Alarm",
    m_vacation: "Urlaub", m_auto: "Automatik", m_manual: "Manuell",
    auto_chip: "Automatik",
    st_extended: "Ausgefahren", st_retracted: "Eingefahren", lbl_open: "Offen", lbl_closed: "Geschlossen",
    privacy: "Sichtschutz", my_position: "My-Position",
    single_name: "Shutter Captain – Rollladen",
    single_description: "Ein einzelner Rollladen – ideal für Abschnitte.",
    pick_one: "Rollladen oder Gruppe",
    confirm_one: "Bei „{name}“ ist Tür/Fenster offen (Aussperrschutz). Trotzdem herunterfahren?",
    confirm_many: "Tür/Fenster offen bei: {names}. Diese auch herunterfahren? (Abbrechen = nur die anderen)",
    legacy: "Diese Karte stammt aus einer älteren Version. Öffne „Bearbeiten“ und wähle die Rollläden neu aus.",
  },
  en: {
    name: "Shutter Captain",
    description: "Control shutters with status, schedule and automation – freely styled.",
    open: "Open", close: "Close", stop: "Stop",
    tomorrow: "tomorrow", up: "Up", down: "Down", sun: "Sun",
    shutters_n: "{n} shutters",
    no_entities: "No shutters in this card.",
    unavailable: "unavailable",
    window_open: "Window open", window_tilted: "tilted",
    st_open: "{n} open", st_closed: "{n} closed", st_sun: "{n} sun protection", st_window: "{n} window open",
    st_manual: "{n} manual", st_alarm: "{n} alarm",
    m_vacation: "Vacation", m_auto: "Automatic", m_manual: "Manual",
    auto_chip: "Automatic",
    st_extended: "Extended", st_retracted: "Retracted", lbl_open: "Open", lbl_closed: "Closed",
    privacy: "Privacy", my_position: "My position",
    single_name: "Shutter Captain – shutter",
    single_description: "A single shutter – ideal for sections.",
    pick_one: "Shutter or group",
    confirm_one: "“{name}” has an open door/window (lockout). Close anyway?",
    confirm_many: "Open door/window at: {names}. Close these too? (Cancel = only the others)",
    legacy: "This card comes from an older version. Open “Edit” and choose the shutters again.",
  },
};

const STATE_COLOR = {
  up: "#f2a900", down: "#5c6bc0", intermediate: "#7986cb", sun_protect: "#ff8f00", heat_protect: "#e65100",
  manual: "#8e24aa", paused: "#78909c", window_open: "#00897b", window_locked: "#00695c",
  emergency: "#b71c1c", fire: "#d32f2f", rain: "#1e88e5", wind1: "#26a69a", wind2: "#00796b", frost: "#29b6f6", none: "#9e9e9e",
  frost_lock: "#0277bd", open_partly: "#ffca28", insect: "#7cb342", privacy: "#6d4c41", my_position: "#ab47bc",
};

const FONTS = {
  theme: "",
  system: "system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif",
  rounded: "ui-rounded, \"SF Pro Rounded\", \"Nunito\", \"Varela Round\", \"Segoe UI\", system-ui, sans-serif",
  serif: "\"Iowan Old Style\", Georgia, \"Times New Roman\", serif",
  mono: "ui-monospace, \"Cascadia Code\", \"SF Mono\", Consolas, monospace",
  condensed: "\"Roboto Condensed\", \"Arial Narrow\", \"Segoe UI\", sans-serif-condensed, sans-serif",
};

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const langOf = (hass) => ((hass?.language || "en").startsWith("de") ? "de" : "en");
const tr = (hass, key) => TXT[langOf(hass)][key] ?? TXT.en[key] ?? key;

function statusByCover(hass) {
  const map = {};
  for (const s of Object.values(hass?.states || {})) {
    if (s.attributes?.[DOMAIN] === "shutter") map[s.attributes.cover_entity] = s;
  }
  return map;
}

function hubState(hass) {
  return Object.values(hass?.states || {}).find((s) => s.attributes?.[DOMAIN] === "hub");
}

function friendly(hass, id) {
  return hass.states[id]?.attributes?.friendly_name || id;
}


/** Relative luminance – to keep text readable on a custom background. */
function isDark(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.4;
}

/* ---- Window visuals shared by panel and card: sky by sun position, weather, motion, accents ---- */
const ACCENT_COLORS = {
  amber: "#f59e0b", indigo: "#5c6bc0", teal: "#0d9488", ocean: "#0284c7", forest: "#16a34a", rose: "#e11d48",
};

/** CSS classes for the window: time of day from the sun, plus rain/snow/clouds from the weather. */
function skyClasses(elevation, azimuth, weather) {
  let phase = "day";
  if (typeof elevation === "number") {
    if (elevation < -6) phase = "night";
    else if (elevation < 5) phase = azimuth < 180 ? "dawn" : "dusk";
  }
  const w = String(weather || "");
  let wx = "";
  if (/rain|pouring|lightning/.test(w)) wx = "rain";
  else if (/snow|hail/.test(w)) wx = "snow";
  else if (/cloud|fog/.test(w)) wx = "cloud";
  return { phase, wx };
}

function applySky(win, elevation, azimuth, weather) {
  const { phase, wx } = skyClasses(elevation, azimuth, weather);
  for (const p of ["day", "dawn", "dusk", "night"]) win.classList.toggle(`sky-${p}`, p === phase);
  for (const w of ["rain", "snow", "cloud"]) win.classList.toggle(`wx-${w}`, w === wx);
}

/** opening / closing / null from the cover entity. */
function motionOf(coverState) {
  return coverState === "opening" || coverState === "closing" ? coverState : null;
}

const SKY_CSS = `
.win { transition: background .8s; }
.win.sky-day   { background: linear-gradient(180deg, #4fa8ec 0%, #a9dcff 62%, #e4f4d2 100%); }
.win.sky-dawn  { background: linear-gradient(180deg, #5b6fc7 0%, #e9a1b4 52%, #ffd59a 100%); }
.win.sky-dusk  { background: linear-gradient(180deg, #2f3483 0%, #b9629a 55%, #ffa566 100%); }
.win.sky-night { background: linear-gradient(180deg, #0b1230 0%, #24305f 100%); }
.win .stars { position: absolute; inset: 0; opacity: 0; transition: opacity .8s; pointer-events: none;
  background-image:
    radial-gradient(1.2px 1.2px at 18% 22%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 62% 14%, #fff 50%, transparent 51%),
    radial-gradient(1.4px 1.4px at 80% 38%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 34% 48%, #dfe7ff 50%, transparent 51%),
    radial-gradient(1px 1px at 70% 66%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 24% 78%, #dfe7ff 50%, transparent 51%); }
.win.sky-night .stars { opacity: .9; animation: sc-twinkle 4s ease-in-out infinite; }
.win.sky-night.wx-cloud .stars, .win.sky-night.wx-rain .stars, .win.sky-night.wx-snow .stars { opacity: .15; }
.win .wx { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .6s; }
.win.wx-cloud .wx, .win.wx-rain .wx, .win.wx-snow .wx { opacity: 1; }
.win.sky-night .wx, .win.sky-dusk .wx { filter: brightness(.55); }
.win.wx-cloud .wx, .win.wx-rain .wx, .win.wx-snow .wx {
  background:
    radial-gradient(circle at 25% 18%, rgba(236,240,246,.95) 0 14%, transparent 15%),
    radial-gradient(circle at 42% 14%, rgba(236,240,246,.95) 0 17%, transparent 18%),
    radial-gradient(circle at 60% 20%, rgba(226,232,240,.9) 0 13%, transparent 14%),
    linear-gradient(180deg, rgba(120,132,150,.45), rgba(160,170,186,.25)); }
.win.wx-rain .wx::after, .win.wx-snow .wx::after { content: ""; position: absolute; inset: -20px 0 0 0; }
.win.wx-rain .wx::after {
  background-image: repeating-linear-gradient(104deg, transparent 0 7px, rgba(255,255,255,.65) 7px 8px, transparent 8px 15px);
  background-size: 15px 15px; animation: sc-rain .45s linear infinite; }
.win.wx-snow .wx::after {
  background-image: radial-gradient(1.6px 1.6px at 20% 30%, #fff 60%, transparent 61%), radial-gradient(1.4px 1.4px at 70% 10%, #fff 60%, transparent 61%),
    radial-gradient(1.8px 1.8px at 45% 65%, #fff 60%, transparent 61%), radial-gradient(1.2px 1.2px at 85% 80%, #fff 60%, transparent 61%);
  background-size: 100% 50%; animation: sc-snow 3s linear infinite; }
.win.moving-closing .slats { animation: sc-slats-down .55s linear infinite; }
.win.moving-opening .slats { animation: sc-slats-up .55s linear infinite; }
.win .mv { position: absolute; right: 4px; top: 4px; z-index: 3; width: 18px; height: 18px; border-radius: 50%;
  display: none; place-items: center; background: var(--sc-motion, #fff); color: #263238; --mdc-icon-size: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.35); animation: sc-pulse 1s ease-in-out infinite; }
.win.moving-opening .mv, .win.moving-closing .mv { display: grid; }
@keyframes sc-twinkle { 0%, 100% { opacity: .9; } 50% { opacity: .55; } }
@keyframes sc-rain { to { background-position: -4px 15px; } }
@keyframes sc-snow { to { background-position: 6px 100%; } }
@keyframes sc-slats-down { to { background-position: 0 7px; } }
@keyframes sc-slats-up { to { background-position: 0 -7px; } }
@keyframes sc-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
@media (prefers-reduced-motion: reduce) {
  .win .stars, .win .wx::after, .win .slats, .win .mv { animation: none !important; }
}
`;


const SHARED_CSS = SKY_CSS + `
  :host { --sc-chip: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    --sc-muted: var(--secondary-text-color); --sc-line: var(--divider-color); --sc-accent: var(--primary-color); }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; border: 0; border-radius: 999px;
    padding: 6px; min-width: 34px; height: 34px; font: inherit; font-size: 13px; cursor: pointer;
    background: var(--sc-chip); color: var(--primary-text-color); --mdc-icon-size: 18px; transition: background .15s, transform .1s; }
  .btn:hover { background: color-mix(in srgb, var(--primary-text-color) 13%, transparent); }
  .btn:active { transform: scale(.94); }
  .btn[disabled] { opacity: .4; cursor: default; }
  .chip { display: inline-flex; align-items: center; gap: 3px; padding: 3px 9px; border-radius: 999px; border: 0; font: inherit;
    font-size: 11px; background: var(--sc-chip); color: var(--primary-text-color); --mdc-icon-size: 13px; cursor: pointer; }
  .chip.on { background: color-mix(in srgb, var(--sc-accent) 18%, transparent); color: var(--sc-accent); font-weight: 600; }
`;

const CARD_CSS = SHARED_CSS + `
  ha-card { overflow: hidden; border-radius: var(--sc-radius-card, var(--ha-card-border-radius, 16px)); }
  ha-card.custom-bg { background: var(--sc-bg); }
  ha-card.has-image { background: linear-gradient(rgba(0,0,0,var(--sc-dim, .3)), rgba(0,0,0,var(--sc-dim, .3))), var(--sc-image) center / cover no-repeat, var(--sc-bg, #2b3445); }
  ha-card.has-image .tile, ha-card.has-image .cchip { background: color-mix(in srgb, var(--card-background-color, #fff) 72%, transparent); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
  ha-card.has-image .head, ha-card.has-image .bar { text-shadow: 0 1px 3px rgba(0,0,0,.35); }
  ha-card .wrap { font-family: var(--sc-font, inherit); }
  ha-card.shape-soft { --sc-radius-card: 26px; --sc-radius: 20px; --sc-radius-chip: 999px; }
  ha-card.shape-rounded { --sc-radius: 14px; --sc-radius-chip: 999px; }
  ha-card.shape-square { --sc-radius-card: 4px; --sc-radius: 4px; --sc-radius-chip: 4px; }
  ha-card.shape-square .btn, ha-card.shape-square .chip, ha-card.shape-square .mode { border-radius: 4px; }
  .wrap { container-type: inline-size; padding: 14px; display: grid; gap: 10px; }
  .head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 2px; }
  .head .t { flex: 1; min-width: 120px; }
  .head h2 { margin: 0; font-size: 18px; font-weight: 600; line-height: 1.25; }
  .head .sub { font-size: 12px; color: var(--sc-muted); }
  .head .ctl { display: flex; gap: 6px; }
  .bar { display: flex; flex-wrap: wrap; gap: 6px; }
  .stat { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: var(--sc-radius-chip, 999px); font-size: 12px; font-weight: 600;
    color: var(--c); background: color-mix(in srgb, var(--c) 13%, transparent); --mdc-icon-size: 14px; }
  .mode { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--sc-line);
    background: transparent; color: var(--primary-text-color); font: inherit; font-size: 13px; cursor: pointer; --mdc-icon-size: 16px; transition: background .15s, color .15s; }
  .mode:hover { background: var(--sc-chip); }
  .mode.on { background: var(--sc-accent); border-color: var(--sc-accent); color: var(--text-primary-color, #fff); font-weight: 600; }
  .tiles { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }
  .tiles.list { grid-template-columns: 1fr; }
  .tile { position: relative; display: grid; grid-template-columns: 54px 1fr; gap: 10px 12px; padding: 12px; border-radius: var(--sc-radius, 14px);
    background: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary-text-color) 7%, transparent); overflow: hidden; min-width: 0; }
  .tile::before { content: ""; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px; border-radius: 0 3px 3px 0; background: var(--sc-color); }
  .tile.group { background: color-mix(in srgb, var(--sc-accent) 9%, transparent); }
  .win { width: 54px; height: 66px; border-radius: 9px; position: relative; overflow: hidden; cursor: pointer;
    background: linear-gradient(180deg, #8ecdf5 0%, #cfeaff 70%, #e9f5d8 100%);
    box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--primary-text-color) 18%, var(--card-background-color, #fff)); }
  .win .mullion { position: absolute; left: 50%; top: 3px; bottom: 3px; width: 2px; transform: translateX(-50%);
    background: color-mix(in srgb, var(--primary-text-color) 18%, var(--card-background-color, #fff)); }
  .win .slats { position: absolute; left: 3px; right: 3px; top: 3px; height: 0; border-radius: 3px 3px 2px 2px;
    background: repeating-linear-gradient(180deg, #b0b7c3 0 5px, #8f97a6 5px 7px); box-shadow: 0 1px 3px rgba(0,0,0,.25);
    transition: height 1.2s cubic-bezier(.4,0,.2,1); }
  .win .slats::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: #6b7280; border-radius: 2px; }
  .win .pct { position: absolute; left: 4px; bottom: 4px; background: rgba(0,0,0,.55); color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 5px; font-variant-numeric: tabular-nums; }
  .win .sun { position: absolute; right: -6px; top: -6px; width: 24px; height: 24px; border-radius: 50%;
    background: radial-gradient(circle, #ffd54f 0 40%, rgba(255,213,79,0) 70%); opacity: 0; transition: opacity .6s; }
  .win.sunny .sun { opacity: 1; }
  .info { min-width: 0; }
  .name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
  .status { display: flex; align-items: center; gap: 4px; margin-top: 2px; font-size: 12px; font-weight: 600; color: var(--sc-color); --mdc-icon-size: 13px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .times { display: flex; flex-wrap: wrap; gap: 2px 10px; margin-top: 4px; font-size: 12px; color: var(--sc-muted); font-variant-numeric: tabular-nums; --mdc-icon-size: 13px; }
  .times span { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
  .times b { color: var(--primary-text-color); font-weight: 500; }
  .times small { font-size: 10px; color: var(--sc-muted); margin-left: 2px; }
  .row { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .row input[type=range] { flex: 1 1 110px; min-width: 60px; accent-color: var(--sc-color); }
  .chips { grid-column: 1 / -1; display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
  .am { display: inline-flex; padding: 2px; border-radius: 999px; background: var(--sc-chip); }
  .am button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 11px; padding: 3px 10px; border-radius: 999px; cursor: pointer; }
  .am button.on { background: var(--sc-accent); color: var(--text-primary-color, #fff); font-weight: 600; }
  .empty { color: var(--sc-muted); font-size: 14px; padding: 8px 4px; display: grid; gap: 10px; justify-items: start; }
  .linkbtn { border: 0; background: var(--sc-accent); color: var(--text-primary-color, #fff); border-radius: 999px; padding: 8px 14px; font: inherit; font-size: 13px; cursor: pointer; }
  .tiles.chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .cchip { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px 5px 5px; border-radius: var(--sc-radius-chip, 999px); cursor: pointer;
    background: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
    border: 1px solid color-mix(in srgb, var(--sc-color) 45%, transparent); transition: transform .1s, background .15s; max-width: 100%; min-width: 0; }
  .cchip:hover { background: color-mix(in srgb, var(--sc-color) 10%, transparent); }
  .cchip:active { transform: scale(.97); }
  .cchip .win { width: 26px; height: 30px; border-radius: 7px; flex: none; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--primary-text-color) 18%, var(--card-background-color, #fff)); }
  .cchip .win .slats { left: 2px; right: 2px; top: 2px; }
  .cchip .win .mv { width: 12px; height: 12px; right: 2px; top: 2px; --mdc-icon-size: 10px; }
  .win.t-awning .mullion, .win.t-garage .mullion, .win.t-garage .sun { display: none; }
  .win.t-awning .slats { background: repeating-linear-gradient(90deg, #ef6c00 0 6px, #fff3e0 6px 12px); border-radius: 0 0 6px 6px; }
  .win.t-awning .slats::after { height: 4px; bottom: -2px; background: radial-gradient(circle at 4px 0, #ef6c00 3px, transparent 4px) 0 0 / 8px 4px repeat-x; border-radius: 0; }
  .win.t-garage { background: linear-gradient(180deg, #263238, #37474f) !important; }
  .win.t-garage .slats { background: repeating-linear-gradient(180deg, #eceff1 0 9px, #b0bec5 9px 11px); }
  .win.t-garage .stars, .win.t-garage .wx { display: none; }
  .win.t-roof { border-radius: 8px 8px 3px 3px; transform: perspective(160px) rotateX(12deg); }
  .win.t-roof .mullion { display: none; }
  .win.t-roof .slats { background: linear-gradient(180deg, rgba(187,222,251,.6), rgba(100,181,246,.4)); border-bottom: 3px solid #546e7a; }
  .win.t-roof .slats::after { display: none; }
  .cchip .cn { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
  .cchip .cn b { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cchip .cn span { font-size: 11px; color: var(--sc-color); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ---- responsive: the card adapts to its own width ---- */
  @container (min-width: 560px) {
    .tiles.list .tile { grid-template-columns: 54px minmax(0, 1fr) minmax(220px, 40%); align-items: center; }
    .tiles.list .tile .row { grid-column: 3; grid-row: 1; }
    .tiles.list .tile .chips { grid-column: 2 / -1; }
  }
  @container (max-width: 380px) {
    .wrap { padding: 10px; gap: 8px; }
    .head h2 { font-size: 16px; }
    .tile { grid-template-columns: 42px 1fr; padding: 10px; gap: 8px 10px; }
    .win { width: 42px; height: 52px; }
    .btn { min-width: 30px; height: 30px; }
    .mode { padding: 5px 10px; font-size: 12px; }
  }
  @container (max-width: 260px) {
    .tile .times, .tile .chips { display: none; }
    .row input[type=range] { display: none; }
    .row { justify-content: space-between; }
    .head .ctl .btn { min-width: 28px; height: 28px; }
    .stat { font-size: 11px; padding: 2px 7px; }
  }
`;

/* ================================================================ card */

class ShutterCaptainCard extends HTMLElement {
  static getConfigElement() { return document.createElement(EDITOR); }

  static getStubConfig(hass) {
    // The full card starts as the complete overview of every shutter.
    return { title: langOf(hass) === "de" ? "Rollläden" : "Shutters", all_shutters: true };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tiles = new Map();
    this._dragging = false;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._raw = config;
    this._built = false;
    this._sig = null;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  /** Template from the panel (card: id) merged with inline options. */
  _resolve() {
    const { type: _t, card, ...inline } = this._raw || {};
    // Cards from 2.3.0 pointed to a panel design by id – those designs no longer exist.
    this._missing = card && !inline.entities && !inline.all_shutters ? card : null;
    const base = {};
    const cfg = { ...CARD_DEFAULTS, ...base, ...inline };
    cfg.entities = (cfg.entities || []).map((e) => (typeof e === "string" ? e : e.entity)).filter(Boolean);
    if (cfg.all_shutters) {
      // Every shutter set up in Shutter Captain – new ones appear automatically.
      cfg.entities = Object.keys(statusByCover(this._hass))
        .filter((id) => this._hass.states[id])
        .sort((a, b) => friendly(this._hass, a).localeCompare(friendly(this._hass, b)));
    }
    return cfg;
  }

  getCardSize() {
    const c = this._config || CARD_DEFAULTS;
    return 2 + Math.ceil((c.entities?.length || 1) / (c.layout === "grid" ? 2 : c.layout === "chips" ? 4 : 1)) * (c.layout === "chips" ? 1 : 3);
  }

  getGridOptions() { return { columns: 12, min_columns: 3, rows: "auto" }; }

  _render() {
    if (!this._raw || !this._hass) return;
    const cfg = this._resolve();
    const status = statusByCover(this._hass);
    const hub = hubState(this._hass);
    const members = this._members(cfg.entities);
    const sig = JSON.stringify(cfg) + cfg.entities.concat(members).map((id) => `${this._hass.states[id]?.last_updated}|${status[id]?.last_updated}`).join(",")
      + this._hass.language + (hub?.last_updated || "") + (this._vacationId() ? this._hass.states[this._vacationId()]?.state : "");
    if (sig === this._sig && this._built) return;
    const layoutChanged = !this._config || this._config.layout !== cfg.layout;
    this._sig = sig;
    this._config = cfg;
    this._hub = hub;
    if (!this._built || layoutChanged) this._build();
    this._applyLook();
    if (this._missing) { this._renderMissing(); return; }
    this._renderHeader(cfg.entities, members);
    this._renderBars(members, status);
    this._renderTiles(cfg.entities, status);
  }

  /** Real shutters behind the selected entities (groups expanded). */
  _members(ids) {
    const set = new Set();
    for (const id of ids) {
      const m = this._hass.states[id]?.attributes?.entity_id;
      (Array.isArray(m) ? m : [id]).forEach((x) => set.add(x));
    }
    return [...set];
  }

  _vacationId() {
    return Object.values(this._hass?.entities || {}).find((e) => e.platform === DOMAIN && e.translation_key === "vacation")?.entity_id;
  }

  _build() {
    this._built = true;
    this._tiles.clear();
    const c = this._config;
    this.shadowRoot.innerHTML = `
      <style>${CARD_CSS}</style>
      <ha-card>
        <div class="wrap">
          <div class="head" id="head"></div>
          <div class="bar" id="modes"></div>
          <div class="bar" id="stats"></div>
          <div class="tiles ${c.layout === "list" ? "list" : c.layout === "chips" ? "chips" : ""}" id="tiles"></div>
        </div>
      </ha-card>`;
    this.shadowRoot.getElementById("head").addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-all]");
      if (!b) return;
      const service = { open: "open_cover", stop: "stop_cover", close: "close_cover" }[b.dataset.all];
      const targets = this._config.entities.filter((id) => this._hass.states[id] && this._hass.states[id].state !== "unavailable");
      if (!targets.length) return;
      if (service === "close_cover") { this._closeWithConfirm(targets); return; }
      this._hass.callService("cover", service, { entity_id: targets });
    });
    this.shadowRoot.getElementById("modes").addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-mode]");
      if (!b) return;
      const members = this._members(this._config.entities).filter((id) => statusByCover(this._hass)[id]);
      if (b.dataset.mode === "vacation") {
        const id = this._vacationId();
        if (id) this._hass.callService("switch", "toggle", { entity_id: id });
      } else if (members.length) {
        this._hass.callService(DOMAIN, b.dataset.mode === "auto" ? "resume" : "pause", { entity_id: members });
      }
    });
  }

  _applyLook() {
    const c = this._config;
    const card = this.shadowRoot.querySelector("ha-card");
    card.className = `shape-${c.shape || "rounded"}${c.background ? " custom-bg" : ""}${c.background_image ? " has-image" : ""}`;
    if (FONTS[c.font]) card.style.setProperty("--sc-font", FONTS[c.font]);
    else card.style.removeProperty("--sc-font");
    if (c.background_image) {
      card.style.setProperty("--sc-image", `url("${String(c.background_image).replace(/["\\\n]/g, "")}")`);
      card.style.setProperty("--sc-dim", String((Number(c.image_dim) || 0) / 100));
    } else {
      card.style.removeProperty("--sc-image");
      card.style.removeProperty("--sc-dim");
    }
    const accent = ACCENT_COLORS[c.color] || (/^#/.test(c.color || "") ? c.color : ACCENT_COLORS[this._hub?.attributes?.accent]);
    if (accent) this.style.setProperty("--sc-accent", accent);
    else this.style.removeProperty("--sc-accent");
    if (c.background) {
      card.style.setProperty("--sc-bg", c.background);
      const dark = isDark(c.background);
      if (dark !== null) {
        card.style.setProperty("--primary-text-color", dark ? "#eef1f6" : "#1f2328");
        card.style.setProperty("--secondary-text-color", dark ? "#a9b0bd" : "#5f6670");
      }
    } else {
      ["--sc-bg", "--primary-text-color", "--secondary-text-color"].forEach((p) => card.style.removeProperty(p));
    }
    // Explicit text colour wins; on a darkened photo default to light text.
    const text = /^#/.test(c.text_color || "") ? c.text_color : (c.background_image && !c.background && Number(c.image_dim) >= 25 ? "#ffffff" : "");
    if (text) {
      card.style.setProperty("--primary-text-color", text);
      card.style.setProperty("--secondary-text-color", `color-mix(in srgb, ${text} 72%, transparent)`);
    }
  }

  _renderMissing() {
    this.shadowRoot.getElementById("head").innerHTML = "";
    this.shadowRoot.getElementById("modes").innerHTML = "";
    this.shadowRoot.getElementById("stats").innerHTML = "";
    const box = this.shadowRoot.getElementById("tiles");
    this._tiles.clear();
    box.innerHTML = `<div class="empty">${esc(tr(this._hass, "legacy"))}</div>`;
  }

  _renderHeader(ids, members) {
    const c = this._config;
    const head = this.shadowRoot.getElementById("head");
    const hasTitle = !!c.title;
    head.hidden = !hasTitle && !c.show_header_controls;
    head.innerHTML = `
      <div class="t">${hasTitle ? `<h2>${esc(c.title)}</h2>` : ""}
        <div class="sub">${esc(tr(this._hass, "shutters_n").replace("{n}", members.length))}</div></div>
      ${c.show_header_controls && ids.length ? `<div class="ctl">
        <button class="btn" data-all="open" title="${esc(tr(this._hass, "open"))}"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="btn" data-all="stop" title="${esc(tr(this._hass, "stop"))}"><ha-icon icon="mdi:stop"></ha-icon></button>
        <button class="btn" data-all="close" title="${esc(tr(this._hass, "close"))}"><ha-icon icon="mdi:arrow-down"></ha-icon></button></div>` : ""}`;
  }

  _renderBars(members, status) {
    const c = this._config;
    const states = members.map((id) => status[id]).filter(Boolean);
    const count = (fn) => states.filter(fn).length;
    const manual = count((s) => ["manual", "paused"].includes(s.state));

    const modes = this.shadowRoot.getElementById("modes");
    const parts = [];
    if (c.show_vacation) {
      const id = this._vacationId();
      const on = id && this._hass.states[id]?.state === "on";
      parts.push(`<button class="mode ${on ? "on" : ""}" data-mode="vacation"><ha-icon icon="mdi:beach"></ha-icon>${esc(tr(this._hass, "m_vacation"))}</button>`);
    }
    if (c.show_auto_mode) parts.push(`<button class="mode ${states.length && !manual ? "on" : ""}" data-mode="auto"><ha-icon icon="mdi:autorenew"></ha-icon>${esc(tr(this._hass, "m_auto"))}</button>`);
    if (c.show_manual_mode) parts.push(`<button class="mode ${manual ? "on" : ""}" data-mode="manual"><ha-icon icon="mdi:hand-back-right-outline"></ha-icon>${esc(tr(this._hass, "m_manual"))}${manual ? ` · ${manual}` : ""}</button>`);
    modes.innerHTML = parts.join("");
    modes.hidden = !parts.length;

    const stats = this.shadowRoot.getElementById("stats");
    if (!c.show_status_chips) { stats.hidden = true; return; }
    const defs = [
      ["st_open", "mdi:window-shutter-open", "#f2a900", (s) => ["up", "open_partly"].includes(s.state)],
      ["st_closed", "mdi:window-shutter", "#5c6bc0", (s) => ["down", "intermediate"].includes(s.state)],
      ["st_sun", "mdi:weather-sunny", "#ff8f00", (s) => ["sun_protect", "heat_protect"].includes(s.state)],
      ["st_window", "mdi:window-open-variant", "#00897b", (s) => (s.attributes.window || "closed") !== "closed"],
      ["st_manual", "mdi:hand-back-right", "#8e24aa", (s) => ["manual", "paused"].includes(s.state)],
      ["st_alarm", "mdi:alert", "#d32f2f", (s) => ["emergency", "fire", "rain", "wind1", "wind2", "frost", "frost_lock"].includes(s.state)],
    ];
    const html = defs.map(([key, icon, color, fn]) => {
      const n = count(fn);
      return n ? `<span class="stat" style="--c:${color}"><ha-icon icon="${icon}"></ha-icon>${esc(tr(this._hass, key).replace("{n}", n))}</span>` : "";
    }).join("");
    stats.innerHTML = html;
    stats.hidden = !html;
  }

  _renderTiles(ids, status) {
    const box = this.shadowRoot.getElementById("tiles");
    if (!ids.length) {
      box.innerHTML = `<div class="empty">${esc(tr(this._hass, "no_entities"))}</div>`;
      this._tiles.clear();
      return;
    }
    box.querySelector(".empty")?.remove();
    for (const [id, el] of this._tiles) if (!ids.includes(id)) { el.remove(); this._tiles.delete(id); }
    ids.forEach((id, i) => {
      let el = this._tiles.get(id);
      if (!el) { el = this._createTile(id); this._tiles.set(id, el); }
      if (box.children[i] !== el) box.insertBefore(el, box.children[i] || null);
      this._updateTile(el, id, status[id]);
    });
  }

  _createTile(id) {
    if (this._config.layout === "chips") {
      const chip = document.createElement("div");
      chip.className = "cchip";
      chip.innerHTML = '<div class="win"><div class="stars"></div><div class="wx"></div><div class="slats"></div><div class="mv"><ha-icon></ha-icon></div></div><div class="cn"><b></b><span></span></div>';
      chip.addEventListener("click", () => this._moreInfo(id));
      return chip;
    }
    const el = document.createElement("div");
    el.className = "tile";
    el.innerHTML = `
      <div class="win" data-more><div class="stars"></div><div class="wx"></div><div class="mullion"></div><div class="sun"></div><div class="slats"></div><div class="mv"><ha-icon></ha-icon></div><div class="pct"></div></div>
      <div class="info">
        <div class="name" data-more></div>
        <div class="status"><ha-icon></ha-icon><span></span></div>
        <div class="times"></div>
      </div>
      <div class="row">
        <button class="btn" data-act="open_cover"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="btn" data-act="stop_cover"><ha-icon icon="mdi:stop"></ha-icon></button>
        <button class="btn" data-act="close_cover"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
        <button class="btn pos" data-pos="privacy" hidden><ha-icon icon="mdi:eye-off-outline"></ha-icon></button>
        <button class="btn pos" data-pos="my_position" hidden><ha-icon icon="mdi:star-outline"></ha-icon></button>
        <input type="range" min="0" max="100" step="1">
      </div>
      <div class="chips"></div>`;
    const range = el.querySelector("input");
    range.addEventListener("pointerdown", () => { this._dragging = true; });
    range.addEventListener("change", () => {
      const now = Number(this._hass.states[id]?.attributes?.current_position ?? 100);
      if (Number(range.value) < now && this._lockedMembers([id]).length) {
        const names = this._lockedMembers([id]).map((m) => friendly(this._hass, m)).join(", ");
        if (!confirm(tr(this._hass, "confirm_many").replace("{names}", names))) {
          this._dragging = false;
          range.value = now;
          return;
        }
        // Confirmed: move the members directly (group covers would skip them).
        this._dragging = false;
        this._hass.callService("cover", "set_cover_position", { entity_id: this._members([id]), position: Number(range.value) });
        return;
      }
      this._dragging = false;
      this._hass.callService("cover", "set_cover_position", { entity_id: id, position: Number(range.value) });
    });
    el.addEventListener("click", (ev) => {
      const act = ev.target.closest("[data-act]");
      if (act) {
        if (act.dataset.act === "close_cover") this._closeWithConfirm([id]);
        else this._hass.callService("cover", act.dataset.act, { entity_id: id });
        return;
      }
      const posBtn = ev.target.closest("[data-pos]");
      if (posBtn) { this._position(id, posBtn.dataset.pos); return; }
      const am = ev.target.closest("[data-am]");
      if (am) { this._hass.callService("switch", am.dataset.am === "on" ? "turn_on" : "turn_off", { entity_id: am.dataset.sw }); return; }
      const auto = ev.target.closest("[data-switch]");
      if (auto) { this._hass.callService("switch", "toggle", { entity_id: auto.dataset.switch }); return; }
      if (ev.target.closest("[data-more]")) this._moreInfo(id);
    });
    return el;
  }

  /** Shutters (group members expanded) whose closing is blocked by an open door/window. */
  _lockedMembers(ids) {
    const status = statusByCover(this._hass);
    return this._members(ids).filter((id) => status[id]?.attributes?.closing_locked);
  }

  /** Close, but ask first for shutters in front of an open door. Returns nothing. */
  _closeWithConfirm(ids) {
    const locked = this._lockedMembers(ids);
    if (!locked.length) { this._hass.callService("cover", "close_cover", { entity_id: ids }); return; }
    const names = locked.map((id) => friendly(this._hass, id));
    const single = locked.length === 1 && ids.length === 1 && !Array.isArray(this._hass.states[ids[0]]?.attributes?.entity_id);
    const ok = confirm(single ? tr(this._hass, "confirm_one").replace("{name}", names[0]) : tr(this._hass, "confirm_many").replace("{names}", names.join(", ")));
    // Confirmed: every shutter directly. Not confirmed: only the unlocked ones.
    const targets = ok ? this._members(ids) : this._members(ids).filter((id) => !locked.includes(id));
    if (targets.length) this._hass.callService("cover", "close_cover", { entity_id: targets });
  }

  /** Privacy / My position (Shutter Captain service); in front of an open door only after confirmation. */
  _position(id, service) {
    const st = statusByCover(this._hass)[id];
    const a = st?.attributes;
    if (!a) return;
    const level = Number(service === "privacy" ? a.privacy_level : a.my_level);
    let override = false;
    if (typeof a.position === "number" && level < a.position - 2 && a.closing_locked) {
      if (!confirm(tr(this._hass, "confirm_one").replace("{name}", friendly(this._hass, id)))) return;
      override = true;
    }
    this._hass.callService(DOMAIN, service, { entity_id: id, override_lockout: override });
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _autoSwitch(statusId, key) {
    const ents = this._hass.entities || {};
    const device = ents[statusId]?.device_id;
    if (!device) return undefined;
    return Object.values(ents).find((e) => e.device_id === device && e.platform === DOMAIN && e.translation_key === key)?.entity_id;
  }

  _fmt(iso) {
    if (!iso) return "–";
    const d = new Date(iso);
    const locale = langOf(this._hass) === "de" ? "de-DE" : "en-GB";
    const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return time;
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return `${time} <small>${esc(tr(this._hass, "tomorrow"))}</small>`;
    return `${d.toLocaleDateString(locale, { weekday: "short" })} ${time}`;
  }

  _updateTile(el, id, statusState) {
    const c = this._config;
    const st = this._hass.states[id];
    const isGroup = Array.isArray(st?.attributes?.entity_id);
    const avail = st && st.state !== "unavailable";
    const pos = avail ? (typeof st.attributes.current_position === "number" ? st.attributes.current_position
      : st.state === "open" ? 100 : st.state === "closed" ? 0 : null) : null;
    const autoState = statusState?.state;
    const dtype = statusState?.attributes?.device_type || "shutter";
    const color = !avail ? STATE_COLOR.none : STATE_COLOR[autoState] || (isGroup ? "var(--sc-accent)" : STATE_COLOR.none);
    el.classList.toggle("group", isGroup);
    el.style.setProperty("--sc-color", color);

    let label;
    let icon;
    if (!st || !avail) { label = tr(this._hass, "unavailable"); icon = "mdi:alert-circle-outline"; }
    else if (statusState) {
      label = this._hass.formatEntityState ? this._hass.formatEntityState(statusState) : autoState;
      const own = { awning: { sun_protect: "st_extended", down: "st_retracted", up: "st_retracted" }, garage: { up: "lbl_open", down: "lbl_closed" }, roof_window: { up: "lbl_open", down: "lbl_closed" } }[dtype]?.[autoState];
      if (own) label = tr(this._hass, own);
      icon = statusState.attributes.icon || "mdi:window-shutter-auto";
      if (statusState.attributes.window && statusState.attributes.window !== "closed" && !["window_open", "window_locked"].includes(autoState)) {
        label += ` · ${tr(this._hass, statusState.attributes.window === "tilted" ? "window_tilted" : "window_open")}`;
      }
    } else {
      label = this._hass.formatEntityState ? this._hass.formatEntityState(st) : st.state;
      icon = isGroup ? "mdi:window-shutter-cog" : "mdi:window-shutter";
      if (isGroup) label += ` · ${tr(this._hass, "shutters_n").replace("{n}", st.attributes.entity_id.length)}`;
    }

    const win = el.querySelector(".win");
    const hubA = this._hub?.attributes || {};
    const sunEl = typeof hubA.sun_elevation === "number" ? hubA.sun_elevation : this._hass.states["sun.sun"]?.attributes?.elevation ?? null;
    applySky(win, sunEl, Number(hubA.sun_azimuth ?? this._hass.states["sun.sun"]?.attributes?.azimuth ?? 180), hubA.weather);
    const motion = motionOf(st?.state);
    win.classList.toggle("t-awning", dtype === "awning");
    win.classList.toggle("t-garage", dtype === "garage");
    win.classList.toggle("t-roof", dtype === "roof_window");
    win.classList.toggle("moving-opening", motion === "opening");
    win.classList.toggle("moving-closing", motion === "closing");
    win.classList.toggle("sunny", autoState === "sun_protect" || autoState === "heat_protect");
    if (motion) win.querySelector(".mv ha-icon").setAttribute("icon", motion === "opening" ? "mdi:arrow-up" : "mdi:arrow-down");

    if (el.classList.contains("cchip")) {
      const coverC = dtype === "awning" ? pos : pos === null ? null : 100 - pos;
      el.querySelector(".slats").style.height = coverC === null ? "0" : `calc(${coverC}% - ${coverC * 0.04}px)`;
      el.querySelector(".cn b").textContent = st ? friendly(this._hass, id) : id;
      el.querySelector(".cn span").textContent = pos === null ? label : `${label} · ${pos}%`;
      el.title = el.querySelector(".cn span").textContent;
      return;
    }

    el.querySelector(".name").textContent = st ? friendly(this._hass, id) : id;
    if (dtype === "awning" && ["up", "down", "sun_protect"].includes(autoState)) icon = autoState === "sun_protect" ? "mdi:awning" : "mdi:awning-outline";
    if (dtype === "garage") icon = autoState === "up" ? "mdi:garage-open-variant" : "mdi:garage-variant";
    if (dtype === "roof_window") icon = autoState === "up" ? "mdi:window-open-variant" : "mdi:window-closed-variant";
    el.querySelector(".status ha-icon").setAttribute("icon", icon);
    el.querySelector(".status span").textContent = label;
    const times = el.querySelector(".times");
    const a = statusState?.attributes;
    times.hidden = !c.show_times || !a || dtype === "garage" || dtype === "roof_window";
    if (a) times.innerHTML = `<span><ha-icon icon="mdi:arrow-up"></ha-icon><b>${this._fmt(a.next_open)}</b></span><span><ha-icon icon="mdi:arrow-down"></ha-icon><b>${this._fmt(a.next_close)}</b></span>`;
    const coverT = dtype === "awning" ? pos : pos === null ? null : 100 - pos;
    el.querySelector(".slats").style.height = coverT === null ? "0" : `calc(${coverT}% - ${coverT * 0.06}px)`;
    el.querySelector(".pct").textContent = pos === null ? "–" : `${pos}%`;

    const row = el.querySelector(".row");
    row.querySelectorAll("button").forEach((b) => { b.disabled = !avail; });
    // Privacy / My position: only for Shutter Captain shutters and awnings, if enabled in the card.
    const posOk = !!a && c.show_positions !== false && ["shutter", "awning"].includes(dtype) && !isGroup;
    row.querySelectorAll("[data-pos]").forEach((b) => {
      b.hidden = !posOk;
      if (posOk) b.title = `${tr(this._hass, b.dataset.pos)} · ${b.dataset.pos === "privacy" ? a.privacy_level : a.my_level}%`;
    });
    const range = row.querySelector("input");
    range.hidden = !c.show_slider;
    range.disabled = !avail || pos === null;
    if (!this._dragging && pos !== null) range.value = pos;

    const chips = el.querySelector(".chips");
    const showChips = c.show_automation && statusState;
    const garageOnly = dtype === "garage" || dtype === "roof_window";
    chips.hidden = !showChips;
    if (showChips) {
      const autoSw = this._autoSwitch(statusState.entity_id, "automation");
      chips.innerHTML = `<span class="am"><button class="${!a.manual ? "on" : ""}" ${autoSw ? `data-am="on" data-sw="${esc(autoSw)}"` : ""}>${esc(tr(this._hass, "m_auto"))}</button><button class="${a.manual ? "on" : ""}" ${autoSw ? `data-am="off" data-sw="${esc(autoSw)}"` : ""}>${esc(tr(this._hass, "m_manual"))}</button></span>`
        + (garageOnly ? [] : [["auto_up", "mdi:arrow-up-bold-box-outline", "up"], ["auto_down", "mdi:arrow-down-bold-box-outline", "down"], ["auto_sun", "mdi:weather-sunny", "sun"]])
        .map(([key, ic, lbl]) => {
          const sw = this._autoSwitch(statusState.entity_id, key);
          return `<button class="chip ${a[key] ? "on" : ""}" ${sw ? `data-switch="${esc(sw)}"` : ""}><ha-icon icon="${ic}"></ha-icon>${esc(tr(this._hass, lbl))}</button>`;
        }).join("");
    }
  }
}

/* ================================================================ editor */

const ED_TXT = {
  de: {
    sec_shutters: "Rollläden", sec_look: "Aussehen", sec_show: "Anzeigen", sec_modes: "Modus-Schalter",
    all_shutters: "Alle Rollläden von Shutter Captain (automatisch)",
    all_note: "Enthält immer jeden Shutter-Captain-Rollladen, auch später hinzugefügte.",
    in_card: "In der Karte – mit der Maus verschieben", available: "Hinzufügen",
    groups: "Gruppen", single: "Rollläden", empty_sel: "Noch nichts ausgewählt – unten Rollläden hinzufügen.",
    none_found: "Keine Shutter-Captain-Rollläden gefunden. Richte zuerst Rollläden im Panel „Shutter Captain“ ein.",
    remove: "Entfernen", add: "Hinzufügen",
    title: "Titel", layout: "Darstellung", l_grid: "Raster", l_list: "Liste", l_chips: "Kompakt",
    shape: "Form", s_rounded: "Rund", s_soft: "Weich", s_square: "Eckig",
    color: "Akzentfarbe", background: "Hintergrund", text_color: "Schriftfarbe", c_default: "Standard", c_custom: "Eigene Farbe",
    font: "Schriftart", f_theme: "Theme", f_system: "System", f_rounded: "Rund", f_serif: "Serif", f_mono: "Mono", f_condensed: "Schmal",
    bg_image: "Hintergrundbild", bg_upload: "Bild hochladen", bg_remove: "Entfernen", bg_url: "oder Adresse: /local/… oder https://…", bg_dim: "Abdunkeln",
    uploading: "Lade hoch …",
    show_status_chips: "Status-Chips (z. B. „3 offen“)", show_header_controls: "Auf/Stopp/Ab für alle",
    show_times: "Nächste Zeiten", show_automation: "Automatik-Schalter je Rollladen", show_slider: "Schieberegler", show_positions: "Knöpfe Sichtschutz / My-Position",
    show_vacation: "Urlaub", show_auto_mode: "Automatik (alle fortsetzen)", show_manual_mode: "Manuell (alle pausieren)",
  },
  en: {
    sec_shutters: "Shutters", sec_look: "Look", sec_show: "Show", sec_modes: "Mode switches",
    all_shutters: "All Shutter Captain shutters (automatic)",
    all_note: "Always contains every Shutter Captain shutter, including ones added later.",
    in_card: "In the card – drag with the mouse", available: "Add",
    groups: "Groups", single: "Shutters", empty_sel: "Nothing selected yet – add shutters below.",
    none_found: "No Shutter Captain shutters found. Set up shutters in the “Shutter Captain” panel first.",
    remove: "Remove", add: "Add",
    title: "Title", layout: "Layout", l_grid: "Grid", l_list: "List", l_chips: "Compact",
    shape: "Shape", s_rounded: "Round", s_soft: "Soft", s_square: "Square",
    color: "Accent colour", background: "Background", text_color: "Text colour", c_default: "Default", c_custom: "Custom colour",
    font: "Font", f_theme: "Theme", f_system: "System", f_rounded: "Rounded", f_serif: "Serif", f_mono: "Mono", f_condensed: "Condensed",
    bg_image: "Background image", bg_upload: "Upload image", bg_remove: "Remove", bg_url: "or address: /local/… or https://…", bg_dim: "Darken",
    uploading: "Uploading …",
    show_status_chips: "Status chips (e.g. “3 open”)", show_header_controls: "Up/stop/down for all",
    show_times: "Next times", show_automation: "Automation switches per shutter", show_slider: "Slider", show_positions: "Privacy / My position buttons",
    show_vacation: "Vacation", show_auto_mode: "Automatic (resume all)", show_manual_mode: "Manual (pause all)",
  },
};

const BG_PRESETS = ["#fff8e6", "#eef4ff", "#effaf5", "#f6f0ff", "#1f2430", "#0f172a"];
const TEXT_PRESETS = ["#ffffff", "#1f2328", "#fde68a", "#bae6fd"];

const EDITOR_CSS = SHARED_CSS + `
  .ed { display: grid; gap: 14px; }
  details { border: 1px solid var(--sc-line); border-radius: 14px; }
  summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 12px 14px; font-weight: 600; font-size: 14px; --mdc-icon-size: 20px; }
  summary::-webkit-details-marker { display: none; }
  summary .chev { margin-left: auto; transition: transform .2s; }
  details[open] summary .chev { transform: rotate(180deg); }
  .body { padding: 0 14px 14px; display: grid; gap: 14px; }
  .lbl { font-size: 13px; font-weight: 500; margin-bottom: 6px; }
  .sub { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: var(--sc-muted); margin: 4px 0; }
  .note { font-size: 12px; color: var(--sc-muted); }
  .input { display: flex; align-items: center; gap: 8px; background: var(--input-fill-color, var(--sc-chip)); border-radius: 10px; padding: 0 12px;
    border: 1px solid transparent; min-height: 42px; --mdc-icon-size: 18px; }
  .input:focus-within { border-color: var(--sc-accent); }
  .input input { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--primary-text-color); font: inherit; font-size: 14px; outline: none; padding: 10px 0; }
  .seg { display: inline-flex; flex-wrap: wrap; padding: 3px; border-radius: 999px; background: var(--sc-chip); }
  .seg button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 13px; padding: 6px 14px; border-radius: 999px; cursor: pointer; }
  .seg button.on { background: var(--card-background-color, #fff); box-shadow: 0 1px 3px rgba(0,0,0,.15); font-weight: 600; }
  .tg { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 38px; font-size: 14px; cursor: pointer; }
  .switch { position: relative; width: 40px; height: 22px; flex: none; }
  .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .switch span { position: absolute; inset: 0; border-radius: 999px; background: color-mix(in srgb, var(--primary-text-color) 22%, transparent); transition: background .2s; }
  .switch span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
  .switch input:checked + span { background: var(--sc-accent); }
  .switch input:checked + span::after { transform: translateX(18px); }
  .sel { display: grid; gap: 6px; padding: 8px; border-radius: 12px; min-height: 52px;
    border: 2px dashed color-mix(in srgb, var(--sc-accent) 40%, transparent); background: color-mix(in srgb, var(--sc-accent) 4%, transparent); }
  .sel.over { border-color: var(--sc-accent); background: color-mix(in srgb, var(--sc-accent) 12%, transparent); }
  .it { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 10px; background: var(--card-background-color, #fff);
    box-shadow: 0 1px 2px rgba(0,0,0,.1); font-size: 14px; user-select: none; --mdc-icon-size: 18px; }
  .sel .it { cursor: grab; }
  .sel .it:active { cursor: grabbing; }
  .it.dragging { opacity: .35; }
  .it.before { box-shadow: 0 -3px 0 0 var(--sc-accent), 0 1px 2px rgba(0,0,0,.1); }
  .it .grip { color: var(--sc-muted); }
  .it .n { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .it .n small { color: var(--sc-muted); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .it .num { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 700;
    background: color-mix(in srgb, var(--sc-accent) 18%, transparent); color: var(--sc-accent); flex: none; }
  .mini { border: 0; background: transparent; color: var(--sc-muted); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; --mdc-icon-size: 18px; flex: none; }
  .mini:hover { background: var(--sc-chip); color: var(--primary-text-color); }
  .avail { display: grid; gap: 6px; }
  .avail .it { cursor: pointer; box-shadow: none; background: var(--sc-chip); }
  .avail .it:hover { background: color-mix(in srgb, var(--sc-accent) 12%, transparent); }
  .sw-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .sw { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
  .sw.on { border-color: var(--primary-text-color); transform: scale(1.08); }
  .sw.def { background: conic-gradient(var(--sc-accent) 0 50%, var(--card-background-color, #fff) 50%); }
  .sw.custom { position: relative; overflow: hidden; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); }
  .sw.custom input { opacity: 0; width: 100%; height: 100%; cursor: pointer; }
  .fonts { display: flex; flex-wrap: wrap; gap: 6px; }
  .fonts button { border: 1px solid var(--sc-line); background: transparent; color: inherit; border-radius: 10px; padding: 6px 12px; cursor: pointer; font-size: 14px; }
  .fonts button.on { border-color: var(--sc-accent); background: color-mix(in srgb, var(--sc-accent) 12%, transparent); color: var(--sc-accent); font-weight: 600; }
  .img { height: 70px; border-radius: 12px; background: var(--sc-chip) center / cover no-repeat; border: 1px solid var(--sc-line); position: relative; overflow: hidden;
    display: grid; place-items: center; color: var(--sc-muted); }
  .img::after { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,var(--dim, 0)); }
  .acts { display: flex; flex-wrap: wrap; gap: 6px; }
  .acts input[type=file] { display: none; }
  .pill { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; padding: 7px 14px; font: inherit; font-size: 13px; cursor: pointer;
    background: var(--sc-chip); color: var(--primary-text-color); --mdc-icon-size: 16px; }
  .pill.danger { color: #d32f2f; }
  .range { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .range input { flex: 1; accent-color: var(--sc-accent); }
`;

class ShutterCaptainCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._open = new Set(["shutters"]);
  }

  setConfig(config) {
    const { card: _legacy, ...rest } = config || {};
    this._config = { ...CARD_DEFAULTS, ...(this._single ? SINGLE_OVERRIDES : {}), ...rest };
    if (!Array.isArray(this._config.entities)) this._config.entities = [];
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._render();
  }

  _t(k) { return ED_TXT[langOf(this._hass)][k] ?? ED_TXT.en[k] ?? k; }

  _emit(patch, rerender = true) {
    this._config = { ...this._config, ...patch };
    // Only store what differs from the defaults – keeps the dashboard YAML short.
    const out = { type: `custom:${this._single ? SINGLE : CARD}` };
    const base = { ...CARD_DEFAULTS, ...(this._single ? SINGLE_OVERRIDES : {}) };
    for (const [k, v] of Object.entries(this._config)) {
      if (k === "type" || (this._single && (k === "entities" || k === "all_shutters"))) continue;
      if (JSON.stringify(v) !== JSON.stringify(base[k])) out[k] = v;
    }
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: out }, bubbles: true, composed: true }));
    if (rerender) this._render();
  }

  _candidates() {
    const groups = Object.values(this._hass.entities || {})
      .filter((e) => e.platform === DOMAIN && e.entity_id.startsWith("cover.") && this._hass.states[e.entity_id])
      .map((e) => e.entity_id);
    const singles = Object.keys(statusByCover(this._hass)).filter((id) => this._hass.states[id])
      .sort((a, b) => friendly(this._hass, a).localeCompare(friendly(this._hass, b)));
    return { groups, singles };
  }

  _render() {
    if (!this._hass || !this._config) return;
    const c = this._config;
    const { groups, singles } = this._candidates();
    const chosen = c.entities;
    const isGroup = (id) => Array.isArray(this._hass.states[id]?.attributes?.entity_id);
    const icon = (id) => (isGroup(id) ? "mdi:window-shutter-cog" : "mdi:window-shutter");
    const sec = (key, ic, title, body) => `<details ${this._open.has(key) ? "open" : ""} data-sec="${key}">
      <summary><ha-icon icon="${ic}"></ha-icon>${esc(title)}<ha-icon class="chev" icon="mdi:chevron-down"></ha-icon></summary>
      <div class="body">${body}</div></details>`;
    const toggle = (key) => `<label class="tg"><span>${esc(this._t(key))}</span>
      <span class="switch"><input type="checkbox" data-flag="${key}" ${c[key] ? "checked" : ""}><span></span></span></label>`;
    const seg = (key, opts) => `<div class="seg">${opts.map((v) => `<button data-seg="${key}" data-val="${v}" class="${c[key] === v ? "on" : ""}">${esc(this._t((key === "layout" ? "l_" : "s_") + v))}</button>`).join("")}</div>`;
    const swatches = (key, presets) => {
      const val = c[key] || "";
      const custom = val && !presets.includes(val);
      return `<div class="sw-row">
        <button class="sw def ${!val ? "on" : ""}" data-sw="${key}" data-val="" title="${esc(this._t("c_default"))}"></button>
        ${presets.map((p) => `<button class="sw ${val === p ? "on" : ""}" data-sw="${key}" data-val="${esc(p)}" style="background:${esc(ACCENT_COLORS[p] || p)}" title="${esc(p)}"></button>`).join("")}
        <label class="sw custom ${custom ? "on" : ""}" title="${esc(this._t("c_custom"))}"><input type="color" data-color="${key}" value="${esc(/^#/.test(val) ? val : "#f59e0b")}"></label>
      </div>`;
    };
    const avail = (list) => list.filter((id) => !chosen.includes(id)).map((id) => `
      <div class="it" data-add="${esc(id)}" title="${esc(this._t("add"))}"><ha-icon icon="${icon(id)}"></ha-icon>
        <span class="n">${esc(friendly(this._hass, id))}<small>${esc(id)}</small></span><ha-icon icon="mdi:plus-circle-outline"></ha-icon></div>`).join("");

    const singleBody = `<div><div class="lbl">${esc(tr(this._hass, "pick_one"))}</div>
      <div class="input"><select id="one" style="flex:1;border:0;background:transparent;color:var(--primary-text-color);font:inherit;font-size:14px;padding:10px 0;outline:none">
        ${[...groups, ...singles].map((id) => `<option value="${esc(id)}" ${c.entity === id ? "selected" : ""}>${esc(friendly(this._hass, id))}</option>`).join("")}
      </select></div></div>`;
    const shuttersBody = !groups.length && !singles.length ? `<div class="note">${esc(this._t("none_found"))}</div>` : this._single ? singleBody : `
      ${toggle("all_shutters")}
      ${c.all_shutters ? `<div class="note">${esc(this._t("all_note"))}</div>` : `
        <div><div class="lbl">${esc(this._t("in_card"))}</div>
          <div class="sel" id="sel">${chosen.length ? chosen.map((id, i) => `
            <div class="it" draggable="true" data-idx="${i}"><ha-icon class="grip" icon="mdi:drag"></ha-icon><span class="num">${i + 1}</span>
              <ha-icon icon="${icon(id)}"></ha-icon><span class="n">${esc(friendly(this._hass, id))}<small>${esc(id)}</small></span>
              <button class="mini" data-rm="${i}" title="${esc(this._t("remove"))}"><ha-icon icon="mdi:close"></ha-icon></button></div>`).join("")
            : `<div class="note">${esc(this._t("empty_sel"))}</div>`}</div></div>
        <div><div class="lbl">${esc(this._t("available"))}</div>
          ${groups.some((id) => !chosen.includes(id)) ? `<div class="sub">${esc(this._t("groups"))}</div><div class="avail">${avail(groups)}</div>` : ""}
          ${singles.some((id) => !chosen.includes(id)) ? `<div class="sub">${esc(this._t("single"))}</div><div class="avail">${avail(singles)}</div>` : ""}
        </div>`}`;

    const lookBody = `
      <div><div class="lbl">${esc(this._t("title"))}</div><div class="input"><input id="title" value="${esc(c.title)}"></div></div>
      <div><div class="lbl">${esc(this._t("layout"))}</div>${seg("layout", ["grid", "list", "chips"])}</div>
      <div><div class="lbl">${esc(this._t("shape"))}</div>${seg("shape", ["rounded", "soft", "square"])}</div>
      <div><div class="lbl">${esc(this._t("color"))}</div>${swatches("color", Object.keys(ACCENT_COLORS))}</div>
      <div><div class="lbl">${esc(this._t("background"))}</div>${swatches("background", BG_PRESETS)}</div>
      <div><div class="lbl">${esc(this._t("text_color"))}</div>${swatches("text_color", TEXT_PRESETS)}</div>
      <div><div class="lbl">${esc(this._t("font"))}</div><div class="fonts">${Object.entries(FONTS).map(([k, f]) =>
        `<button data-font="${k}" class="${(c.font || "theme") === k ? "on" : ""}" style="font-family:${esc(f || "inherit")}">${esc(this._t("f_" + k))}</button>`).join("")}</div></div>
      <div><div class="lbl">${esc(this._t("bg_image"))}</div>
        <div class="img" style="${c.background_image ? `background-image:url('${esc(c.background_image)}');--dim:${(Number(c.image_dim) || 0) / 100}` : ""}">${c.background_image ? "" : "—"}</div>
        <div class="acts" style="margin-top:8px"><label class="pill"><ha-icon icon="mdi:image-plus"></ha-icon>${esc(this._t("bg_upload"))}<input type="file" id="file" accept="image/*"></label>
          ${c.background_image ? `<button class="pill danger" id="imgrm"><ha-icon icon="mdi:image-remove"></ha-icon>${esc(this._t("bg_remove"))}</button>` : ""}</div>
        <div class="input" style="margin-top:8px"><ha-icon icon="mdi:link-variant"></ha-icon><input id="imgurl" placeholder="${esc(this._t("bg_url"))}" value="${esc(c.background_image)}"></div>
        ${c.background_image ? `<div class="range" style="margin-top:8px"><span>${esc(this._t("bg_dim"))}</span><input type="range" id="dim" min="0" max="90" step="5" value="${esc(c.image_dim)}"><span>${esc(c.image_dim)}%</span></div>` : ""}
      </div>`;

    this.shadowRoot.innerHTML = `<style>${EDITOR_CSS}</style><div class="ed">
      ${sec("shutters", "mdi:window-shutter", this._t("sec_shutters"), shuttersBody)}
      ${sec("look", "mdi:palette-outline", this._t("sec_look"), lookBody)}
      ${sec("show", "mdi:eye-outline", this._t("sec_show"), ["show_status_chips", "show_header_controls", "show_times", "show_automation", "show_slider", "show_positions"].map(toggle).join(""))}
      ${sec("modes", "mdi:toggle-switch-outline", this._t("sec_modes"), ["show_vacation", "show_auto_mode", "show_manual_mode"].map(toggle).join(""))}
    </div>`;
    this._wire();
  }

  _wire() {
    const r = this.shadowRoot;
    r.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) this._open.add(d.dataset.sec); else this._open.delete(d.dataset.sec);
    }));
    r.getElementById("one")?.addEventListener("change", (ev) => this._emit({ entity: ev.target.value }));
    if (this._single && !this._config.entity && r.getElementById("one")) this._emit({ entity: r.getElementById("one").value }, false);
    r.querySelectorAll("[data-flag]").forEach((i) => i.addEventListener("change", () => this._emit({ [i.dataset.flag]: i.checked })));
    r.querySelectorAll("[data-seg]").forEach((b) => b.addEventListener("click", () => this._emit({ [b.dataset.seg]: b.dataset.val })));
    r.querySelectorAll("[data-sw]").forEach((b) => b.addEventListener("click", () => this._emit({ [b.dataset.sw]: b.dataset.val })));
    r.querySelectorAll("[data-color]").forEach((i) => i.addEventListener("change", () => this._emit({ [i.dataset.color]: i.value })));
    r.querySelectorAll("[data-font]").forEach((b) => b.addEventListener("click", () => this._emit({ font: b.dataset.font })));
    r.getElementById("title")?.addEventListener("change", (ev) => this._emit({ title: ev.target.value }, false));
    r.getElementById("imgurl")?.addEventListener("change", (ev) => this._emit({ background_image: ev.target.value.trim() }));
    r.getElementById("imgrm")?.addEventListener("click", () => this._emit({ background_image: "" }));
    r.getElementById("dim")?.addEventListener("change", (ev) => this._emit({ image_dim: Number(ev.target.value) }));
    r.getElementById("file")?.addEventListener("change", (ev) => this._upload(ev.target.files?.[0]));
    r.querySelectorAll("[data-add]").forEach((el) => el.addEventListener("click", () => this._emit({ entities: [...this._config.entities, el.dataset.add] })));
    r.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const list = [...this._config.entities];
      list.splice(Number(b.dataset.rm), 1);
      this._emit({ entities: list });
    }));
    this._wireDrag();
  }

  /** Reorder the chosen shutters with the mouse. */
  _wireDrag() {
    const box = this.shadowRoot.getElementById("sel");
    if (!box) return;
    let from = null;
    const marks = () => box.querySelectorAll(".before").forEach((x) => x.classList.remove("before"));
    const target = (ev) => {
      for (const it of box.querySelectorAll(".it[data-idx]")) {
        const rc = it.getBoundingClientRect();
        if (ev.clientY < rc.top + rc.height / 2) return { idx: Number(it.dataset.idx), el: it };
      }
      return { idx: this._config.entities.length, el: null };
    };
    box.querySelectorAll(".it[data-idx]").forEach((it) => {
      it.addEventListener("dragstart", (ev) => { from = Number(it.dataset.idx); it.classList.add("dragging"); ev.dataTransfer.effectAllowed = "move"; ev.dataTransfer.setData("text/plain", String(from)); });
      it.addEventListener("dragend", () => { from = null; it.classList.remove("dragging"); box.classList.remove("over"); marks(); });
    });
    box.addEventListener("dragover", (ev) => {
      if (from === null) return;
      ev.preventDefault();
      box.classList.add("over");
      marks();
      target(ev).el?.classList.add("before");
    });
    box.addEventListener("dragleave", (ev) => { if (!box.contains(ev.relatedTarget)) { box.classList.remove("over"); marks(); } });
    box.addEventListener("drop", (ev) => {
      ev.preventDefault();
      if (from === null) return;
      const list = [...this._config.entities];
      let { idx } = target(ev);
      const [moved] = list.splice(from, 1);
      if (from < idx) idx -= 1;
      list.splice(idx, 0, moved);
      from = null;
      this._emit({ entities: list });
    });
  }

  /** Upload into Home Assistant's image store; the card shows /api/image/serve/<id>/original. */
  async _upload(file) {
    if (!file) return;
    try {
      const body = new FormData();
      body.append("file", file);
      const resp = await this._hass.fetchWithAuth("/api/image/upload", { method: "POST", body });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const img = await resp.json();
      this._emit({ background_image: `/api/image/serve/${img.id}/original` });
    } catch (err) {
      alert(`${this._t("bg_image")}: ${err.message || err}`);
    }
  }
}

/** One shutter (or one group) – sized for dashboard sections. */
class ShutterCaptainShutterCard extends ShutterCaptainCard {
  static getConfigElement() {
    const editor = document.createElement(EDITOR);
    editor._single = true;
    return editor;
  }

  static getStubConfig(hass) {
    return { entity: Object.keys(statusByCover(hass))[0] || "" };
  }

  setConfig(config) {
    const { entity, ...rest } = config || {};
    super.setConfig({ ...SINGLE_OVERRIDES, ...rest, entities: entity ? [entity] : rest.entities || [] });
  }

  getCardSize() { return 3; }

  getGridOptions() { return { columns: 6, min_columns: 3, rows: "auto" }; }
}

if (!customElements.get(CARD)) customElements.define(CARD, ShutterCaptainCard);
if (!customElements.get(SINGLE)) customElements.define(SINGLE, ShutterCaptainShutterCard);
if (!customElements.get(EDITOR)) customElements.define(EDITOR, ShutterCaptainCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === CARD)) {
  const lang = (navigator.language || "en").startsWith("de") ? "de" : "en";
  window.customCards.push({
    type: CARD,
    name: TXT[lang].name,
    description: TXT[lang].description,
    preview: true,
    documentationURL: "https://github.com/Fab29-690/ha-shutter-captain",
  });
}
if (!window.customCards.some((c) => c.type === SINGLE)) {
  const lang = (navigator.language || "en").startsWith("de") ? "de" : "en";
  window.customCards.push({
    type: SINGLE,
    name: TXT[lang].single_name,
    description: TXT[lang].single_description,
    preview: true,
    documentationURL: "https://github.com/Fab29-690/ha-shutter-captain",
  });
}
