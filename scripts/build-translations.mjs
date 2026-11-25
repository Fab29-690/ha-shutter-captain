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
  brightness_close: ["Schließen unter (abends)", "Close below (evening)"],
  brightness_open: ["Öffnen über (morgens)", "Open above (morning)"],
  brightness_delay: ["Mindestdauer", "Minimum duration", "So lange muss der Wert anliegen, bevor gefahren wird (gegen Wolken).", "How long the value must hold before moving (against clouds)."],
  late_close_time: ["Spät schließen um", "Late close at", "Für Rollläden mit „Spät schließen“ – ignoriert den Aussperrschutz!", "For shutters with 'Late close' – ignores lockout protection!"],
  intermediate_close_time: ["Zwischenposition komplett schließen um", "Close intermediate position at"],
  min_minutes_since_move: ["Öffnen nur, wenn letzte Fahrt älter als", "Open only if last move older than"],
  wait_time: ["Fahrzeit / Wartezeit", "Travel / wait time", "Mindestens die Fahrzeit des Rollladens. Bewegungen in dieser Zeit gelten nicht als Handbetrieb.", "At least the shutter travel time. Moves during this time are not treated as manual."],
  position_tolerance: ["Positionstoleranz", "Position tolerance"],
  manual_round: ["Bekannte Höhen runden auf", "Round known heights to", "Wird von Hand auf eine konfigurierte Höhe gefahren, bleibt die Automatik aktiv.", "Moving by hand to a configured height keeps the automation active."],
  manual_reset: ["Handbetrieb endet", "Manual mode ends"],
  manual_timeout: ["Handbetrieb-Dauer", "Manual mode duration"],
  awning_wind_entity: ["Windsensor (Markisen)", "Wind sensor (awnings)", "Schalter/Binärsensor (an = Wind) oder Windgeschwindigkeit in km/h.", "Switch/binary sensor (on = wind) or wind speed in km/h."],
  awning_wind_speed: ["Einfahren ab Windgeschwindigkeit", "Retract from wind speed"],
  awning_rain_entity: ["Regensensor (Markisen)", "Rain sensor (awnings)", "An/Regen oder Regenmenge > 0 → Markisen fahren ein.", "On/rain or rain amount > 0 → awnings retract."],
  awning_temp_entity: ["Außentemperatur (Markisen)", "Outside temperature (awnings)"],
  awning_frost_temp: ["Einfahren bei Frost unter", "Retract on frost below", "−50 = aus.", "−50 = off."],
  awning_min_temp: ["Ausfahren erst ab", "Extend only from", "Zusätzlich zum Sonnenschutz: nur ausfahren, wenn es mindestens so warm ist. 0 = egal.", "On top of sun protection: only extend when at least this warm. 0 = ignore."],
  awning_retract_time: ["Abends einfahren um", "Retract in the evening at", "Danach bleiben Markisen bis Mitternacht eingefahren. 00:00 = aus (eingefahren wird dann mit dem Sonnenstand).", "Awnings then stay in until midnight. 00:00 = off (they then retract with the sun)."],
  garage_emergency_entities: ["Notfall-Öffner", "Emergency opener", "Z. B. Rauchmelder (auch mehrere). HÖCHSTE PRIORITÄT – überschreibt alles: Sobald einer auslöst, fährt das Garagentor auf jeden Fall ganz auf (Fluchtweg) – egal was sonst eingestellt ist, auch bei Handbetrieb, ausgeschaltetem Hauptschalter, Bedingungen oder Zeiten. Solange er aktiv ist, schließt das Tor nicht automatisch.", "E.g. smoke detectors (several possible). HIGHEST PRIORITY – overrides everything: as soon as one triggers, the garage door always opens fully (escape route) – no matter what else is set, even in manual mode, with the main switch off, conditions or times. While active the door never closes automatically."],
  garage_emergency_alarms: ["Notfall-Öffner auch bei Feueralarm und Notfall-Eingang", "Emergency opener also on fire alarm and emergency input", "Öffnet die Garagentore zusätzlich, wenn der Feueralarm oder der Notfall-Eingang (Alarme) auslöst – mit derselben höchsten Priorität.", "Also opens the garage doors when the fire alarm or the emergency input (Alarms) triggers – with the same highest priority."],
  garage_open_level: ["Öffnungshöhe", "Opening height", "So weit öffnet die Automatik das Tor (100 % = ganz auf). Nur bei Toren mit Positionsangabe; sonst fährt das Tor ganz auf.", "How far the automation opens the door (100% = fully). Only for doors that report a position; otherwise it opens fully."],
  garage_close_level: ["Schließhöhe", "Closing height", "Bis zu dieser Höhe schließt die Automatik das Tor (0 % = ganz zu). Nur bei Toren mit Positionsangabe; sonst schließt das Tor ganz.", "The automation closes the door down to this height (0% = fully closed). Only for doors that report a position; otherwise it closes fully."],
  garage_vent_level: ["Lüftungshöhe", "Vent height", "Der Lüften-Knopf fährt das Tor auf diese Höhe. Das „Automatisch schließen nach“ wartet dann; abends, bei „alle weg“ und per Bedingung wird trotzdem geschlossen. Braucht ein Tor mit Positionsangabe.", "The vent button moves the door to this height. \"Close automatically after\" then waits; closing in the evening, when everyone left or by condition still happens. Needs a door that reports a position."],
  garage_arrival_entities: ["Öffnen wenn jemand heimkommt", "Open when someone comes home", "Eine oder mehrere Personen: wechselt eine davon auf „zu Hause“, öffnet das Garagentor (sofern „Öffnen nur erlaubt, wenn“ erfüllt ist).", "One or more persons: when one of them changes to home, the garage door opens (if \"opening only allowed while\" is met)."],
  garage_open_mode: ["Öffnen per Bedingung", "Open by condition", "„Öffnen, wenn erfüllt“: Das Tor öffnet, sobald die Bedingung erfüllt wird. „Öffnen nur erlaubt, wenn“: automatisches Öffnen (z. B. bei Heimkehr) nur, solange sie erfüllt ist.", "\"Open when met\": the door opens as soon as the condition becomes true. \"Opening only allowed while\": automatic opening (e.g. on arrival) only while it is true."],
  garage_open_entity: ["Öffnen: Entität", "Open: entity"],
  garage_open_op: ["Öffnen: ist", "Open: is"],
  garage_open_value: ["Öffnen: Wert", "Open: value", "Für größer/kleiner/gleich, z. B. 24 oder home.", "For greater/less/equal, e.g. 24 or home."],
  garage_close_mode: ["Schließen per Bedingung", "Close by condition", "„Schließen, wenn erfüllt“: Das Tor schließt, sobald die Bedingung erfüllt wird. „Schließen nur erlaubt, wenn“: automatisches Schließen (Zeit, Dauer, alle weg) nur, solange sie erfüllt ist.", "\"Close when met\": the door closes as soon as the condition becomes true. \"Closing only allowed while\": automatic closing (time, duration, everyone left) only while it is true."],
  garage_close_entity: ["Schließen: Entität", "Close: entity"],
  garage_close_op: ["Schließen: ist", "Close: is"],
  garage_close_value: ["Schließen: Wert", "Close: value", "Für größer/kleiner/gleich, z. B. 24 oder home.", "For greater/less/equal, e.g. 24 or home."],
  garage_light_entity: ["Licht beim Öffnen", "Light when opening", "Wird eingeschaltet, sobald das Tor öffnet – auch per Hand oder Fernbedienung.", "Turned on as soon as the door opens – also by hand or remote."],
  garage_light_minutes: ["Licht an für (nach dem Öffnen)", "Light on for (after opening)", "So lange bleibt das Licht nach dem Öffnen an, dann geht es aus. 0 = bleibt an (bis zum Schließen, falls unten eingestellt).", "How long the light stays on after opening before it turns off. 0 = stays on (until closing, if set below)."],
  garage_light_off_on_close: ["Licht aus beim Schließen", "Light off when closing", "Schaltet das Licht aus, wenn das Tor zu ist – nach der Nachlaufzeit.", "Turns the light off once the door is closed – after the delay."],
  garage_light_close_delay: ["Nachlaufzeit nach dem Schließen", "Delay after closing", "So lange bleibt das Licht nach dem Schließen noch an. 0 = sofort aus.", "How long the light stays on after closing. 0 = off immediately."],
  awning_sun_end_elevation: ["Ausfahren endet unter Sonnenhöhe", "Extending ends below elevation", "Unter dieser Sonnenhöhe fahren Markisen ein (Schatten durch Nachbarhäuser oder Bäume).", "Below this sun elevation awnings retract (shade from buildings or trees)."],
  awning_emergency_entities: ["Notfall: einfahren", "Emergency: retract", "Z. B. Rauchmelder (auch mehrere). Höchste Priorität für Markisen: sie fahren sofort ein – auch bei Handbetrieb oder ausgeschaltetem Hauptschalter.", "E.g. smoke detectors (several possible). Highest priority for awnings: they retract at once – even in manual mode or with the main switch off."],
  awning_emergency_alarms: ["Auch bei Feueralarm und Notfall-Eingang der Rollläden einfahren", "Also retract on the shutters fire alarm and emergency input"],
  awning_wait_time: ["Fahrzeit / Wartezeit", "Travel / wait time", "Mindestens die Fahrzeit der Markise. Bewegungen in dieser Zeit gelten nicht als Handbetrieb.", "At least the awning travel time. Moves during this time are not treated as manual."],
  awning_position_tolerance: ["Positionstoleranz", "Position tolerance"],
  awning_manual_round: ["Bekannte Höhen runden auf", "Round known heights to", "Wird von Hand auf eine konfigurierte Höhe gefahren, bleibt die Automatik aktiv.", "Moving by hand to a configured height keeps the automation active."],
  awning_manual_reset: ["Handbetrieb endet", "Manual mode ends"],
  awning_manual_timeout: ["Handbetrieb-Dauer", "Manual mode duration"],
  garage_position_tolerance: ["Positionstoleranz", "Position tolerance", "So viel % Abweichung gilt noch als „erreicht“ (Öffnungs-, Schließ- und Lüftungshöhe).", "Deviation in % that still counts as reached (opening, closing and vent height)."],
  garage_auto_close_minutes: ["Automatisch schließen nach", "Close automatically after", "Wenn das Tor so lange offen steht. 0 = aus.", "When the door has been open this long. 0 = off."],
  garage_close_time: ["Abends schließen um", "Close in the evening at", "Schließt offene Garagentore zu dieser Uhrzeit. 00:00 = aus.", "Closes open garage doors at this time. 00:00 = off."],
  garage_presence_entity: ["Schließen wenn alle weg", "Close when everyone left", "Person, Gruppe oder Zone: wechselt sie auf abwesend/aus, schließen die Garagentore.", "Person, group or zone: when it changes to away/off, garage doors close."],
  emergency_entity: ["Notfall-Eingang", "Emergency input", "Z. B. Rauchmelder. Höchste Priorität: überschreibt Alarme, Handbetrieb und Hauptschalter für alle Rollläden. Markisen fahren ein.", "E.g. smoke detector. Highest priority: overrides alarms, manual mode and the main switch for all shutters. Awnings retract."],
  emergency_level: ["Notfall-Position", "Emergency position", "100 % = ganz offen (Fluchtweg).", "100% = fully open (escape route)."],
  brightness_open_from: ["Helligkeit öffnet ab", "Brightness opens from"],
  brightness_close_from: ["Helligkeit schließt ab", "Brightness closes from", "Davor wird nur geöffnet, danach nur geschlossen.", "Before this time only opening, after it only closing."],
  command_gap: ["Mindestabstand zwischen Fahrbefehlen", "Minimum gap between commands", "Gilt für alle Rollläden zusammen – nie mehrere Funkbefehle gleichzeitig (Homematic IP Duty-Cycle).", "Applies to all shutters together – never several radio commands at once (Homematic IP duty cycle)."],
  random_offset: ["Anwesenheitssimulation ±", "Presence simulation ±", "Verschiebt die Fahrzeiten täglich zufällig um bis zu so viele Minuten. 0 = aus.", "Shifts the times randomly each day by up to this many minutes. 0 = off."],
  random_only_vacation: ["Simulation nur im Urlaub", "Simulation only on vacation"],
  accent: ["Akzentfarbe", "Accent colour", "Farbe für Panel und Dashboard-Karte. „Home Assistant“ = Farbe deines Themes.", "Colour for panel and dashboard card. 'Home Assistant' = your theme colour."],
  forecast_entity: ["Vorhersage-Entität", "Forecast entity", "Wetter-Entität mit Tagesvorhersage für „Nur wenn heute erwartet ab“. Leer = Wetter-Entität oben.", "Weather entity with a daily forecast for 'Only if today's forecast reaches'. Empty = weather entity above."],
  weather_entity: ["Wetter-Entität", "Weather entity", "Zeigt Regen, Schnee und Wolken im Fenster von Panel und Karte.", "Shows rain, snow and clouds in the window of panel and card."],
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
  window_profile: ["Tür-/Fensterverhalten", "Door/window behaviour", "Terrassentür: beim Öffnen hoch, solange offen nie runter, nach dem Schließen zurück zur Automatik · Lüftungsfenster: beim Öffnen/Kippen auf Lüftungshöhe, abends erst zu und dann auf Lüftungshöhe · Nur Schutz: keine Reaktion, aber solange offen nie runter · Eigene: die Einzelfelder unten.", "Terrace door: up when opened, never down while open, back to automation after closing · Vent window: vent position when opened/tilted, at night first closed then vent position · Protection only: no reaction, but never down while open · Custom: the single fields below."],
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
  close1_entity: ["Stufe 1: auch schließen wenn an", "Stage 1: also close when on", "Z. B. Licht an. Schließt zusätzlich zur Zeit-/Helligkeitsautomatik.", "E.g. a light turning on. Closes in addition to the time/brightness automation."],
  close1_from: ["Stufe 1 per Entität frühestens ab", "Stage 1 by entity not before"],
  close2_enabled: ["Zweite Schließstufe (Nacht)", "Second closing stage (night)", "Fährt nach Stufe 1 auf eine zweite Höhe/Lamellenstellung – nur bei Automatik an, ohne Sperre und mit geschlossenem Fenster.", "After stage 1 moves to a second position/slat angle – only with automation on, no lock and the window closed."],
  close2_level: ["Stufe 2: Höhe", "Stage 2: position"],
  close2_tilt: ["Stufe 2: Lamellenwinkel", "Stage 2: slat tilt", "−1 = nicht verstellen.", "−1 = do not change."],
  close2_lux: ["Stufe 2 bei Helligkeit unter", "Stage 2 when brightness below", "0 = nicht über Helligkeit.", "0 = not by brightness."],
  close2_lux_entity: ["Stufe 2: Helligkeitssensor", "Stage 2: brightness sensor", "Leer = globaler Helligkeitssensor.", "Empty = global brightness sensor."],
  close2_lux_minutes: ["Stufe 2: so lange darunter", "Stage 2: below for"],
  close2_entity: ["Stufe 2 auch wenn an", "Stage 2 also when on"],
  close2_from: ["Stufe 2 frühestens ab", "Stage 2 not before", "00:00 = keine Uhrzeit.", "00:00 = no time limit."],
  garage_switch_entity: ["Tor-Schalter (Impuls)", "Door switch (impulse)", "Optional: Schalter, Taster oder Relais, der das Tor bewegt (z. B. Shelly mit Auto-Aus). Shutter Captain löst dann einen Impuls aus statt den Cover-Befehl; die Position kommt weiter vom Cover oben.", "Optional: switch, button or relay that moves the door (e.g. Shelly with auto-off). Shutter Captain then sends an impulse instead of the cover command; the position still comes from the cover above."],
  device_type: ["Gerät", "Device", "Markise: Wind- und Regenalarm fahren sie in die Geschlossen-Position (eingefahren).", "Awning: wind and rain alarms move it to the closed (retracted) position."],
  open_tilt: ["Lamellenwinkel offen", "Slat tilt open", "−1 = nicht verstellen.", "−1 = do not change."],
  close_tilt: ["Lamellenwinkel geschlossen", "Slat tilt closed", "−1 = nicht verstellen.", "−1 = do not change."],
  vent_level: ["Höhe für den Lüften-Knopf", "Position for the vent button"],
  sun_start_delay: ["Sonnenschutz erst nach", "Start sun protection after", "So lange muss die Sonne anhaltend scheinen – gegen Hoch und Runter bei Wolken.", "Sun must shine this long without a break – avoids up and down with passing clouds."],
  sun_month_from: ["Sonnenschutz ab Monat", "Sun protection from month", "1–12. Über den Jahreswechsel möglich, z. B. 4 bis 9. Im Winter bleibt die Sonne so drin.", "1–12, may wrap the new year, e.g. 4 to 9. Keeps winter sun inside."],
  sun_month_to: ["bis Monat", "to month"],
  forecast_temp: ["Nur wenn heute erwartet ab", "Only if today's forecast reaches", "Höchsttemperatur der Wettervorhersage (Wetter-Entität unter Einstellungen → Darstellung). 0 = egal.", "Maximum temperature of the weather forecast (weather entity under Settings → Appearance). 0 = ignore."],
  weather_conditions: ["Nur bei Wetterlage", "Only with weather", "Leer = egal. Sonst muss das aktuelle Wetter eine der gewählten Lagen sein.", "Empty = ignore. Otherwise the current weather must be one of these."],
  cond_mode: ["Eigene Bedingung wirkt auf", "Own condition controls", "Sonnenschutz nur wenn erfüllt · abends nur bis zur Höhe unten · nicht schließen · nicht öffnen.", "Sun protection only when met · evening close only to the level below · don't close · don't open."],
  cond_logic: ["Verknüpfung", "Combine"],
  cond1_entity: ["Bedingung 1: Entität", "Condition 1: entity"],
  cond1_op: ["Bedingung 1: ist", "Condition 1: is"],
  cond1_value: ["Bedingung 1: Wert", "Condition 1: value", "Für größer/kleiner/gleich, z. B. 24 oder home.", "For greater/less/equal, e.g. 24 or home."],
  cond2_entity: ["Bedingung 2: Entität", "Condition 2: entity"],
  cond2_op: ["Bedingung 2: ist", "Condition 2: is"],
  cond2_value: ["Bedingung 2: Wert", "Condition 2: value"],
  cond_level: ["Höhe bei „nur halb schließen“", "Level for 'close only partly'"],
  lamp_entity: ["Licht beim Schließen", "Light when closing", "Wird beim automatischen Schließen eingeschaltet und beim Öffnen wieder aus.", "Turned on with automatic closing and off again when opening."],
  lamp_brightness: ["Helligkeit des Lichts", "Light brightness"],
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
  window_profile: { terrace_door: ["Terrassentür", "Terrace door"], vent_window: ["Lüftungsfenster", "Vent window"], protect_only: ["Nur Schutz", "Protection only"], custom: ["Eigene Einstellung", "Custom"] },
  window_action: { off: ["Aus", "Off"], open: ["Öffnen", "Open"], close: ["Schließen", "Close"], open_close: ["Öffnen und Schließen", "Open and close"] },
  lockout: { off: ["Nichts (komplett gesperrt)", "Nothing (fully locked)"], open: ["Nur Öffnen", "Opening only"], close: ["Nur Schließen", "Closing only"], open_close: ["Öffnen und Schließen", "Opening and closing"] },
  sun_mode: {
    off: ["Aus", "Off"], in_out_temp: ["Innen- & Außentemperatur", "Inside & outside temperature"], azimuth: ["Sonnenstand", "Sun position"], all: ["Temperaturen & Sonnenstand", "Temperatures & sun position"],
    out_temp_azimuth: ["Außentemperatur & Sonnenstand", "Outside temperature & sun position"], out_temp: ["Nur Außentemperatur", "Outside temperature only"], in_temp: ["Nur Innentemperatur", "Inside temperature only"],
  },
  manual_round: { 0: ["Nicht runden", "No rounding"], 5: ["5 %", "5%"], 10: ["10 %", "10%"] },
  area: { auto: ["Automatisch", "Automatic"], living: ["Wohnbereich", "Living area"], sleep: ["Schlafbereich", "Sleeping area"], children: ["Kinderbereich", "Children's area"], none: ["Keiner", "None"] },
  accent: { ha: ["Home Assistant", "Home Assistant"], amber: ["Bernstein", "Amber"], indigo: ["Indigo", "Indigo"], teal: ["Petrol", "Teal"], ocean: ["Ozean", "Ocean"], forest: ["Wald", "Forest"], rose: ["Rose", "Rose"] },
  device_type: { shutter: ["Rollladen / Jalousie", "Shutter / blind"], awning: ["Markise", "Awning"], garage: ["Garagentor / Tor", "Garage door / gate"] },
  cond_mode: { off: ["Aus", "Off"], sun: ["Sonnenschutz nur wenn erfüllt", "Sun protection only when met"], half_close: ["Abends nur teilweise schließen", "Evening: close only partly"], no_close: ["Nicht automatisch schließen", "Don't close automatically"], no_open: ["Nicht automatisch öffnen", "Don't open automatically"] },
  garage_open_mode: { off: ["Aus", "Off"], trigger: ["Öffnen, wenn erfüllt", "Open when met"], allow: ["Öffnen nur erlaubt, wenn", "Opening only allowed while"] },
  garage_close_mode: { off: ["Aus", "Off"], trigger: ["Schließen, wenn erfüllt", "Close when met"], allow: ["Schließen nur erlaubt, wenn", "Closing only allowed while"] },
  cond_logic: { and: ["Alle erfüllt (UND)", "All met (AND)"], or: ["Eine erfüllt (ODER)", "Any met (OR)"] },
  cond_op: { on: ["an / offen / zu Hause", "on / open / home"], off: ["aus / zu / abwesend", "off / closed / away"], gt: ["größer als", "greater than"], lt: ["kleiner als", "less than"], eq: ["gleich", "equal to"], ne: ["ungleich", "not equal to"] },
  weather_conditions: { sunny: ["Sonnig", "Sunny"], "clear-night": ["Klare Nacht", "Clear night"], partlycloudy: ["Teilweise bewölkt", "Partly cloudy"], cloudy: ["Bewölkt", "Cloudy"], fog: ["Nebel", "Fog"], rainy: ["Regen", "Rainy"], pouring: ["Starkregen", "Pouring"], lightning: ["Gewitter", "Lightning"], "lightning-rainy": ["Gewitter mit Regen", "Lightning, rainy"], snowy: ["Schnee", "Snowy"], "snowy-rainy": ["Schneeregen", "Snowy, rainy"], hail: ["Hagel", "Hail"], windy: ["Windig", "Windy"], "windy-variant": ["Windig, bewölkt", "Windy, cloudy"], exceptional: ["Unwetter", "Exceptional"] },
  manual_reset: { next_event: ["Beim nächsten Zeitereignis", "At next scheduled event"], timeout: ["Nach Ablauf der Dauer", "After the duration"], never: ["Nur manuell (Fortsetzen)", "Only manually (resume)"] },
};

