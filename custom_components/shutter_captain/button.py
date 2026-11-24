"""Buttons: group commands (open/close/sun per area) and per-shutter resume."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import ShutterCaptainConfigEntry
from .const import AREAS
from .entity import HubEntity, ShutterEntity

ACTION_ICONS = {
    "open": "mdi:arrow-up-box",
    "close": "mdi:arrow-down-box",
    "sun_protect": "mdi:sun-angle-outline",
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ShutterCaptainConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create buttons."""
    hub = entry.runtime_data
    buttons: list[ButtonEntity] = [GroupButton(hub, "auto", "all")]
    for area in ("all", *AREAS):
        buttons.extend(GroupButton(hub, action, area) for action in ACTION_ICONS)
    async_add_entities(buttons)
    for subentry_id, ctrl in hub.shutters.items():
        async_add_entities([ResumeButton(ctrl)], config_subentry_id=subentry_id)


class GroupButton(HubEntity, ButtonEntity):
    """ioBroker openAll / closeLiving / sunProtectSleep / autoAll …"""

    def __init__(self, hub, action: str, area: str) -> None:
        super().__init__(hub, f"{action}_{area}")
        self.action = action
        self.area = area
        self._attr_icon = ACTION_ICONS.get(action, "mdi:autorenew")

    async def async_press(self) -> None:
        """Run the command."""
        await self.hub.async_command(self.action, self.area)


class ResumeButton(ShutterEntity, ButtonEntity):
    """Leave manual mode and continue automatically."""

    _attr_icon = "mdi:autorenew"

    def __init__(self, ctrl) -> None:
        super().__init__(ctrl, "resume")

    async def async_press(self) -> None:
        """Resume."""
        await self.ctrl.async_resume()
