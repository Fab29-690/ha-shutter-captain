/* Shutter Captain – sidebar panel for Home Assistant.
 * Plain web component (no build step). Uses Home Assistant theme variables,
 * so light and dark themes work automatically.
 */

const DOMAIN = "shutter_captain";
const AREAS = ["living", "sleep", "children"];
const LANG_KEY = "shutter-captain-language";

const T = {
  de: {
    title: "Shutter Captain",
    overview: "Übersicht",
    shutters: "Rollläden bearbeiten",
    settings: "Einstellungen",
    all: "Alle",
    living: "Wohnen",
    sleep: "Schlafen",
    children: "Kinder",
    open: "Öffnen",
    close: "Schließen",
    stop: "Stopp",
    sun_protect: "Sonnenschutz",
    auto: "Automatik",
    resume: "Fortsetzen",
    pause: "Pause",
    pause_1h: "1 Std. pausieren",
    pause_3h: "3 Std. pausieren",
    pause_inf: "Bis Fortsetzen pausieren",
    today: "Heute",
    workday: "Arbeitstag",
    free_day: "Freier Tag",
    tomorrow_free: "morgen frei",
    tomorrow_work: "morgen Arbeitstag",
    vacation: "Urlaub",
    school_holiday: "Schulferien",
    am_auto: "Automatik",
    am_manual: "Manuell",
    aw_extend: "Ausfahren", aw_retract: "Einfahren", none_of_type: "Noch keine eingerichtet.",
    master: "Automatik",
    vent: "Lüften",
    summer: "Sommer",
    xmas: "Weihnachtszeit",
    sun: "Sonne",
    azimuth: "Richtung",
    elevation: "Höhe",
    next_open: "Öffnet",
    next_close: "Schließt",
    tomorrow: "morgen",
    no_plan: "—",
    auto_up: "Auf",
    auto_down: "Ab",
    auto_sun: "Sonne",
    window_open: "Fenster offen",
    window_tilted: "Fenster gekippt",
    alarm_active: "Alarm aktiv",
    until: "bis",
    edit: "Bearbeiten",
    add: "Rollladen hinzufügen",
    duplicate: "Duplizieren",
    delete: "Löschen",
    save: "Speichern",
    cancel: "Abbrechen",
    saved: "Gespeichert",
    confirm_delete: "Rollladen „{name}“ wirklich entfernen? Die Entitäten werden gelöscht.",
    bulk_edit: "Auswahl gemeinsam bearbeiten",
    bulk_hint: "Nur Felder, die du änderst, werden auf alle {n} Rollläden übertragen.",
    selected: "ausgewählt",
    empty_title: "Noch keine Rollläden",
    empty_text: "Füge deinen ersten Rollladen hinzu – Zeiten, Sonnenschutz und Fensterkontakt stellst du direkt hier ein.",
    not_setup: "Shutter Captain ist noch nicht eingerichtet. Füge die Integration unter Einstellungen → Geräte & Dienste hinzu.",
    readonly: "Nur Administratoren können Einstellungen ändern.",
    col_name: "Rollladen",
    col_open: "Öffnen",
    col_close: "Schließen",
    col_sun: "Sonnenschutz",
    col_window: "Fenster",
    yes: "ja",
    no: "—",
    search: "Suchen …",
    unsaved: "Ungespeicherte Änderungen",
    why: "Grund",
    position: "Position",
    alarms: { fire: "Feuer", rain: "Regen", wind1: "Wind 1", wind2: "Wind 2", frost: "Frost" },
  },
  en: {
    title: "Shutter Captain",
    overview: "Overview",
    shutters: "Edit shutters",
    settings: "Settings",
    all: "All",
    living: "Living",
    sleep: "Sleeping",
    children: "Children",
    open: "Open",
    close: "Close",
    stop: "Stop",
    sun_protect: "Sun protection",
    auto: "Automatic",
    resume: "Resume",
    pause: "Pause",
    pause_1h: "Pause 1 h",
    pause_3h: "Pause 3 h",
    pause_inf: "Pause until resumed",
    today: "Today",
    workday: "Workday",
    free_day: "Day off",
    tomorrow_free: "tomorrow off",
    tomorrow_work: "tomorrow workday",
    vacation: "Vacation",
    school_holiday: "School holidays",
    am_auto: "Automatic",
    am_manual: "Manual",
    aw_extend: "Extend", aw_retract: "Retract", none_of_type: "None set up yet.",
    master: "Automation",
    vent: "Vent",
    summer: "Summer",
    xmas: "Christmas",
    sun: "Sun",
    azimuth: "Azimuth",
    elevation: "Elevation",
    next_open: "Opens",
    next_close: "Closes",
    tomorrow: "tomorrow",
    no_plan: "—",
    auto_up: "Up",
    auto_down: "Down",
    auto_sun: "Sun",
    window_open: "Window open",
    window_tilted: "Window tilted",
    alarm_active: "Alarm active",
    until: "until",
    edit: "Edit",
    add: "Add shutter",
    duplicate: "Duplicate",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    saved: "Saved",
    confirm_delete: "Really remove shutter “{name}”? Its entities will be deleted.",
    bulk_edit: "Edit selection together",
    bulk_hint: "Only fields you change are applied to all {n} shutters.",
    selected: "selected",
    empty_title: "No shutters yet",
    empty_text: "Add your first shutter – schedule, sun protection and window contact are set right here.",
    not_setup: "Shutter Captain is not set up yet. Add the integration under Settings → Devices & services.",
    readonly: "Only administrators can change settings.",
    col_name: "Shutter",
    col_open: "Open",
    col_close: "Close",
    col_sun: "Sun protection",
    col_window: "Window",
    yes: "yes",
    no: "—",
    search: "Search …",
    unsaved: "Unsaved changes",
    why: "Reason",
    position: "Position",
    alarms: { fire: "Fire", rain: "Rain", wind1: "Wind 1", wind2: "Wind 2", frost: "Frost" },
  },
};

const REASONS = {
  de: {
    start: "Gestartet",
    scheduled_open: "Zeitplan: geöffnet",
    scheduled_close: "Zeitplan: geschlossen",
    late_close: "Spät schließen",
    intermediate_close: "Zwischenposition → ganz geschlossen",
    command_open: "Befehl: öffnen",
    garage_arrival: "Jemand kommt heim – geöffnet", garage_condition_open: "Bedingung erfüllt – geöffnet", garage_condition_close: "Bedingung erfüllt – geschlossen",
    garage_emergency: "NOTFALL-ÖFFNER – Tor als Fluchtweg geöffnet", garage_emergency_cleared: "Notfall-Öffner beendet", garage_vent: "Lüften – Tor auf Lüftungshöhe",
    command_close: "Befehl: schließen",
    command_sun: "Befehl: Sonnenschutz",
    resumed: "Automatik fortgesetzt",
    paused: "Pausiert",
    manual_move: "Von Hand bewegt – Automatik wartet",
    moved_to_known_level: "Von Hand auf bekannte Höhe – Automatik bleibt aktiv",
    window_lockout: "Fenster offen – Aussperrschutz verhindert Fahrt",
    window_open: "Fenster offen – Lüftungshöhe",
    window_tilted: "Fenster gekippt – Lüftungshöhe",
    window_closed: "Fenster zu – Automatik-Position",
    window_closed_stay: "Fenster zu – bleibt stehen (kein Nachfahren eingestellt)",
    master_off: "Automatik (gesamt) ist aus",
    emergency: "Notfall – Notfallposition",
    emergency_cleared: "Notfall beendet – zurück zur Automatik",
    blocked_emergency: "Notfall aktiv – Automatik gesperrt",
    stage2: "Zweite Schließstufe (Nacht)",
    awning_wind: "Wind – Markise eingefahren", awning_rain: "Regen – Markise eingefahren", awning_frost: "Frost – Markise eingefahren",
    awning_evening: "Abends eingefahren", awning_extend: "Sonne – Markise ausgefahren", awning_retract: "Keine Sonne – Markise eingefahren",
    garage_auto_close: "Stand zu lange offen – geschlossen", garage_close_time: "Abends geschlossen", garage_presence: "Alle weg – geschlossen",
    condition_no_open: "Eigene Bedingung: nicht geöffnet",
    condition_no_close: "Eigene Bedingung: nicht geschlossen",
    condition_half_close: "Eigene Bedingung: nur teilweise geschlossen",
    vent_button: "Lüften – bleibt bis zum nächsten Zeitereignis",
    vent_position: "Geschlossen, wegen offenem Fenster auf Lüftungshöhe",
    sun_sun_protect: "Sonne scheint aufs Fenster",
    sun_heat_protect: "Hitzeschutz",
    sun_up: "Sonnenschutz beendet",
    sun_disabled: "Sonnenschutz deaktiviert",
    summer_no_close: "Sommer – bleibt offen",
    auto_up_off: "Automatisches Öffnen ist aus",
    auto_down_off: "Automatisches Schließen ist aus",
    area_auto_off_up: "Bereichsautomatik aus – nicht geöffnet",
    area_auto_off_down: "Bereichsautomatik aus – nicht geschlossen",
    recently_moved: "Kürzlich bewegt – Öffnen übersprungen",
    blocked_manual: "Handbetrieb – Automatik wartet",
    cover_unavailable: "Rollladen nicht erreichbar",
    alarm_fire: "Feueralarm",
    fire_cleared_waiting: "Feueralarm vorbei – mit Öffnen/Schließen freigeben",
    alarm_rain: "Regenalarm",
    alarm_wind1: "Windalarm 1",
    alarm_wind2: "Windalarm 2",
    alarm_frost: "Frostschutz",
    alarm_cleared: "Alarm beendet",
    frost_cleared: "Frost vorbei",
    blocked_alarm_fire: "Feueralarm blockiert",
    blocked_alarm_rain: "Regenalarm blockiert",
    blocked_alarm_wind1: "Windalarm blockiert",
    blocked_alarm_wind2: "Windalarm blockiert",
  },
  en: {
    start: "Started",
    scheduled_open: "Schedule: opened",
    scheduled_close: "Schedule: closed",
    late_close: "Late close",
    intermediate_close: "Intermediate → fully closed",
    command_open: "Command: open",
    garage_arrival: "Someone came home – opened", garage_condition_open: "Condition met – opened", garage_condition_close: "Condition met – closed",
    garage_emergency: "EMERGENCY OPENER – door opened as escape route", garage_emergency_cleared: "Emergency opener ended", garage_vent: "Venting – door at vent height",
    command_close: "Command: close",
    command_sun: "Command: sun protection",
    resumed: "Automation resumed",
    paused: "Paused",
    manual_move: "Moved by hand – automation waits",
    moved_to_known_level: "Moved by hand to a known position – automation stays on",
    window_lockout: "Window open – lockout protection blocks the move",
    window_open: "Window open – vent position",
    window_tilted: "Window tilted – vent position",
    window_closed: "Window closed – automation position",
    window_closed_stay: "Window closed – stays put (catch-up is off)",
    master_off: "Automation (all) is off",
    emergency: "Emergency – emergency position",
    emergency_cleared: "Emergency over – back to automation",
    blocked_emergency: "Emergency active – automation blocked",
    stage2: "Second closing stage (night)",
    awning_wind: "Wind – awning retracted", awning_rain: "Rain – awning retracted", awning_frost: "Frost – awning retracted",
    awning_evening: "Retracted for the evening", awning_extend: "Sun – awning extended", awning_retract: "No sun – awning retracted",
    garage_auto_close: "Open too long – closed", garage_close_time: "Closed in the evening", garage_presence: "Everyone left – closed",
    condition_no_open: "Own condition: not opened",
    condition_no_close: "Own condition: not closed",
    condition_half_close: "Own condition: closed only partly",
    vent_button: "Venting – held until the next scheduled event",
    vent_position: "Closed, back to vent position because window is open",
    sun_sun_protect: "Sun is shining on the window",
    sun_heat_protect: "Heat protection",
    sun_up: "Sun protection ended",
    sun_disabled: "Sun protection disabled",
    summer_no_close: "Summer – stays open",
    auto_up_off: "Automatic opening is off",
    auto_down_off: "Automatic closing is off",
    area_auto_off_up: "Area automation off – not opened",
    area_auto_off_down: "Area automation off – not closed",
    recently_moved: "Recently moved – opening skipped",
    blocked_manual: "Manual mode – automation waits",
    cover_unavailable: "Cover unavailable",
    alarm_fire: "Fire alarm",
    fire_cleared_waiting: "Fire alarm over – release with open/close",
    alarm_rain: "Rain alarm",
    alarm_wind1: "Wind alarm 1",
    alarm_wind2: "Wind alarm 2",
    alarm_frost: "Frost protection",
    alarm_cleared: "Alarm ended",
    frost_cleared: "Frost over",
    blocked_alarm_fire: "Blocked by fire alarm",
    blocked_alarm_rain: "Blocked by rain alarm",
    blocked_alarm_wind1: "Blocked by wind alarm",
    blocked_alarm_wind2: "Blocked by wind alarm",
  },
};