const SECTION_TITLES = {
  area_living: ["Wohnbereich", "Living area"], area_sleep: ["Schlafbereich", "Sleeping area"], area_children: ["Kinderbereich", "Children's area"],
  astro: ["Astro & Versatz", "Astro & delays"], days: ["Arbeitstage, Feiertage, Urlaub", "Workdays, holidays, vacation"], seasons: ["Sommer & Weihnachten", "Summer & Christmas"],
  brightness: ["Helligkeitssensor", "Brightness sensor"], special: ["Sonderzeiten", "Special times"], alarms: ["Alarme", "Alarms"], behaviour: ["Verhalten & Handbetrieb", "Behaviour & manual mode"], appearance: ["Darstellung", "Appearance"], awnings: ["Markisen", "Awnings"], garages: ["Garagentore", "Garage doors"],
  main: ["Rollladen & Zeiten", "Shutter & schedule"], window: ["Fenster & Tür", "Window & door"], sun: ["Sonnenschutz", "Sun protection"], conditions: ["Eigene Bedingungen", "Own conditions"], stages: ["Schließstufen", "Closing stages"], extra: ["Extras & Alarme", "Extras & alarms"],
};

const STATES = {
  none: ["Unbekannt", "Unknown"], up: ["Offen", "Open"], down: ["Geschlossen", "Closed"], intermediate: ["Zwischenposition", "Intermediate"], sun_protect: ["Sonnenschutz", "Sun protection"],
  heat_protect: ["Hitzeschutz", "Heat protection"], manual: ["Handbetrieb", "Manual"], paused: ["Pausiert", "Paused"], window_open: ["Fenster offen", "Window open"], window_locked: ["Aussperrschutz", "Lockout"],
  emergency: ["Notfall", "Emergency"], fire: ["Feueralarm", "Fire alarm"], rain: ["Regenalarm", "Rain alarm"], wind1: ["Windalarm 1", "Wind alarm 1"], wind2: ["Windalarm 2", "Wind alarm 2"], frost: ["Frostschutz", "Frost protection"],
};

