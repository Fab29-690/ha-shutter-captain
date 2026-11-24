"""Diagnostics download (Settings → Devices & services → Shutter Captain → ⋮)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from . import ShutterCaptainConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ShutterCaptainConfigEntry
) -> dict[str, Any]:
    """Settings and live state of every shutter (no personal location data)."""
    hub = entry.runtime_data
    return {
        "options": dict(entry.options),
        "flags": hub.flags,
        "summary": hub.summary(),
        "shutters": {
            sid: {"config": ctrl.cfg, "runtime": ctrl.as_store(), "info": ctrl.info()}
            for sid, ctrl in hub.shutters.items()
        },
    }
