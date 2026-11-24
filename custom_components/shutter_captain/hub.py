"""The hub: global settings, calendar logic, schedules, alarms and group commands."""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from typing import TYPE_CHECKING, Any

from astral import Observer, SunDirection, sun as astral_sun

from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_track_point_in_time,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import logic
from .const import (
    ALARMS,
    AREAS,
    DOMAIN,
    GLOBAL_DEFAULTS,
    HUB_FLAG_DEFAULTS,
    SHUTTER_DEFAULTS,
    SIGNAL_UPDATE,
    STORAGE_VERSION,
    SUBENTRY_SHUTTER,
)
from .shutter import ShutterController, state_is_on, state_number

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

GOLDEN_ELEVATION = 6.0


class ShutterHub:
    """Owns all shutter controllers of one config entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.options: dict[str, Any] = {**GLOBAL_DEFAULTS, **entry.options}
        self.flags: dict[str, bool] = dict(HUB_FLAG_DEFAULTS)
        self.shutters: dict[str, ShutterController] = {}
        self.alarms_active: dict[str, bool] = dict.fromkeys(ALARMS, False)
        self.area_schedule: dict[str, logic.AreaTimes] = {}
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}"
        )
        self._unsubs: list[Callable[[], None]] = []
        self._day_unsubs: list[Callable[[], None]] = []
        self._brightness_since: dict[str, datetime | None] = {"low": None, "high": None}
        self.started = False

    # ------------------------------------------------------------------ setup

    @property
    def signal(self) -> str:
        """Dispatcher signal for entity refreshes."""
        return SIGNAL_UPDATE.format(self.entry.entry_id)

    async def async_setup(self) -> None:
        """Create controllers, restore runtime state and start listeners."""
        stored = await self._store.async_load() or {}
        self.flags.update(
            {k: v for k, v in stored.get("flags", {}).items() if k in self.flags}
        )
        saved_shutters: dict[str, Any] = stored.get("shutters", {})

        for subentry_id, subentry in self.entry.subentries.items():
            if subentry.subentry_type != SUBENTRY_SHUTTER:
                continue
            cfg = {**SHUTTER_DEFAULTS, **subentry.data}
            ctrl = ShutterController(self, subentry_id, subentry.title, cfg)
            ctrl.restore(saved_shutters.get(subentry_id, {}))
            self.shutters[subentry_id] = ctrl

        async def _started(_hass: HomeAssistant) -> None:
            await self._async_start()

        # Runs now if HA is already up, otherwise once it has started; the returned
        # unsubscribe is safe to call even after it fired (unload/reload).
        self._unsubs.append(async_at_started(self.hass, _started))

    async def _async_start(self) -> None:
        self.started = True
        self._read_alarms()
        for ctrl in self.shutters.values():
            ctrl.async_start()
        self._schedule_day()

        self._unsubs.append(
            async_track_time_change(self.hass, self._on_midnight, hour=0, minute=0, second=10)
        )
        self._unsubs.append(
            async_track_time_interval(self.hass, self._on_tick, timedelta(minutes=1))
        )
        alarm_entities = [e for a in ALARMS if (e := self.options.get(f"alarm_{a}_entity"))]
        if alarm_entities:
            self._unsubs.append(
                async_track_state_change_event(self.hass, alarm_entities, self._on_alarm_change)
            )
        watched = [
            e
            for e in (
                self.options.get("vacation_entity"),
                self.options.get("school_holiday_entity"),
                self.options.get("workday_entity"),
                self.options.get("workday_tomorrow_entity"),
            )
            if e
        ]
        if watched:
            self._unsubs.append(
                async_track_state_change_event(self.hass, watched, self._on_calendar_change)
            )
        self.async_update()

    async def async_unload(self) -> None:
        """Stop everything and persist runtime state."""
        for unsub in (*self._unsubs, *self._day_unsubs):
            unsub()
        self._unsubs.clear()
        self._day_unsubs.clear()
        for ctrl in self.shutters.values():
            ctrl.async_stop()
        await self._store.async_save(self._data_to_store())

    def _data_to_store(self) -> dict[str, Any]:
        return {
            "flags": self.flags,
            "shutters": {sid: c.as_store() for sid, c in self.shutters.items()},
        }

    @callback
    def async_save(self) -> None:
        """Debounced persistence of runtime state."""
        self._store.async_delay_save(self._data_to_store, 5)

    @callback
    def async_update(self) -> None:
        """Notify entities and the panel."""
        async_dispatcher_send(self.hass, self.signal)

    # ------------------------------------------------------------- calendar

    def _entity_on(self, key: str) -> bool:
        entity_id = self.options.get(key)
        if not entity_id:
            return False
        return state_is_on(self.hass.states.get(entity_id))

    def _entity_off(self, key: str) -> bool | None:
        """True when the entity is off, None when not configured/unavailable."""
        entity_id = self.options.get(key)
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in ("unknown", "unavailable"):
            return None
        return not state_is_on(state)

    @property
    def vacation(self) -> bool:
        """Vacation/holiday mode active (switch or entity)."""
        return self.flags["vacation"] or self._entity_on("vacation_entity")

    @property
    def school_holiday(self) -> bool:
        """School holidays active (switch or entity)."""
        return self.flags["school_holiday"] or self._entity_on("school_holiday_entity")

    def is_free_day(self, day: date) -> bool:
        """Weekend, public holiday or vacation."""
        if self.vacation:
            return True
        today = dt_util.now().date()
        if day == today and (off := self._entity_off("workday_entity")) is not None:
            return off
        if day == today + timedelta(days=1):
            if (off := self._entity_off("workday_tomorrow_entity")) is not None:
                return off
        return logic.is_weekend(day, self.options.get("saturday_is_workday", False))

    def is_summer(self, day: date | None = None) -> bool:
        """Inside the configured summer period."""
        day = day or dt_util.now().date()
        return logic.in_period(day, self.options["summer_start"], self.options["summer_end"])

    def is_xmas(self, day: date | None = None) -> bool:
        """Inside the configured Christmas period."""
        day = day or dt_util.now().date()
        return logic.in_period(day, self.options["xmas_start"], self.options["xmas_end"])

    def area_auto(self, area: str) -> bool:
        """Area automatic switch."""
        return self.flags.get(f"auto_{area}", True)

    # ----------------------------------------------------------------- astro

    def _observer(self) -> Observer:
        cfg = self.hass.config
        return Observer(latitude=cfg.latitude, longitude=cfg.longitude, elevation=cfg.elevation or 0)

    def sun_position(self, moment: datetime | None = None) -> tuple[float, float]:
        """(azimuth, elevation) in degrees."""
        observer = self._observer()
        moment = moment or dt_util.utcnow()
        return astral_sun.azimuth(observer, moment), astral_sun.elevation(observer, moment)

    def _astro(self, event: str, day: date) -> datetime | None:
        try:
            moment = getattr(astral_sun, event)(self._observer(), day, tzinfo=dt_util.UTC)
        except ValueError:
            return None
        return dt_util.as_local(moment)

    def time_at_elevation(self, elev: float, day: date, rising: bool) -> datetime | None:
        """Local time the sun passes `elev` degrees on `day`."""
        try:
            moment = astral_sun.time_at_elevation(
                self._observer(),
                elev,
                day,
                SunDirection.RISING if rising else SunDirection.SETTING,
                tzinfo=dt_util.UTC,
            )
        except ValueError:
            return None
        return dt_util.as_local(moment)

    def sun_events(self, day: date) -> dict[str, datetime | None]:
        """Sunrise/sunset/golden-hour moments with the global astro offsets."""
        up = self.options["astro_offset_up"]
        down = self.options["astro_offset_down"]
        return {
            "sunrise": logic.with_offset(self._astro("sunrise", day), up),
            "sunset": logic.with_offset(self._astro("sunset", day), down),
            "golden_morning": logic.with_offset(
                self.time_at_elevation(GOLDEN_ELEVATION, day, True), up
            ),
            "golden_evening": logic.with_offset(
                self.time_at_elevation(GOLDEN_ELEVATION, day, False), down
            ),
        }

    def compute_area_times(self, area: str, day: date) -> logic.AreaTimes:
        """Opening/closing of an area on `day`."""
        events = self.sun_events(day)
        free_open = self.is_free_day(day) or (
            self.school_holiday and self.options.get(f"{area}_school_holiday", False)
        )
        free_close = self.is_free_day(day + timedelta(days=1))
        return logic.area_times(
            area=area,
            cfg=self.options,
            day=day,
            tz=dt_util.get_default_time_zone(),
            free_open=free_open,
            free_close=free_close,
            **events,
        )

    # ------------------------------------------------------------ scheduling

    def _schedule_day(self) -> None:
        """(Re)compute today's plan and register timers."""
        for unsub in self._day_unsubs:
            unsub()
        self._day_unsubs.clear()

        today = dt_util.now().date()
        self.area_schedule = {a: self.compute_area_times(a, today) for a in AREAS}
        events = self.sun_events(today)

        # Assign stagger index per (direction, mode) group in configured order.
        groups: dict[tuple[str, str], int] = {}
        for ctrl in self.shutters.values():
            plan = ctrl.plan_day(today, events)
            for direction, moment in (("up", plan.open), ("down", plan.close)):
                if moment is None:
                    continue
                mode = ctrl.cfg["up_mode" if direction == "up" else "down_mode"]
                index = groups.get((direction, mode), 0)
                groups[(direction, mode)] = index + 1
                delay = index * self._stagger_for(mode)
                fire_at = moment + timedelta(seconds=delay)
                if fire_at <= dt_util.now():
                    continue
                self._day_unsubs.append(
                    async_track_point_in_time(
                        self.hass,
                        _bind(ctrl.async_scheduled, direction),
                        fire_at,
                    )
                )

        for key, handler in (
            ("late_close_time", self._on_late_close),
            ("intermediate_close_time", self._on_intermediate_close),
        ):
            t = logic.parse_time(self.options.get(key))
            if t is None:
                continue
            moment = datetime.combine(today, t, tzinfo=dt_util.get_default_time_zone())
            if moment > dt_util.now():
                self._day_unsubs.append(async_track_point_in_time(self.hass, handler, moment))
        self.async_update()

    def _stagger_for(self, mode: str) -> int:
        area = mode.removesuffix("_auto")
        if area in AREAS:
            return int(self.options.get(f"{area}_stagger", 0))
        return int(self.options.get("stagger", 0))

    async def _on_midnight(self, _now: datetime) -> None:
        self._schedule_day()

    async def _on_late_close(self, _now: datetime) -> None:
        for index, ctrl in enumerate(c for c in self.shutters.values() if c.cfg["late_close"]):
            self._later(index * self.options["stagger"], ctrl.async_late_close)

    async def _on_intermediate_close(self, _now: datetime) -> None:
        for index, ctrl in enumerate(c for c in self.shutters.values() if c.in_intermediate):
            self._later(index * self.options["stagger"], ctrl.async_full_close)

    def _later(self, seconds: float, job: Callable[[], Any]) -> None:
        if seconds <= 0:
            self.hass.async_create_task(job())
            return

        async def _run(_now: datetime) -> None:
            await job()

        self._day_unsubs.append(
            async_track_point_in_time(
                self.hass, _run, dt_util.now() + timedelta(seconds=seconds)
            )
        )

    async def _on_tick(self, now: datetime) -> None:
        """Every minute: sun protection and brightness control."""
        self._check_brightness(now)
        for ctrl in self.shutters.values():
            await ctrl.async_evaluate_sun()

    @callback
    def _on_calendar_change(self, _event: Event[EventStateChangedData]) -> None:
        self._schedule_day()

    # ------------------------------------------------------------ brightness

    def brightness(self) -> float | None:
        """Current value of the global brightness sensor."""
        entity_id = self.options.get("brightness_entity")
        if not entity_id:
            return None
        return state_number(self.hass.states.get(entity_id))

    def _check_brightness(self, now: datetime) -> None:
        value = self.brightness()
        if value is None:
            return
        delay = timedelta(minutes=self.options["brightness_delay"])
        _, elevation = self.sun_position()
        morning = dt_util.now().hour < 12

        for kind, condition in (
            ("low", value <= self.options["brightness_close"]),
            ("high", value >= self.options["brightness_open"]),
        ):
            if not condition:
                self._brightness_since[kind] = None
                continue
            since = self._brightness_since[kind] or now
            self._brightness_since[kind] = since
            if now - since < delay:
                continue
            # Darkness only closes in the evening, brightness only opens in the morning,
            # so a passing storm cloud at noon does not close everything.
            if kind == "low" and not morning:
                self._run_brightness("down")
            elif kind == "high" and morning and elevation > -6:
                self._run_brightness("up")

    def _run_brightness(self, direction: str) -> None:
        mode_key = "up_mode" if direction == "up" else "down_mode"
        targets = [c for c in self.shutters.values() if c.cfg[mode_key] == "brightness"]
        for index, ctrl in enumerate(targets):
            if ctrl.brightness_done(direction):
                continue
            self._later(index * self.options["stagger"], _bind_async(ctrl.async_scheduled, direction))

    # ---------------------------------------------------------------- alarms

    def _alarm_state(self, alarm: str) -> bool:
        return self._entity_on(f"alarm_{alarm}_entity")

    def _read_alarms(self) -> None:
        for alarm in ALARMS:
            self.alarms_active[alarm] = self._alarm_state(alarm)

    @callback
    def _on_alarm_change(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        for alarm in ALARMS:
            if self.options.get(f"alarm_{alarm}_entity") != entity_id:
                continue
            new = self._alarm_state(alarm)
            if new == self.alarms_active[alarm]:
                continue
            self.alarms_active[alarm] = new
            _LOGGER.info("Alarm %s %s", alarm, "active" if new else "cleared")
            for ctrl in self.shutters.values():
                self.hass.async_create_task(ctrl.async_alarm_changed(alarm, new))
        self.async_update()

    def alarm_level(self, alarm: str) -> int:
        """Configured target level for an alarm."""
        return int(self.options[f"alarm_{alarm}_level"])

    # -------------------------------------------------------- group commands

    def members(self, area: str) -> list[ShutterController]:
        """Shutters of an area ('all' for every shutter)."""
        if area == "all":
            return list(self.shutters.values())
        return [c for c in self.shutters.values() if c.belongs_to(area)]

    async def async_command(self, action: str, area: str = "all") -> None:
        """open | close | sun_protect | auto for an area."""
        targets = [c for c in self.members(area) if not c.manual_only or action == "auto"]
        stagger = self._stagger_for(area) if area in AREAS else self.options["stagger"]
        for index, ctrl in enumerate(targets):
            self._later(index * stagger, _bind_async(ctrl.async_command, action))

    async def async_set_flag(self, flag: str, value: bool) -> None:
        """Hub switches."""
        self.flags[flag] = value
        self.async_save()
        if flag in ("vacation", "school_holiday"):
            self._schedule_day()
        self.async_update()

    # ----------------------------------------------------------------- info

    def next_area_event(self, area: str, direction: str) -> datetime | None:
        """Today's (or tomorrow's) open/close moment of an area."""
        now = dt_util.now()
        today = self.area_schedule.get(area)
        if today is None:
            return None
        moment = today.open if direction == "up" else today.close
        if moment and moment > now:
            return moment
        tomorrow = self.compute_area_times(area, now.date() + timedelta(days=1))
        return tomorrow.open if direction == "up" else tomorrow.close

    def summary(self) -> dict[str, Any]:
        """Hub info for the status sensor and the panel."""
        azimuth, elevation = self.sun_position()
        today = dt_util.now().date()
        return {
            "free_day": self.is_free_day(today),
            "free_tomorrow": self.is_free_day(today + timedelta(days=1)),
            "vacation": self.vacation,
            "school_holiday": self.school_holiday,
            "summer": self.is_summer(),
            "xmas": self.is_xmas(),
            "sun_azimuth": round(azimuth, 1),
            "sun_elevation": round(elevation, 1),
            "alarms": [a for a, on in self.alarms_active.items() if on],
            "areas": {
                area: {
                    "open": _iso(self.next_area_event(area, "up")),
                    "close": _iso(self.next_area_event(area, "down")),
                    "auto": self.area_auto(area),
                }
                for area in AREAS
            },
            "shutter_count": len(self.shutters),
        }


def _iso(moment: datetime | None) -> str | None:
    return moment.isoformat() if moment else None


def _bind(func: Callable[[str], Any], arg: str) -> Callable[[datetime], Any]:
    """Wrap an async `func(arg)` as a point-in-time callback."""

    async def _run(_now: datetime) -> None:
        await func(arg)

    return _run


def _bind_async(func: Callable[[str], Any], arg: str) -> Callable[[], Any]:
    def _job():
        return func(arg)

    return _job
