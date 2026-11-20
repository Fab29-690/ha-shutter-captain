"""Base entities."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity

from .const import DOMAIN, NAME, VERSION
from .hub import ShutterHub
from .shutter import ShutterController


class HubEntity(Entity):
    """Entity on the central 'Shutter Pilot' device."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, hub: ShutterHub, key: str) -> None:
        self.hub = hub
        self._attr_translation_key = key
        self._attr_unique_id = f"{hub.entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, hub.entry.entry_id)},
            name=NAME,
            manufacturer=NAME,
            model="Zentrale",
            sw_version=VERSION,
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Refresh on hub updates."""
        self.async_on_remove(
            async_dispatcher_connect(self.hass, self.hub.signal, self.async_write_ha_state)
        )


class ShutterEntity(Entity):
    """Entity on a per-shutter device."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, ctrl: ShutterController, key: str) -> None:
        self.ctrl = ctrl
        self.hub = ctrl.hub
        self._attr_translation_key = key
        self._attr_unique_id = f"{ctrl.subentry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, ctrl.subentry_id)},
            name=ctrl.name,
            manufacturer=NAME,
            model="Rollladen-Automatik",
            sw_version=VERSION,
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Refresh on hub updates."""
        self.async_on_remove(
            async_dispatcher_connect(self.hass, self.hub.signal, self.async_write_ha_state)
        )