const STATE_STYLE = {
  up: { color: "#f2a900", icon: "mdi:window-shutter-open" },
  down: { color: "#5c6bc0", icon: "mdi:window-shutter" },
  intermediate: { color: "#7986cb", icon: "mdi:window-shutter-settings" },
  sun_protect: { color: "#ff8f00", icon: "mdi:weather-sunny" },
  heat_protect: { color: "#e65100", icon: "mdi:thermometer-high" },
  manual: { color: "#8e24aa", icon: "mdi:hand-back-right" },
  paused: { color: "#78909c", icon: "mdi:pause-circle" },
  window_open: { color: "#00897b", icon: "mdi:window-open-variant" },
  window_locked: { color: "#00695c", icon: "mdi:lock" },
  emergency: { color: "#b71c1c", icon: "mdi:alarm-light" },
  fire: { color: "#d32f2f", icon: "mdi:fire-alert" },
  rain: { color: "#1e88e5", icon: "mdi:weather-pouring" },
  wind1: { color: "#26a69a", icon: "mdi:weather-windy" },
  wind2: { color: "#00796b", icon: "mdi:weather-windy-variant" },
  frost: { color: "#29b6f6", icon: "mdi:snowflake-alert" },
  none: { color: "#9e9e9e", icon: "mdi:window-shutter-auto" },
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);


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

const CSS = SKY_CSS + `
:host {
  display: block;
  min-height: 100vh;
  background: var(--primary-background-color);
  color: var(--primary-text-color);
  font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
  --sp-radius: var(--ha-card-border-radius, 16px);
  --sp-card: var(--card-background-color, #fff);
  --sp-muted: var(--secondary-text-color, #6b7280);
  --sp-line: var(--divider-color, rgba(0,0,0,.12));
  --sp-accent: var(--primary-color, #03a9f4);
  --sp-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04));
  --sp-chip: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
.toolbar {
  position: sticky; top: 0; z-index: 4;
  display: flex; align-items: center; gap: 8px;
  height: var(--header-height, 56px); padding: 0 12px;
  background: var(--app-header-background-color, var(--sp-card));
  color: var(--app-header-text-color, var(--primary-text-color));
  border-bottom: 1px solid var(--app-header-border-bottom, var(--sp-line));
}
.toolbar .name { font-size: 20px; font-weight: 500; margin-right: auto; display:flex; align-items:center; gap:10px; }
.toolbar .logo { width: 28px; height: 28px; border-radius: 8px; display:grid; place-items:center;
  background: linear-gradient(135deg, #ffb300, #fb8c00); color: #fff; --mdc-icon-size: 18px; }
.tabs { display: flex; gap: 4px; }
.langsel { display: inline-flex; align-items: center; gap: 4px; margin-left: 4px; padding: 0 4px 0 8px; border-radius: 999px;
  background: var(--sp-chip); --mdc-icon-size: 18px; opacity: .85; }
.langsel select { border: 0; background: transparent; color: inherit; font: inherit; font-size: 13px; padding: 6px 2px; cursor: pointer; outline: none; }
.langsel select option { background: var(--sp-card); color: var(--primary-text-color); }
.tab { border: 0; background: transparent; color: inherit; font: inherit; font-size: 14px; padding: 8px 14px;
  border-radius: 999px; cursor: pointer; opacity: .75; display:flex; gap:6px; align-items:center; --mdc-icon-size:18px; }
.tab:hover { background: var(--sp-chip); opacity: 1; }
.tab.active { background: color-mix(in srgb, var(--sp-accent) 16%, transparent); color: var(--sp-accent); opacity: 1; font-weight: 500; }
main { max-width: 1400px; margin: 0 auto; padding: 20px 16px 96px; }
.row { display: flex; gap: 12px; flex-wrap: wrap; align-items: stretch; }
.card { background: var(--sp-card); border-radius: var(--sp-radius); box-shadow: var(--sp-shadow);
  border: 1px solid var(--ha-card-border-color, transparent); }
.hero { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 16px; }
.hero .card { padding: 16px; }
.eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--sp-muted); margin-bottom: 6px; }
.big { font-size: 22px; font-weight: 600; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 12px;
  background: var(--sp-chip); color: var(--primary-text-color); border: 0; font-family: inherit; --mdc-icon-size: 14px; }
button.chip { cursor: pointer; }
button.chip.on { background: color-mix(in srgb, var(--sp-accent) 18%, transparent); color: var(--sp-accent); font-weight: 500; }
.alarm-banner { display:flex; gap:12px; align-items:center; padding: 14px 16px; margin-bottom: 16px; border-radius: var(--sp-radius);
  background: color-mix(in srgb, #d32f2f 14%, var(--sp-card)); color: #d32f2f; font-weight: 600; }
.sunbox { display: flex; align-items: center; gap: 14px; }
.areas { display: grid; gap: 8px; }
.area { display: grid; grid-template-columns: 1fr auto auto auto; gap: 10px; align-items: center; font-size: 14px; }
.area.tm { grid-template-columns: 1fr auto auto; }
.tmode { margin-bottom: 10px; }
.area .t { font-variant-numeric: tabular-nums; color: var(--sp-muted); display:flex; align-items:center; gap:2px; --mdc-icon-size: 14px; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 16px; }
.segment { display: inline-flex; padding: 3px; border-radius: 999px; background: var(--sp-chip); }
.segment button { border: 0; background: transparent; padding: 6px 14px; border-radius: 999px; font: inherit; font-size: 13px; color: inherit; cursor: pointer; }
.segment button.active { background: var(--sp-card); box-shadow: 0 1px 3px rgba(0,0,0,.15); font-weight: 600; }
.spacer { flex: 1; }
.btn { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; padding: 8px 14px; font: inherit; font-size: 13px;
  font-weight: 500; cursor: pointer; background: var(--sp-chip); color: var(--primary-text-color); --mdc-icon-size: 18px; transition: background .15s, transform .1s; }
.btn:hover { background: color-mix(in srgb, var(--primary-text-color) 12%, transparent); }
.btn:active { transform: scale(.97); }
.btn.primary { background: var(--sp-accent); color: var(--text-primary-color, #fff); }
.btn.danger { color: #d32f2f; }
.btn.icon { padding: 8px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
.shutter { padding: 16px; display: grid; grid-template-columns: 84px 1fr; gap: 14px; position: relative; overflow: hidden; }
.shutter::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--state-color); }
.win { width: 84px; height: 104px; border-radius: 10px; position: relative; overflow: hidden;
  background: linear-gradient(180deg, #8ecdf5 0%, #cfeaff 70%, #e9f5d8 100%);
  box-shadow: inset 0 0 0 4px color-mix(in srgb, var(--primary-text-color) 18%, var(--sp-card)); }
.win .glass { position:absolute; inset: 4px; border-radius: 6px;
  background: linear-gradient(120deg, rgba(255,255,255,.35) 0 18%, transparent 18% 100%); }
.win .mullion { position:absolute; left: 50%; top: 4px; bottom: 4px; width: 3px; transform: translateX(-50%);
  background: color-mix(in srgb, var(--primary-text-color) 18%, var(--sp-card)); }
.win .slats { position: absolute; left: 4px; right: 4px; top: 4px; height: 0; border-radius: 4px 4px 2px 2px;
  background: repeating-linear-gradient(180deg, #b0b7c3 0 6px, #8f97a6 6px 7px);
  box-shadow: 0 2px 4px rgba(0,0,0,.25); transition: height 1.2s cubic-bezier(.4,0,.2,1); }
.win .slats::after { content:""; position:absolute; left: 0; right: 0; bottom: 0; height: 4px; background: #6b7280; border-radius: 2px; }
.win .sunray { position: absolute; right: -8px; top: -8px; width: 36px; height: 36px; border-radius: 50%;
  background: radial-gradient(circle, #ffd54f 0 40%, rgba(255,213,79,0) 70%); opacity: 0; transition: opacity .6s; }
.win.sunny .sunray { opacity: 1; }
.win .badge { position:absolute; left: 6px; bottom: 6px; background: rgba(0,0,0,.55); color:#fff; font-size: 11px; padding: 2px 6px; border-radius: 6px; font-variant-numeric: tabular-nums; }
.shutter h3 { margin: 0; font-size: 16px; font-weight: 600; line-height: 1.3; }
.head { display: flex; align-items: flex-start; gap: 8px; }
.head .titles { flex: 1; min-width: 0; }
.status { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 12px; font-weight: 600;
  color: var(--state-color); --mdc-icon-size: 14px; }
.reason { font-size: 12px; color: var(--sp-muted); margin-top: 6px; min-height: 16px; }
.times { display: flex; gap: 14px; margin-top: 10px; font-size: 13px; font-variant-numeric: tabular-nums; }
.times span { display:flex; align-items:center; gap: 3px; --mdc-icon-size: 15px; color: var(--sp-muted); }
.times b { color: var(--primary-text-color); font-weight: 500; }
.controls { grid-column: 1 / -1; display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.controls input[type=range] { flex: 1; accent-color: var(--state-color); }
.actions .break { flex-basis: 100%; height: 0; }
.typeseg button { display: inline-flex; align-items: center; gap: 6px; --mdc-icon-size: 16px; }
.win.t-awning .glass, .win.t-awning .mullion, .win.t-garage .glass, .win.t-garage .mullion, .win.t-garage .sunray { display: none; }
.win.t-awning .slats { background: repeating-linear-gradient(90deg, #ef6c00 0 9px, #fff3e0 9px 18px); border-radius: 0 0 8px 8px; box-shadow: 0 3px 6px rgba(0,0,0,.25); }
.win.t-awning .slats::after { height: 6px; bottom: -3px; background: radial-gradient(circle at 6px 0, #ef6c00 5px, transparent 6px) 0 0 / 12px 6px repeat-x; border-radius: 0; }
.win.t-garage { background: linear-gradient(180deg, #263238, #37474f) !important; }
.win.t-garage .slats { background: repeating-linear-gradient(180deg, #eceff1 0 13px, #b0bec5 13px 15px); }
.win.t-garage .stars, .win.t-garage .wx { display: none; }
.toggles { grid-column: 1 / -1; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.am { display: inline-flex; padding: 2px; border-radius: 999px; background: var(--sp-chip); margin-right: 4px; }
.am button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 12px; padding: 4px 11px; border-radius: 999px; cursor: pointer; }
.am button.on { background: var(--sp-accent); color: var(--text-primary-color, #fff); font-weight: 600; }
.compass { flex: none; }
.menu { position: relative; }
.menu-list { position: absolute; right: 0; top: 100%; z-index: 3; min-width: 200px; padding: 6px; display: none;
  background: var(--sp-card); border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,.2); }
.menu.open .menu-list { display: block; }
.menu-list button { display: flex; width: 100%; gap: 8px; align-items: center; border: 0; background: transparent; color: inherit;
  font: inherit; font-size: 14px; padding: 9px 10px; border-radius: 8px; cursor: pointer; text-align: left; --mdc-icon-size: 18px; }
.menu-list button:hover { background: var(--sp-chip); }
.empty { text-align: center; padding: 48px 16px; }
.empty ha-icon { --mdc-icon-size: 56px; color: var(--sp-accent); }
.empty h2 { margin: 12px 0 6px; }
.empty p { color: var(--sp-muted); max-width: 420px; margin: 0 auto 16px; }
/* editor */
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th { text-align: left; font-weight: 500; color: var(--sp-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; padding: 12px; border-bottom: 1px solid var(--sp-line); }
.table td { padding: 10px 12px; border-bottom: 1px solid var(--sp-line); vertical-align: middle; }
.table tr:last-child td { border-bottom: 0; }
.table tbody tr { cursor: pointer; transition: background .12s; }
.table tbody tr:hover { background: var(--sp-chip); }
.table .sub { display:block; font-size: 12px; color: var(--sp-muted); }
.table input[type=checkbox] { width: 18px; height: 18px; accent-color: var(--sp-accent); }
.table-wrap { overflow-x: auto; }
.sections { display: grid; gap: 14px; }
.section { padding: 4px 0 8px; }
.section > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  font-weight: 600; font-size: 15px; --mdc-icon-size: 20px; }
.section > summary::-webkit-details-marker { display: none; }
.section > summary .chev { margin-left: auto; transition: transform .2s; }
.section[open] > summary .chev { transform: rotate(180deg); }
.section .ico { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
  background: color-mix(in srgb, var(--sp-accent) 14%, transparent); color: var(--sp-accent); }
.fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px 18px; padding: 4px 16px 12px; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field.wide { grid-column: 1 / -1; }
.field label { font-size: 13px; font-weight: 500; }
.field .help { font-size: 12px; color: var(--sp-muted); line-height: 1.35; }
.field.changed label::after { content: " •"; color: var(--sp-accent); }
.input { display: flex; align-items: center; gap: 8px; background: var(--input-fill-color, var(--sp-chip)); border-radius: 10px; padding: 0 10px;
  border: 1px solid transparent; transition: border-color .15s; min-height: 40px; }
.input:focus-within { border-color: var(--sp-accent); }
.input input, .input select { flex: 1; min-width: 0; border: 0; background: transparent; color: var(--primary-text-color); font: inherit; font-size: 14px; padding: 9px 0; outline: none; }
.input select option { background: var(--sp-card); color: var(--primary-text-color); }
.input .unit { color: var(--sp-muted); font-size: 13px; }
.pct { display: flex; align-items: center; gap: 10px; }
.pct input[type=range] { flex: 1; accent-color: var(--sp-accent); }
.pct .input { width: 92px; flex: none; }
.switch { position: relative; width: 44px; height: 24px; flex: none; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch span { position: absolute; inset: 0; border-radius: 999px; background: color-mix(in srgb, var(--primary-text-color) 22%, transparent); transition: background .2s; cursor: pointer; }
.switch span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
.switch input:checked + span { background: var(--sp-accent); }
.switch input:checked + span::after { transform: translateX(20px); }
.ms { display: flex; flex-wrap: wrap; gap: 6px; }
.ms .chip { cursor: pointer; }
.ents { display: flex; flex-direction: column; gap: 6px; }
.ents .chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ents .chips:empty { display: none; }
.ents .chip button { all: unset; cursor: pointer; display: inline-flex; margin-left: 2px; opacity: .7; }
.ents .chip button:hover { opacity: 1; }
.ents .chip ha-icon { --mdc-icon-size: 14px; }
.boolrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 40px; }
.entity-name { font-size: 12px; color: var(--sp-muted); }
.savebar { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%) translateY(140%); z-index: 6;
  display: flex; gap: 10px; align-items: center; padding: 10px 12px 10px 18px; border-radius: 999px;
  background: var(--sp-card); box-shadow: 0 10px 34px rgba(0,0,0,.25); transition: transform .25s cubic-bezier(.4,0,.2,1), visibility .25s; font-size: 14px; visibility: hidden; }
.savebar.show { transform: translateX(-50%) translateY(0); visibility: visible; }
.editor-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.editor-head h2 { margin: 0; font-size: 22px; flex: 1; min-width: 200px; }
.notice { padding: 12px 16px; border-radius: 12px; background: color-mix(in srgb, var(--sp-accent) 12%, transparent); margin-bottom: 14px; font-size: 14px; }
.toast { position: fixed; right: 20px; bottom: 20px; z-index: 7; background: #323232; color: #fff; padding: 12px 18px; border-radius: 10px; font-size: 14px;
  opacity: 0; transform: translateY(10px); transition: all .2s; pointer-events: none; }
.toast.show { opacity: 1; transform: none; }
.toast.err { background: #c62828; }
.searchbox { max-width: 280px; }
@media (max-width: 720px) {
  .tab .lbl { display: none; }
  .toolbar { gap: 4px; padding: 0 6px; }
  .toolbar .title-text { display: none; }
  .tab { padding: 8px 10px; }
  .langsel { padding: 0 2px 0 6px; }
  .langsel select { font-size: 12px; max-width: 74px; }
  main { padding: 12px 10px 96px; }
  .grid { grid-template-columns: 1fr; }
  .table .hide-sm { display: none; }
}
`;

class ShutterCaptainPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._view = "overview";
    this._area = "all";
    this._config = null;
    this._configError = null;
    this._cards = new Map();
    this._editing = null; // {mode: 'new'|'edit'|'bulk', ids:[], data:{}, original:{}}
    this._draftGlobal = null;
    this._selected = new Set();
    this._search = "";
    this._dragging = false;
    this._built = false;
    this._langPref = "auto";
    try { this._langPref = localStorage.getItem(LANG_KEY) || "auto"; } catch (_err) { /* private mode */ }
  }

  /* ------------------------------------------------------------ HA hooks */
  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._built) this._build();
    if (this._menuButton) {
      this._menuButton.hass = hass;
      this._menuButton.narrow = this._narrow;
    }
    if (first) this._loadConfig();
    if (this._view !== "overview") return;
    // Only redraw when one of our own entities changed.
    // Our entities plus the covers themselves (for the moving animation).
    const ours = Object.values(hass.states).filter((st) => st.attributes.shutter_captain);
    const sig = ours.map((st) => st.last_updated).join(",") + "#" + Object.values(hass.states)
      .filter((st) => st.entity_id.startsWith("cover."))
      .map((st) => st.last_updated)
      .join(",");
    if (sig === this._sig) return;
    this._sig = sig;
    this._renderOverview();
  }
  get hass() { return this._hass; }
  set narrow(v) { this._narrow = v; if (this._menuButton) this._menuButton.narrow = v; }
  set panel(v) { this._panel = v; }
  set route(v) { this._route = v; }

  get lang() {
    if (this._langPref === "de" || this._langPref === "en") return this._langPref;
    return (this._hass?.language || "en").startsWith("de") ? "de" : "en";
  }
  get locale() { return this.lang === "de" ? "de-DE" : "en-GB"; }

  _setLanguage(pref) {
    this._langPref = pref;
    try { localStorage.setItem(LANG_KEY, pref); } catch (_err) { /* private mode */ }
    const view = this._view;
    this._built = false;
    this._build();
    this._config = null;
    this._setView(view);
    this._loadConfig();
  }
  t(key) { return T[this.lang][key] ?? T.en[key] ?? key; }

  /* --------------------------------------------------------------- shell */
  _build() {
    this._built = true;
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="toolbar">
        <span id="menu"></span>
        <div class="name"><span class="logo"><ha-icon icon="mdi:window-shutter-auto"></ha-icon></span><span class="title-text">${esc(this.t("title"))}</span></div>
        <nav class="tabs">
          <button class="tab" data-view="overview"><ha-icon icon="mdi:view-dashboard-outline"></ha-icon><span class="lbl">${esc(this.t("overview"))}</span></button>
          <button class="tab" data-view="shutters"><ha-icon icon="mdi:window-shutter-cog"></ha-icon><span class="lbl">${esc(this.t("shutters"))}</span></button>
          <button class="tab" data-view="awnings"><ha-icon icon="mdi:awning-outline"></ha-icon><span class="lbl">${esc(this.t("edit_awnings"))}</span></button>
          <button class="tab" data-view="garages"><ha-icon icon="mdi:garage-variant"></ha-icon><span class="lbl">${esc(this.t("edit_garages"))}</span></button>
          <button class="tab" data-view="settings"><ha-icon icon="mdi:cog-outline"></ha-icon><span class="lbl">${esc(this.t("settings"))}</span></button>
        </nav>
        <label class="langsel" title="Sprache / Language"><ha-icon icon="mdi:translate"></ha-icon>
          <select id="lang" aria-label="Sprache / Language">
            <option value="auto" ${this._langPref === "auto" ? "selected" : ""}>Auto</option>
            <option value="de" ${this._langPref === "de" ? "selected" : ""}>Deutsch</option>
            <option value="en" ${this._langPref === "en" ? "selected" : ""}>English</option>
          </select></label>
      </div>
      <main id="main"></main>
      <div class="savebar" id="savebar"><span>${esc(this.t("unsaved"))}</span>
        <button class="btn" id="discard">${esc(this.t("cancel"))}</button>
        <button class="btn primary" id="save"><ha-icon icon="mdi:content-save-outline"></ha-icon>${esc(this.t("save"))}</button></div>
      <div class="toast" id="toast"></div>`;
    const menu = document.createElement("ha-menu-button");
    menu.hass = this._hass;
    menu.narrow = this._narrow;
    this._menuButton = menu;
    this.shadowRoot.getElementById("menu").appendChild(menu);
    this.shadowRoot.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => this._setView(b.dataset.view)));
    this.shadowRoot.getElementById("lang").addEventListener("change", (ev) => this._setLanguage(ev.target.value));
    this.shadowRoot.getElementById("save").addEventListener("click", () => this._save());
    this.shadowRoot.getElementById("discard").addEventListener("click", () => this._discard());
    this._setView("overview");
  }

  _setView(view) {
    this._view = view;
    this.shadowRoot.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    this._cards.clear();
    this._editing = null;
    this._draftGlobal = null;
    this._showSavebar(false);
    const main = this.shadowRoot.getElementById("main");
    main.innerHTML = "";
    this._sig = null;
    if (view === "overview") this._renderOverview();
    else if (["shutters", "awnings", "garages"].includes(view)) { this._editType = { shutters: "shutter", awnings: "awning", garages: "garage" }[view]; this._renderShutterList(); }
    else this._renderSettings();
  }

  async _loadConfig() {
    try {
      this._config = await this._hass.callWS({ type: `${DOMAIN}/get_config`, language: this.lang });
      this._configError = null;
    } catch (err) {
      this._configError = err;
    }
    if (this._view === "overview") { this._sig = null; this._renderOverview(); }
    if (["shutters", "awnings", "garages"].includes(this._view) && !this._editing) this._renderShutterList();
    if (this._view === "settings" && !this._draftGlobal) this._renderSettings();
  }

  _toast(text, error = false) {
    const el = this.shadowRoot.getElementById("toast");
    el.textContent = text;
    el.classList.toggle("err", error);
    el.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  _showSavebar(show) { this.shadowRoot.getElementById("savebar").classList.toggle("show", show); }

  /* ----------------------------------------------------------- data */
  _hub() {
    return Object.values(this._hass.states).find((s) => s.attributes.shutter_captain === "hub");
  }
  _shutterStates() {
    return Object.values(this._hass.states)
      .filter((s) => s.attributes.shutter_captain === "shutter")
      .sort((a, b) => String(a.attributes.name).localeCompare(String(b.attributes.name)));
  }
  _entityOnDevice(statusEntityId, translationKey) {
    const ents = this._hass.entities || {};
    const device = ents[statusEntityId]?.device_id;
    if (!device) return undefined;
    return Object.values(ents).find((e) => e.device_id === device && e.platform === DOMAIN && e.translation_key === translationKey)?.entity_id;
  }

  _fmtTime(iso) {
    if (!iso) return this.t("no_plan");
    const d = new Date(iso);
    const now = new Date();
    const time = d.toLocaleTimeString(this.locale, { hour: "2-digit", minute: "2-digit" });
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    if (d.toDateString() === now.toDateString()) return time;
    if (d.toDateString() === tomorrow.toDateString()) return `${time} <small>${esc(this.t("tomorrow"))}</small>`;
    return `${d.toLocaleDateString(this.locale, { weekday: "short" })} ${time}`;
  }

  _stateLabel(state, type = "shutter") {
    const own = { awning: { sun_protect: "st_extended", down: "st_retracted", up: "st_retracted" }, garage: { up: "st_open", down: "st_closed" } }[type]?.[state];
    if (own) return this.t(own);
    return this._config?.labels?.entity?.sensor?.status?.state?.[state] || state;
  }

  /* ------------------------------------------------------------ overview */
  _renderOverview() {
    const main = this.shadowRoot.getElementById("main");
    if (!main || !this._hass) return;
    const hub = this._hub();
    if (!hub) {
      main.innerHTML = `<div class="card empty"><ha-icon icon="mdi:window-shutter-alert"></ha-icon><h2>${esc(this.t("title"))}</h2><p>${esc(this.t("not_setup"))}</p></div>`;
      this._cards.clear();
      return;
    }
    if (!main.querySelector("#hero")) {
      main.innerHTML = `<div id="alarm"></div><section class="hero" id="hero"></section>
        <div class="actions" id="actions"></div><section class="grid" id="grid"></section><section id="extra"></section>`;
      this._cards.clear();
      this._renderActions();
    }
    const accent = ACCENT_COLORS[hub.attributes.accent];
    if (accent) this.style.setProperty("--sp-accent", accent);
    else this.style.removeProperty("--sp-accent");
    this._renderHero(hub);
    this._renderGrid();
  }

  _renderHero(hub) {
    const a = hub.attributes;
    const alarm = this.shadowRoot.getElementById("alarm");
    alarm.innerHTML = a.emergency
      ? `<div class="alarm-banner"><ha-icon icon="mdi:alarm-light"></ha-icon>${esc(this.t("emergency_active"))}</div>`
      : a.alarms?.length
      ? `<div class="alarm-banner"><ha-icon icon="mdi:alert"></ha-icon>${esc(this.t("alarm_active"))}: ${a.alarms.map((x) => esc(this.t("alarms")[x] || x)).join(", ")}</div>`
      : "";
    const flag = (key) => this._entityOnDevice(hub.entity_id, key);
    const flagChip = (key, icon) => {
      const id = flag(key);
      const on = id ? this._hass.states[id]?.state === "on" : a[key];
      return `<button class="chip ${on ? "on" : ""}" data-toggle="${esc(id || "")}"><ha-icon icon="${icon}"></ha-icon>${esc(this.t(key))}</button>`;
    };
    const elev = Number(a.sun_elevation);
    const areaRows = AREAS.map((ar) => {
      const info = a.areas?.[ar] || {};
      const id = flag(`auto_${ar}`);
      const on = id ? this._hass.states[id]?.state === "on" : info.auto;
      return `<div class="area"><span>${esc(this.t(ar))}</span>
        <span class="t"><ha-icon icon="mdi:arrow-up"></ha-icon>${this._fmtTime(info.open)}</span>
        <span class="t"><ha-icon icon="mdi:arrow-down"></ha-icon>${this._fmtTime(info.close)}</span>
        <label class="switch" title="${esc(this.t("auto"))}"><input type="checkbox" data-toggle-input="${esc(id || "")}" ${on ? "checked" : ""}><span></span></label></div>`;
    }).join("");

    // Awnings / garage doors: no areas, no shutter sun protection – their own Automatic | Manual card instead.
    const dtype = { awnings: "awning", garages: "garage" }[this._type];
    let typeCard = "";
    if (dtype) {
      const devs = this._shutterStates().filter((s) => (s.attributes.device_type || "shutter") === dtype);
      const allAuto = devs.length > 0 && devs.every((s) => !s.attributes.manual);
      const allManual = devs.length > 0 && devs.every((s) => s.attributes.manual);
      const rows = devs.map((s) => {
        const id = this._entityOnDevice(s.entity_id, "automation");
        return `<div class="area tm"><span>${esc(s.attributes.name)}</span><span class="t">${esc(this._stateLabel(s.state, dtype))}</span>
          <label class="switch" title="${esc(this.t("am_auto"))}"><input type="checkbox" data-toggle-input="${esc(id || "")}" ${s.attributes.manual ? "" : "checked"}><span></span></label></div>`;
      }).join("");
      typeCard = `<div class="card"><div class="eyebrow">${esc(this.t("auto"))} · ${esc(this.t(dtype === "awning" ? "c_awnings" : "c_garage"))}</div>
        <div class="segment tmode">${[["auto", "am_auto", allAuto], ["manual", "am_manual", allManual]].map(([k, l, on]) => `<button data-tmode="${k}" class="${on ? "active" : ""}">${esc(this.t(l))}</button>`).join("")}</div>
        <div class="areas">${rows || `<div class="entity-name">${esc(this.t("none_of_type"))}</div>`}</div></div>`;
    }
    const sunCard = `<div class="card"><div class="eyebrow">${esc(this.t("sun"))}</div>
        <div class="sunbox">${this._compass(Number(a.sun_azimuth), elev, null, null, 72)}
          <div><div class="big">${elev > 0 ? "☀" : "☾"} ${Math.round(elev)}°</div>
          <div class="entity-name">${esc(this.t("azimuth"))} ${Math.round(a.sun_azimuth)}° · ${esc(this.t("elevation"))} ${Math.round(elev)}°</div></div></div></div>`;
    const hero = this.shadowRoot.getElementById("hero");
    hero.innerHTML = `
      <div class="card"><div class="eyebrow">${esc(this.t("today"))}</div>
        <div class="big">${esc(this.t(a.free_day ? "free_day" : "workday"))}</div>
        <div class="entity-name">${esc(this.t(a.free_tomorrow ? "tomorrow_free" : "tomorrow_work"))}</div>
        <div class="chips">${flagChip("master", "mdi:power")}${flagChip("vacation", "mdi:beach")}${flagChip("school_holiday", "mdi:school-outline")}
          ${a.summer ? `<span class="chip"><ha-icon icon="mdi:white-balance-sunny"></ha-icon>${esc(this.t("summer"))}</span>` : ""}
          ${a.xmas ? `<span class="chip"><ha-icon icon="mdi:pine-tree"></ha-icon>${esc(this.t("xmas"))}</span>` : ""}</div></div>
      ${dtype === "garage" ? "" : sunCard}
      ${dtype ? typeCard : `<div class="card"><div class="eyebrow">${esc(this.t("auto"))}</div><div class="areas">${areaRows}</div></div>`}`;
    hero.querySelectorAll("[data-tmode]").forEach((b) => b.addEventListener("click", () =>
      this._hass.callService(DOMAIN, "command", { action: b.dataset.tmode, device_type: dtype })));
    hero.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.toggle) this._hass.callService("switch", "toggle", { entity_id: b.dataset.toggle });
    }));
    hero.querySelectorAll("[data-toggle-input]").forEach((i) => i.addEventListener("change", () => {
      if (i.dataset.toggleInput) this._hass.callService("switch", i.checked ? "turn_on" : "turn_off", { entity_id: i.dataset.toggleInput });
    }));
  }

  _renderActions() {
    const el = this.shadowRoot.getElementById("actions");
    this._type = this._type || "all";
    const dtype = { awnings: "awning", garages: "garage" }[this._type];
    const lbl = (k) => this.t(dtype === "awning" ? { open: "aw_extend", close: "aw_retract" }[k] || k : k);
    el.innerHTML = `
      <div class="segment typeseg">${[["all", "t_all", "mdi:view-grid-outline"], ["groups", "c_groups", "mdi:window-shutter-cog"], ["shutters", "c_shutters", "mdi:window-shutter"], ["awnings", "c_awnings", "mdi:awning-outline"], ["garages", "c_garage", "mdi:garage-variant"]]
        .map(([k, l, ic]) => `<button data-type="${k}" class="${this._type === k ? "active" : ""}"><ha-icon icon="${ic}"></ha-icon>${esc(this.t(l))}</button>`).join("")}</div>
      <div class="break"></div>
      ${dtype ? "" : `<div class="segment">${["all", ...AREAS].map((ar) => `<button data-area="${ar}" class="${this._area === ar ? "active" : ""}">${esc(this.t(ar))}</button>`).join("")}</div>`}
      <span class="spacer"></span>
      <button class="btn" data-cmd="open"><ha-icon icon="mdi:arrow-up-bold"></ha-icon>${esc(lbl("open"))}</button>
      ${dtype ? "" : `<button class="btn" data-cmd="sun_protect"><ha-icon icon="mdi:weather-sunny"></ha-icon>${esc(this.t("sun_protect"))}</button>`}
      <button class="btn" data-cmd="close"><ha-icon icon="mdi:arrow-down-bold"></ha-icon>${esc(lbl("close"))}</button>
      <button class="btn primary" data-cmd="auto"><ha-icon icon="mdi:autorenew"></ha-icon>${esc(this.t("auto"))}</button>`;
    el.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => {
      this._type = b.dataset.type;
      // Areas, sun protection and the hero cards depend on the type.
      this._renderActions();
      const hub = this._hub();
      if (hub) this._renderHero(hub);
      this._renderGrid();
    }));
    el.querySelectorAll("[data-area]").forEach((b) => b.addEventListener("click", () => {
      this._area = b.dataset.area;
      el.querySelectorAll("[data-area]").forEach((x) => x.classList.toggle("active", x === b));
      this._renderGrid();
    }));
    el.querySelectorAll("[data-cmd]").forEach((b) => b.addEventListener("click", () =>
      this._hass.callService(DOMAIN, "command", dtype ? { action: b.dataset.cmd, device_type: dtype } : { action: b.dataset.cmd, area: this._area })));
  }

  _renderGrid() {
    const grid = this.shadowRoot.getElementById("grid");
    if (!grid) return;
    const type = this._type || "all";
    const wantType = { shutters: "shutter", awnings: "awning", garages: "garage" }[type];
    const shutters = this._shutterStates()
      .filter((s) => type === "all" || (wantType && (s.attributes.device_type || "shutter") === wantType))
      .filter((s) => (wantType && wantType !== "shutter") || this._area === "all" || s.attributes.area === this._area
        || [s.attributes.up_mode, s.attributes.down_mode].some((m) => String(m).replace("_auto", "") === this._area));
    this._renderExtra();
    if (!shutters.length && type !== "all") {
      grid.innerHTML = "";
      this._cards.clear();
      return;
    }
    if (!shutters.length) {
      grid.innerHTML = `<div class="card empty" style="grid-column:1/-1"><ha-icon icon="mdi:window-shutter"></ha-icon>
        <h2>${esc(this.t("empty_title"))}</h2><p>${esc(this.t("empty_text"))}</p>
        <button class="btn primary" id="emptyadd"><ha-icon icon="mdi:plus"></ha-icon>${esc(this.t("add"))}</button></div>`;
      this._cards.clear();
      grid.querySelector("#emptyadd").addEventListener("click", () => { this._setView("shutters"); this._openEditor("new"); });
      return;
    }
    const wanted = new Set(shutters.map((s) => s.entity_id));
    for (const [id, card] of this._cards) if (!wanted.has(id)) { card.remove(); this._cards.delete(id); }
    grid.querySelector(".empty")?.remove();
    shutters.forEach((s, index) => {
      let card = this._cards.get(s.entity_id);
      if (!card) {
        card = this._createCard(s);
        this._cards.set(s.entity_id, card);
      }
      if (grid.children[index] !== card) grid.insertBefore(card, grid.children[index] || null);
      this._updateCard(card, s);
    });
  }

  /** Covers Shutter Captain does not automate (and the group devices) as simple control tiles. */
  _renderExtra() {
    const box = this.shadowRoot.getElementById("extra");
    if (!box) return;
    if (!this.shadowRoot.getElementById("control-css")) {
      const st = document.createElement("style");
      st.id = "control-css";
      st.textContent = CONTROL_CSS;
      this.shadowRoot.appendChild(st);
    }
    const type = this._type || "all";
    const managed = new Set(this._shutterStates().map((s) => s.attributes.cover_entity));
    const map = { groups: "groups", shutters: "shutters", awnings: "awnings", garages: "garage" };
    const cats = type === "all" ? ["groups", "shutters", "awnings", "garage"] : [map[type]];
    const ids = Object.keys(this._hass.states)
      .filter((id) => id.startsWith("cover.") && !managed.has(id))
      .sort((a, b) => this._friendly(a).localeCompare(this._friendly(b)));
    const sections = cats.map((cat) => {
      const list = ids.filter((id) => this._coverCategory(id) === cat);
      if (!list.length) return "";
      const title = cat === "groups" ? this.t("c_groups") : `${this.t(`c_${cat}`)} · ${this.t("other_devices")}`;
      const icon = COVER_GROUPS.find(([k]) => k === cat)?.[1] || "mdi:window-shutter";
      return `<div class="ctl-sec"><ha-icon icon="${icon}"></ha-icon>${esc(title)}<small>${list.length}</small></div>
        <div class="ctl-grid">${list.map((id) => this._controlTile(id, cat, false)).join("")}</div>`;
    }).join("");
    box.innerHTML = sections;
    box.querySelectorAll("[data-cact]").forEach((b) => b.addEventListener("click", () => this._controlAction(b.dataset.id, b.dataset.cact)));
    box.querySelectorAll("input[data-cpos]").forEach((r) => {
      r.addEventListener("pointerdown", () => { this._dragging = true; });
      r.addEventListener("change", () => {
        this._dragging = false;
        this._hass.callService("cover", "set_cover_position", { entity_id: r.dataset.cpos, position: Number(r.value) });
      });
    });
  }

  _createCard(s) {
    const card = document.createElement("div");
    card.className = "card shutter";
    card.innerHTML = `
      <div class="win"><div class="stars"></div><div class="wx"></div><div class="glass"></div><div class="mullion"></div><div class="sunray"></div><div class="slats"></div><div class="mv"><ha-icon></ha-icon></div><div class="badge"></div></div>
      <div>
        <div class="head"><div class="titles"><h3 class="nm"></h3><div class="status"><ha-icon></ha-icon><span></span></div></div>
          <div class="compass"></div>
          <div class="menu"><button class="btn icon" data-act="menu"><ha-icon icon="mdi:dots-vertical"></ha-icon></button>
            <div class="menu-list">
              <button data-act="resume"><ha-icon icon="mdi:autorenew"></ha-icon>${esc(this.t("resume"))}</button>
              <button data-act="pause60"><ha-icon icon="mdi:pause"></ha-icon>${esc(this.t("pause_1h"))}</button>
              <button data-act="pause180"><ha-icon icon="mdi:pause"></ha-icon>${esc(this.t("pause_3h"))}</button>
              <button data-act="pause0"><ha-icon icon="mdi:pause-octagon-outline"></ha-icon>${esc(this.t("pause_inf"))}</button>
              <button data-act="sun"><ha-icon icon="mdi:weather-sunny"></ha-icon>${esc(this.t("sun_protect"))}</button>
              <button data-act="vent"><ha-icon icon="mdi:weather-windy"></ha-icon>${esc(this.t("vent"))}</button>
              <button data-act="edit"><ha-icon icon="mdi:pencil-outline"></ha-icon>${esc(this.t("edit"))}</button>
            </div></div></div>
        <div class="reason"></div>
        <div class="times"><span><ha-icon icon="mdi:arrow-up"></ha-icon><b class="to"></b></span><span><ha-icon icon="mdi:arrow-down"></ha-icon><b class="tc"></b></span></div>
      </div>
      <div class="controls">
        <button class="btn icon" data-act="open" title="${esc(this.t("open"))}"><ha-icon icon="mdi:arrow-up"></ha-icon></button>
        <button class="btn icon" data-act="stop" title="${esc(this.t("stop"))}"><ha-icon icon="mdi:stop"></ha-icon></button>
        <button class="btn icon" data-act="close" title="${esc(this.t("close"))}"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
        <input type="range" min="0" max="100" step="1" aria-label="${esc(this.t("position"))}">
      </div>
      <div class="toggles">
        <span class="am"><button data-am="on">${esc(this.t("am_auto"))}</button><button data-am="off">${esc(this.t("am_manual"))}</button></span>
        <button class="chip" data-auto="auto_up"><ha-icon icon="mdi:arrow-up-bold-box-outline"></ha-icon>${esc(this.t("auto_up"))}</button>
        <button class="chip" data-auto="auto_down"><ha-icon icon="mdi:arrow-down-bold-box-outline"></ha-icon>${esc(this.t("auto_down"))}</button>
        <button class="chip" data-auto="auto_sun"><ha-icon icon="mdi:weather-sunny"></ha-icon>${esc(this.t("auto_sun"))}</button>
        <span class="chip win-chip" hidden></span>
      </div>`;
    const range = card.querySelector("input[type=range]");
    range.addEventListener("pointerdown", () => { this._dragging = true; });
    range.addEventListener("change", () => {
      this._dragging = false;
      const now = Number(this._hass.states[card._cover]?.attributes?.current_position ?? 100);
      if (Number(range.value) < now && !this._okToClose(card._cover)) { range.value = now; return; }
      this._hass.callService("cover", "set_cover_position", { entity_id: card._cover, position: Number(range.value) });
    });
    card.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-act],[data-auto],[data-am]");
      const menu = card.querySelector(".menu");
      if (!btn) { menu.classList.remove("open"); return; }
      const act = btn.dataset.act;
      const cover = card._cover;
      if (btn.dataset.am) {
        const sw = this._entityOnDevice(card._status, "automation");
        if (sw) this._hass.callService("switch", btn.dataset.am === "on" ? "turn_on" : "turn_off", { entity_id: sw });
        return;
      }
      if (btn.dataset.auto) {
        const id = this._entityOnDevice(card._status, btn.dataset.auto);
        if (id) this._hass.callService("switch", "toggle", { entity_id: id });
        return;
      }
      if (act === "menu") { menu.classList.toggle("open"); ev.stopPropagation(); return; }
      menu.classList.remove("open");
      if (act === "open") this._hass.callService("cover", "open_cover", { entity_id: cover });
      if (act === "close" && this._okToClose(cover)) this._hass.callService("cover", "close_cover", { entity_id: cover });
      if (act === "stop") this._hass.callService("cover", "stop_cover", { entity_id: cover });
      if (act === "resume") this._hass.callService(DOMAIN, "resume", { entity_id: cover });
      if (act?.startsWith("pause")) {
        const minutes = Number(act.slice(5));
        this._hass.callService(DOMAIN, "pause", minutes ? { entity_id: cover, minutes } : { entity_id: cover });
      }
      if (act === "sun") this._hass.callService("cover", "set_cover_position", { entity_id: cover, position: card._sunLevel });
      if (act === "vent") this._hass.callService(DOMAIN, "vent", { entity_id: cover });
      if (act === "edit") { this._setView({ awning: "awnings", garage: "garages" }[card._dtype] || "shutters"); this._openEditor("edit", [card._subentry]); }
    });
    return card;
  }

  _updateCard(card, s) {
    const a = s.attributes;
    const state = this._hass.states[s.entity_id]?.state || "none";
    const style = STATE_STYLE[state] || STATE_STYLE.none;
    card._cover = a.cover_entity;
    card._status = s.entity_id;
    card._subentry = a.subentry_id;
    card._sunLevel = a.sun_level;
    card.style.setProperty("--state-color", style.color);
    card.querySelector(".nm").textContent = a.name;
    card.querySelector(".status ha-icon").setAttribute("icon", style.icon);
    const dtype = a.device_type || "shutter";
    card._dtype = dtype;
    // Garage doors: no schedule, no sun – only the Automatic/Manual switch.
    const isGarage = dtype === "garage";
    // Awnings: no schedule either – only their sun automation.
    const isAwning = dtype === "awning";
    card.querySelectorAll("[data-auto]").forEach((b) => { b.hidden = isGarage || (isAwning && b.dataset.auto !== "auto_sun"); });
    card.querySelector(".times").hidden = isGarage || isAwning;
    card.querySelector(".compass").hidden = isGarage;
    card.querySelector("[data-act=\"sun\"]")?.toggleAttribute("hidden", isGarage);
    let label = this._stateLabel(state, dtype);
    if (a.manual_until) label += ` · ${this.t("until")} ${new Date(a.manual_until).toLocaleTimeString(this.locale, { hour: "2-digit", minute: "2-digit" })}`;
    card.querySelector(".status span").textContent = label;
    card.querySelector(".reason").textContent = REASONS[this.lang][a.reason] || "";
    card.querySelector(".to").innerHTML = this._fmtTime(a.next_open);
    card.querySelector(".tc").innerHTML = this._fmtTime(a.next_close);

    const pos = typeof a.position === "number" ? a.position : null;
    const win = card.querySelector(".win");
    const hub = this._hub();
    const elev = Number(hub?.attributes.sun_elevation ?? 0);
    applySky(win, elev, Number(hub?.attributes.sun_azimuth ?? 0), hub?.attributes.weather);
    const motion = motionOf(this._hass.states[a.cover_entity]?.state);
    win.classList.toggle("moving-opening", motion === "opening");
    win.classList.toggle("moving-closing", motion === "closing");
    if (motion) win.querySelector(".mv ha-icon").setAttribute("icon", motion === "opening" ? "mdi:arrow-up" : "mdi:arrow-down");
    win.classList.toggle("sunny", state === "sun_protect" || state === "heat_protect" || !!a.sun_checks?.azimuth);
    win.classList.toggle("t-awning", dtype === "awning");
    win.classList.toggle("t-garage", dtype === "garage");
    // Awning: the fabric grows with the position (extended = open). Shutter/garage: the curtain comes down.
    const cover = dtype === "awning" ? pos : (pos === null ? null : 100 - pos);
    card.querySelector(".slats").style.height = cover === null ? "0" : `calc(${cover}% - ${cover * 0.08}px)`;
    const typeIcon = { awning: "mdi:awning-outline", garage: "mdi:garage-variant" }[dtype];
    if (typeIcon && (state === "up" || state === "down" || state === "sun_protect")) card.querySelector(".status ha-icon").setAttribute("icon", dtype === "garage" ? (state === "up" ? "mdi:garage-open-variant" : "mdi:garage-variant") : (state === "sun_protect" ? "mdi:awning" : "mdi:awning-outline"));
    card.querySelector(".badge").textContent = pos === null ? "?" : `${pos}%`;
    const range = card.querySelector("input[type=range]");
    if (!this._dragging && pos !== null) range.value = pos;
    range.disabled = pos === null;

    const azimuth = Number(hub?.attributes.sun_azimuth ?? 0);
    const compassKey = `${Math.round(azimuth)}|${Math.round(elev)}|${a.window_azimuth}|${a.azimuth_range}`;
    if (card._compassKey !== compassKey) {
      card._compassKey = compassKey;
      card.querySelector(".compass").innerHTML = a.sun_mode === "off" ? "" : this._compass(azimuth, elev, a.window_azimuth, a.azimuth_range, 40);
    }
    card.querySelectorAll("[data-auto]").forEach((b) => b.classList.toggle("on", !!a[b.dataset.auto]));
    card.querySelectorAll("[data-am]").forEach((b) => b.classList.toggle("on", (b.dataset.am === "on") === !a.manual));
    const wc = card.querySelector(".win-chip");
    if (a.window && a.window !== "closed") {
      wc.hidden = false;
      wc.innerHTML = `<ha-icon icon="mdi:window-open-variant"></ha-icon>${esc(this.t(a.window === "tilted" ? "window_tilted" : "window_open"))}`;
    } else wc.hidden = true;
  }

  _compass(sunAz, sunEl, winAz, range, size) {
    const r = size / 2;
    const c = r;
    const pt = (deg, rad) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return [c + rad * Math.cos(a), c + rad * Math.sin(a)];
    };
    let wedge = "";
    if (winAz !== null && winAz !== undefined) {
      const [x1, y1] = pt(winAz - range, r - 2);
      const [x2, y2] = pt(winAz + range, r - 2);
      const large = range * 2 > 180 ? 1 : 0;
      wedge = `<path d="M${c},${c} L${x1},${y1} A${r - 2},${r - 2} 0 ${large} 1 ${x2},${y2} Z" fill="var(--sp-accent)" opacity=".3"/>`;
      const [wx, wy] = pt(winAz, r * 0.62);
      wedge += `<line x1="${c}" y1="${c}" x2="${wx}" y2="${wy}" stroke="var(--sp-accent)" stroke-width="2" stroke-linecap="round"/>`;
    }
    const up = sunEl > 0;
    const [sx, sy] = pt(sunAz, r - Math.max(5, size * 0.12));
    const n = pt(0, r - size * 0.2);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${c}" cy="${c}" r="${r - 1}" fill="none" stroke="var(--sp-line)" stroke-width="1.5"/>
      ${wedge}
      ${size > 50 ? `<text x="${n[0]}" y="${n[1] + 4}" text-anchor="middle" font-size="10" fill="var(--sp-muted)">N</text>` : ""}
      <circle cx="${sx}" cy="${sy}" r="${Math.max(3.5, size * 0.08)}" fill="${up ? "#ffb300" : "#90a4ae"}" ${up ? 'stroke="#fff3c4" stroke-width="2"' : ""}/>
    </svg>`;
  }

  /* --------------------------------------------------- shutter editor */
  _renderShutterList() {
    const main = this.shadowRoot.getElementById("main");
    if (this._editing) return;
    if (this._configError) {
      main.innerHTML = `<div class="card empty"><ha-icon icon="mdi:alert"></ha-icon><p>${esc(this.t("not_setup"))}</p></div>`;
      return;
    }
    if (!this._config) { main.innerHTML = ""; return; }
    const cfg = this._config;
    const sel = (key, val) => this._optionLabel(key, val);
    const q = this._search.toLowerCase();
    const etype = this._editType || "shutter";
    const rows = cfg.shutters
      .filter((s) => (s.data.device_type || "shutter") === etype)
      .filter((s) => !q || s.title.toLowerCase().includes(q) || String(s.data.cover_entity).includes(q));
    const admin = cfg.is_admin;
    main.innerHTML = `
      ${admin ? "" : `<div class="notice">${esc(this.t("readonly"))}</div>`}
      <div class="editor-head"><h2>${esc(this.t({ shutter: "shutters", awning: "edit_awnings", garage: "edit_garages" }[this._editType || "shutter"]))}</h2>
        <div class="input searchbox"><ha-icon icon="mdi:magnify"></ha-icon><input id="search" placeholder="${esc(this.t("search"))}" value="${esc(this._search)}"></div>
        ${admin && this._selected.size > 1 ? `<button class="btn" id="bulk"><ha-icon icon="mdi:checkbox-multiple-marked-outline"></ha-icon>${esc(this.t("bulk_edit"))} (${this._selected.size})</button>` : ""}
        ${admin ? `<button class="btn primary" id="add"><ha-icon icon="mdi:plus"></ha-icon>${esc(this.t({ shutter: "add", awning: "add_awning", garage: "add_garage" }[this._editType || "shutter"]))}</button>` : ""}</div>
      ${cfg.shutters.length ? `<div class="card table-wrap"><table class="table"><thead><tr>
        <th style="width:40px"><input type="checkbox" id="selall" ${this._selected.size && this._selected.size === cfg.shutters.length ? "checked" : ""}></th>
        <th>${esc(this.t("col_name"))}</th><th>${esc(this.t("col_open"))}</th><th>${esc(this.t("col_close"))}</th>
        <th class="hide-sm">${esc(this.t("col_sun"))}</th><th class="hide-sm">${esc(this.t("col_window"))}</th><th style="width:96px"></th></tr></thead><tbody>
        ${rows.map((s) => `<tr data-id="${esc(s.subentry_id)}">
          <td><input type="checkbox" data-sel="${esc(s.subentry_id)}" ${this._selected.has(s.subentry_id) ? "checked" : ""}></td>
          <td><b>${esc(s.title)}</b><span class="sub">${esc(s.data.cover_entity)}</span></td>
          <td>${esc(sel("up_mode", s.data.up_mode))}<span class="sub">${s.data.open_level}%</span></td>
          <td>${esc(sel("down_mode", s.data.down_mode))}<span class="sub">${s.data.close_level}%</span></td>
          <td class="hide-sm">${esc(sel("sun_mode", s.data.sun_mode))}${s.data.sun_mode !== "off" ? `<span class="sub">${s.data.azimuth}° ± ${s.data.azimuth_range}° · ${s.data.sun_level}%</span>` : ""}</td>
          <td class="hide-sm">${s.data.window_entity ? esc(this._friendly(s.data.window_entity)) : esc(this.t("no"))}</td>
          <td>${admin ? `<button class="btn icon" data-dup="${esc(s.subentry_id)}" title="${esc(this.t("duplicate"))}"><ha-icon icon="mdi:content-copy"></ha-icon></button>
            <button class="btn icon danger" data-del="${esc(s.subentry_id)}" title="${esc(this.t("delete"))}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>` : ""}</td></tr>`).join("")}
        </tbody></table></div>`
        : `<div class="card empty"><ha-icon icon="mdi:window-shutter"></ha-icon><h2>${esc(this.t("empty_title"))}</h2><p>${esc(this.t("empty_text"))}</p></div>`}`;

    const search = main.querySelector("#search");
    search?.addEventListener("input", () => {
      this._search = search.value;
      const pos = search.selectionStart;
      this._renderShutterList();
      const s2 = this.shadowRoot.getElementById("search");
      s2.focus(); s2.setSelectionRange(pos, pos);
    });
    main.querySelector("#add")?.addEventListener("click", () => this._openEditor("new"));
    main.querySelector("#bulk")?.addEventListener("click", () => this._openEditor("bulk", [...this._selected]));
    main.querySelector("#selall")?.addEventListener("change", (ev) => {
      this._selected = ev.target.checked ? new Set(cfg.shutters.map((s) => s.subentry_id)) : new Set();
      this._renderShutterList();
    });
    main.querySelectorAll("tbody tr").forEach((tr) => tr.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.dataset.sel !== undefined) {
        t.checked ? this._selected.add(t.dataset.sel) : this._selected.delete(t.dataset.sel);
        this._renderShutterList();
        return;
      }
      const dup = t.closest("[data-dup]"); const del = t.closest("[data-del]");
      if (dup) return this._openEditor("duplicate", [dup.dataset.dup]);
      if (del) return this._delete(del.dataset.del);
      if (admin) this._openEditor("edit", [tr.dataset.id]);
    }));
  }

  _friendly(entityId) {
    return this._hass.states[entityId]?.attributes?.friendly_name || entityId;
  }

  _optionLabel(key, value) {
    const tk = this._translationKey(key);
    return this._config?.labels?.selector?.[tk]?.options?.[value] || value;
  }
  _translationKey(key) {
    return /^(living|sleep|children)_/.test(key) ? key.split("_").slice(1).join("_") : key;
  }

  async _openEditor(mode, ids = []) {
    if (!this._config) await this._loadConfig();
    const cfg = this._config;
    const find = (id) => cfg.shutters.find((s) => s.subentry_id === id);
    let data;
    if (mode === "new") data = { ...cfg.shutter_defaults, device_type: this._editType || "shutter", ...(this._editType === "garage" ? { up_mode: "off", down_mode: "off" } : this._editType === "awning" ? { up_mode: "off", down_mode: "off", open_level: 100, close_level: 0, sun_level: 100, sun_mode: "azimuth" } : {}) };
    else if (mode === "duplicate") data = { ...find(ids[0]).data, name: "", cover_entity: null };
    else data = { ...find(ids[0]).data };
    this._editing = { mode, ids, data, original: { ...data }, changed: new Set() };
    this._renderEditor();
  }

  _renderEditor() {
    const main = this.shadowRoot.getElementById("main");
    const ed = this._editing;
    const cfg = this._config;
    const titleMap = { new: this.t("add"), duplicate: this.t("duplicate"), bulk: `${this.t("bulk_edit")} (${ed.ids.length})` };
    const title = titleMap[ed.mode] || cfg.shutters.find((s) => s.subentry_id === ed.ids[0])?.title;
    const icons = { main: "mdi:window-shutter", window: "mdi:window-open-variant", sun: "mdi:weather-sunny", conditions: "mdi:function-variant", stages: "mdi:stairs-down", extra: "mdi:tune-variant" };
    const labels = cfg.labels?.config_subentries?.shutter?.step || {};
    const hidden = ed.mode === "bulk" ? new Set(["name", "cover_entity"]) : new Set();
    main.innerHTML = `
      <div class="editor-head"><button class="btn icon" id="back"><ha-icon icon="mdi:arrow-left"></ha-icon></button><h2>${esc(title)}</h2>
        ${ed.mode === "edit" ? `<button class="btn danger" id="del"><ha-icon icon="mdi:delete-outline"></ha-icon>${esc(this.t("delete"))}</button>` : ""}</div>
      ${ed.mode === "bulk" ? `<div class="notice">${esc(this.t("bulk_hint").replace("{n}", ed.ids.length))}</div>` : ""}
      <div class="sections">${Object.entries(cfg.shutter_schema).map(([section, fields], i) => `
        <details class="card section" data-section="${section}" ${i < 2 || ed.mode !== "edit" ? "open" : ""}>
          <summary><span class="ico"><ha-icon icon="${icons[section]}"></ha-icon></span>${esc(labels[section]?.title || section)}<ha-icon class="chev" icon="mdi:chevron-down"></ha-icon></summary>
          <div class="fields">${fields.filter((f) => !hidden.has(f.key)).map((f) => this._fieldHtml(f, ed.data[f.key], labels[section])).join("")}</div>
        </details>`).join("")}</div>`;
    main.querySelector("#back").addEventListener("click", () => this._closeEditor());
    main.querySelector("#del")?.addEventListener("click", () => this._delete(ed.ids[0]));
    this._wireFields(main, ed.data, ed.changed, cfg.shutter_schema);
    this._applyShowIf(main, ed.data, cfg.shutter_schema);
    this._showSavebar(ed.mode !== "edit" || ed.changed.size > 0);
  }

  _closeEditor() {
    this._editing = null;
    this._showSavebar(false);
    this._renderShutterList();
  }

  async _delete(id) {
    const s = this._config.shutters.find((x) => x.subentry_id === id);
    if (!s || !confirm(this.t("confirm_delete").replace("{name}", s.title))) return;
    try {
      await this._hass.callWS({ type: `${DOMAIN}/delete_shutter`, entry_id: this._config.entry_id, subentry_id: id });
      this._selected.delete(id);
      this._editing = null;
      this._showSavebar(false);
      await this._loadConfig();
      this._renderShutterList();
    } catch (err) { this._toast(err.message || String(err), true); }
  }

  /* ------------------------------------------------------- settings */
  _sg() { return SETTINGS_GROUPS[this._settingsGroup] ? this._settingsGroup : "shutters"; }

  _renderSettings() {
    const main = this.shadowRoot.getElementById("main");
    if (this._configError) {
      main.innerHTML = `<div class="card empty"><ha-icon icon="mdi:alert"></ha-icon><p>${esc(this.t("not_setup"))}</p></div>`;
      return;
    }
    if (!this._config) { main.innerHTML = ""; return; }
    const cfg = this._config;
    if (!this._draftGlobal) this._draftGlobal = { data: { ...cfg.options }, changed: new Set() };
    const draft = this._draftGlobal;
    const labels = cfg.labels?.options?.step || {};
    const icons = {
      area_living: "mdi:sofa-outline", area_sleep: "mdi:bed-outline", area_children: "mdi:teddy-bear", astro: "mdi:weather-sunset",
      days: "mdi:calendar-star", seasons: "mdi:pine-tree", brightness: "mdi:brightness-6", special: "mdi:clock-star-four-points-outline",
      alarms: "mdi:alarm-light-outline", behaviour: "mdi:hand-back-right-outline", appearance: "mdi:palette-outline", awnings: "mdi:awning-outline", garages: "mdi:garage-variant",
    };
    main.innerHTML = `
      ${cfg.is_admin ? "" : `<div class="notice">${esc(this.t("readonly"))}</div>`}
      <div class="editor-head"><h2>${esc(this.t("settings"))}</h2>
        <div class="segment">${Object.keys(SETTINGS_GROUPS).map((g) => `<button data-sg="${g}" class="${this._sg() === g ? "active" : ""}">${esc(this.t("sg_" + g))}</button>`).join("")}</div></div>
      <div class="sections">${SETTINGS_GROUPS[this._sg()].filter((section) => cfg.global_schema[section]).map((section, i) => [section, cfg.global_schema[section], i]).map(([section, fields, i]) => `
        <details class="card section" ${i < 1 ? "open" : ""}>
          <summary><span class="ico"><ha-icon icon="${icons[section] || "mdi:cog"}"></ha-icon></span>${esc(labels[section]?.title || section)}<ha-icon class="chev" icon="mdi:chevron-down"></ha-icon></summary>
          ${labels[section]?.description ? `<div class="fields"><div class="field wide"><div class="help">${esc(labels[section].description)}</div></div></div>` : ""}
          <div class="fields">${fields.map((f) => this._fieldHtml(f, draft.data[f.key], labels[section])).join("")}</div>
        </details>`).join("")}</div>`;
    main.querySelectorAll("[data-sg]").forEach((b) => b.addEventListener("click", () => { this._settingsGroup = b.dataset.sg; this._renderSettings(); }));
    this._wireFields(main, draft.data, draft.changed, cfg.global_schema);
    this._applyShowIf(main, draft.data, cfg.global_schema);
    if (!cfg.is_admin) main.querySelectorAll("input,select").forEach((i) => { i.disabled = true; });
  }

  /* --------------------------------------------------------- fields */
  _fieldHtml(f, value, labels = {}) {
    const label = labels?.data?.[f.key] || f.key.replace(/_/g, " ");
    const help = labels?.data_description?.[f.key];
    const id = `f_${f.key}`;
    let control = "";
    const v = value ?? "";
    if (f.kind === "bool") {
      return `<div class="field" data-field="${f.key}"><div class="boolrow"><label for="${id}">${esc(label)}</label>
        <label class="switch"><input type="checkbox" id="${id}" data-key="${f.key}" ${value ? "checked" : ""}><span></span></label></div>
        ${help ? `<div class="help">${esc(help)}</div>` : ""}</div>`;
    }
    if ((f.kind === "int" || f.kind === "float") && f.unit === "%" && f.min === 0 && f.max === 100) {
      control = `<div class="pct"><input type="range" min="0" max="100" step="1" value="${esc(v)}" data-key="${f.key}" data-mirror="1">
        <div class="input"><input type="number" id="${id}" min="0" max="100" step="1" value="${esc(v)}" data-key="${f.key}"><span class="unit">%</span></div></div>`;
    } else if (f.kind === "int" || f.kind === "float") {
      control = `<div class="input"><input type="number" id="${id}" data-key="${f.key}" value="${esc(v)}"
        ${f.min !== null ? `min="${f.min}"` : ""} ${f.max !== null ? `max="${f.max}"` : ""} step="${f.step || 1}">
        ${f.unit ? `<span class="unit">${esc(f.unit)}</span>` : ""}</div>`;
    } else if (f.kind === "time") {
      control = `<div class="input"><input type="time" id="${id}" data-key="${f.key}" value="${esc(String(v).slice(0, 5))}"></div>`;
    } else if (f.kind === "select") {
      const tk = this._translationKey(f.key);
      const opts = this._config.labels?.selector?.[tk]?.options || {};
      control = `<div class="input"><select id="${id}" data-key="${f.key}">${f.options.map((o) =>
        `<option value="${esc(o)}" ${String(v) === o ? "selected" : ""}>${esc(opts[o] || o)}</option>`).join("")}</select></div>`;
    } else if (f.kind === "multiselect") {
      const opts = this._config.labels?.selector?.[f.key]?.options || {};
      const chosen = Array.isArray(value) ? value : [];
      control = `<div class="ms">${f.options.map((o) => `<button type="button" class="chip ${chosen.includes(o) ? "on" : ""}" data-ms-key="${f.key}" data-ms-val="${esc(o)}">${esc(opts[o] || o)}</button>`).join("")}</div>`;
    } else if (f.kind === "entities") {
      const list = `dl_${f.key}`;
      const chosen = Array.isArray(value) ? value : [];
      const ids = Object.keys(this._hass.states).filter((e) => !f.domains.length || f.domains.includes(e.split(".")[0])).sort();
      control = `<div class="ents" data-ents-key="${f.key}"><div class="chips">${chosen.map((e) => `<span class="chip">${esc(this._friendly(e))}<button type="button" data-ents-del="${esc(e)}" title="${esc(e)}"><ha-icon icon="mdi:close"></ha-icon></button></span>`).join("")}</div>
        <div class="input"><ha-icon icon="mdi:plus"></ha-icon><input id="${id}" list="${list}" data-ents-add="${f.key}" placeholder="${esc(f.domains[0] || "sensor")}.…" autocomplete="off"></div>
        <datalist id="${list}">${ids.filter((e) => !chosen.includes(e)).map((e) => `<option value="${esc(e)}">${esc(this._friendly(e))}</option>`).join("")}</datalist></div>`;
    } else if (f.kind === "entity") {
      const list = `dl_${f.key}`;
      const ids = Object.keys(this._hass.states).filter((e) => !f.domains.length || f.domains.includes(e.split(".")[0])).sort();
      control = `<div class="input"><ha-icon icon="mdi:shape-outline"></ha-icon><input id="${id}" list="${list}" data-key="${f.key}" value="${esc(v)}"
        placeholder="${esc(f.domains[0] || "sensor")}.…" autocomplete="off"></div>
        <datalist id="${list}">${ids.map((e) => `<option value="${esc(e)}">${esc(this._friendly(e))}</option>`).join("")}</datalist>
        <div class="entity-name" data-name-for="${f.key}">${v ? esc(this._friendly(v)) : ""}</div>`;
    } else {
      control = `<div class="input"><input id="${id}" data-key="${f.key}" value="${esc(v)}" ${f.kind === "daymonth" ? 'placeholder="TT.MM."' : ""}></div>`;
    }
    return `<div class="field" data-field="${f.key}"><label for="${id}">${esc(label)}</label>${control}${help ? `<div class="help">${esc(help)}</div>` : ""}</div>`;
  }

  _wireFields(root, data, changed, schema) {
    const fields = Object.fromEntries(Object.values(schema).flat().map((f) => [f.key, f]));
    root.querySelectorAll("[data-ms-key]").forEach((btn) => btn.addEventListener("click", () => {
      const key = btn.dataset.msKey;
      const list = new Set(Array.isArray(data[key]) ? data[key] : []);
      if (list.has(btn.dataset.msVal)) list.delete(btn.dataset.msVal); else list.add(btn.dataset.msVal);
      data[key] = fields[key].options.filter((o) => list.has(o));
      btn.classList.toggle("on", list.has(btn.dataset.msVal));
      changed.add(key);
      root.querySelector(`[data-field="${key}"]`)?.classList.add("changed");
      this._showSavebar(true);
    }));
    const setEnts = (key, list) => {
      data[key] = list;
      changed.add(key);
      const field = root.querySelector(`[data-field="${key}"]`);
      if (field) {
        field.classList.add("changed");
        const tmp = document.createElement("div");
        tmp.innerHTML = this._fieldHtml(fields[key], list);
        const fresh = tmp.querySelector(".ents");
        field.querySelector(".ents").replaceWith(fresh);
        wireEnts(fresh);
      }
      this._applyShowIf(root, data, schema);
      this._showSavebar(true);
    };
    const wireEnts = (box) => {
      const key = box.dataset.entsKey;
      box.querySelectorAll("[data-ents-del]").forEach((b) => b.addEventListener("click", () =>
        setEnts(key, (data[key] || []).filter((e) => e !== b.dataset.entsDel))));
      const input = box.querySelector("[data-ents-add]");
      const add = () => {
        const v = input.value.trim();
        if (!v || !this._hass.states[v]) return;
        const list = Array.isArray(data[key]) ? data[key] : [];
        if (!list.includes(v)) setEnts(key, [...list, v]); else input.value = "";
      };
      input.addEventListener("change", add);
      input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); add(); } });
    };
    root.querySelectorAll("[data-ents-key]").forEach(wireEnts);
    root.querySelectorAll("[data-key]").forEach((input) => {
      const key = input.dataset.key;
      const f = fields[key];
      const handler = () => {
        let value;
        if (f.kind === "bool") value = input.checked;
        else if (f.kind === "int") value = input.value === "" ? null : parseInt(input.value, 10);
        else if (f.kind === "float") value = input.value === "" ? null : parseFloat(input.value);
        else if (f.kind === "time") value = input.value ? `${input.value}:00` : null;
        else value = input.value === "" ? null : input.value;
        data[key] = value;
        changed.add(key);
        root.querySelectorAll(`[data-key="${key}"]`).forEach((other) => {
          if (other !== input && other.type !== "checkbox") other.value = value ?? "";
        });
        root.querySelector(`[data-field="${key}"]`)?.classList.add("changed");
        const nm = root.querySelector(`[data-name-for="${key}"]`);
        if (nm) nm.textContent = value ? this._friendly(value) : "";
        this._applyShowIf(root, data, schema);
        this._showSavebar(true);
      };
      const isText = input.tagName === "INPUT" && input.type !== "checkbox";
      input.addEventListener(isText ? "input" : "change", handler);
    });
  }

  _applyShowIf(root, data, schema) {
    for (const f of Object.values(schema).flat()) {
      const el = root.querySelector(`[data-field="${f.key}"]`);
      if (!el) continue;
      let show = true;
      if (f.show_if) show = f.show_if.values.includes(data[f.show_if.key]);
      // Hide settings that cannot have any effect in the current configuration.
      const dep = DEPENDS[f.key];
      if (dep) show = show && dep(data);
      // Fields that make no sense for awnings / garage doors.
      const hideFor = TYPE_HIDDEN_FIELDS[data.device_type || "shutter"];
      if (hideFor && hideFor.includes(f.key)) show = false;
      el.hidden = !show;
    }
    const hiddenSections = TYPE_HIDDEN_SECTIONS[data.device_type || "shutter"] || [];
    root.querySelectorAll("[data-section]").forEach((sec) => { sec.hidden = hiddenSections.includes(sec.dataset.section); });
  }

  /* ------------------------------------------------------------ save */
  _discard() {
    if (this._editing) { this._closeEditor(); return; }
    this._draftGlobal = null;
    this._showSavebar(false);
    this._renderSettings();
  }

  async _save() {
    const cfg = this._config;
    try {
      if (this._editing) {
        const ed = this._editing;
        if (ed.mode === "bulk") {
          const changes = Object.fromEntries([...ed.changed].map((k) => [k, ed.data[k]]));
          for (const id of ed.ids) {
            await this._hass.callWS({ type: `${DOMAIN}/save_shutter`, entry_id: cfg.entry_id, subentry_id: id, data: changes });
          }
        } else {
          await this._hass.callWS({
            type: `${DOMAIN}/save_shutter`, entry_id: cfg.entry_id,
            subentry_id: ed.mode === "edit" ? ed.ids[0] : null, data: ed.data,
          });
        }
        this._editing = null;
        this._showSavebar(false);
        this._toast(this.t("saved"));
        await this._loadConfig();
        this._renderShutterList();
      } else if (this._draftGlobal) {
        const d = this._draftGlobal;
        const changes = Object.fromEntries([...d.changed].map((k) => [k, d.data[k]]));
        await this._hass.callWS({ type: `${DOMAIN}/update_options`, entry_id: cfg.entry_id, options: changes });
        this._draftGlobal = null;
        this._showSavebar(false);
        this._toast(this.t("saved"));
        await this._loadConfig();
        this._renderSettings();
      }
    } catch (err) {
      this._toast(err.message || String(err), true);
    }
  }
}

