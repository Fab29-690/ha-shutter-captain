"""Controller for a single shutter: automation, window logic, sun protection, alarms."""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.cover import CoverEntityFeature
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import Event, EventStateChangedData, State, callback
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_state_change_event,
)
from homeassistant.util import dt as dt_util

from . import logic
from .const import (
    ALARM_PRIORITY,
    AREAS,
    STATE_DOWN,
    STATE_HEAT,
    STATE_INTERMEDIATE,
    STATE_LOCKED,
    STATE_MANUAL,
    STATE_NONE,
    STATE_PAUSED,
    STATE_SUN,
    STATE_TRIGGERED,
    STATE_UP,
)

if TYPE_CHECKING:
    from .hub import ShutterHub

_LOGGER = logging.getLogger(__name__)

ON_STATES = {"on", "open", "opened", "true", "1", "tilted", "tilt", "gekippt", "offen"}
TILT_STATES = {"tilted", "tilt", "gekippt"}
DAY_STATES = (STATE_UP, STATE_SUN, STATE_HEAT)


def state_is_on(state: State | None) -> bool:
    """Generic truthiness of an entity state."""
    if state is None:
        return False
    return str(state.state).lower() in ON_STATES


def state_number(state: State | None) -> float | None:
    """Numeric value of a sensor, weather or climate entity."""
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None
    if state.domain == "weather":
        value = state.attributes.get("temperature")
    elif state.domain == "climate":
        value = state.attributes.get("current_temperature")
    else:
        value = state.state
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


