// Run: node scripts/build-translations.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "custom_components", "shutter_captain");

// [de, en, descDe?, descEn?]
const AREA = {
  mode: ["Art der Automatik", "Automatic type", "Nur Zeit, Sonnenauf-/-untergang oder Golden Hour – jeweils begrenzt durch die Zeiten unten.", "Fixed time, sunrise/sunset or golden hour – always limited by the times below."],
  down_week: ["Schließen (Arbeitswoche)", "Close (workweek)", "Spätester Zeitpunkt zum Schließen, wenn morgen ein Arbeitstag ist (gilt auch sonntags).", "Latest close time when tomorrow is a workday (also on Sundays)."],
  up_week_min: ["Früheste Öffnung (Woche)", "Earliest opening (week)"],
  up_week_max: ["Späteste Öffnung (Woche)", "Latest opening (week)"],
  down_weekend: ["Schließen (Wochenende/Feiertag)", "Close (weekend/holiday)", "Gilt, wenn morgen frei ist – also auch freitags.", "Used when tomorrow is free – so also on Fridays."],
  up_weekend_min: ["Früheste Öffnung (Wochenende)", "Earliest opening (weekend)"],
  up_weekend_max: ["Späteste Öffnung (Wochenende)", "Latest opening (weekend)"],
  stagger: ["Versatz zwischen den Rollläden", "Delay between shutters", "Sekunden zwischen zwei Rollläden dieses Bereichs (Funkentlastung).", "Seconds between two shutters of this area (less radio traffic)."],
  school_holiday: ["Schulferien = Wochenendzeiten", "School holidays = weekend times"],
};
const AREA_NAMES = { living: ["Wohnbereich", "Living area"], sleep: ["Schlafbereich", "Sleeping area"], children: ["Kinderbereich", "Children's area"] };

const GLOBAL = {
  astro_offset_up: ["Astro-Versatz Öffnen", "Astro offset opening", "Minuten, die auf Sonnenaufgang/Golden Hour addiert werden.", "Minutes added to sunrise/golden hour."],
  astro_offset_down: ["Astro-Versatz Schließen", "Astro offset closing", "Minuten, die auf Sonnenuntergang/Golden Hour addiert werden.", "Minutes added to sunset/golden hour."],
  sun_end_elevation: ["Sonnenschutz endet unter Sonnenhöhe", "Sun protection ends below elevation", "Gleicht Schatten durch Nachbarhäuser oder Bäume aus.", "Compensates for shade from buildings or trees."],
  stagger: ["Versatz (allgemein)", "Delay (general)", "Sekunden zwischen Rollläden bei Astro-, Helligkeits- und Gruppenbefehlen.", "Seconds between shutters for astro, brightness and group commands."],
  workday_entity: ["Arbeitstag-Sensor (heute)", "Workday sensor (today)", "Z. B. die Workday-Integration – erkennt Feiertage. Leer = nur Sa/So frei.", "E.g. the Workday integration – detects public holidays. Empty = only Sat/Sun free."],
  workday_tomorrow_entity: ["Arbeitstag-Sensor (morgen)", "Workday sensor (tomorrow)", "Workday mit Tagesversatz 1 – damit vor Feiertagen später geschlossen wird.", "Workday with day offset 1 – closes later before holidays."],
  saturday_is_workday: ["Samstag ist Arbeitstag", "Saturday is a workday"],
  vacation_entity: ["Urlaub (Entität)", "Vacation (entity)", "Wenn an: Wochenendzeiten. Zusätzlich gibt es den Schalter „Urlaub“.", "When on: weekend times. There is also a 'Vacation' switch."],
  school_holiday_entity: ["Schulferien (Entität)", "School holidays (entity)", "Kalender oder Schalter; aktiviert Wochenend-Öffnung für Bereiche mit Schulferien-Option.", "Calendar or switch; enables weekend opening for areas with the school-holiday option."],
  summer_start: ["Sommer Beginn (TT.MM.)", "Summer start (DD.MM.)"],
  summer_end: ["Sommer Ende (TT.MM.)", "Summer end (DD.MM.)"],
  xmas_start: ["Weihnachtszeit Beginn (TT.MM.)", "Christmas start (DD.MM.)"],
  xmas_end: ["Weihnachtszeit Ende (TT.MM.)", "Christmas end (DD.MM.)"],
  brightness_entity: ["Helligkeitssensor", "Brightness sensor"],
  brightness_close: ["Schließen unter", "Close below"],
  brightness_open: ["Öffnen über", "Open above"],
  brightness_delay: ["Mindestdauer", "Minimum duration", "So lange muss der Wert anliegen, bevor gefahren wird (gegen Wolken).", "How long the value must hold before moving (against clouds)."],
  late_close_time: ["Spät schließen um", "Late close at", "Für Rollläden mit „Spät schließen“ – ignoriert den Aussperrschutz!", "For shutters with 'Late close' – ignores lockout protection!"],
  intermediate_close_time: ["Zwischenposition komplett schließen um", "Close intermediate position at"],
  min_minutes_since_move: ["Öffnen nur, wenn letzte Fahrt älter als", "Open only if last move older than"],
  wait_time: ["Fahrzeit / Wartezeit", "Travel / wait time", "Mindestens die Fahrzeit des Rollladens. Bewegungen in dieser Zeit gelten nicht als Handbetrieb.", "At least the shutter travel time. Moves during this time are not treated as manual."],
  position_tolerance: ["Positionstoleranz", "Position tolerance"],
  manual_round: ["Bekannte Höhen runden auf", "Round known heights to", "Wird von Hand auf eine konfigurierte Höhe gefahren, bleibt die Automatik aktiv.", "Moving by hand to a configured height keeps the automation active."],
  manual_reset: ["Handbetrieb endet", "Manual mode ends"],
  manual_timeout: ["Handbetrieb-Dauer", "Manual mode duration"],
};
const ALARM_NAMES = { fire: ["Feuer", "Fire"], rain: ["Regen", "Rain"], wind1: ["Wind Stufe 1", "Wind level 1"], wind2: ["Wind Stufe 2", "Wind level 2"], frost: ["Frost", "Frost"] };
for (const [a, [de, en]] of Object.entries(ALARM_NAMES)) {
  GLOBAL[`alarm_${a}_entity`] = [`${de}: Auslöser`, `${en}: trigger`];
  GLOBAL[`alarm_${a}_level`] = [`${de}: Höhe`, `${en}: position`];
}

