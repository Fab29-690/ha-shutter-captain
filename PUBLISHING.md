# Veröffentlichen – Schritt für Schritt

Diese Datei ist nur für dich (kann im Repo bleiben oder gelöscht werden).

## 1. Vorher prüfen

- `custom_components/shutter_pilot/manifest.json`: `codeowners`, `documentation`, `issue_tracker`
  zeigen auf **@Fab29-690** / `github.com/Fab29-690/ha-shutter-pilot`. Falls dein GitHub-Name anders
  ist, dort sowie in `README.md`, `README.de.md` und `LICENSE` ersetzen.
- Übersetzungen werden aus `scripts/build-translations.mjs` erzeugt:
  `node scripts/build-translations.mjs` (die CI prüft, dass sie aktuell sind).

## 2. GitHub-Repository

```powershell
cd C:\Users\mchie\BAWA-Projects\Projects\ha-shutter-pilot
git init -b main
git add .
git commit -m "Shutter Pilot 1.0.0"
git remote add origin https://github.com/Fab29-690/ha-shutter-pilot.git
git push -u origin main
```

Auf GitHub:
- Repository **öffentlich**, Beschreibung setzen, **Topics**: `home-assistant`, `hacs`, `integration`, `shutter`, `cover`.
- Issues aktiviert lassen.
- Actions → „Validate“ muss grün sein (HACS-Check, hassfest, Tests).

## 3. Release

GitHub → Releases → *Draft a new release* → Tag `v1.0.0` → Text aus `CHANGELOG.md` → *Publish*.
Die Action „Release“ hängt automatisch `shutter_pilot.zip` an.

Ab jetzt kann jeder es als **Custom Repository** in HACS hinzufügen.

## 4. Icon (Brands)

Seit Home Assistant 2026.3 liest HA das Icon direkt aus `custom_components/shutter_pilot/brand/`.
Ein Pull Request an [home-assistant/brands](https://github.com/home-assistant/brands) ist **nicht mehr nötig**
(der Ordner `custom_integrations` dort ist inzwischen „legacy“). Die HACS-Prüfung akzeptiert den
`brand/`-Ordner im Repository.

Hinweis: Nutzer mit HA < 2026.3 sehen ohne Brands-Eintrag nur ein Platzhalter-Icon – funktional egal.

## 5. In den HACS-Standardkatalog („Marketplace“)

Voraussetzungen: öffentliches Repo, mindestens ein Release (erstellt *nach* grüner HACS-Action und hassfest), Icon im `brand/`-Ordner.

1. [hacs/default](https://github.com/hacs/default) forken.
2. In der Datei `integration` die Zeile `Fab29-690/ha-shutter-pilot` alphabetisch einfügen.
3. Pull Request stellen und die Vorlage ausfüllen. Die Prüfung dauert meist einige Tage bis Wochen.

## 6. Updates

`CHANGELOG.md` ergänzen (und am besten auch `version` in `manifest.json` – die Release-Action setzt sie im Zip ohnehin aus dem Tag) → committen → neues Release `vX.Y.Z`.
HACS zeigt Nutzern das Update automatisch an.