// Shutters, awnings and garage doors have completely separate settings; appearance is the panel itself.
const SETTINGS_GROUPS = {
  shutters: ["area_living", "area_sleep", "area_children", "astro", "days", "brightness", "seasons", "special", "alarms", "behaviour"],
  awnings: ["awnings"],
  garages: ["garages"],
  appearance: ["appearance"],
};
const TYPE_HIDDEN_SECTIONS = { awning: ["window", "stages"], garage: ["window", "sun", "conditions", "stages", "extra"] };
const TYPE_HIDDEN_FIELDS = {
  awning: ["open_tilt", "close_tilt", "elevation", "keep_sun", "heat_protection", "heat_temp", "sun_tilt", "alarm_fire", "alarm_rain", "alarm_wind1", "alarm_wind2", "alarm_frost"],
  garage: ["up_mode", "down_mode", "open_level", "close_level", "open_tilt", "close_tilt", "elevation"],
};
const sunOn = (d) => d.sun_mode && d.sun_mode !== "off";
const sunHas = (t) => (d) => ({
  in_out_temp: ["in", "out"], azimuth: ["az"], all: ["in", "out", "az"], out_temp_azimuth: ["out", "az"], out_temp: ["out"], in_temp: ["in"],
}[d.sun_mode] || []).includes(t);
const hasWindow = (d) => !!d.window_entity;
const DEPENDS = {
  elevation: (d) => d.up_mode === "elevation" || d.down_mode === "elevation",
  tilt_entity: hasWindow,
  window_action: (d) => hasWindow(d) && (d.window_profile || "custom") === "custom",
  window_open_level: hasWindow,
  window_tilt_level: (d) => hasWindow(d),
  lockout: (d) => hasWindow(d) && (d.window_profile || "custom") === "custom",
  vent_on_close: (d) => hasWindow(d) && (d.window_profile || "custom") === "custom",
  drive_after_close: (d) => hasWindow(d) && (d.window_profile || "custom") === "custom",
  window_profile: hasWindow,
  window_open_delay: hasWindow,
  window_close_delay: hasWindow,
  sun_level: sunOn,
  sun_tilt: sunOn,
  azimuth: sunHas("az"),
  azimuth_range: sunHas("az"),
  out_temp_entity: (d) => sunHas("out")(d) || d.heat_protection,
  out_temp_setpoint: sunHas("out"),
  out_temp_hyst: sunHas("out"),
  in_temp_entity: (d) => sunHas("in")(d) || d.heat_protection,
  in_temp_setpoint: sunHas("in"),
  in_temp_hyst: sunHas("in"),
  light_entity: sunOn,
  light_setpoint: (d) => sunOn(d) && !!d.light_entity,
  light_hyst: (d) => sunOn(d) && !!d.light_entity,
  keep_sun: sunOn,
  sun_end_delay: sunOn,
  heat_temp: (d) => !!d.heat_protection,
  sun_start_delay: sunOn,
  sun_month_from: sunOn,
  sun_month_to: sunOn,
  forecast_temp: sunOn,
  weather_conditions: sunOn,
  cond_logic: (d) => d.cond_mode && d.cond_mode !== "off",
  cond1_entity: (d) => d.cond_mode && d.cond_mode !== "off",
  cond1_op: (d) => d.cond_mode !== "off" && !!d.cond1_entity,
  cond1_value: (d) => d.cond_mode !== "off" && !!d.cond1_entity && ["gt", "lt", "eq", "ne"].includes(d.cond1_op),
  cond2_entity: (d) => d.cond_mode && d.cond_mode !== "off",
  cond2_op: (d) => d.cond_mode !== "off" && !!d.cond2_entity,
  cond2_value: (d) => d.cond_mode !== "off" && !!d.cond2_entity && ["gt", "lt", "eq", "ne"].includes(d.cond2_op),
  cond_level: (d) => d.cond_mode === "half_close",
  lamp_brightness: (d) => !!d.lamp_entity,
  garage_switch_entity: (d) => d.device_type === "garage",
  garage_open_entity: (d) => !!d.garage_open_mode && d.garage_open_mode !== "off",
  garage_open_op: (d) => !!d.garage_open_mode && d.garage_open_mode !== "off" && !!d.garage_open_entity,
  garage_open_value: (d) => !!d.garage_open_mode && d.garage_open_mode !== "off" && !!d.garage_open_entity && ["gt", "lt", "eq", "ne"].includes(d.garage_open_op),
  garage_close_entity: (d) => !!d.garage_close_mode && d.garage_close_mode !== "off",
  garage_close_op: (d) => !!d.garage_close_mode && d.garage_close_mode !== "off" && !!d.garage_close_entity,
  garage_close_value: (d) => !!d.garage_close_mode && d.garage_close_mode !== "off" && !!d.garage_close_entity && ["gt", "lt", "eq", "ne"].includes(d.garage_close_op),
  garage_light_minutes: (d) => !!d.garage_light_entity,
  garage_light_off_on_close: (d) => !!d.garage_light_entity,
  garage_light_close_delay: (d) => !!d.garage_light_entity && !!d.garage_light_off_on_close,
  close1_from: (d) => !!d.close1_entity,
  close2_level: (d) => !!d.close2_enabled,
  close2_tilt: (d) => !!d.close2_enabled,
  close2_lux: (d) => !!d.close2_enabled,
  close2_lux_entity: (d) => !!d.close2_enabled && Number(d.close2_lux) > 0,
  close2_lux_minutes: (d) => !!d.close2_enabled && Number(d.close2_lux) > 0,
  close2_entity: (d) => !!d.close2_enabled,
  close2_from: (d) => !!d.close2_enabled,
  emergency_level: (d) => !!d.emergency_entity,
  brightness_open_from: (d) => !!d.brightness_entity,
  brightness_close_from: (d) => !!d.brightness_entity,
  random_only_vacation: (d) => Number(d.random_offset) > 0,
  xmas_level: (d) => !!d.xmas,
  intermediate_level: (d) => !!d.intermediate,
  brightness_close: (d) => !!d.brightness_entity,
  brightness_open: (d) => !!d.brightness_entity,
  brightness_delay: (d) => !!d.brightness_entity,
  ...Object.fromEntries(["fire", "rain", "wind1", "wind2", "frost"].map((a) => [`alarm_${a}_level`, (d) => !!d[`alarm_${a}_entity`]])),
};