const SHUTTER = {
  name: ["Name", "Name", "Leer = Name der Rollladen-Entität.", "Empty = name of the cover entity."],
  cover_entity: ["Rollladen", "Cover"],
  up_mode: ["Öffnen nach", "Open by"],
  down_mode: ["Schließen nach", "Close by"],
  area: ["Bereich (Gruppe)", "Area (group)", "In welcher Bereichs-Gruppe der Rollladen steuerbar ist. Automatisch = aus „Öffnen/Schließen nach“.", "Which area group the shutter belongs to. Automatic = taken from 'Open/Close by'."],
  open_level: ["Höhe offen", "Open position", "Home Assistant: 100 % = ganz offen.", "Home Assistant: 100% = fully open."],
  close_level: ["Höhe geschlossen", "Closed position"],
  elevation: ["Sonnenhöhe für Modus „Sonnenhöhe“", "Elevation for 'Sun elevation' mode"],
  window_entity: ["Fenster-/Türkontakt", "Window/door contact"],
  tilt_entity: ["Kipp-Kontakt (optional)", "Tilt contact (optional)", "Separater Sensor für „gekippt“. Sensoren mit Zustand „tilted“ werden auch erkannt.", "Separate sensor for 'tilted'. Sensors with state 'tilted' are detected too."],
  window_action: ["Fahren bei Fensteränderung", "Move on window change"],
  window_open_level: ["Höhe bei offenem Fenster", "Position when window open"],
  window_tilt_level: ["Höhe bei gekipptem Fenster", "Position when window tilted"],
  lockout: ["Aussperrschutz: erlaubt bei offenem Fenster", "Lockout: allowed while window open", "Welche Richtung die Automatik fahren darf, solange Fenster/Tür offen ist.", "Which direction the automation may move while the window/door is open."],
  vent_on_close: ["Lüftungshöhe beim Schließen", "Vent position when closing", "Bei offenem Fenster erst ganz schließen, dann auf die Fensterhöhe fahren.", "With an open window, close fully first, then move to the window position."],
  drive_after_close: ["Nach Schließen des Fensters nachfahren", "Catch up after window closes"],
  window_open_delay: ["Verzögerung bei Öffnen", "Delay on opening"],
  window_close_delay: ["Verzögerung bei Schließen", "Delay on closing"],
  sun_mode: ["Sonnenschutz-Auslöser", "Sun protection trigger", "Alle gewählten Auslöser müssen aktiv sein. Ein Lichtsensor wird zusätzlich UND-verknüpft.", "All selected triggers must be active. A light sensor is ANDed on top."],
  sun_level: ["Höhe Sonnenschutz", "Sun protection position"],
  sun_tilt: ["Lamellenwinkel im Sonnenschutz", "Slat tilt in sun protection", "Für Jalousien mit Lamellen. −1 = nicht verstellen.", "For venetian blinds. −1 = do not change."],
  azimuth: ["Fensterausrichtung", "Window orientation", "0° = Nord, 90° = Ost, 180° = Süd, 270° = West.", "0° = north, 90° = east, 180° = south, 270° = west."],
  azimuth_range: ["± Bereich", "± range"],
  out_temp_entity: ["Außentemperatur", "Outside temperature"],
  out_temp_setpoint: ["Außentemperatur ab", "Outside temperature from"],
  out_temp_hyst: ["Hysterese außen", "Hysteresis outside"],
  in_temp_entity: ["Innentemperatur", "Inside temperature"],
  in_temp_setpoint: ["Innentemperatur ab", "Inside temperature from"],
  in_temp_hyst: ["Hysterese innen", "Hysteresis inside"],
  light_entity: ["Lichtsensor (optional)", "Light sensor (optional)"],
  light_setpoint: ["Licht ab", "Light from"],
  light_hyst: ["Hysterese Licht", "Hysteresis light", "Beispiel: 30.000 lx und 40 % → aktiv bis unter 18.000 lx.", "Example: 30,000 lx and 40% → active until below 18,000 lx."],
  keep_sun: ["Im Sonnenschutz halten bis abends", "Keep sun protection until evening"],
  sun_end_delay: ["Verzögerung Sonnenschutz-Ende", "Sun protection end delay"],
  heat_protection: ["Hitzeschutz (ganz schließen)", "Heat protection (close fully)"],
  heat_temp: ["Hitzeschutz ab", "Heat protection from"],
  late_close: ["Spät schließen", "Late close"],
  summer_no_close: ["Im Sommer nicht schließen", "Do not close in summer"],
  xmas: ["Weihnachtshöhe verwenden", "Use Christmas position"],
  xmas_level: ["Höhe zur Weihnachtszeit", "Christmas position"],
  intermediate: ["Erst Zwischenposition, später ganz", "Intermediate first, fully later"],
  intermediate_level: ["Höhe Zwischenposition", "Intermediate position"],
};
for (const [a, [de, en]] of Object.entries(ALARM_NAMES)) SHUTTER[`alarm_${a}`] = [`Alarm ${de}`, `${en} alarm`];