class ShutterController:
    """Everything one shutter does on its own."""

    def __init__(self, hub: ShutterHub, subentry_id: str, title: str, cfg: dict[str, Any]) -> None:
        self.hub = hub
        self.hass = hub.hass
        self.subentry_id = subentry_id
        self.cfg = cfg
        self.cover_entity: str = cfg["cover_entity"]
        self.name: str = cfg.get("name") or title

        # automation switches
        self.auto_up = True
        self.auto_down = True
        self.auto_sun = True

        # runtime state
        self.state = STATE_NONE
        self.reason = "start"
        self.desired_state: str | None = None
        self.desired_level: int | None = None
        self.desired_tilt: int | None = None
        self.manual = False
        self.manual_until: datetime | None = None
        self.paused = False
        self.fire_latched = False
        self.alarm: str | None = None
        self.pending = False
        self.last_move: datetime | None = None
        self.plan_today = logic.AreaTimes(None, None)
        self.plan_tomorrow = logic.AreaTimes(None, None)

        self._expected: int | None = None
        self._command_until: datetime | None = None
        self._pending_tilt: int | None = None
        self._sun_flags: dict[str, bool] = {"out_temp": False, "in_temp": False, "light": False}
        self._sun_end_since: datetime | None = None
        self._sun_checks: dict[str, Any] = {}
        self._last_window = "closed"
        self._brightness_day: dict[str, date] = {}
        self._unsubs: list[Callable[[], None]] = []
        self._window_timer: Callable[[], None] | None = None
        self._vent_timer: Callable[[], None] | None = None

    # ---------------------------------------------------------- persistence

    def restore(self, data: dict[str, Any]) -> None:
        """Restore runtime state saved before a restart/reload."""
        if not data:
            return
        self.auto_up = data.get("auto_up", True)
        self.auto_down = data.get("auto_down", True)
        self.auto_sun = data.get("auto_sun", True)
        self.manual = data.get("manual", False)
        self.paused = data.get("paused", False)
        self.manual_until = _parse_dt(data.get("manual_until"))
        self.fire_latched = data.get("fire_latched", False)
        self.desired_state = data.get("desired_state")
        self.desired_level = data.get("desired_level")
        self.desired_tilt = data.get("desired_tilt")
        self.state = data.get("state", STATE_NONE)
        self.last_move = _parse_dt(data.get("last_move"))
        self._expected = data.get("expected")

    def as_store(self) -> dict[str, Any]:
        """Data for the hub's Store."""
        return {
            "auto_up": self.auto_up,
            "auto_down": self.auto_down,
            "auto_sun": self.auto_sun,
            "manual": self.manual,
            "paused": self.paused,
            "manual_until": _iso(self.manual_until),
            "fire_latched": self.fire_latched,
            "desired_state": self.desired_state,
            "desired_level": self.desired_level,
            "desired_tilt": self.desired_tilt,
            "state": self.state,
            "last_move": _iso(self.last_move),
            "expected": self._expected,
        }

    def _changed(self) -> None:
        self.hub.async_save()
        self.hub.async_update()

    # ---------------------------------------------------------------- start

    @callback
    def async_start(self) -> None:
        """Begin listening once Home Assistant runs."""
        self._unsubs.append(
            async_track_state_change_event(self.hass, [self.cover_entity], self._on_cover_change)
        )
        window_entities = [e for e in (self.cfg.get("window_entity"), self.cfg.get("tilt_entity")) if e]
        if window_entities:
            self._unsubs.append(
                async_track_state_change_event(self.hass, window_entities, self._on_window_change)
            )
        self._last_window = self.window_state()

        active = {a for a in ALARM_PRIORITY if self.hub.alarms_active[a] and self._alarm_enabled(a)}
        self.alarm = next((a for a in ALARM_PRIORITY if a in active), None)

        if self.desired_state is None:
            self._infer_desired()
        position = self.position
        if self._expected is None:
            self._expected = position
        # Window open and shutter not where the automation wants it: show why.
        if (
            self._last_window != "closed"
            and position is not None
            and self.desired_level is not None
            and abs(position - int(self.desired_level)) > self._tolerance()
            and not logic.move_allowed(self.cfg["lockout"], position, int(self.desired_level), True)
        ):
            self.pending = True
            self.state = STATE_LOCKED
            self.reason = "window_lockout"

    def _infer_desired(self) -> None:
        """Guess where the automation would be right now (no movement)."""
        today = dt_util.now().date()
        events = self.hub.sun_events(today)
        self.plan_day(today, events)
        now = dt_util.now()
        opened, closed = self.plan_today.open, self.plan_today.close
        if opened and closed and opened <= now < closed:
            self.desired_state, self.desired_level = STATE_UP, self.cfg["open_level"]
        else:
            self.desired_level, self.desired_state = self._close_target()
        self.state = self.desired_state

    @callback
    def async_stop(self) -> None:
        """Cancel listeners and timers."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._cancel_window_timer()
        self._cancel_vent_timer()

    # ---------------------------------------------------------------- facts

    @property
    def position(self) -> int | None:
        """Current cover position (0 = closed, 100 = open)."""
        state = self.hass.states.get(self.cover_entity)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        pos = state.attributes.get("current_position")
        if pos is not None:
            try:
                return int(pos)
            except (TypeError, ValueError):
                return None
        if state.state == "open":
            return 100
        if state.state == "closed":
            return 0
        return None

    @property
    def tilt(self) -> int | None:
        """Current slat tilt, if the cover has one."""
        state = self.hass.states.get(self.cover_entity)
        if state is None:
            return None
        return state.attributes.get("current_tilt_position")

    def window_state(self) -> str:
        """closed | open | tilted."""
        tilt_entity = self.cfg.get("tilt_entity")
        if tilt_entity and state_is_on(self.hass.states.get(tilt_entity)):
            return "tilted"
        window_entity = self.cfg.get("window_entity")
        if window_entity:
            state = self.hass.states.get(window_entity)
            if state is not None and str(state.state).lower() in TILT_STATES:
                return "tilted"
            if state_is_on(state):
                return "open"
        return "closed"

    @property
    def manual_only(self) -> bool:
        """'manual' mode: group commands never move it."""
        return "manual" in (self.cfg["up_mode"], self.cfg["down_mode"])

    @property
    def in_intermediate(self) -> bool:
        """Currently parked in the intermediate position."""
        return self.desired_state == STATE_INTERMEDIATE

    def belongs_to(self, area: str) -> bool:
        """Shutter uses the time profile of `area`."""
        return any(
            self.cfg[k].removesuffix("_auto") == area for k in ("up_mode", "down_mode")
        )

    def area(self) -> str | None:
        """Main area (for grouping in the panel)."""
        for key in ("down_mode", "up_mode"):
            area = self.cfg[key].removesuffix("_auto")
            if area in AREAS:
                return area
        return None

    def _alarm_enabled(self, alarm: str) -> bool:
        return bool(self.cfg.get(f"alarm_{alarm}"))

    def _tolerance(self) -> int:
        return int(self.hub.options["position_tolerance"])

    def _close_target(self) -> tuple[int, str]:
        """Level and state for an automatic close, honouring season and frost."""
        if self.cfg["intermediate"]:
            level, state = int(self.cfg["intermediate_level"]), STATE_INTERMEDIATE
        elif self.cfg["xmas"] and self.hub.is_xmas():
            level, state = int(self.cfg["xmas_level"]), STATE_DOWN
        else:
            level, state = int(self.cfg["close_level"]), STATE_DOWN
        if self._alarm_enabled("frost") and self.hub.alarms_active["frost"]:
            level = self.hub.alarm_level("frost")
        return level, state

    # ------------------------------------------------------------- planning

    def _moment(self, direction: str, day: date, events: dict[str, datetime | None]) -> datetime | None:
        mode = self.cfg["up_mode" if direction == "up" else "down_mode"]
        area = mode.removesuffix("_auto")
        up = direction == "up"
        if area in AREAS:
            today = dt_util.now().date()
            times = self.hub.area_schedule.get(area) if day == today else None
            if times is None:
                times = self.hub.compute_area_times(area, day)
            return times.open if up else times.close
        if mode == "sun":
            return events["sunrise" if up else "sunset"]
        if mode == "golden_hour":
            return events["golden_morning" if up else "golden_evening"]
        if mode == "elevation":
            return self.hub.time_at_elevation(float(self.cfg["elevation"]), day, up)
        return None

    def plan_day(self, day: date, events: dict[str, datetime | None]) -> logic.AreaTimes:
        """Today's open/close moment (also caches tomorrow for display)."""
        self.plan_today = logic.AreaTimes(
            self._moment("up", day, events), self._moment("down", day, events)
        )
        tomorrow = day + timedelta(days=1)
        tomorrow_events = self.hub.sun_events(tomorrow)
        self.plan_tomorrow = logic.AreaTimes(
            self._moment("up", tomorrow, tomorrow_events),
            self._moment("down", tomorrow, tomorrow_events),
        )
        return self.plan_today

    def next_event(self, direction: str) -> datetime | None:
        """Next scheduled open/close."""
        now = dt_util.now()
        today = self.plan_today.open if direction == "up" else self.plan_today.close
        if today and today > now:
            return today
        return self.plan_tomorrow.open if direction == "up" else self.plan_tomorrow.close

    def brightness_done(self, direction: str) -> bool:
        """Brightness already triggered this direction today."""
        return self._brightness_day.get(direction) == dt_util.now().date()

    # ----------------------------------------------------- scheduled events

    async def async_scheduled(self, direction: str) -> None:
        """Called by the hub at the planned time."""
        mode = self.cfg["up_mode" if direction == "up" else "down_mode"]
        if mode == "brightness":
            self._brightness_day[direction] = dt_util.now().date()
        if mode.endswith("_auto") and not self.hub.area_auto(mode.removesuffix("_auto")):
            self._set_reason(f"area_auto_off_{direction}")
            return
        if direction == "up":
            await self.async_auto_open()
        else:
            await self.async_auto_close()

    async def async_auto_open(self) -> None:
        """Automatic opening in the morning."""
        if not self.auto_up:
            self._set_reason("auto_up_off")
            return
        min_minutes = int(self.hub.options["min_minutes_since_move"])
        if (
            min_minutes
            and self.last_move
            and dt_util.utcnow() - self.last_move < timedelta(minutes=min_minutes)
        ):
            self._set_reason("recently_moved")
            return
        self._event_releases_manual()
        await self._apply(int(self.cfg["open_level"]), STATE_UP, reason="scheduled_open")
        await self.async_evaluate_sun()

    async def async_auto_close(self) -> None:
        """Automatic closing in the evening."""
        if not self.auto_down:
            self._set_reason("auto_down_off")
            return
        if self.cfg["summer_no_close"] and self.hub.is_summer():
            self._set_reason("summer_no_close")
            return
        self._event_releases_manual()
        level, state = self._close_target()
        await self._apply(level, state, vent=self.cfg["vent_on_close"], reason="scheduled_close")

    async def async_late_close(self) -> None:
        """Late close ignores the lockout protection (as documented)."""
        if not self.auto_down:
            return
        self._event_releases_manual()
        await self._apply(
            int(self.cfg["close_level"]), STATE_DOWN, ignore_lockout=True, reason="late_close"
        )

    async def async_full_close(self) -> None:
        """Intermediate position -> fully closed."""
        if self.desired_state != STATE_INTERMEDIATE:
            return
        await self._apply(
            int(self.cfg["close_level"]),
            STATE_DOWN,
            vent=self.cfg["vent_on_close"],
            reason="intermediate_close",
        )

    def _event_releases_manual(self) -> None:
        if self.manual and not self.paused and self.hub.options["manual_reset"] == "next_event":
            self.manual = False
            self.manual_until = None

    # -------------------------------------------------------------- commands

    async def async_command(self, action: str) -> None:
        """Group/panel command: open | close | sun_protect | auto."""
        if action == "auto":
            await self.async_resume()
            return
        self.manual = False
        self.paused = False
        self.manual_until = None
        self.fire_latched = False
        if action == "open":
            await self._apply(int(self.cfg["open_level"]), STATE_UP, reason="command_open")
        elif action == "close":
            level, state = self._close_target()
            await self._apply(level, state, reason="command_close")
        elif action == "sun_protect":
            await self._apply(
                int(self.cfg["sun_level"]), STATE_SUN, tilt=self._sun_tilt(), reason="command_sun"
            )

    async def async_resume(self) -> None:
        """Leave manual/pause mode and return to what the automation wants."""
        self.manual = False
        self.paused = False
        self.manual_until = None
        if self.desired_state is None:
            self._infer_desired()
        await self._apply(
            int(self.desired_level if self.desired_level is not None else self.cfg["open_level"]),
            self.desired_state or STATE_UP,
            tilt=self.desired_tilt,
            reason="resumed",
        )
        await self.async_evaluate_sun()

    async def async_pause(self, minutes: int | None) -> None:
        """Hold the shutter where it is (minutes=None: until resumed)."""
        self.manual = True
        self.paused = True
        self.manual_until = (
            dt_util.utcnow() + timedelta(minutes=minutes) if minutes else None
        )
        self.state = STATE_PAUSED
        self._set_reason("paused")

    def set_auto(self, kind: str, value: bool) -> None:
        """Per-shutter automation switch."""
        setattr(self, f"auto_{kind}", value)
        self._changed()
        if kind == "sun":
            self.hass.async_create_task(self.async_evaluate_sun())

    # ------------------------------------------------------------- applying

    def _manual_active(self) -> bool:
        if self.manual and self.manual_until and dt_util.utcnow() >= self.manual_until:
            return False
        return self.manual

    async def _check_manual_expiry(self) -> None:
        if self.manual and self.manual_until and dt_util.utcnow() >= self.manual_until:
            await self.async_resume()

    def _set_reason(self, reason: str) -> None:
        self.reason = reason
        self._changed()

    async def _apply(
        self,
        level: int,
        state: str,
        *,
        tilt: int | None = None,
        ignore_lockout: bool = False,
        vent: bool = False,
        reason: str = "",
    ) -> None:
        """Remember the automation target and drive there if nothing blocks it."""
        self.desired_level = level
        self.desired_state = state
        self.desired_tilt = tilt
        self.reason = reason or self.reason

        if self.fire_latched or self.alarm:
            self._set_reason(f"blocked_alarm_{'fire' if self.fire_latched else self.alarm}")
            return
        if self._manual_active():
            self._set_reason("blocked_manual")
            return
        current = self.position
        if current is None:
            self._set_reason("cover_unavailable")
            return

        window = self.window_state()
        if window != "closed" and not ignore_lockout:
            if not logic.move_allowed(self.cfg["lockout"], current, level, True):
                self.pending = True
                self.state = STATE_LOCKED
                self._set_reason("window_lockout")
                return
            if vent and level < current:
                vent_level = int(
                    self.cfg["window_tilt_level"] if window == "tilted" else self.cfg["window_open_level"]
                )
                if level < vent_level:
                    await self._move(level, tilt)
                    self.state = state
                    self.pending = True
                    self._schedule_vent(vent_level)
                    self._changed()
                    return

        self.pending = False
        await self._move(level, tilt)
        self.state = state
        self._changed()

    def _schedule_vent(self, vent_level: int) -> None:
        """After a full close with open window, go back up to the vent level."""
        self._cancel_vent_timer()

        async def _vent(_now: datetime) -> None:
            self._vent_timer = None
            if self.window_state() == "closed" or self.alarm or self.fire_latched:
                return
            await self._move(vent_level)
            self.state = STATE_TRIGGERED
            self._set_reason("vent_position")

        self._vent_timer = async_track_point_in_time(
            self.hass, _vent, dt_util.utcnow() + timedelta(seconds=self.hub.options["wait_time"])
        )

    async def _move(self, level: int, tilt: int | None = None, *, force: bool = False) -> None:
        """Send the actual cover command."""
        state = self.hass.states.get(self.cover_entity)
        if state is None:
            return
        features = int(state.attributes.get("supported_features", 0))
        current = self.position
        self._expected = level
        self._command_until = dt_util.utcnow() + timedelta(seconds=self.hub.options["wait_time"])
        self._pending_tilt = tilt if tilt is not None and tilt >= 0 else None

        if not force and current is not None and abs(current - level) <= self._tolerance():
            await self._send_tilt()
            return
        self.last_move = dt_util.utcnow()
        if features & CoverEntityFeature.SET_POSITION:
            await self.hass.services.async_call(
                "cover",
                "set_cover_position",
                {"entity_id": self.cover_entity, "position": level},
                blocking=False,
            )
        else:
            service = "open_cover" if level >= 50 else "close_cover"
            await self.hass.services.async_call(
                "cover", service, {"entity_id": self.cover_entity}, blocking=False
            )
        _LOGGER.debug("%s -> %s%%", self.name, level)

    async def _send_tilt(self) -> None:
        tilt = self._pending_tilt
        if tilt is None:
            return
        state = self.hass.states.get(self.cover_entity)
        if state is None:
            return
        features = int(state.attributes.get("supported_features", 0))
        self._pending_tilt = None
        if features & CoverEntityFeature.SET_TILT_POSITION:
            await self.hass.services.async_call(
                "cover",
                "set_cover_tilt_position",
                {"entity_id": self.cover_entity, "tilt_position": tilt},
                blocking=False,
            )

    def _sun_tilt(self) -> int | None:
        tilt = int(self.cfg.get("sun_tilt", -1))
        return tilt if tilt >= 0 else None

    # ------------------------------------------------------- cover changes

    @callback
    def _on_cover_change(self, event: Event[EventStateChangedData]) -> None:
        new = event.data["new_state"]
        if new is None or new.state in ("opening", "closing"):
            return
        if self._pending_tilt is not None:
            self.hass.async_create_task(self._send_tilt())
        pos = self.position
        if pos is None:
            return
        old = event.data["old_state"]
        old_pos = old.attributes.get("current_position") if old else None
        if self._command_until and dt_util.utcnow() < self._command_until:
            # Our own movement is still running.
            self.hub.async_update()
            return
        tol = self._tolerance()
        if self._expected is not None and abs(pos - self._expected) <= tol:
            self.hub.async_update()
            return
        if old_pos is not None and int(old_pos) == pos:
            return

        self._expected = pos
        step = int(self.hub.options["manual_round"])
        known = {
            STATE_UP: int(self.cfg["open_level"]),
            STATE_DOWN: int(self.cfg["close_level"]),
            STATE_SUN: int(self.cfg["sun_level"]),
        }
        for state_name, level in known.items():
            if logic.is_known_level(pos, [level], step, tol):
                # Moved by hand to a configured height: automation stays active.
                self.state = state_name
                self._set_reason("moved_to_known_level")
                return

        self.manual = True
        self.paused = False
        reset = self.hub.options["manual_reset"]
        self.manual_until = (
            dt_util.utcnow() + timedelta(minutes=int(self.hub.options["manual_timeout"]))
            if reset == "timeout"
            else None
        )
        self.state = STATE_MANUAL
        self._set_reason("manual_move")

    # ------------------------------------------------------- window changes

    @callback
    def _on_window_change(self, _event: Event[EventStateChangedData]) -> None:
        window = self.window_state()
        if window == self._last_window:
            return
        self._last_window = window
        self._cancel_window_timer()
        if window == "closed":
            self._cancel_vent_timer()
            delay = int(self.cfg["window_close_delay"])

            async def job() -> None:
                await self._window_closed()
        else:
            delay = int(self.cfg["window_open_delay"])

            async def job() -> None:
                await self._window_opened(window)

        if delay <= 0:
            self.hass.async_create_task(job())
            return

        async def _later(_now: datetime) -> None:
            self._window_timer = None
            await job()

        self._window_timer = async_track_point_in_time(
            self.hass, _later, dt_util.utcnow() + timedelta(seconds=delay)
        )
        self.hub.async_update()

    async def _window_opened(self, window: str) -> None:
        if self.alarm or self.fire_latched or self._manual_active():
            self.hub.async_update()
            return
        if self.cfg["window_action"] not in ("open", "open_close"):
            self.hub.async_update()
            return
        level = int(
            self.cfg["window_tilt_level"] if window == "tilted" else self.cfg["window_open_level"]
        )
        current = self.position
        if current is not None and current < level - self._tolerance():
            await self._move(level)
            self.state = STATE_TRIGGERED
            self.pending = True
            self._set_reason(f"window_{window}")
        else:
            self.hub.async_update()

    async def _window_closed(self) -> None:
        if self.alarm or self.fire_latched or self._manual_active():
            self.hub.async_update()
            return
        restore = (
            self.pending
            or self.cfg["window_action"] in ("close", "open_close")
            or (self.cfg["drive_after_close"] and self.cfg["lockout"] != "off")
        )
        if restore and self.desired_level is not None and self.desired_state:
            await self._apply(
                int(self.desired_level),
                self.desired_state,
                tilt=self.desired_tilt,
                reason="window_closed",
            )
        else:
            self.hub.async_update()

    def _cancel_window_timer(self) -> None:
        if self._window_timer:
            self._window_timer()
            self._window_timer = None

    def _cancel_vent_timer(self) -> None:
        if self._vent_timer:
            self._vent_timer()
            self._vent_timer = None

    # ------------------------------------------------------- sun protection

    def _sun_wanted(self) -> tuple[bool, bool]:
        """(shading wanted, heat protection wanted)."""
        azimuth, elevation = self.hub.sun_position()
        cfg = self.cfg
        out_value = _number(self.hass, cfg.get("out_temp_entity"))
        in_value = _number(self.hass, cfg.get("in_temp_entity"))
        light_value = _number(self.hass, cfg.get("light_entity"))

        sun_up = elevation >= float(self.hub.options["sun_end_elevation"])
        checks: dict[str, bool | None] = {
            "azimuth": sun_up and logic.azimuth_in_range(azimuth, cfg["azimuth"], cfg["azimuth_range"]),
        }
        for key, value in (("out_temp", out_value), ("in_temp", in_value)):
            if value is None:
                checks[key] = None
                self._sun_flags[key] = False
                continue
            self._sun_flags[key] = logic.hysteresis(
                self._sun_flags[key], value, float(cfg[f"{key}_setpoint"]), float(cfg[f"{key}_hyst"])
            )
            checks[key] = self._sun_flags[key]

        light: bool | None = None
        # An unavailable light sensor must not block shading – it is optional.
        if cfg.get("light_entity") and light_value is not None:
            self._sun_flags["light"] = logic.hysteresis(
                self._sun_flags["light"], light_value, float(cfg["light_setpoint"]), float(cfg["light_hyst"])
            )
            light = self._sun_flags["light"]

        wanted = sun_up and logic.sun_protection_wanted(cfg["sun_mode"], checks, light)
        heat_source = out_value if out_value is not None else in_value
        heat = bool(
            cfg["heat_protection"]
            and sun_up
            and heat_source is not None
            and heat_source >= float(cfg["heat_temp"])
        )
        self._sun_checks = {
            "sun_up": sun_up,
            "azimuth": checks["azimuth"],
            "out_temp": checks.get("out_temp"),
            "in_temp": checks.get("in_temp"),
            "light": light,
            "out_value": out_value,
            "in_value": in_value,
            "light_value": light_value,
        }
        return wanted, heat

    async def async_evaluate_sun(self) -> None:
        """Start/stop shading. Runs every minute and after every open."""
        await self._check_manual_expiry()
        if self.alarm or self.fire_latched or self._manual_active():
            return
        if self.desired_state not in DAY_STATES:
            return
        if self.cfg["sun_mode"] == "off" and not self.cfg["heat_protection"]:
            if self.desired_state in (STATE_SUN, STATE_HEAT):
                await self._apply(int(self.cfg["open_level"]), STATE_UP, reason="sun_disabled")
            return

        wanted, heat = self._sun_wanted()
        if not self.auto_sun:
            wanted = heat = False

        if heat:
            target_state, level, tilt = STATE_HEAT, int(self.cfg["close_level"]), None
        elif wanted:
            target_state, level, tilt = STATE_SUN, int(self.cfg["sun_level"]), self._sun_tilt()
        else:
            target_state, level, tilt = STATE_UP, int(self.cfg["open_level"]), None

        if target_state == self.desired_state:
            self._sun_end_since = None
            self.hub.async_update()
            return

        if target_state == STATE_UP and self.desired_state in (STATE_SUN, STATE_HEAT) and self.auto_sun:
            if self.cfg["keep_sun"]:
                return
            delay = int(self.cfg["sun_end_delay"])
            if delay:
                now = dt_util.utcnow()
                self._sun_end_since = self._sun_end_since or now
                if now - self._sun_end_since < timedelta(minutes=delay):
                    self.hub.async_update()
                    return
        self._sun_end_since = None
        await self._apply(level, target_state, tilt=tilt, reason=f"sun_{target_state}")

    async def async_alarm_changed(self, alarm: str, active: bool) -> None:
        """React to a global alarm."""
        if not self._alarm_enabled(alarm):
            return
        if alarm == "fire":
            if active:
                self.fire_latched = True
                await self._move(self.hub.alarm_level("fire"), force=True)
                self.state = "fire"
                self._set_reason("alarm_fire")
            else:
                # Stays latched until 'open all' / 'close all' (escape routes!).
                self._set_reason("fire_cleared_waiting")
            return

        if alarm == "frost":
            if self.alarm or self.fire_latched or self._manual_active():
                return
            if active and self.desired_state in (STATE_DOWN, STATE_INTERMEDIATE):
                await self._move(self.hub.alarm_level("frost"))
                self.state = "frost"
                self._set_reason("alarm_frost")
            elif not active and self.state == "frost":
                level, state = self._close_target()
                await self._apply(level, state, reason="frost_cleared")
            return

        active_set = {
            a for a in ALARM_PRIORITY if self.hub.alarms_active[a] and self._alarm_enabled(a)
        }
        new = logic.next_alarm(self.alarm, active_set, alarm, active, ALARM_PRIORITY)
        if new == self.alarm and not active:
            return
        self.alarm = new
        if self.fire_latched:
            self._changed()
            return
        if new:
            await self._move(self.hub.alarm_level(new), force=True)
            self.state = new
            self._set_reason(f"alarm_{new}")
        elif self.desired_level is not None and self.desired_state:
            await self._apply(
                int(self.desired_level), self.desired_state, tilt=self.desired_tilt, reason="alarm_cleared"
            )

    # ------------------------------------------------------------------ info

    def info(self) -> dict[str, Any]:
        """Attributes for the status sensor and the panel."""
        manual_until = self.manual_until if self._manual_active() else None
        return {
            "shutter_pilot": "shutter",
            "entry_id": self.hub.entry.entry_id,
            "subentry_id": self.subentry_id,
            "name": self.name,
            "cover_entity": self.cover_entity,
            "position": self.position,
            "tilt": self.tilt,
            "area": self.area(),
            "up_mode": self.cfg["up_mode"],
            "down_mode": self.cfg["down_mode"],
            "sun_mode": self.cfg["sun_mode"],
            "desired_state": self.desired_state,
            "desired_level": self.desired_level,
            "reason": self.reason,
            "manual": self._manual_active(),
            "paused": self.paused and self._manual_active(),
            "manual_until": _iso(manual_until),
            "alarm": "fire" if self.fire_latched else self.alarm,
            "window": self.window_state(),
            "pending": self.pending,
            "auto_up": self.auto_up,
            "auto_down": self.auto_down,
            "auto_sun": self.auto_sun,
            "next_open": _iso(self.next_event("up")),
            "next_close": _iso(self.next_event("down")),
            "last_move": _iso(self.last_move),
            "window_azimuth": self.cfg["azimuth"],
            "azimuth_range": self.cfg["azimuth_range"],
            "open_level": self.cfg["open_level"],
            "close_level": self.cfg["close_level"],
            "sun_level": self.cfg["sun_level"],
            "sun_checks": self._sun_checks,
        }


def _number(hass, entity_id: str | None) -> float | None:
    if not entity_id:
        return None
    return state_number(hass.states.get(entity_id))


def _iso(moment: datetime | None) -> str | None:
    return moment.isoformat() if moment else None


def _parse_dt(value: Any) -> datetime | None:
    if not value:
        return None
    return dt_util.parse_datetime(value)
