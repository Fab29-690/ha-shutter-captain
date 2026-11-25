"""Shutter Captain – automatic shutter control for Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ENTITY_ID, Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import AREAS, DOMAIN, PANEL_ELEMENT, PANEL_URL, STATIC_URL, VERSION
from .hub import ShutterHub
from .websocket import async_register_websocket

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.BUTTON, Platform.COVER, Platform.SENSOR, Platform.SWITCH]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type ShutterCaptainConfigEntry = ConfigEntry[ShutterHub]

SERVICE_COMMAND = "command"
SERVICE_PAUSE = "pause"
SERVICE_RESUME = "resume"
SERVICE_VENT = "vent"

COMMAND_SCHEMA = vol.Schema(
    {
        vol.Required("action"): vol.In(["open", "close", "sun_protect", "auto", "manual"]),
        vol.Optional("area", default="all"): vol.In(["all", *AREAS]),
        vol.Optional("device_type", default="shutter"): vol.In(["shutter", "awning", "garage"]),
    }
)
PAUSE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional("minutes"): vol.All(vol.Coerce(int), vol.Range(min=1, max=10080)),
    }
)
RESUME_SCHEMA = vol.Schema({vol.Required(ATTR_ENTITY_ID): cv.entity_ids})


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register services, websocket commands and the static frontend files."""
    async_register_websocket(hass)
    _register_services(hass)
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(Path(__file__).parent / "frontend"), False)]
    )
    # The dashboard card is loaded on every dashboard automatically – no resource needed.
    card_file = Path(__file__).parent / "frontend" / "shutter-captain-card.js"
    stamp = await hass.async_add_executor_job(lambda: int(card_file.stat().st_mtime))
    frontend.add_extra_js_url(hass, f"{STATIC_URL}/shutter-captain-card.js?v={VERSION}-{stamp}")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ShutterCaptainConfigEntry) -> bool:
    """Set up the hub and its shutters."""
    hub = ShutterHub(hass, entry)
    entry.runtime_data = hub
    await hub.async_setup()
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    await _async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ShutterCaptainConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_unload()
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ShutterCaptainConfigEntry) -> None:
    """Remove the sidebar panel with the last entry."""
    if not hass.config_entries.async_loaded_entries(DOMAIN):
        frontend.async_remove_panel(hass, PANEL_URL, warn_if_unknown=False)


async def _async_reload(hass: HomeAssistant, entry: ShutterCaptainConfigEntry) -> None:
    """Options or subentries changed."""
    await hass.config_entries.async_reload(entry.entry_id)


async def _async_register_panel(hass: HomeAssistant) -> None:
    if PANEL_URL in hass.data.get("frontend_panels", {}):
        return
    # Cache-buster from the file itself: every changed panel file gets a new URL,
    # so browsers never keep an outdated panel (also between unreleased builds).
    panel_file = Path(__file__).parent / "frontend" / "shutter-captain-panel.js"
    stamp = await hass.async_add_executor_job(lambda: int(panel_file.stat().st_mtime))
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_ELEMENT,
        frontend_url_path=PANEL_URL,
        module_url=f"{STATIC_URL}/shutter-captain-panel.js?v={VERSION}-{stamp}",
        sidebar_title="Shutter Captain",
        sidebar_icon="mdi:window-shutter-auto",
        require_admin=False,
        config={"domain": DOMAIN},
    )


def _hubs(hass: HomeAssistant) -> list[ShutterHub]:
    return [e.runtime_data for e in hass.config_entries.async_loaded_entries(DOMAIN)]


def _controllers_for(hass: HomeAssistant, entity_ids: list[str]):
    found = []
    for hub in _hubs(hass):
        for ctrl in hub.shutters.values():
            if ctrl.cover_entity in entity_ids:
                found.append(ctrl)
    if not found:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="no_shutter_for_entity"
        )
    return found


@callback
def _register_services(hass: HomeAssistant) -> None:
    async def command(call: ServiceCall) -> None:
        for hub in _hubs(hass):
            await hub.async_command(call.data["action"], call.data["area"], call.data["device_type"])

    async def pause(call: ServiceCall) -> None:
        for ctrl in _controllers_for(hass, call.data[ATTR_ENTITY_ID]):
            await ctrl.async_pause(call.data.get("minutes"))

    async def resume(call: ServiceCall) -> None:
        for ctrl in _controllers_for(hass, call.data[ATTR_ENTITY_ID]):
            await ctrl.async_resume()

    hass.services.async_register(DOMAIN, SERVICE_COMMAND, command, COMMAND_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_PAUSE, pause, PAUSE_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_RESUME, resume, RESUME_SCHEMA)

    async def vent(call: ServiceCall) -> None:
        for ctrl in _controllers_for(hass, call.data[ATTR_ENTITY_ID]):
            await ctrl.async_vent()

    hass.services.async_register(DOMAIN, SERVICE_VENT, vent, RESUME_SCHEMA)