const SELECTORS = {
  mode: { time: ["Nur Zeit", "Time only"], sun: ["Sonnenauf-/-untergang", "Sunrise/sunset"], golden_hour: ["Golden Hour", "Golden hour"] },
  drive: {
    off: ["Aus", "Off"], living: ["Wohnbereich", "Living area"], sleep: ["Schlafbereich", "Sleeping area"], children: ["Kinderbereich", "Children's area"],
    living_auto: ["Wohnbereich (Automatik-Schalter)", "Living area (auto switch)"], sleep_auto: ["Schlafbereich (Automatik-Schalter)", "Sleeping area (auto switch)"], children_auto: ["Kinderbereich (Automatik-Schalter)", "Children's area (auto switch)"],
    sun: ["Sonnenauf-/-untergang", "Sunrise/sunset"], elevation: ["Sonnenhöhe", "Sun elevation"], golden_hour: ["Golden Hour", "Golden hour"], brightness: ["Helligkeitssensor", "Brightness sensor"], manual: ["Nur manuell", "Manual only"],
  },
  window_action: { off: ["Aus", "Off"], open: ["Öffnen", "Open"], close: ["Schließen", "Close"], open_close: ["Öffnen und Schließen", "Open and close"] },
  lockout: { off: ["Nichts (komplett gesperrt)", "Nothing (fully locked)"], open: ["Nur Öffnen", "Opening only"], close: ["Nur Schließen", "Closing only"], open_close: ["Öffnen und Schließen", "Opening and closing"] },
  sun_mode: {
    off: ["Aus", "Off"], in_out_temp: ["Innen- & Außentemperatur", "Inside & outside temperature"], azimuth: ["Sonnenstand", "Sun position"], all: ["Temperaturen & Sonnenstand", "Temperatures & sun position"],
    out_temp_azimuth: ["Außentemperatur & Sonnenstand", "Outside temperature & sun position"], out_temp: ["Nur Außentemperatur", "Outside temperature only"], in_temp: ["Nur Innentemperatur", "Inside temperature only"],
  },
  manual_round: { 0: ["Nicht runden", "No rounding"], 5: ["5 %", "5%"], 10: ["10 %", "10%"] },
  area: { auto: ["Automatisch", "Automatic"], living: ["Wohnbereich", "Living area"], sleep: ["Schlafbereich", "Sleeping area"], children: ["Kinderbereich", "Children's area"], none: ["Keiner", "None"] },
  manual_reset: { next_event: ["Beim nächsten Zeitereignis", "At next scheduled event"], timeout: ["Nach Ablauf der Dauer", "After the duration"], never: ["Nur manuell (Fortsetzen)", "Only manually (resume)"] },
};

