# Changelog

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
