# Changelog

## 3.2.0

- **Frost by temperature**: a temperature sensor (Settings → Alarms) can drive the frost alarm
  ("frost protection when colder than") and a **frost lock** ("frost lock when colder than"), each
  with 1 °C hysteresis; -50 = off. The frost trigger entity keeps working as before.
- **Frost opening position** per shutter: while frost is active the automation only opens up to this
  position (-1 = off); when the frost is over the shutter opens fully.
- **Frost lock** per shutter: below the lock temperature the shutter is not moved automatically at
  all (schedule, sun, stages, window, wind/rain alarms). Manual control, explicit commands, the fire
  alarm and the emergency input still work.
- **Second closing stage aligned**: triggers brightness, time and entity can now be combined with
  **AND** (all configured triggers must apply, default) or **OR**; stage 2 only follows a *full*
  close (not the intermediate / partial position). The time is a real trigger now and also works
  after midnight (e.g. stage 1 at 21:00, stage 2 at 01:00).
- **Second opening stage**: in the morning first only to a partial position, fully open later –
  by brightness (with minimum duration), time and/or entity (AND/OR). Without a trigger the shutter
  opens fully at once. Sun protection starts once it is fully open.
- **Insect protection**: once a day briefly fully up and back to the previous position, slats
  included – time window (default 11–16), optional temperature sensor with minimum (default 15 °C)
  and a condition entity. Skipped when the shutter was fully up that day; waits while the window is
  open, a lock, alarm or frost is active or the automation is off. Stored, so no second run after a
  restart (and a shutter caught at the top by a restart goes back).
- **Privacy position** (default 30 %) and **My position** (default 50 %) per shutter and awning:
  buttons, services `shutter_captain.privacy` / `shutter_captain.my_position`, menu entries in the
  panel and buttons in the dashboard card (option *Privacy / My position buttons*). Held until the
  next scheduled event, like venting. The lockout protection applies; panel and card ask first and
  only then move down in front of an open door.
- **New device type roof window**: closes on rain and wind (also in manual mode and with the main
  switch off), cannot be opened by command or vent button while it rains, closes after X minutes
  open and at an evening time, vent button with its own vent position. Own edit tab, own settings
  tab, own filter in the overview, own symbol in panel and card. Never moved by shutter schedules or
  groups.
- **Plausibility hints** in the panel editor, the device list and the settings, e.g. lockout allows
  closing with the door open, opening is off so sun protection never applies, a stage without
  trigger, overlapping brightness time windows, frost settings without a frost source.
- Fixed: the status chips of the dashboard card showed "Open"/"Closed" without the number of
  shutters (label clash with the garage door states).

## 3.1.2

- README: optional "Support this project" section with a PayPal link. Shutter Captain stays free –
  all features remain fully available.

## 3.1.1

- README: animated preview and a 65-second explainer video; new screenshots.
- README: the "Coming from Shutter Pilot 1.x?" note now says it only concerns the earlier custom
  repository of this project, not the unrelated *Shutter Pilot* integration in the default catalog.

## 3.1.0

- **Garage doors: emergency opener** (e.g. one or more smoke detectors, optionally also the fire
  alarm and the emergency input). Highest priority – overrides everything: the door always opens
  fully as escape route, also in manual mode, with the main switch off or blocked by conditions,
  and is reopened if someone closes it. No automatic closing while it is active.
- **Opening and closing height** for garage doors (doors that report a position).
- **Open / close by condition** (entity, is on/off/greater/less/equal): either *move when met* or
  *only allowed while met*.
- **Open when someone comes home** (one or more persons).
- **Light when opening** (also by hand or remote): on for X minutes, and optionally off when the
  door closes after an adjustable delay.
- **Vent** for garage doors with an own vent height; the "close after X minutes" timer waits while
  venting.
- **Door switch (impulse)** per garage door: switch, button or relay that moves the door instead of
  the cover services (e.g. a Shelly with auto-off).
- **Settings fully separated by device type**: tabs *Shutters · Awnings · Garage doors ·
  Appearance*. The former *General* settings (astro, days, alarms, behaviour) now belong to the
  shutters only. Awnings get their own sun elevation, travel/wait time, position tolerance, manual
  mode settings and their own emergency (retract on own entities, optionally also on the shutter
  fire alarm / emergency input – on by default, as before); the shutter alarms no longer move
  awnings. Garage doors get their own position tolerance.
- **Overview per device type**: with *Awnings* or *Garage doors* selected, the areas (living /
  sleeping / children) and the shutter sun protection button disappear (garage doors: also the sun
  card). Instead an **Automatic | Manual** card switches all awnings or all garage doors at once,
  with a switch per device. Awning tiles no longer show the shutter up/down switches and times.
- Group command service: new action `manual` and new field `device_type` (shutter, awning,
  garage) – awnings and garage doors are always addressed as a whole type.