const SECTION_TITLES = {
  area_living: ["Wohnbereich", "Living area"], area_sleep: ["Schlafbereich", "Sleeping area"], area_children: ["Kinderbereich", "Children's area"],
  astro: ["Astro & Versatz", "Astro & delays"], days: ["Arbeitstage, Feiertage, Urlaub", "Workdays, holidays, vacation"], seasons: ["Sommer & Weihnachten", "Summer & Christmas"],
  brightness: ["Helligkeitssensor", "Brightness sensor"], special: ["Sonderzeiten", "Special times"], alarms: ["Alarme", "Alarms"], behaviour: ["Verhalten & Handbetrieb", "Behaviour & manual mode"],
  main: ["Rollladen & Zeiten", "Shutter & schedule"], window: ["Fenster & Tür", "Window & door"], sun: ["Sonnenschutz", "Sun protection"], extra: ["Extras & Alarme", "Extras & alarms"],
};

const STATES = {
  none: ["Unbekannt", "Unknown"], up: ["Offen", "Open"], down: ["Geschlossen", "Closed"], intermediate: ["Zwischenposition", "Intermediate"], sun_protect: ["Sonnenschutz", "Sun protection"],
  heat_protect: ["Hitzeschutz", "Heat protection"], manual: ["Handbetrieb", "Manual"], paused: ["Pausiert", "Paused"], window_open: ["Fenster offen", "Window open"], window_locked: ["Aussperrschutz", "Lockout"],
  fire: ["Feueralarm", "Fire alarm"], rain: ["Regenalarm", "Rain alarm"], wind1: ["Windalarm 1", "Wind alarm 1"], wind2: ["Windalarm 2", "Wind alarm 2"], frost: ["Frostschutz", "Frost protection"],
};

const ENTITIES = {
  sensor: {
    hub_status: { name: ["Status", "Status"], state: { workday: ["Arbeitstag", "Workday"], free_day: ["Freier Tag", "Day off"], vacation: ["Urlaub", "Vacation"], alarm: ["Alarm", "Alarm"] } },
    status: { name: ["Automatik-Status", "Automation status"], state: STATES },
    next_up: { name: ["Nächstes Öffnen", "Next opening"] },
    next_down: { name: ["Nächstes Schließen", "Next closing"] },
  },
  switch: {
    vacation: { name: ["Urlaub", "Vacation"] }, school_holiday: { name: ["Schulferien", "School holidays"] },
    auto_living: { name: ["Automatik Wohnbereich", "Auto living area"] }, auto_sleep: { name: ["Automatik Schlafbereich", "Auto sleeping area"] }, auto_children: { name: ["Automatik Kinderbereich", "Auto children's area"] },
    auto_up: { name: ["Automatisch öffnen", "Open automatically"] }, auto_down: { name: ["Automatisch schließen", "Close automatically"] }, auto_sun: { name: ["Sonnenschutz", "Sun protection"] },
  },
  button: { resume: { name: ["Automatik fortsetzen", "Resume automation"] }, auto_all: { name: ["Alle: Automatik fortsetzen", "All: resume automation"] } },
};
// Group covers are their own devices; the cover takes the device name (good for voice assistants).
const DEVICES = {
  group_living: ["Wohnbereich", "Living area"], group_sleep: ["Schlafbereich", "Sleeping area"],
  group_children: ["Kinderbereich", "Children's area"], group_all: ["Alle Rollläden", "All shutters"],
};
const AREA_LABEL = { all: ["Alle", "All"], ...AREA_NAMES };
const ACTIONS = { open: ["öffnen", "open"], close: ["schließen", "close"], sun_protect: ["Sonnenschutz", "sun protection"] };
for (const [area, [ad, ae]] of Object.entries(AREA_LABEL))
  for (const [act, [d, e]] of Object.entries(ACTIONS)) ENTITIES.button[`${act}_${area}`] = { name: [`${ad}: ${d}`, `${ae}: ${e}`] };