/* ================================================================== control view
 * Every cover in Home Assistant – shutters, awnings, garage doors and gates – in one place,
 * also the ones Shutter Captain does not automate.
 */

Object.assign(T.de, {
  control: "Steuern",
  c_all: "Alle", c_groups: "Gruppen", c_shutters: "Rollläden & Jalousien", c_awnings: "Markisen", c_garage: "Garagentore & Tore",
  c_search: "Suchen …", c_none: "Keine passenden Geräte.",
  c_confirm_open: "„{name}“ wirklich öffnen?", c_confirm_close: "„{name}“ wirklich schließen?",
  c_managed: "Automatik",
  t_all: "Alle", other_devices: "ohne Automatik",
  edit_awnings: "Markisen bearbeiten", edit_garages: "Garagentore bearbeiten",
  add_awning: "Markise hinzufügen", add_garage: "Garagentor hinzufügen",
  st_extended: "Ausgefahren", st_retracted: "Eingefahren", st_open: "Offen", st_closed: "Geschlossen",
  sg_appearance: "Darstellung", sg_shutters: "Rollläden", sg_awnings: "Markisen", sg_garages: "Garagentore",
  confirm_close_locked: "Tür/Fenster offen (Aussperrschutz) bei: {names}. Trotzdem herunterfahren?",
  emergency_active: "Notfall aktiv – alle Rollläden in Notfallposition",
});
Object.assign(T.en, {
  control: "Control",
  c_all: "All", c_groups: "Groups", c_shutters: "Shutters & blinds", c_awnings: "Awnings", c_garage: "Garage doors & gates",
  c_search: "Search …", c_none: "No matching devices.",
  c_confirm_open: "Really open “{name}”?", c_confirm_close: "Really close “{name}”?",
  c_managed: "Automatic",
  t_all: "All", other_devices: "without automation",
  edit_awnings: "Edit awnings", edit_garages: "Edit garage doors",
  add_awning: "Add awning", add_garage: "Add garage door",
  st_extended: "Extended", st_retracted: "Retracted", st_open: "Open", st_closed: "Closed",
  sg_appearance: "Appearance", sg_shutters: "Shutters", sg_awnings: "Awnings", sg_garages: "Garage doors",
  confirm_close_locked: "Door/window open (lockout) at: {names}. Close anyway?",
  emergency_active: "Emergency active – all shutters in emergency position",
});