- New field type for several entities (persons, smoke detectors) in panel and options flow.

## 3.0.0

- **Shutters, awnings and garage doors are handled separately.**
  - New device type *Garage door / gate* with its own settings: close automatically after X minutes
    open, close at a fixed evening time, close when everyone has left (presence entity). Garage
    doors are never moved by schedules, sun, groups, resume or the emergency input.
  - Awnings get their own settings: wind sensor (switch or km/h), rain sensor, temperature,
    retract on frost, extend only from a minimum temperature, retract at an evening time. They
    extend in sun protection and retract otherwise.
  - Group devices and area commands only contain shutters.
- **One overview** with a type filter (All · Groups · Shutters · Awnings · Garage doors). Covers
  that Shutter Captain does not automate are shown below as simple control tiles. The separate
  *Control* tab is gone.
- Panel tabs **Edit shutters · Edit awnings · Edit garage doors**; new devices get sensible
  defaults per type, and the form only shows what fits the type.
- **Settings split** into General · Shutters · Awnings · Garage doors.
- Own pictures, icons and labels per type in panel and dashboard card (awning fabric "extended /
  retracted", garage door panels "open / closed").

## 2.8.0

- **Door/window profiles** replace the three overlapping window fields: *Terrace door* (up when
  opened, never down while open, back to automation after closing), *Vent window* (vent position
  when opened/tilted, at night first closed then vent position), *Protection only* (no reaction,
  never down while open) and *Custom* (the single fields as before). Contradicting combinations
  like "open on door opening, but close while open" can no longer be set with a profile.
  Existing shutters keep *Custom* until changed.
- Every shutter tile in panel and dashboard card shows an **Automatic | Manual** switch.

## 2.7.0

- **Safety fix – lockout protection can no longer be bypassed.** A central check right before every
  cover command stops any automatic downward move while the door/window is open (schedule, alarms,
  late close, group devices, stages). Only the emergency input may override it.
- A window/door contact that is unavailable (e.g. right after a restart) now counts as *not closed*,
  and its reappearance is no longer treated as a door event (no movement on restart).
- *Late close* no longer ignores the lockout protection.
- Closing a shutter by hand in card or panel while its door is open asks for confirmation first
  (tile ↓, slider, header ↓, group tiles, *Control* tab). Cancel = only the other shutters move.
- New switch **Automatic** per shutter: off = manual (the automation leaves it alone), on = back to
  automatic. Also as a chip on every card tile.
- New card **Shutter Captain – shutter** for a single shutter or group, sized for dashboard sections.
  The full **Shutter Captain** card now starts with all shutters.

## 2.6.0

- **Emergency input** (Settings → Alarms): e.g. a smoke detector. Highest priority – overrides
  alarms, manual mode, pause and the main switch; every shutter goes to the emergency position
  (default fully open), awnings retract. When it ends, alarms are re-applied, otherwise the
  shutters return to their automation position. Red banner in the panel.
- **Closing stages** per shutter (new form section):
  - Stage 1 can also be triggered by an entity (e.g. a light turning on), not before a set time.
  - Stage 2 (night) moves to its own position and slat angle – by its own brightness threshold
    (X minutes below, own or global sensor), an entity and/or not before a time. Only after
    stage 1, with automation on, no lock and the window closed. It is Shutter Captain's own move,
    so it never counts as manual.
- **Brightness time windows**: "Brightness opens from" and "Brightness closes from" replace the
  fixed noon border (separate thresholds for opening and closing already existed).
- **New panel tab "Control"**: every cover in Home Assistant – groups, shutters and blinds,
  awnings, garage doors and gates – with open/stop/close, slider, filter and search. Garage doors
  and gates ask before moving.
- Separate *forecast entity* (Appearance) for weather providers without forecasts; an unknown
  forecast no longer blocks sun protection.

## 2.5.0

- **Minimum gap between all cover commands** (Settings → Behaviour, default 1 s): one queue for every
  shutter, group and area – never several radio commands at once (Homematic IP duty cycle).
- **Sun protection start delay**: shading starts only after the sun has been shining for X minutes.
- **Weather forecast / weather condition**: sun protection only if today's forecast reaches X °C
  and/or the current weather is one of the chosen conditions (weather entity under Appearance).
- **Main switch** *Automation (all)*: switches every automatic move off (alarms keep working);
  also a chip in the panel.
- **Presence simulation**: scheduled times shift randomly by up to ±X minutes per day and shutter,
  optionally only on vacation.
- **Light action**: a light/switch per shutter turns on with automatic closing (dimmable) and off
  when opening.
- **Vent button** per shutter (button entity, panel menu, service `shutter_captain.vent`).
- **Slat tilt for open and closed** in addition to sun protection.
- **Event `shutter_captain_cover_moved`** for every automatic move (entity, position, previous
  position, reason, area).
- **Own conditions** (up to two entities, AND/OR, on/off/greater/less/equal): sun protection only
  when met, close only partly in the evening (e.g. hot and someone home), don't close or don't open.
- **Sun protection months** (e.g. April–September, also across the new year).
- **Awning mode**: wind, rain and fire alarms retract the awning (closed position).

## 2.4.0

- The card is configured where it is used again: *Edit dashboard → Add card → Shutter Captain*.
  Its visual editor picks shutters and groups (or *all shutters*), reorders them with the mouse and
  holds all look options (layout, shape, accent/background/text colour, font, background image with
  darkening, status chips, header controls, times, automation switches, slider, vacation/automatic/
  manual buttons).
- Removed the *Dashboard cards* tab from the panel and the stored card designs. Cards that pointed to
  a design (`card: …`) show a hint – open *Edit* and choose the shutters again.

## 2.3.0

- Dashboard cards are now designed in the panel (new tab *Dashboard cards*) instead of the card
  editor: drag shutters and groups into the card and arrange them with the mouse, pick layout,
  shape (round/soft/square), accent, background colour, text colour, font and a background image
  (upload or URL, adjustable darkening), and switch every part on or off. Live preview.
- *Add to dashboard* puts the card on any dashboard/view; *Copy YAML* gives `card: <id>`.
  Dashboards reference the design, so changes in the panel appear everywhere at once.
- Card option *All Shutter Captain shutters*: always contains every shutter, including new ones;
  one-click preset *Card for all shutters* with vacation/automatic/manual buttons.
- New status chips (e.g. "3 open", "1 window open", "2 manual") and mode buttons
  *Vacation*, *Automatic* (resume all) and *Manual* (pause all) – each can be shown or hidden.
- The card adapts to its own width (container queries): several columns when wide, one column
  on narrow dashboards, a compact view in very small columns.

## 2.2.0

- Panel and card: the window shows the real time of day (dawn, day, dusk, night with stars) and,
  with a weather entity, clouds, rain or snow.
- Panel and card: a moving shutter is visible – the slats run in the travel direction and an arrow
  shows up or down.
- Card: new compact layout – one chip per shutter (window, name, state, position); tap opens the controls.
- New settings page *Appearance*: accent colour for panel and card (Amber, Indigo, Teal, Ocean,
  Forest, Rose or your Home Assistant theme) and the weather entity.

## 2.1.0

- New dashboard card *Shutter Captain* with a visual editor: tick shutters and group devices,
  sort them, grid or list layout, header controls for all, next times, automation switches and
  slider can be switched on/off. Loaded automatically, no dashboard resource needed. German/English.
- Fix: a shutter set to *Move on window change: Open* (without *Catch up after window closes*)
  went down again as soon as the door was closed. It now stays where it is, as configured; the
  panel shows "Window closed – stays put".

## 2.0.0

- **Breaking: renamed to Shutter Captain.** New domain `shutter_captain` (folder
  `custom_components/shutter_captain`), services `shutter_captain.command` / `.pause` / `.resume`,
  entity IDs `…shutter_captain_…`. The old name clashed with another integration in the HACS store.
  Coming from 1.x: remove *Shutter Pilot*, install *Shutter Captain* and set it up again.
- README: install via HACS search first, custom repository as fallback.
- New group devices *Living area*, *Sleeping area*, *Children's area* (each with the shutters that
  use that area's time profile) and *All shutters*. Each is a device with one cover named like the
  device, so voice assistants (Alexa, Google, Assist) find it by the plain name and it can be put in
  a room. Shows the average position; open, close, stop, set position and slat tilt for all members.
- New per-shutter setting *Area (group)*: put a shutter into the living, sleeping or children's
  group regardless of its schedule (default *Automatic* = from *Open/Close by*). Also used by the
  area buttons and the panel filter.
- The *Children's area* group always exists (unavailable until a shutter is assigned), so all
  three area devices are there from the start.
- Panel: language selector (Auto / Deutsch / English) in the toolbar; it switches the whole panel
  including the editor labels and is remembered per browser.
- Panel: compact toolbar on phones; the panel file URL now changes with every file change, so
  browsers no longer show an outdated panel after an update.
- Fix: error in the log when the integration was reloaded after Home Assistant had started.

## 1.0.0

- First release: time profiles for three areas, astro and golden hour, sun protection by sun
  position/temperature/light with hysteresis and slat tilt, window contacts with lockout
  protection and vent positions, alarms (fire, rain, wind 1/2, frost), workday/vacation/school
  holidays, summer and Christmas periods, late close, intermediate position, manual detection.
- Sidebar panel with live overview, editor for all shutters (including bulk edit) and global settings.
- Services `command`, `pause`, `resume`; diagnostics; German and English.
