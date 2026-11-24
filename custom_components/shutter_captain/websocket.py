"""Websocket API used by the sidebar panel to read and edit all settings."""

from __future__ import annotations

from functools import lru_cache
import json
from pathlib import Path
from types import MappingProxyType
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant, callback

from . import logic
from .const import (
    DOMAIN,
    GLOBAL_DEFAULTS,
    GLOBAL_FIELDS,
    GLOBAL_SECTIONS,
    SHUTTER_DEFAULTS,
    SHUTTER_FIELDS,
    SHUTTER_SECTIONS,
    SUBENTRY_SHUTTER,
    Field,
)

TRANSLATIONS = Path(__file__).parent / "translations"


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    """Register all commands."""
    websocket_api.async_register_command(hass, ws_get_config)
    websocket_api.async_register_command(hass, ws_update_options)
    websocket_api.async_register_command(hass, ws_save_shutter)
    websocket_api.async_register_command(hass, ws_delete_shutter)


def _entry(hass: HomeAssistant, entry_id: str | None) -> ConfigEntry | None:
    entries = hass.config_entries.async_entries(DOMAIN)
    if entry_id:
        return next((e for e in entries if e.entry_id == entry_id), None)
    return entries[0] if entries else None


@lru_cache(maxsize=8)
def _load_labels(language: str) -> dict[str, Any]:
    for lang in (language, language.split("-")[0], "en"):
        path = TRANSLATIONS / f"{lang}.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    return {}


def coerce(field: Field, value: Any) -> Any:
    """Validate and convert one value coming from the panel."""
    if value in (None, "") and field.kind in ("entity", "text"):
        if field.optional:
            return None
        raise vol.Invalid(f"{field.key} is required")
    if field.kind == "bool":
        return bool(value)
    if field.kind in ("int", "float"):
        number = float(value)
        if field.min is not None and number < field.min:
            raise vol.Invalid(f"{field.key} < {field.min}")
        if field.max is not None and number > field.max:
            raise vol.Invalid(f"{field.key} > {field.max}")
        return int(round(number)) if field.kind == "int" else number
    if field.kind == "select":
        if str(value) not in field.options:
            raise vol.Invalid(f"{field.key}: invalid option")
        return str(value)
    if field.kind == "time":
        parsed = logic.parse_time(value)
        if parsed is None:
            raise vol.Invalid(f"{field.key}: invalid time")
        return parsed.strftime("%H:%M:%S")
    if field.kind == "daymonth":
        if not logic.valid_day_month(value):
            raise vol.Invalid(f"{field.key}: use DD.MM.")
        return str(value)
    return str(value)


def _coerce_all(fields: dict[str, Field], data: dict[str, Any]) -> dict[str, Any]:
    return {key: coerce(fields[key], value) for key, value in data.items() if key in fields}


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/get_config",
        vol.Optional("entry_id"): str,
        vol.Optional("language", default="en"): str,
    }
)
@websocket_api.async_response
async def ws_get_config(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Schema, labels, global options and every shutter's settings."""
    entry = _entry(hass, msg.get("entry_id"))
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Shutter Captain is not set up")
        return
    shutters = [
        {
            "subentry_id": sub.subentry_id,
            "title": sub.title,
            "data": {**SHUTTER_DEFAULTS, **sub.data},
        }
        for sub in entry.subentries.values()
        if sub.subentry_type == SUBENTRY_SHUTTER
    ]
    connection.send_result(
        msg["id"],
        {
            "entry_id": entry.entry_id,
            "is_admin": connection.user.is_admin,
            "options": {**GLOBAL_DEFAULTS, **entry.options},
            "global_schema": {s: [f.as_dict() for f in fs] for s, fs in GLOBAL_SECTIONS.items()},
            "shutter_schema": {s: [f.as_dict() for f in fs] for s, fs in SHUTTER_SECTIONS.items()},
            "shutter_defaults": SHUTTER_DEFAULTS,
            "shutters": shutters,
            "labels": await hass.async_add_executor_job(_load_labels, msg["language"]),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/update_options",
        vol.Required("entry_id"): str,
        vol.Required("options"): dict,
    }
)
@websocket_api.require_admin
@callback
def ws_update_options(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Save global settings (reloads the integration)."""
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Entry not found")
        return
    try:
        changes = _coerce_all(GLOBAL_FIELDS, msg["options"])
    except (vol.Invalid, ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    hass.config_entries.async_update_entry(entry, options={**entry.options, **changes})
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/save_shutter",
        vol.Required("entry_id"): str,
        vol.Optional("subentry_id"): vol.Any(str, None),
        vol.Required("data"): dict,
    }
)
@websocket_api.require_admin
@callback
def ws_save_shutter(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Create or update one shutter (a config subentry)."""
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(msg["id"], "not_found", "Entry not found")
        return
    subentry_id = msg.get("subentry_id")
    existing = entry.subentries.get(subentry_id) if subentry_id else None
    base = {**SHUTTER_DEFAULTS, **(existing.data if existing else {})}
    try:
        data = {**base, **_coerce_all(SHUTTER_FIELDS, msg["data"])}
    except (vol.Invalid, ValueError, TypeError) as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    cover = data.get("cover_entity")
    if not cover:
        connection.send_error(msg["id"], "invalid", "cover_entity is required")
        return
    for sub in entry.subentries.values():
        if sub.subentry_id != subentry_id and sub.data.get("cover_entity") == cover:
            connection.send_error(msg["id"], "duplicate", f"{cover} is already configured")
            return
    title = data.get("name") or _friendly(hass, cover)

    if existing:
        hass.config_entries.async_update_subentry(
            entry, existing, data=data, title=title, unique_id=cover
        )
        connection.send_result(msg["id"], {"subentry_id": existing.subentry_id})
        return
    subentry = ConfigSubentry(
        data=MappingProxyType(data),
        subentry_type=SUBENTRY_SHUTTER,
        title=title,
        unique_id=cover,
    )
    hass.config_entries.async_add_subentry(entry, subentry)
    connection.send_result(msg["id"], {"subentry_id": subentry.subentry_id})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/delete_shutter",
        vol.Required("entry_id"): str,
        vol.Required("subentry_id"): str,
    }
)
@websocket_api.require_admin
@callback
def ws_delete_shutter(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Remove a shutter (its entities and device go with it)."""
    entry = _entry(hass, msg["entry_id"])
    if entry is None or msg["subentry_id"] not in entry.subentries:
        connection.send_error(msg["id"], "not_found", "Shutter not found")
        return
    hass.config_entries.async_remove_subentry(entry, msg["subentry_id"])
    connection.send_result(msg["id"], {"ok": True})


def _friendly(hass: HomeAssistant, entity_id: str) -> str:
    state = hass.states.get(entity_id)
    if state and state.attributes.get("friendly_name"):
        return str(state.attributes["friendly_name"])
    return entity_id
