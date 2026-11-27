"""Sensors: shutter status, next open/close, hub overview."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import ShutterCaptainConfigEntry
from .const import AREAS, SHUTTER_STATES
from .entity import HubEntity, ShutterEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ShutterCaptainConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create sensors."""
    hub = entry.runtime_data
    hub_entities: list[SensorEntity] = [HubStatusSensor(hub)]
    for area in AREAS:
        hub_entities.append(AreaTimeSensor(hub, area, "up"))
        hub_entities.append(AreaTimeSensor(hub, area, "down"))
    async_add_entities(hub_entities)

    for subentry_id, ctrl in hub.shutters.items():
        async_add_entities(
            [
                ShutterStatusSensor(ctrl),
                ShutterNextSensor(ctrl, "up"),
                ShutterNextSensor(ctrl, "down"),
            ],
            config_subentry_id=subentry_id,
        )


class HubStatusSensor(HubEntity, SensorEntity):
    """Overview: day type, season, sun, alarms."""

    _attr_icon = "mdi:window-shutter-cog"
    _unrecorded_attributes = frozenset(
        {"sun_azimuth", "sun_elevation", "areas", "shutter_count", "weather", "accent"}
    )

    def __init__(self, hub) -> None:
        super().__init__(hub, "hub_status")

    @property
    def native_value(self) -> str:
        """Short day classification."""
        info = self.hub.summary()
        if info["alarms"]:
            return "alarm"
        if info["vacation"]:
            return "vacation"
        return "free_day" if info["free_day"] else "workday"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Everything the panel needs about the hub."""
        return {"shutter_captain": "hub", "entry_id": self.hub.entry.entry_id, **self.hub.summary()}


class AreaTimeSensor(HubEntity, SensorEntity):
    """Next open/close of an area (ioBroker 'info' values)."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, hub, area: str, direction: str) -> None:
        super().__init__(hub, f"{area}_next_{direction}")
        self.area = area
        self.direction = direction

    @property
    def native_value(self) -> datetime | None:
        """Moment."""
        return self.hub.next_area_event(self.area, self.direction)


class ShutterStatusSensor(ShutterEntity, SensorEntity):
    """What the shutter automation is doing and why."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = list(SHUTTER_STATES)
    # Volatile details are only for the panel – keep them out of the recorder.
    _unrecorded_attributes = frozenset(
        {"sun_checks", "position", "tilt", "next_open", "next_close", "last_move", "manual_until",
         "window_azimuth", "azimuth_range", "open_level", "close_level", "sun_level", "desired_level"}
    )

    def __init__(self, ctrl) -> None:
        super().__init__(ctrl, "status")

    @property
    def native_value(self) -> str:
        """Current automation state."""
        if self.ctrl.fire_latched:
            return "fire"
        if self.ctrl.paused and self.ctrl.manual:
            return "paused"
        return self.ctrl.state if self.ctrl.state in SHUTTER_STATES else "none"

    @property
    def icon(self) -> str:
        """Icon by state."""
        if self.ctrl.device_type == "roof_window" and self.native_value in ("up", "down"):
            return "mdi:window-open-variant" if self.native_value == "up" else "mdi:window-closed-variant"
        return {
            "up": "mdi:window-shutter-open",
            "down": "mdi:window-shutter",
            "intermediate": "mdi:window-shutter-settings",
            "sun_protect": "mdi:weather-sunny",
            "heat_protect": "mdi:thermometer-high",
            "manual": "mdi:hand-back-right",
            "paused": "mdi:pause-circle",
            "window_open": "mdi:window-open-variant",
            "window_locked": "mdi:lock",
            "fire": "mdi:fire-alert",
            "rain": "mdi:weather-pouring",
            "wind1": "mdi:weather-windy",
            "wind2": "mdi:weather-windy-variant",
            "frost": "mdi:snowflake-alert",
            "frost_lock": "mdi:snowflake-off",
            "open_partly": "mdi:window-shutter-settings",
            "insect": "mdi:bug-outline",
            "privacy": "mdi:eye-off-outline",
            "my_position": "mdi:star-outline",
            "emergency": "mdi:alarm-light",
        }.get(self.native_value, "mdi:window-shutter-auto")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Detailed state for the panel and automations."""
        return self.ctrl.info()


class ShutterNextSensor(ShutterEntity, SensorEntity):
    """Next automatic open or close."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, ctrl, direction: str) -> None:
        super().__init__(ctrl, f"next_{direction}")
        self.direction = direction

    @property
    def native_value(self) -> datetime | None:
        """Moment."""
        return self.ctrl.next_event(self.direction)