for (const [area, [ad, ae]] of Object.entries(AREA_NAMES)) {
  ENTITIES.sensor[`${area}_next_up`] = { name: [`${ad}: nächstes Öffnen`, `${ae}: next opening`] };
  ENTITIES.sensor[`${area}_next_down`] = { name: [`${ad}: nächstes Schließen`, `${ae}: next closing`] };
}

const AREA_INTRO = ["Zeiten für alle Rollläden, die diesem Bereich zugeordnet sind.", "Times for all shutters assigned to this area."];

function build(i) {
  const pick = (v) => v[i];
  const fieldBlock = (table, keys, prefix = "") => {
    const data = {}, desc = {};
    for (const k of keys) {
      const v = table[k.slice(prefix.length)] ?? table[k];
      data[k] = v[i];
      if (v[2]) desc[k] = v[2 + i];
    }
    return { data, data_description: desc };
  };

  const optionSteps = {
    init: { title: ["Shutter Captain – Einstellungen", "Shutter Captain – settings"][i], menu_options: Object.fromEntries(Object.entries(SECTION_TITLES).filter(([k]) => !["main", "window", "sun", "extra"].includes(k)).map(([k, v]) => [k, v[i]])) },
  };
  for (const area of Object.keys(AREA_NAMES)) {
    const keys = Object.keys(AREA).map((k) => `${area}_${k}`);
    optionSteps[`area_${area}`] = { title: SECTION_TITLES[`area_${area}`][i], description: AREA_INTRO[i], ...fieldBlock(AREA, keys, `${area}_`) };
  }
  const globalSections = {
    astro: ["astro_offset_up", "astro_offset_down", "sun_end_elevation", "stagger"],
    days: ["workday_entity", "workday_tomorrow_entity", "saturday_is_workday", "vacation_entity", "school_holiday_entity"],
    seasons: ["summer_start", "summer_end", "xmas_start", "xmas_end"],
    brightness: ["brightness_entity", "brightness_close", "brightness_open", "brightness_delay"],
    special: ["late_close_time", "intermediate_close_time", "min_minutes_since_move"],
    alarms: Object.keys(GLOBAL).filter((k) => k.startsWith("alarm_")),
    behaviour: ["wait_time", "position_tolerance", "manual_round", "manual_reset", "manual_timeout"],
  };
  for (const [s, keys] of Object.entries(globalSections)) optionSteps[s] = { title: SECTION_TITLES[s][i], ...fieldBlock(GLOBAL, keys) };

  const shutterSections = {
    main: ["name", "cover_entity", "up_mode", "down_mode", "area", "open_level", "close_level", "elevation"],
    window: ["window_entity", "tilt_entity", "window_action", "window_open_level", "window_tilt_level", "lockout", "vent_on_close", "drive_after_close", "window_open_delay", "window_close_delay"],
    sun: ["sun_mode", "sun_level", "sun_tilt", "azimuth", "azimuth_range", "out_temp_entity", "out_temp_setpoint", "out_temp_hyst", "in_temp_entity", "in_temp_setpoint", "in_temp_hyst", "light_entity", "light_setpoint", "light_hyst", "keep_sun", "sun_end_delay", "heat_protection", "heat_temp"],
    extra: ["late_close", "summer_no_close", "xmas", "xmas_level", "intermediate", "intermediate_level", "alarm_fire", "alarm_rain", "alarm_wind1", "alarm_wind2", "alarm_frost"],
  };
  const subSteps = {};
  for (const [s, keys] of Object.entries(shutterSections)) subSteps[s] = { title: SECTION_TITLES[s][i], ...fieldBlock(SHUTTER, keys) };

  const sel = (table) => ({ options: Object.fromEntries(Object.entries(table).map(([k, v]) => [k, v[i]])) });
  const entity = {};
  for (const [platform, items] of Object.entries(ENTITIES)) {
    entity[platform] = {};
    for (const [k, v] of Object.entries(items)) {
      entity[platform][k] = { name: v.name[i] };
      if (v.state) entity[platform][k].state = Object.fromEntries(Object.entries(v.state).map(([s, l]) => [s, l[i]]));
    }
  }
  const dmErr = ["Bitte im Format TT.MM. eingeben, z. B. 01.05.", "Please use DD.MM., e.g. 01.05."][i];

  return {
    title: "Shutter Captain",
    config: {
      step: { user: { title: "Shutter Captain", description: ["Richtet die zentrale Rollladen-Automatik ein. Rollläden fügst du danach mit „Rollladen hinzufügen“ hinzu, Zeiten und Alarme stellst du unter „Konfigurieren“ ein – oder bequem im Seitenleisten-Panel „Shutter Captain“.", "Sets up the central shutter automation. Afterwards add shutters with 'Add shutter' and adjust times and alarms under 'Configure' – or in the 'Shutter Captain' sidebar panel."][i] } },
      abort: { single_instance_allowed: ["Shutter Captain ist bereits eingerichtet.", "Shutter Captain is already set up."][i] },
    },
    options: { step: optionSteps, error: { invalid_day_month: dmErr } },
    config_subentries: {
      shutter: {
        initiate_flow: { user: ["Rollladen hinzufügen", "Add shutter"][i] },
        entry_type: ["Rollladen", "Shutter"][i],
        step: subSteps,
        error: { already_configured: ["Dieser Rollladen ist bereits eingerichtet.", "This cover is already configured."][i], invalid_day_month: dmErr },
        abort: { reconfigure_successful: ["Rollladen gespeichert.", "Shutter saved."][i] },
      },
    },
    selector: {
      mode: sel(SELECTORS.mode), up_mode: sel(SELECTORS.drive), down_mode: sel(SELECTORS.drive), window_action: sel(SELECTORS.window_action),
      lockout: sel(SELECTORS.lockout), sun_mode: sel(SELECTORS.sun_mode), manual_round: sel(SELECTORS.manual_round), manual_reset: sel(SELECTORS.manual_reset),
      area: sel(SELECTORS.area),
    },
    device: Object.fromEntries(Object.entries(DEVICES).map(([k, v]) => [k, { name: v[i] }])),
    entity,
    exceptions: { no_shutter_for_entity: { message: ["Für diese Entität ist kein Shutter-Captain-Rollladen eingerichtet.", "No Shutter Captain shutter is configured for this entity."][i] } },
    services: {
      command: {
        name: ["Gruppenbefehl", "Group command"][i],
        description: ["Öffnet, schließt, fährt in den Sonnenschutz oder setzt die Automatik für einen Bereich fort.", "Opens, closes, sets sun protection or resumes automation for an area."][i],
        fields: { action: { name: ["Aktion", "Action"][i], description: ["open, close, sun_protect oder auto", "open, close, sun_protect or auto"][i] }, area: { name: ["Bereich", "Area"][i], description: ["all, living, sleep oder children", "all, living, sleep or children"][i] } },
      },
      pause: {
        name: ["Automatik pausieren", "Pause automation"][i],
        description: ["Hält die Rollläden an ihrer Position, z. B. während einer Party.", "Holds the shutters in place, e.g. during a party."][i],
        fields: { entity_id: { name: ["Rollläden", "Covers"][i], description: ["Cover-Entitäten", "Cover entities"][i] }, minutes: { name: ["Minuten", "Minutes"][i], description: ["Leer = bis Fortsetzen", "Empty = until resumed"][i] } },
      },
      resume: {
        name: ["Automatik fortsetzen", "Resume automation"][i],
        description: ["Beendet Handbetrieb/Pause und fährt sofort auf die Automatik-Position.", "Ends manual mode/pause and moves to the automation position."][i],
        fields: { entity_id: { name: ["Rollläden", "Covers"][i], description: ["Cover-Entitäten", "Cover entities"][i] } },
      },
    },
  };
}

mkdirSync(join(root, "translations"), { recursive: true });
const de = build(0), en = build(1);
writeFileSync(join(root, "translations", "de.json"), JSON.stringify(de, null, 2) + "\n");
writeFileSync(join(root, "translations", "en.json"), JSON.stringify(en, null, 2) + "\n");
console.log("translations written");