const COVER_GROUPS = [
  ["groups", "mdi:window-shutter-cog"],
  ["shutters", "mdi:window-shutter"],
  ["awnings", "mdi:awning-outline"],
  ["garage", "mdi:garage"],
];

const CONTROL_CSS = `
.ctl-head { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 14px; }
.ctl-head h2 { margin: 0; font-size: 22px; flex: 1; min-width: 160px; }
.ctl-sec { margin: 18px 0 10px; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; --mdc-icon-size: 20px; }
.ctl-sec small { color: var(--sp-muted); font-weight: 400; }
.ctl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.ctl { padding: 14px; display: grid; grid-template-columns: 44px 1fr; gap: 10px 12px; align-items: center; position: relative; overflow: hidden; }
.ctl::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--c, var(--sp-line)); }
.ctl .ico { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; --mdc-icon-size: 26px;
  background: color-mix(in srgb, var(--c, var(--sp-accent)) 14%, transparent); color: var(--c, var(--sp-accent)); }
.ctl .nm { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ctl .st { font-size: 12px; color: var(--sp-muted); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.ctl .tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: 1px 6px; border-radius: 6px;
  background: color-mix(in srgb, var(--sp-accent) 14%, transparent); color: var(--sp-accent); }
.ctl .acts { grid-column: 1 / -1; display: flex; align-items: center; gap: 6px; }
.ctl .acts input[type=range] { flex: 1; min-width: 60px; accent-color: var(--c, var(--sp-accent)); }
.ctl .acts .btn[disabled] { opacity: .4; cursor: default; }
`;

