"""Group covers: one per area (living, sleeping, children) and one for all shutters."""

from __future__ import annotations

from typing import Any

from homeassistant.components.cover import (
    ATTR_POSITION,
    ATTR_TILT_POSITION,
    CoverDeviceClass,
    CoverEntity,
    CoverEntityFeature,
)
from homeassistant.const import ATTR_ENTITY_ID, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, State, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from . import ShutterCaptainConfigEntry
from .const import AREAS, DOMAIN, NAME, VERSION
from .hub import ShutterHub

# Features a group can offer when at least one member supports them.
GROUP_FEATURES = (
    CoverEntityFeature.OPEN
    | CoverEntityFeature.CLOSE
    | CoverEntityFeature.STOP
    | CoverEntityFeature.SET_POSITION
    | CoverEntityFeature.OPEN_TILT
    | CoverEntityFeature.CLOSE_TILT
    | CoverEntityFeature.STOP_TILT
    | CoverEntityFeature.SET_TILT_POSITION
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ShutterCaptainConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create a group cover for every area and one for all shutters.

    All groups always exist, so voice assistants and dashboards can rely on them;
    a group without shutters is shown as unavailable until one is assigned.
    """
    hub = entry.runtime_data
    async_add_entities(ShutterGroupCover(hub, area) for area in (*AREAS, "all"))


class ShutterGroupCover(CoverEntity):
    """Controls all Shutter Captain shutters of an area at once.

    Each group is its own device ("Wohnbereich", "Alle Rollläden" …) and the cover
    is that device's main entity, so it carries the plain device name. Voice
    assistants (Alexa, Google, Assist) then find it as "Wohnbereich", and the
    device can be put into a room like any other device.

    Moving a group works like moving the shutters by hand: positions that match
    the configured open/closed/sun heights keep the automation active, any other
    position switches the shutters to manual mode.
    """

    _attr_device_class = CoverDeviceClass.SHUTTER
    _attr_has_entity_name = True
    _attr_name = None
    _attr_should_poll = False

    def __init__(self, hub: ShutterHub, area: str) -> None:
        key = f"group_{area}"
        self.hub = hub
        self.area = area
        self._members = [ctrl.cover_entity for ctrl in hub.members(area)]
        self._attr_unique_id = f"{hub.entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{hub.entry.entry_id}_{key}")},
            translation_key=key,
            manufacturer=NAME,
            model="Rollladen-Gruppe",
            sw_version=VERSION,
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Follow the member covers."""
        self.async_on_remove(
            async_track_state_change_event(self.hass, self._members, self._on_member_change)
        )

    @callback
    def _on_member_change(self, _event: Event[EventStateChangedData]) -> None:
        self.async_write_ha_state()

    # ------------------------------------------------------------ state

    def _states(self) -> list[State]:
        states = (self.hass.states.get(e) for e in self._members)
        return [s for s in states if s is not None and s.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)]

    @property
    def available(self) -> bool:
        """At least one member is reachable."""
        return bool(self._states())

    @property
    def supported_features(self) -> CoverEntityFeature:
        """Union of what the members can do."""
        features = CoverEntityFeature(0)
        for state in self._states():
            features |= CoverEntityFeature(int(state.attributes.get("supported_features", 0)))
        return features & GROUP_FEATURES

    @staticmethod
    def _average(values: list[Any]) -> int | None:
        numbers = [int(v) for v in values if isinstance(v, (int, float))]
        if not numbers:
            return None
        return round(sum(numbers) / len(numbers))

    @property
    def current_cover_position(self) -> int | None:
        """Average position of the members."""
        positions = []
        for state in self._states():
            pos = state.attributes.get("current_position")
            if pos is None and state.state in ("open", "closed"):
                pos = 100 if state.state == "open" else 0
            positions.append(pos)
        return self._average(positions)

    @property
    def current_cover_tilt_position(self) -> int | None:
        """Average slat tilt of the members that have one."""
        return self._average([s.attributes.get("current_tilt_position") for s in self._states()])

    @property
    def is_closed(self) -> bool | None:
        """Closed only when every member is closed."""
        states = self._states()
        if not states:
            return None
        return all(s.state == "closed" for s in states)

    @property
    def is_opening(self) -> bool:
        """Any member opening."""
        return any(s.state == "opening" for s in self._states())

    @property
    def is_closing(self) -> bool:
        """Any member closing."""
        return any(s.state == "closing" for s in self._states())

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Members, like a Home Assistant cover group."""
        return {ATTR_ENTITY_ID: self._members, "area": self.area}

    # --------------------------------------------------------- commands

    async def _call(self, service: str, data: dict[str, Any] | None = None, feature: int = 0) -> None:
        targets = [
            s.entity_id
            for s in self._states()
            if not feature or int(s.attributes.get("supported_features", 0)) & feature
        ]
        # One command per shutter through the hub queue keeps the minimum gap between
        # radio commands (Homematic IP duty cycle) instead of firing all at once.
        for entity_id in targets:
            await self.hub.async_cover_call(service, {ATTR_ENTITY_ID: entity_id, **(data or {})})

    async def async_open_cover(self, **kwargs: Any) -> None:
        """Open all."""
        await self._call("open_cover", feature=CoverEntityFeature.OPEN)

    async def async_close_cover(self, **kwargs: Any) -> None:
        """Close all."""
        await self._call("close_cover", feature=CoverEntityFeature.CLOSE)

    async def async_stop_cover(self, **kwargs: Any) -> None:
        """Stop all."""
        await self._call("stop_cover", feature=CoverEntityFeature.STOP)

    async def async_set_cover_position(self, **kwargs: Any) -> None:
        """Move all to a position."""
        await self._call(
            "set_cover_position",
            {ATTR_POSITION: kwargs[ATTR_POSITION]},
            feature=CoverEntityFeature.SET_POSITION,
        )

    async def async_open_cover_tilt(self, **kwargs: Any) -> None:
        """Open slats."""
        await self._call("open_cover_tilt", feature=CoverEntityFeature.OPEN_TILT)

    async def async_close_cover_tilt(self, **kwargs: Any) -> None:
        """Close slats."""
        await self._call("close_cover_tilt", feature=CoverEntityFeature.CLOSE_TILT)

    async def async_stop_cover_tilt(self, **kwargs: Any) -> None:
        """Stop slats."""
        await self._call("stop_cover_tilt", feature=CoverEntityFeature.STOP_TILT)

    async def async_set_cover_tilt_position(self, **kwargs: Any) -> None:
        """Set slat tilt."""
        await self._call(
            "set_cover_tilt_position",
            {ATTR_TILT_POSITION: kwargs[ATTR_TILT_POSITION]},
            feature=CoverEntityFeature.SET_TILT_POSITION,
        )
