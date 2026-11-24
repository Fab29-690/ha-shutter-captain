"""Unit tests for the pure decision logic (no Home Assistant needed)."""

from __future__ import annotations

from datetime import date, datetime, time, timezone
import importlib.util
from pathlib import Path
import sys

_spec = importlib.util.spec_from_file_location(
    "sp_logic", Path(__file__).parents[1] / "custom_components" / "shutter_captain" / "logic.py"
)
logic = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = logic
_spec.loader.exec_module(logic)

TZ = timezone.utc


def test_parse_time():
    assert logic.parse_time("21:00") == time(21, 0)
    assert logic.parse_time("06:30:15") == time(6, 30, 15)
    assert logic.parse_time("x") is None
    assert logic.parse_time(None) is None


def test_day_month_and_period_wraps_new_year():
    assert logic.parse_day_month("24.12.") == (12, 24)
    assert logic.parse_day_month("01-06") == (1, 6)
    assert logic.parse_day_month("32.01.") is None
    assert logic.in_period(date(2026, 12, 30), "24.12.", "06.01.")
    assert logic.in_period(date(2027, 1, 3), "24.12.", "06.01.")
    assert not logic.in_period(date(2026, 7, 1), "24.12.", "06.01.")
    assert logic.in_period(date(2026, 7, 1), "01.05.", "30.09.")


def test_weekend():
    assert logic.is_weekend(date(2026, 11, 22))  # Sunday
    assert logic.is_weekend(date(2026, 11, 21))  # Saturday
    assert not logic.is_weekend(date(2026, 11, 21), saturday_is_workday=True)
    assert not logic.is_weekend(date(2026, 11, 20))  # Friday


def test_azimuth_range_wraps_north():
    assert logic.azimuth_in_range(350, 10, 30)
    assert logic.azimuth_in_range(180, 180, 1)
    assert not logic.azimuth_in_range(90, 180, 45)


def test_hysteresis_matches_documented_example():
    # 30,000 lx with 40 % hysteresis -> active until below 18,000 lx
    assert logic.hysteresis(False, 30000, 30000, 40)
    assert logic.hysteresis(True, 20000, 30000, 40)
    assert logic.hysteresis(True, 18000, 30000, 40)
    assert not logic.hysteresis(True, 17999, 30000, 40)
    assert not logic.hysteresis(False, 25000, 30000, 40)
    assert not logic.hysteresis(True, None, 30000, 40)


def test_sun_protection_is_and_combined():
    on = {"out_temp": True, "in_temp": True, "azimuth": True}
    assert logic.sun_protection_wanted("all", on, None)
    assert not logic.sun_protection_wanted("all", {**on, "azimuth": False}, None)
    assert not logic.sun_protection_wanted("out_temp", {"out_temp": None}, None)
    assert not logic.sun_protection_wanted("azimuth", on, False)  # light sensor says no
    assert logic.sun_protection_wanted("azimuth", on, True)
    assert not logic.sun_protection_wanted("off", on, True)


def test_known_level_rounding():
    assert logic.round_level(32, 5) == 30
    assert logic.is_known_level(98, [100], 5, 0)
    assert logic.is_known_level(31, [30], 10, 0)
    assert not logic.is_known_level(55, [100, 0, 30], 5, 3)


def test_lockout():
    assert logic.move_allowed("off", 100, 0, False)  # window closed
    assert not logic.move_allowed("off", 100, 0, True)
    assert logic.move_allowed("open", 0, 100, True)
    assert not logic.move_allowed("open", 100, 0, True)
    assert logic.move_allowed("close", 100, 0, True)
    assert not logic.move_allowed("close", 0, 100, True)
    assert logic.move_allowed("open_close", 100, 0, True)


def _cfg(mode):
    return {
        "living_mode": mode,
        "living_down_week": "21:00:00",
        "living_up_week_min": "06:30:00",
        "living_up_week_max": "08:00:00",
        "living_down_weekend": "22:00:00",
        "living_up_weekend_min": "08:00:00",
        "living_up_weekend_max": "09:30:00",
    }


def _times(mode, *, free_open=False, free_close=False, sunrise=(7, 15), sunset=(17, 0)):
    day = date(2026, 11, 20)
    return logic.area_times(
        area="living",
        cfg=_cfg(mode),
        day=day,
        tz=TZ,
        free_open=free_open,
        free_close=free_close,
        sunrise=datetime(2026, 11, 20, *sunrise, tzinfo=TZ),
        sunset=datetime(2026, 11, 20, *sunset, tzinfo=TZ),
        golden_morning=datetime(2026, 11, 20, 8, 10, tzinfo=TZ),
        golden_evening=datetime(2026, 11, 20, 16, 0, tzinfo=TZ),
    )


def test_area_time_mode():
    t = _times("time")
    assert t.open.time() == time(6, 30)
    assert t.close.time() == time(21, 0)


def test_friday_closes_with_weekend_time():
    assert _times("time", free_close=True).close.time() == time(22, 0)
    assert _times("time", free_open=True).open.time() == time(8, 0)


def test_sun_mode_is_clamped():
    t = _times("sun")
    assert t.open.time() == time(7, 15)  # between 06:30 and 08:00
    assert t.close.time() == time(17, 0)  # sunset before 21:00
    early = _times("sun", sunrise=(5, 0), sunset=(21, 45))
    assert early.open.time() == time(6, 30)  # not before earliest
    assert early.close.time() == time(21, 0)  # never after close time
    late = _times("sun", sunrise=(8, 40))
    assert late.open.time() == time(8, 0)  # not after latest


def test_golden_hour_mode():
    t = _times("golden_hour")
    assert t.open.time() == time(8, 0)  # 08:10 clamped to latest
    assert t.close.time() == time(16, 0)


def test_alarm_priority():
    prio = ("rain", "wind2", "wind1")
    assert logic.next_alarm(None, {"wind1"}, "wind1", True, prio) == "wind1"
    # newest wins on activation
    assert logic.next_alarm("rain", {"rain", "wind1"}, "wind1", True, prio) == "wind1"
    # on release: highest priority of the rest
    assert logic.next_alarm("wind1", {"rain", "wind2"}, "wind1", False, prio) == "rain"
    assert logic.next_alarm("wind2", set(), "wind2", False, prio) is None
