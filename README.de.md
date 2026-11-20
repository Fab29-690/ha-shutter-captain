# Shutter Pilot – Rollladensteuerung für Home Assistant

Automatische Steuerung von Rollläden, Jalousien und Markisen: Zeitprofile, Sonnenauf- und
-untergang, Golden Hour, Sonnenschutz nach Sonnenstand und Temperatur, Fensterkontakte mit
Aussperrschutz, Alarme (Feuer, Regen, Wind, Frost), Feiertage und Urlaub – alles in einem
eigenen Panel in der Seitenleiste einstellbar.

Inspiriert vom ioBroker-Adapter *shuttercontrol*, nativ für Home Assistant neu gebaut.

![Übersicht](docs/images/overview.png)

## Funktionen

- **Drei Bereiche** (Wohnen, Schlafen, Kinder) mit Zeiten für Arbeitswoche und Wochenende/Feiertag.
  Pro Bereich: *nur Zeit*, *Sonnenauf-/-untergang* oder *Golden Hour* – immer begrenzt durch
  früheste/späteste Öffnung und spätestes Schließen. Freitag schließt mit Wochenendzeit, Sonntag mit Wochenzeit.
- **Pro Rollladen** getrennt für Öffnen und Schließen: Bereich, Bereich mit Automatik-Schalter,
  Sonnenauf-/-untergang, Sonnenhöhe, Golden Hour, Helligkeitssensor oder nur manuell.
- **Sonnenschutz** nach Sonnenstand (Fensterausrichtung ± Bereich), Außen-/Innentemperatur und
  Lichtsensor (UND-verknüpft, mit Hysterese), Ende unter Sonnenhöhe, *halten bis abends*,
  Verzögerung, Hitzeschutz und **Lamellenwinkel** für Jalousien.
- **Fenster & Tür**: offen/gekippt, Lüftungshöhen, Fahren bei Öffnen/Schließen, **Aussperrschutz**,
  erst schließen und dann auf Lüftungshöhe, Nachfahren nach dem Schließen, Verzögerungen.
- **Alarme**: Feuer (bleibt verriegelt, bis „Alle öffnen/schließen“ gedrückt wird), Regen, Wind 1/2, Frost.
- **Kalender**: Workday-Sensor (Feiertage), Arbeitstag morgen, Urlaub, Schulferien je Bereich,
  Sommer (nicht schließen), Weihnachtshöhe, spät schließen, Zwischenposition.
- **Handbetrieb-Erkennung** mit Rundung auf bekannte Höhen; endet beim nächsten Zeitereignis,
  nach einer Dauer oder erst bei „Fortsetzen“.

### Verbesserungen gegenüber ioBroker

- **Seitenleisten-Panel** mit Live-Ansicht: animierter Rollladen, Status, **Begründung**
  („Fenster offen – Aussperrschutz verhindert Fahrt“), nächste Zeiten, Sonnenkompass je Fenster.
- **Alle Rollläden in einer Tabelle bearbeiten**, duplizieren, löschen – und **Mehrfachbearbeitung**:
  mehrere Rollläden auswählen und eine Einstellung für alle gleichzeitig ändern.
- **Pause** für 1 h / 3 h / bis Fortsetzen (z. B. bei einer Party).
- **Lamellen nativ** statt zwei Einträge pro Jalousie.
- **Helligkeitssteuerung mit Schutz**: Dunkelheit schließt nur abends, Helligkeit öffnet nur
  morgens – jeweils erst nach einer Mindestdauer. Eine Gewitterwolke mittags schließt nicht das ganze Haus.

## Installation

**HACS:** HACS → ⋮ → *Benutzerdefinierte Repositories* → `https://github.com/Fab29-690/ha-shutter-pilot`
(Typ *Integration*) → *Shutter Pilot* installieren → Home Assistant neu starten →
*Einstellungen → Geräte & Dienste → Integration hinzufügen → Shutter Pilot*.

**Manuell:** `custom_components/shutter_pilot` nach `config/custom_components` kopieren und neu starten.

## Einrichtung

1. In der Seitenleiste **Shutter Pilot** öffnen.
2. *Einstellungen*: Zeiten der Bereiche prüfen, optional Workday-Sensor, Alarme, Helligkeitssensor.
3. *Rollläden bearbeiten → Rollladen hinzufügen*.

> **Positionen** wie in Home Assistant: `100 %` = ganz offen, `0 %` = geschlossen.

## Dienste

```yaml
action: shutter_pilot.command          # open | close | sun_protect | auto
data: { action: close, area: living }  # all | living | sleep | children

action: shutter_pilot.pause
data: { entity_id: cover.wohnzimmer, minutes: 120 }

action: shutter_pilot.resume
data: { entity_id: cover.wohnzimmer }
```
