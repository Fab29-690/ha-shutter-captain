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
  fire: { color: "#d32f2f", icon: "mdi:fire-alert" },
  rain: { color: "#1e88e5", icon: "mdi:weather-pouring" },
  wind1: { color: "#26a69a", icon: "mdi:weather-windy" },
  wind2: { color: "#00796b", icon: "mdi:weather-windy-variant" },
  frost: { color: "#29b6f6", icon: "mdi:snowflake-alert" },
  none: { color: "#9e9e9e", icon: "mdi:window-shutter-auto" },
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const CSS = `
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
.win.night { background: linear-gradient(180deg, #1b2440 0%, #33416b 100%); }
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
.toggles { grid-column: 1 / -1; display: flex; gap: 6px; flex-wrap: wrap; }
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
    const sig = Object.values(hass.states)
      .filter((st) => st.attributes.shutter_captain)
      .map((st) => st.last_updated)
      .join("|");
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
          <button class="tab" data-view="shutters"><ha-icon icon="mdi:pencil-outline"></ha-icon><span class="lbl">${esc(this.t("shutters"))}</span></button>
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
    else if (view === "shutters") this._renderShutterList();
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
    if (this._view === "shutters" && !this._editing) this._renderShutterList();
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

  _stateLabel(state) {
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
        <div class="actions" id="actions"></div><section class="grid" id="grid"></section>`;
      this._cards.clear();
      this._renderActions();
    }
    this._renderHero(hub);
    this._renderGrid();
  }

  _renderHero(hub) {
    const a = hub.attributes;
    const alarm = this.shadowRoot.getElementById("alarm");
    alarm.innerHTML = a.alarms?.length
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

    const hero = this.shadowRoot.getElementById("hero");
    hero.innerHTML = `
      <div class="card"><div class="eyebrow">${esc(this.t("today"))}</div>
        <div class="big">${esc(this.t(a.free_day ? "free_day" : "workday"))}</div>
        <div class="entity-name">${esc(this.t(a.free_tomorrow ? "tomorrow_free" : "tomorrow_work"))}</div>
        <div class="chips">${flagChip("vacation", "mdi:beach")}${flagChip("school_holiday", "mdi:school-outline")}
          ${a.summer ? `<span class="chip"><ha-icon icon="mdi:white-balance-sunny"></ha-icon>${esc(this.t("summer"))}</span>` : ""}
          ${a.xmas ? `<span class="chip"><ha-icon icon="mdi:pine-tree"></ha-icon>${esc(this.t("xmas"))}</span>` : ""}</div></div>
      <div class="card"><div class="eyebrow">${esc(this.t("sun"))}</div>
        <div class="sunbox">${this._compass(Number(a.sun_azimuth), elev, null, null, 72)}
          <div><div class="big">${elev > 0 ? "☀" : "☾"} ${Math.round(elev)}°</div>
          <div class="entity-name">${esc(this.t("azimuth"))} ${Math.round(a.sun_azimuth)}° · ${esc(this.t("elevation"))} ${Math.round(elev)}°</div></div></div></div>
      <div class="card"><div class="eyebrow">${esc(this.t("auto"))}</div><div class="areas">${areaRows}</div></div>`;
    hero.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.toggle) this._hass.callService("switch", "toggle", { entity_id: b.dataset.toggle });
    }));
    hero.querySelectorAll("[data-toggle-input]").forEach((i) => i.addEventListener("change", () => {
      if (i.dataset.toggleInput) this._hass.callService("switch", i.checked ? "turn_on" : "turn_off", { entity_id: i.dataset.toggleInput });
    }));
  }

  _renderActions() {
    const el = this.shadowRoot.getElementById("actions");
    el.innerHTML = `
      <div class="segment">${["all", ...AREAS].map((ar) => `<button data-area="${ar}" class="${this._area === ar ? "active" : ""}">${esc(this.t(ar))}</button>`).join("")}</div>
      <span class="spacer"></span>
      <button class="btn" data-cmd="open"><ha-icon icon="mdi:arrow-up-bold"></ha-icon>${esc(this.t("open"))}</button>
      <button class="btn" data-cmd="sun_protect"><ha-icon icon="mdi:weather-sunny"></ha-icon>${esc(this.t("sun_protect"))}</button>
      <button class="btn" data-cmd="close"><ha-icon icon="mdi:arrow-down-bold"></ha-icon>${esc(this.t("close"))}</button>
      <button class="btn primary" data-cmd="auto"><ha-icon icon="mdi:autorenew"></ha-icon>${esc(this.t("auto"))}</button>`;
    el.querySelectorAll("[data-area]").forEach((b) => b.addEventListener("click", () => {
      this._area = b.dataset.area;
      el.querySelectorAll("[data-area]").forEach((x) => x.classList.toggle("active", x === b));
      this._renderGrid();
    }));
    el.querySelectorAll("[data-cmd]").forEach((b) => b.addEventListener("click", () =>
      this._hass.callService(DOMAIN, "command", { action: b.dataset.cmd, area: this._area })));
  }

  _renderGrid() {
    const grid = this.shadowRoot.getElementById("grid");
    if (!grid) return;
    const shutters = this._shutterStates().filter((s) => this._area === "all" || s.attributes.area === this._area
      || [s.attributes.up_mode, s.attributes.down_mode].some((m) => String(m).replace("_auto", "") === this._area));
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

  _createCard(s) {
    const card = document.createElement("div");
    card.className = "card shutter";
    card.innerHTML = `
      <div class="win"><div class="glass"></div><div class="mullion"></div><div class="sunray"></div><div class="slats"></div><div class="badge"></div></div>
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
        <button class="chip" data-auto="auto_up"><ha-icon icon="mdi:arrow-up-bold-box-outline"></ha-icon>${esc(this.t("auto_up"))}</button>
        <button class="chip" data-auto="auto_down"><ha-icon icon="mdi:arrow-down-bold-box-outline"></ha-icon>${esc(this.t("auto_down"))}</button>
        <button class="chip" data-auto="auto_sun"><ha-icon icon="mdi:weather-sunny"></ha-icon>${esc(this.t("auto_sun"))}</button>
        <span class="chip win-chip" hidden></span>
      </div>`;
    const range = card.querySelector("input[type=range]");
    range.addEventListener("pointerdown", () => { this._dragging = true; });
    range.addEventListener("change", () => {
      this._dragging = false;
      this._hass.callService("cover", "set_cover_position", { entity_id: card._cover, position: Number(range.value) });
    });
    card.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-act],[data-auto]");
      const menu = card.querySelector(".menu");
      if (!btn) { menu.classList.remove("open"); return; }
      const act = btn.dataset.act;
      const cover = card._cover;
      if (btn.dataset.auto) {
        const id = this._entityOnDevice(card._status, btn.dataset.auto);
        if (id) this._hass.callService("switch", "toggle", { entity_id: id });
        return;
      }
      if (act === "menu") { menu.classList.toggle("open"); ev.stopPropagation(); return; }
      menu.classList.remove("open");
      if (act === "open") this._hass.callService("cover", "open_cover", { entity_id: cover });
      if (act === "close") this._hass.callService("cover", "close_cover", { entity_id: cover });
      if (act === "stop") this._hass.callService("cover", "stop_cover", { entity_id: cover });
      if (act === "resume") this._hass.callService(DOMAIN, "resume", { entity_id: cover });
      if (act?.startsWith("pause")) {
        const minutes = Number(act.slice(5));
        this._hass.callService(DOMAIN, "pause", minutes ? { entity_id: cover, minutes } : { entity_id: cover });
      }
      if (act === "sun") this._hass.callService("cover", "set_cover_position", { entity_id: cover, position: card._sunLevel });
      if (act === "edit") { this._setView("shutters"); this._openEditor("edit", [card._subentry]); }
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
    let label = this._stateLabel(state);
    if (a.manual_until) label += ` · ${this.t("until")} ${new Date(a.manual_until).toLocaleTimeString(this.locale, { hour: "2-digit", minute: "2-digit" })}`;
    card.querySelector(".status span").textContent = label;
    card.querySelector(".reason").textContent = REASONS[this.lang][a.reason] || "";
    card.querySelector(".to").innerHTML = this._fmtTime(a.next_open);
    card.querySelector(".tc").innerHTML = this._fmtTime(a.next_close);

    const pos = typeof a.position === "number" ? a.position : null;
    const win = card.querySelector(".win");
    const hub = this._hub();
    const elev = Number(hub?.attributes.sun_elevation ?? 0);
    win.classList.toggle("night", elev < -4);
    win.classList.toggle("sunny", state === "sun_protect" || state === "heat_protect" || !!a.sun_checks?.azimuth);
    card.querySelector(".slats").style.height = pos === null ? "0" : `calc(${100 - pos}% - ${(100 - pos) * 0.08}px)`;
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
    const rows = cfg.shutters.filter((s) => !q || s.title.toLowerCase().includes(q) || String(s.data.cover_entity).includes(q));
    const admin = cfg.is_admin;
    main.innerHTML = `
      ${admin ? "" : `<div class="notice">${esc(this.t("readonly"))}</div>`}
      <div class="editor-head"><h2>${esc(this.t("shutters"))}</h2>
        <div class="input searchbox"><ha-icon icon="mdi:magnify"></ha-icon><input id="search" placeholder="${esc(this.t("search"))}" value="${esc(this._search)}"></div>
        ${admin && this._selected.size > 1 ? `<button class="btn" id="bulk"><ha-icon icon="mdi:checkbox-multiple-marked-outline"></ha-icon>${esc(this.t("bulk_edit"))} (${this._selected.size})</button>` : ""}
        ${admin ? `<button class="btn primary" id="add"><ha-icon icon="mdi:plus"></ha-icon>${esc(this.t("add"))}</button>` : ""}</div>
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
    if (mode === "new") data = { ...cfg.shutter_defaults };
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
    const icons = { main: "mdi:window-shutter", window: "mdi:window-open-variant", sun: "mdi:weather-sunny", extra: "mdi:tune-variant" };
    const labels = cfg.labels?.config_subentries?.shutter?.step || {};
    const hidden = ed.mode === "bulk" ? new Set(["name", "cover_entity"]) : new Set();
    main.innerHTML = `
      <div class="editor-head"><button class="btn icon" id="back"><ha-icon icon="mdi:arrow-left"></ha-icon></button><h2>${esc(title)}</h2>
        ${ed.mode === "edit" ? `<button class="btn danger" id="del"><ha-icon icon="mdi:delete-outline"></ha-icon>${esc(this.t("delete"))}</button>` : ""}</div>
      ${ed.mode === "bulk" ? `<div class="notice">${esc(this.t("bulk_hint").replace("{n}", ed.ids.length))}</div>` : ""}
      <div class="sections">${Object.entries(cfg.shutter_schema).map(([section, fields], i) => `
        <details class="card section" ${i < 2 || ed.mode !== "edit" ? "open" : ""}>
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
      alarms: "mdi:alarm-light-outline", behaviour: "mdi:hand-back-right-outline",
    };
    main.innerHTML = `
      ${cfg.is_admin ? "" : `<div class="notice">${esc(this.t("readonly"))}</div>`}
      <div class="editor-head"><h2>${esc(this.t("settings"))}</h2></div>
      <div class="sections">${Object.entries(cfg.global_schema).map(([section, fields], i) => `
        <details class="card section" ${i < 1 ? "open" : ""}>
          <summary><span class="ico"><ha-icon icon="${icons[section] || "mdi:cog"}"></ha-icon></span>${esc(labels[section]?.title || section)}<ha-icon class="chev" icon="mdi:chevron-down"></ha-icon></summary>
          ${labels[section]?.description ? `<div class="fields"><div class="field wide"><div class="help">${esc(labels[section].description)}</div></div></div>` : ""}
          <div class="fields">${fields.map((f) => this._fieldHtml(f, draft.data[f.key], labels[section])).join("")}</div>
        </details>`).join("")}</div>`;
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
    } else if (f.kind === "entity") {
      const list = `dl_${f.key}`;
      const ids = Object.keys(this._hass.states).filter((e) => f.domains.includes(e.split(".")[0])).sort();
      control = `<div class="input"><ha-icon icon="mdi:shape-outline"></ha-icon><input id="${id}" list="${list}" data-key="${f.key}" value="${esc(v)}"
        placeholder="${esc(f.domains[0])}.…" autocomplete="off"></div>
        <datalist id="${list}">${ids.map((e) => `<option value="${esc(e)}">${esc(this._friendly(e))}</option>`).join("")}</datalist>
        <div class="entity-name" data-name-for="${f.key}">${v ? esc(this._friendly(v)) : ""}</div>`;
    } else {
      control = `<div class="input"><input id="${id}" data-key="${f.key}" value="${esc(v)}" ${f.kind === "daymonth" ? 'placeholder="TT.MM."' : ""}></div>`;
    }
    return `<div class="field" data-field="${f.key}"><label for="${id}">${esc(label)}</label>${control}${help ? `<div class="help">${esc(help)}</div>` : ""}</div>`;
  }

  _wireFields(root, data, changed, schema) {
    const fields = Object.fromEntries(Object.values(schema).flat().map((f) => [f.key, f]));
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
      el.hidden = !show;
    }
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

const sunOn = (d) => d.sun_mode && d.sun_mode !== "off";
const sunHas = (t) => (d) => ({
  in_out_temp: ["in", "out"], azimuth: ["az"], all: ["in", "out", "az"], out_temp_azimuth: ["out", "az"], out_temp: ["out"], in_temp: ["in"],
}[d.sun_mode] || []).includes(t);
const hasWindow = (d) => !!d.window_entity;
const DEPENDS = {
  elevation: (d) => d.up_mode === "elevation" || d.down_mode === "elevation",
  tilt_entity: hasWindow,
  window_action: hasWindow,
  window_open_level: hasWindow,
  window_tilt_level: (d) => hasWindow(d),
  lockout: hasWindow,
  vent_on_close: hasWindow,
  drive_after_close: hasWindow,
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
  xmas_level: (d) => !!d.xmas,
  intermediate_level: (d) => !!d.intermediate,
  brightness_close: (d) => !!d.brightness_entity,
  brightness_open: (d) => !!d.brightness_entity,
  brightness_delay: (d) => !!d.brightness_entity,
  ...Object.fromEntries(["fire", "rain", "wind1", "wind2", "frost"].map((a) => [`alarm_${a}_level`, (d) => !!d[`alarm_${a}_entity`]])),
};

if (!customElements.get("shutter-captain-panel")) customElements.define("shutter-captain-panel", ShutterCaptainPanel);
