"""Pure decision logic. No Home Assistant imports, so it is unit-testable."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
import hashlib
from typing import Any

# --- parsing ---------------------------------------------------------------


def parse_time(value: Any) -> time | None:
    """Parse 'HH:MM' or 'HH:MM:SS'."""
    if isinstance(value, time):
        return value
    if not value or not isinstance(value, str):
        return None
    parts = value.strip().split(":")
    try:
        hour, minute = int(parts[0]), int(parts[1])
        second = int(parts[2]) if len(parts) > 2 else 0
        return time(hour, minute, second)
    except (ValueError, IndexError):
        return None


def parse_day_month(value: Any) -> tuple[int, int] | None:
    """Parse 'DD.MM.' / 'DD.MM' / 'MM-DD' into (month, day)."""
    if not value or not isinstance(value, str):
        return None
    text = value.strip().rstrip(".")
    try:
        if "-" in text:
            month, day = (int(x) for x in text.split("-")[-2:])
        else:
            day, month = (int(x) for x in text.split(".")[:2])
    except ValueError:
        return None
    if not (1 <= month <= 12 and 1 <= day <= 31):
        return None
    return month, day


def valid_day_month(value: Any) -> bool:
    """True when a day/month text parses."""
    return parse_day_month(value) is not None


def in_period(day: date, start: Any, end: Any) -> bool:
    """True if `day` lies in the yearly period start..end (inclusive, may wrap)."""
    s, e = parse_day_month(start), parse_day_month(end)
    if s is None or e is None:
        return False
    current = (day.month, day.day)
    if s <= e:
        return s <= current <= e
    return current >= s or current <= e


# --- days --------------------------------------------------------------------


def is_weekend(day: date, saturday_is_workday: bool = False) -> bool:
    """Sunday always, Saturday unless configured as workday."""
    wd = day.weekday()
    return wd == 6 or (wd == 5 and not saturday_is_workday)


# --- sun / sensors -----------------------------------------------------------


def angle_diff(a: float, b: float) -> float:
    """Smallest absolute difference of two compass angles."""
    d = abs(a - b) % 360
    return 360 - d if d > 180 else d


def azimuth_in_range(sun_azimuth: float, window_azimuth: float, half_range: float) -> bool:
    """Sun shines onto a window facing `window_azimuth` +/- `half_range`."""
    return angle_diff(sun_azimuth, window_azimuth) <= half_range


def hysteresis(active: bool, value: float | None, setpoint: float, hyst_pct: float) -> bool:
    """Threshold with downward hysteresis in percent of the setpoint.

    Starts at value >= setpoint, ends below setpoint - |setpoint| * hyst%.
    """
    if value is None:
        return False
    if value >= setpoint:
        return True
    if not active:
        return False
    return value >= setpoint - abs(setpoint) * hyst_pct / 100


SUN_TRIGGERS: dict[str, tuple[str, ...]] = {
    "off": (),
    "in_out_temp": ("in_temp", "out_temp"),
    "azimuth": ("azimuth",),
    "all": ("in_temp", "out_temp", "azimuth"),
    "out_temp_azimuth": ("out_temp", "azimuth"),
    "out_temp": ("out_temp",),
    "in_temp": ("in_temp",),
}


def sun_protection_wanted(mode: str, checks: dict[str, bool | None], light: bool | None) -> bool:
    """All selected triggers must be active (AND). The light sensor, if any, is ANDed.

    A check with value None means "sensor missing/unavailable" and blocks shading.
    """
    triggers = SUN_TRIGGERS.get(mode, ())
    if not triggers:
        return False
    if not all(checks.get(t) is True for t in triggers):
        return False
    return light is not False


def round_level(level: float, step: int) -> int:
    """Round a position to the nearest multiple of `step` (0 = no rounding)."""
    if step <= 0:
        return round(level)
    return int(round(level / step) * step)


def is_known_level(level: float, known: list[int], step: int, tolerance: int) -> bool:
    """Position matches one of the configured heights (after rounding)."""
    rounded = round_level(level, step)
    return any(abs(rounded - k) <= max(tolerance, 0) or rounded == round_level(k, step) for k in known)


# --- area times --------------------------------------------------------------


@dataclass
class AreaTimes:
    """Opening and closing moment of one area for one day."""

    open: datetime | None
    close: datetime | None


def _at(day: date, value: Any, tz) -> datetime | None:
    t = parse_time(value)
    if t is None:
        return None
    return datetime.combine(day, t, tzinfo=tz)


def clamp(value: datetime | None, low: datetime | None, high: datetime | None) -> datetime | None:
    """Clamp a moment between low and high (either may be None)."""
    if value is None:
        return low or high
    if low is not None and value < low:
        value = low
    if high is not None and value > high:
        value = high
    return value


def area_times(
    *,
    area: str,
    cfg: dict[str, Any],
    day: date,
    tz,
    free_open: bool,
    free_close: bool,
    sunrise: datetime | None,
    sunset: datetime | None,
    golden_morning: datetime | None,
    golden_evening: datetime | None,
) -> AreaTimes:
    """Compute when an area opens and closes on `day`.

    * time:        open at the earliest time, close at the close time.
    * sun:         follow sunrise/sunset, opening is clamped to earliest..latest,
                   closing never happens after the configured close time.
    * golden_hour: same as sun, but with golden hour as reference.

    `free_open`  -> weekend/holiday times are used for opening (today is free).
    `free_close` -> weekend times are used for closing (tomorrow is free), so
                    Friday closes late and Sunday closes at the weekday time.
    """
    up_kind = "weekend" if free_open else "week"
    down_kind = "weekend" if free_close else "week"
    earliest = _at(day, cfg.get(f"{area}_up_{up_kind}_min"), tz)
    latest = _at(day, cfg.get(f"{area}_up_{up_kind}_max"), tz)
    close_at = _at(day, cfg.get(f"{area}_down_{down_kind}"), tz)
    if latest is not None and earliest is not None and latest < earliest:
        latest = earliest

    mode = cfg.get(f"{area}_mode", "time")
    if mode == "time":
        return AreaTimes(earliest, close_at)

    morning, evening = (sunrise, sunset) if mode == "sun" else (golden_morning, golden_evening)
    open_at = clamp(morning, earliest, latest)
    if evening is None:
        close = close_at
    elif close_at is None:
        close = evening
    else:
        close = min(evening, close_at)
    return AreaTimes(open_at, close)


def with_offset(moment: datetime | None, minutes: float) -> datetime | None:
    """Shift a moment by minutes."""
    if moment is None:
        return None
    return moment + timedelta(minutes=minutes)


# --- window / lockout -------------------------------------------------------


def move_allowed(lockout: str, current: float, target: float, window_open: bool) -> bool:
    """Decide whether an automatic move may run while a window/door is open.

    lockout = which directions stay allowed while open:
      off -> none, open -> only up, close -> only down, open_close -> both.
    """
    if not window_open or target == current:
        return True
    going_up = target > current
    if lockout == "open_close":
        return True
    if lockout == "open":
        return going_up
    if lockout == "close":
        return not going_up
    return False


def restore_after_window_close(window_action: str, drive_after_close: bool, lockout: str) -> bool:
    """Move back to the automation position after the window/door closed?

    * window action "close" / "open_close": yes (e.g. darkening after closing the door).
    * "catch up after window closes": yes, unless the lockout blocks everything
      (then nothing was postponed that could be caught up).
    * otherwise (e.g. action "open" only): no – the shutter stays where it is.
    """
    if window_action in ("close", "open_close"):
        return True
    return bool(drive_after_close) and lockout != "off"


# --- conditions / months ----------------------------------------------------

ON_WORDS = {"on", "open", "true", "home", "1", "yes", "detected", "an", "ein"}


def _as_float(value: Any) -> float | None:
    try:
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None


def condition_met(state: Any, op: str, value: Any = None) -> bool:
    """One user condition on an entity state.

    on/off: generic truthiness (on, open, home, true …); gt/lt: numeric; eq/ne: text or number.
    An unavailable/missing entity never satisfies a condition.
    """
    if state is None or str(state).lower() in ("unavailable", "unknown", ""):
        return False
    text = str(state).lower()
    if op == "on":
        return text in ON_WORDS
    if op == "off":
        return text not in ON_WORDS
    number, target = _as_float(state), _as_float(value)
    if op in ("gt", "lt"):
        if number is None or target is None:
            return False
        return number > target if op == "gt" else number < target
    same = (number == target) if number is not None and target is not None else text == str(value or "").strip().lower()
    return same if op == "eq" else not same


def conditions_met(results: list[bool], logic_op: str = "and") -> bool:
    """Combine configured conditions; no conditions configured means 'not met'."""
    if not results:
        return False
    return any(results) if logic_op == "or" else all(results)


def month_in_range(month: int, start: int, end: int) -> bool:
    """Month window, may wrap around the new year (e.g. 10..3)."""
    start, end = int(start), int(end)
    if start <= end:
        return start <= month <= end
    return month >= start or month <= end


def random_offset_minutes(seed: str, max_minutes: int) -> float:
    """Stable per day and shutter pseudo-random offset in [-max, +max] minutes."""
    if max_minutes <= 0:
        return 0.0
    digest = hashlib.sha256(seed.encode()).digest()
    fraction = int.from_bytes(digest[:4], "big") / 0xFFFFFFFF
    return (fraction * 2 - 1) * max_minutes


# --- alarms -----------------------------------------------------------------


def next_alarm(
    current: str | None,
    active: set[str],
    changed: str,
    became_active: bool,
    priority: tuple[str, ...],
) -> str | None:
    """Which blocking alarm controls the shutter after a change.

    A newly activated alarm always takes over (most recent wins).
    When the controlling alarm ends, the highest-priority remaining one takes over.
    """
    if became_active and changed in priority:
        return changed
    if current in active:
        return current
    for name in priority:
        if name in active:
            return name
    return None


# --- stages, frost, insect protection -----------------------------------------


def stage_time_reached(since: datetime, at: time, now: datetime, *, night: bool) -> bool:
    """Time trigger of a stage that started at `since`.

    A time already passed when the stage started counts as reached at once – except for the
    night stage, where a morning time (before noon) means "after midnight".
    """
    candidate = since.replace(hour=at.hour, minute=at.minute, second=at.second, microsecond=0)
    if candidate < since and night and at.hour < 12:
        candidate += timedelta(days=1)
    return now >= candidate


def below_limit(active: bool, value: float | None, limit: float, hyst: float = 1.0) -> bool:
    """Frost-like threshold: on below `limit`, off again only from `limit + hyst`.

    A limit of -50 or lower means "off"; an unknown value keeps the current state.
    """
    if limit <= -50:
        return False
    if value is None:
        return active
    return value < (limit + hyst if active else limit)


def in_time_window(now: time, start: time | None, end: time | None) -> bool:
    """Daily window [start, end), may wrap midnight; a missing bound means open."""
    if start is None or end is None or start == end:
        return True
    if start < end:
        return start <= now < end
    return now >= start or now < end