const ENTITIES = {
  sensor: {
    hub_status: { name: ["Status", "Status"], state: { workday: ["Arbeitstag", "Workday"], free_day: ["Freier Tag", "Day off"], vacation: ["Urlaub", "Vacation"], alarm: ["Alarm", "Alarm"] } },
    status: { name: ["Automatik-Status", "Automation status"], state: STATES },
    next_up: { name: ["Nächstes Öffnen", "Next opening"] },
    next_down: { name: ["Nächstes Schließen", "Next closing"] },
  },
  switch: {
    master: { name: ["Automatik (gesamt)", "Automation (all)"] }, vacation: { name: ["Urlaub", "Vacation"] }, school_holiday: { name: ["Schulferien", "School holidays"] },
    auto_living: { name: ["Automatik Wohnbereich", "Auto living area"] }, auto_sleep: { name: ["Automatik Schlafbereich", "Auto sleeping area"] }, auto_children: { name: ["Automatik Kinderbereich", "Auto children's area"] },
    automation: { name: ["Automatik", "Automatic"] }, auto_up: { name: ["Automatisch öffnen", "Open automatically"] }, auto_down: { name: ["Automatisch schließen", "Close automatically"] }, auto_sun: { name: ["Sonnenschutz", "Sun protection"] },
  },
  button: { resume: { name: ["Automatik fortsetzen", "Resume automation"] }, vent: { name: ["Lüften", "Vent"] }, auto_all: { name: ["Alle: Automatik fortsetzen", "All: resume automation"] } },
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
    init: { title: ["Shutter Captain – Einstellungen", "Shutter Captain – settings"][i], menu_options: Object.fromEntries(Object.entries(SECTION_TITLES).filter(([k]) => !["main", "window", "sun", "conditions", "stages", "extra"].includes(k)).map(([k, v]) => [k, v[i]])) },
  };
  for (const area of Object.keys(AREA_NAMES)) {
    const keys = Object.keys(AREA).map((k) => `${area}_${k}`);
    optionSteps[`area_${area}`] = { title: SECTION_TITLES[`area_${area}`][i], description: AREA_INTRO[i], ...fieldBlock(AREA, keys, `${area}_`) };
  }
  const globalSections = {
    astro: ["astro_offset_up", "astro_offset_down", "sun_end_elevation", "stagger"],
    days: ["workday_entity", "workday_tomorrow_entity", "saturday_is_workday", "vacation_entity", "school_holiday_entity"],
    seasons: ["summer_start", "summer_end", "xmas_start", "xmas_end"],
    brightness: ["brightness_entity", "brightness_close", "brightness_open", "brightness_delay", "brightness_open_from", "brightness_close_from"],
    special: ["late_close_time", "intermediate_close_time", "min_minutes_since_move", "random_offset", "random_only_vacation"],
    alarms: ["emergency_entity", "emergency_level", ...Object.keys(GLOBAL).filter((k) => k.startsWith("alarm_"))],
    behaviour: ["wait_time", "command_gap", "position_tolerance", "manual_round", "manual_reset", "manual_timeout"],
    appearance: ["accent", "weather_entity", "forecast_entity"],
    awnings: ["awning_wind_entity", "awning_wind_speed", "awning_rain_entity", "awning_temp_entity", "awning_frost_temp", "awning_min_temp", "awning_retract_time", "awning_sun_end_elevation", "awning_emergency_entities", "awning_emergency_alarms", "awning_wait_time", "awning_position_tolerance", "awning_manual_round", "awning_manual_reset", "awning_manual_timeout"],
    garages: ["garage_emergency_entities", "garage_emergency_alarms", "garage_open_level", "garage_close_level", "garage_vent_level", "garage_position_tolerance", "garage_auto_close_minutes", "garage_close_time", "garage_presence_entity", "garage_arrival_entities", "garage_open_mode", "garage_open_entity", "garage_open_op", "garage_open_value", "garage_close_mode", "garage_close_entity", "garage_close_op", "garage_close_value", "garage_light_entity", "garage_light_minutes", "garage_light_off_on_close", "garage_light_close_delay"],
  };
  for (const [s, keys] of Object.entries(globalSections)) optionSteps[s] = { title: SECTION_TITLES[s][i], ...fieldBlock(GLOBAL, keys) };

  const shutterSections = {
    main: ["name", "cover_entity", "device_type", "garage_switch_entity", "up_mode", "down_mode", "area", "open_level", "close_level", "open_tilt", "close_tilt", "elevation"],
    window: ["window_profile", "window_entity", "tilt_entity", "window_action", "window_open_level", "window_tilt_level", "lockout", "vent_on_close", "drive_after_close", "window_open_delay", "window_close_delay", "vent_level"],
    sun: ["sun_mode", "sun_level", "sun_tilt", "azimuth", "azimuth_range", "out_temp_entity", "out_temp_setpoint", "out_temp_hyst", "in_temp_entity", "in_temp_setpoint", "in_temp_hyst", "light_entity", "light_setpoint", "light_hyst", "keep_sun", "sun_start_delay", "sun_end_delay", "sun_month_from", "sun_month_to", "forecast_temp", "weather_conditions", "heat_protection", "heat_temp"],
    conditions: ["cond_mode", "cond_logic", "cond1_entity", "cond1_op", "cond1_value", "cond2_entity", "cond2_op", "cond2_value", "cond_level"],
    stages: ["close1_entity", "close1_from", "close2_enabled", "close2_level", "close2_tilt", "close2_lux", "close2_lux_entity", "close2_lux_minutes", "close2_entity", "close2_from"],
    extra: ["lamp_entity", "lamp_brightness", "late_close", "summer_no_close", "xmas", "xmas_level", "intermediate", "intermediate_level", "alarm_fire", "alarm_rain", "alarm_wind1", "alarm_wind2", "alarm_frost"],
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
      awning_manual_round: sel(SELECTORS.manual_round), awning_manual_reset: sel(SELECTORS.manual_reset),
      area: sel(SELECTORS.area),
      accent: sel(SELECTORS.accent),
      device_type: sel(SELECTORS.device_type), window_profile: sel(SELECTORS.window_profile), cond_mode: sel(SELECTORS.cond_mode), cond_logic: sel(SELECTORS.cond_logic),
      cond1_op: sel(SELECTORS.cond_op), cond2_op: sel(SELECTORS.cond_op), garage_open_op: sel(SELECTORS.cond_op), garage_close_op: sel(SELECTORS.cond_op),
      garage_open_mode: sel(SELECTORS.garage_open_mode), garage_close_mode: sel(SELECTORS.garage_close_mode), weather_conditions: sel(SELECTORS.weather_conditions),
    },
    device: Object.fromEntries(Object.entries(DEVICES).map(([k, v]) => [k, { name: v[i] }])),
    entity,
    exceptions: { no_shutter_for_entity: { message: ["Für diese Entität ist kein Shutter-Captain-Rollladen eingerichtet.", "No Shutter Captain shutter is configured for this entity."][i] } },
    services: {
      command: {
        name: ["Gruppenbefehl", "Group command"][i],
        description: ["Öffnet, schließt, fährt in den Sonnenschutz oder setzt die Automatik für einen Bereich fort.", "Opens, closes, sets sun protection or resumes automation for an area."][i],
        fields: { action: { name: ["Aktion", "Action"][i], description: ["open, close, sun_protect, auto oder manual", "open, close, sun_protect, auto or manual"][i] }, area: { name: ["Bereich", "Area"][i], description: ["all, living, sleep oder children (nur Rollläden)", "all, living, sleep or children (shutters only)"][i] }, device_type: { name: ["Gerätetyp", "Device type"][i], description: ["shutter, awning oder garage – Markisen und Garagentore: immer alle des Typs", "shutter, awning or garage – awnings and garage doors: always all of the type"][i] } },
      },
      pause: {
        name: ["Automatik pausieren", "Pause automation"][i],
        description: ["Hält die Rollläden an ihrer Position, z. B. während einer Party.", "Holds the shutters in place, e.g. during a party."][i],
        fields: { entity_id: { name: ["Rollläden", "Covers"][i], description: ["Cover-Entitäten", "Cover entities"][i] }, minutes: { name: ["Minuten", "Minutes"][i], description: ["Leer = bis Fortsetzen", "Empty = until resumed"][i] } },
      },
      vent: {
        name: ["Lüften", "Vent"][i],
        description: ["Fährt die Rollläden auf ihre Lüftungshöhe und hält sie dort bis zum nächsten Zeitereignis.", "Moves the shutters to their vent position and holds it until the next scheduled event."][i],
        fields: { entity_id: { name: ["Rollläden", "Covers"][i], description: ["Cover-Entitäten", "Cover entities"][i] } },
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
