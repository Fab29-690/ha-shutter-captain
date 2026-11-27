"""Switches: hub modes and per-shutter automation toggles."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import ShutterCaptainConfigEntry
from .const import HUB_FLAGS
from .entity import HubEntity, ShutterEntity

FLAG_ICONS = {
    "master": "mdi:power",
    "vacation": "mdi:beach",
    "school_holiday": "mdi:school-outline",
    "auto_living": "mdi:sofa-outline",
    "auto_sleep": "mdi:bed-outline",
    "auto_children": "mdi:teddy-bear",
}
AUTO_ICONS = {
    "up": "mdi:arrow-up-bold-box-outline",
    "down": "mdi:arrow-down-bold-box-outline",
    "sun": "mdi:weather-sunny",
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ShutterCaptainConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create switches."""
    hub = entry.runtime_data
    async_add_entities(HubFlagSwitch(hub, flag) for flag in HUB_FLAGS)
    for subentry_id, ctrl in hub.shutters.items():
        async_add_entities(
            [ShutterAutomationSwitch(ctrl)]
            + ([] if ctrl.device_type in ("garage", "roof_window") else [ShutterAutoSwitch(ctrl, kind) for kind in ("up", "down", "sun")]),
            config_subentry_id=subentry_id,
        )


class HubFlagSwitch(HubEntity, SwitchEntity):
    """Vacation, school holidays, area automatics."""

    def __init__(self, hub, flag: str) -> None:
        super().__init__(hub, flag)
        self.flag = flag
        self._attr_icon = FLAG_ICONS[flag]

    @property
    def is_on(self) -> bool:
        """Flag value."""
        return self.hub.flags[self.flag]

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Enable."""
        await self.hub.async_set_flag(self.flag, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Disable."""
        await self.hub.async_set_flag(self.flag, False)


class ShutterAutoSwitch(ShutterEntity, SwitchEntity):
    """Automatic open / close / sun protection for one shutter."""

    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, ctrl, kind: str) -> None:
        super().__init__(ctrl, f"auto_{kind}")
        self.kind = kind
        self._attr_icon = AUTO_ICONS[kind]

    @property
    def is_on(self) -> bool:
        """Switch state."""
        return getattr(self.ctrl, f"auto_{self.kind}")

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Enable."""
        self.ctrl.set_auto(self.kind, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Disable."""
        self.ctrl.set_auto(self.kind, False)


class ShutterAutomationSwitch(ShutterEntity, SwitchEntity):
    """Automatic / manual: off = the automation leaves this shutter alone until switched on again."""

    _attr_icon = "mdi:robot-outline"

    def __init__(self, ctrl) -> None:
        super().__init__(ctrl, "automation")

    @property
    def is_on(self) -> bool:
        """On while the shutter runs automatically."""
        return not self.ctrl.manual

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Back to automatic (moves to the automation position – the lockout still applies)."""
        await self.ctrl.async_resume()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Manual: hold until switched on again."""
        await self.ctrl.async_pause(None)