Object.assign(ShutterCaptainPanel.prototype, {
  /** Lockout: ask before a shutter goes down in front of an open door/window. */
  _okToClose(coverId) {
    const members = this._hass.states[coverId]?.attributes?.entity_id;
    const ids = Array.isArray(members) ? members : [coverId];
    const locked = this._shutterStates().filter((s) => ids.includes(s.attributes.cover_entity) && s.attributes.closing_locked);
    if (!locked.length) return true;
    return confirm(this.t("confirm_close_locked").replace("{names}", locked.map((s) => s.attributes.name).join(", ")));
  },

  _coverCategory(id) {
    const ent = this._hass.entities?.[id];
    if (ent?.platform === DOMAIN) return "groups";
    const dc = this._hass.states[id]?.attributes?.device_class;
    if (dc === "awning") return "awnings";
    if (["garage", "gate", "door"].includes(dc)) return "garage";
    return "shutters";
  },

  _renderControl() {
    const main = this.shadowRoot.getElementById("main");
    if (!main || !this._hass) return;
    if (!this.shadowRoot.getElementById("control-css")) {
      const st = document.createElement("style");
      st.id = "control-css";
      st.textContent = CONTROL_CSS;
      this.shadowRoot.appendChild(st);
    }
    this._ctlFilter = this._ctlFilter || "all";
    const q = (this._ctlSearch || "").toLowerCase();
    const managed = new Set(this._shutterStates().map((s) => s.attributes.cover_entity));
    const covers = Object.keys(this._hass.states)
      .filter((id) => id.startsWith("cover."))
      .filter((id) => !q || id.includes(q) || this._friendly(id).toLowerCase().includes(q))
      .sort((a, b) => this._friendly(a).localeCompare(this._friendly(b)));
    const byCat = Object.fromEntries(COVER_GROUPS.map(([k]) => [k, []]));
    covers.forEach((id) => byCat[this._coverCategory(id)].push(id));

    const keepSearch = main.querySelector("#ctlsearch");
    const pos = keepSearch ? keepSearch.selectionStart : null;
    main.innerHTML = `
      <div class="ctl-head"><h2>${esc(this.t("control"))}</h2>
        <div class="segment">${[["all", "c_all"], ...COVER_GROUPS.map(([k]) => [k, `c_${k}`])].map(([k, l]) =>
          `<button data-cf="${k}" class="${this._ctlFilter === k ? "active" : ""}">${esc(this.t(l))}</button>`).join("")}</div>
        <div class="input searchbox"><ha-icon icon="mdi:magnify"></ha-icon><input id="ctlsearch" placeholder="${esc(this.t("c_search"))}" value="${esc(this._ctlSearch || "")}"></div>
      </div>
      ${COVER_GROUPS.filter(([k]) => this._ctlFilter === "all" || this._ctlFilter === k).map(([k, icon]) => byCat[k].length ? `
        <div class="ctl-sec"><ha-icon icon="${icon}"></ha-icon>${esc(this.t(`c_${k}`))}<small>${byCat[k].length}</small></div>
        <div class="ctl-grid">${byCat[k].map((id) => this._controlTile(id, k, managed.has(id))).join("")}</div>` : "").join("")
        || `<div class="card empty"><p>${esc(this.t("c_none"))}</p></div>`}`;

    main.querySelectorAll("[data-cf]").forEach((b) => b.addEventListener("click", () => { this._ctlFilter = b.dataset.cf; this._renderControl(); }));
    const search = main.querySelector("#ctlsearch");
    search.addEventListener("input", () => { this._ctlSearch = search.value; this._renderControl(); });
    if (pos !== null && document.activeElement === this) { search.focus(); search.setSelectionRange(pos, pos); }
    main.querySelectorAll("[data-cact]").forEach((b) => b.addEventListener("click", () => this._controlAction(b.dataset.id, b.dataset.cact)));
    main.querySelectorAll("input[data-cpos]").forEach((r) => {
      r.addEventListener("pointerdown", () => { this._dragging = true; });
      r.addEventListener("change", () => {
        this._dragging = false;
        const now = Number(this._hass.states[r.dataset.cpos]?.attributes?.current_position ?? 100);
        if (Number(r.value) < now && !this._okToClose(r.dataset.cpos)) { r.value = now; return; }
        this._hass.callService("cover", "set_cover_position", { entity_id: r.dataset.cpos, position: Number(r.value) });
      });
    });
  },

  _controlTile(id, cat, managed) {
    const st = this._hass.states[id];
    const a = st.attributes;
    const features = Number(a.supported_features || 0);
    const pos = typeof a.current_position === "number" ? a.current_position : null;
    const avail = st.state !== "unavailable";
    const open = ["open", "opening"].includes(st.state);
    const colors = { groups: "var(--sp-accent)", shutters: open ? "#f2a900" : "#5c6bc0", awnings: open ? "#ff8f00" : "#78909c", garage: open ? "#e53935" : "#43a047" };
    const icons = {
      groups: "mdi:window-shutter-cog",
      shutters: open ? "mdi:window-shutter-open" : "mdi:window-shutter",
      awnings: open ? "mdi:awning" : "mdi:awning-outline",
      garage: a.device_class === "gate" ? (open ? "mdi:gate-open" : "mdi:gate") : (open ? "mdi:garage-open-variant" : "mdi:garage-variant"),
    };
    const label = this._hass.formatEntityState ? this._hass.formatEntityState(st) : st.state;
    const dis = avail ? "" : "disabled";
    return `<div class="card ctl" style="--c:${avail ? colors[cat] : "var(--sp-line)"}">
      <div class="ico"><ha-icon icon="${a.icon || icons[cat]}"></ha-icon></div>
      <div style="min-width:0"><div class="nm">${esc(this._friendly(id))}</div>
        <div class="st">${esc(label)}${pos !== null ? ` · ${pos}%` : ""}${managed ? `<span class="tag">${esc(this.t("c_managed"))}</span>` : ""}</div></div>
      <div class="acts">
        ${features & 1 ? `<button class="btn icon" data-cact="open_cover" data-id="${esc(id)}" ${dis}><ha-icon icon="mdi:arrow-up"></ha-icon></button>` : ""}
        ${features & 8 ? `<button class="btn icon" data-cact="stop_cover" data-id="${esc(id)}" ${dis}><ha-icon icon="mdi:stop"></ha-icon></button>` : ""}
        ${features & 2 ? `<button class="btn icon" data-cact="close_cover" data-id="${esc(id)}" ${dis}><ha-icon icon="mdi:arrow-down"></ha-icon></button>` : ""}
        ${features & 4 && pos !== null ? `<input type="range" min="0" max="100" step="1" value="${pos}" data-cpos="${esc(id)}" ${dis}>` : ""}
      </div></div>`;
  },

  _controlAction(id, service) {
    const cat = this._coverCategory(id);
    if (service === "close_cover") {
      if (!this._okToClose(id)) return;
      // Confirmed for a group: move the members directly (the group itself skips locked ones).
      const members = this._hass.states[id]?.attributes?.entity_id;
      if (Array.isArray(members)) { this._hass.callService("cover", "close_cover", { entity_id: members }); return; }
    }
    // Garage doors and gates: ask first – they can hurt people and lock you out.
    if (cat === "garage" && service !== "stop_cover") {
      const key = service === "open_cover" ? "c_confirm_open" : "c_confirm_close";
      if (!confirm(this.t(key).replace("{name}", this._friendly(id)))) return;
    }
    this._hass.callService("cover", service, { entity_id: id });
  },
});

if (!customElements.get("shutter-captain-panel")) customElements.define("shutter-captain-panel", ShutterCaptainPanel);
