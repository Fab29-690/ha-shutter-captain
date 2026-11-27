"""Constants and the field schema shared by config flow, websocket API and panel."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

DOMAIN = "shutter_captain"
NAME = "Shutter Captain"
VERSION = "3.2.1"

SUBENTRY_SHUTTER = "shutter"

PANEL_URL = "shutter-captain"
PANEL_ELEMENT = "shutter-captain-panel"
STATIC_URL = "/shutter_captain_static"

STORAGE_VERSION = 1

AREAS = ("living", "sleep", "children")
ALARMS = ("fire", "rain", "wind2", "wind1", "frost")
# Release order after an alarm ends (fire is latched and handled separately).
ALARM_PRIORITY = ("rain", "wind2", "wind1")

# --- Select option lists -------------------------------------------------

AREA_MODES = ("time", "sun", "golden_hour")

DRIVE_MODES = (
    "off",
    "living",
    "sleep",
    "children",
    "living_auto",
    "sleep_auto",
    "children_auto",
    "sun",
    "elevation",
    "golden_hour",
    "brightness",
    "manual",
)

WINDOW_ACTIONS = ("off", "open", "close", "open_close")
LOCKOUT_MODES = ("off", "open", "close", "open_close")

# Ready-made window/door behaviours. "custom" uses the single fields below.
WINDOW_PROFILES = ("terrace_door", "vent_window", "protect_only", "custom")
WINDOW_PROFILE_SETTINGS: dict[str, dict[str, Any]] = {
    # up when the door opens, never down while it is open, back to the automation position after closing
    "terrace_door": {"window_action": "open", "lockout": "open", "drive_after_close": True, "vent_on_close": False},
    # vent position when opened/tilted, back after closing; closing at night first fully, then to vent position
    "vent_window": {"window_action": "open_close", "lockout": "close", "drive_after_close": True, "vent_on_close": True},
    # no reaction to the window, but never down while it is open; catch up after closing
    "protect_only": {"window_action": "off", "lockout": "open", "drive_after_close": True, "vent_on_close": False},
}

SUN_MODES = (
    "off",
    "in_out_temp",
    "azimuth",
    "all",
    "out_temp_azimuth",
    "out_temp",
    "in_temp",
)

GROUP_AREAS = ("auto", "living", "sleep", "children", "none")

DEVICE_TYPES = ("shutter", "awning", "garage", "roof_window")
COND_MODES = ("off", "sun", "half_close", "no_close", "no_open")
COND_OPS = ("on", "off", "gt", "lt", "eq", "ne")
COND_LOGIC = ("and", "or")
# Garage door condition: off | trigger (move when it becomes true) | allow (automatic moves only while true)
GARAGE_COND_MODES = ("off", "trigger", "allow")
WEATHER_CONDITIONS = (
    "sunny", "clear-night", "partlycloudy", "cloudy", "fog", "rainy", "pouring",
    "lightning", "lightning-rainy", "snowy", "snowy-rainy", "hail", "windy", "windy-variant", "exceptional",
)

ACCENTS = ("ha", "amber", "indigo", "teal", "ocean", "forest", "rose")

MANUAL_RESET_MODES = ("next_event", "timeout", "never")

# --- Shutter states (sensor enum) ----------------------------------------

STATE_NONE = "none"
STATE_UP = "up"
STATE_DOWN = "down"
STATE_INTERMEDIATE = "intermediate"
STATE_SUN = "sun_protect"
STATE_HEAT = "heat_protect"
STATE_MANUAL = "manual"
STATE_TRIGGERED = "window_open"
STATE_LOCKED = "window_locked"
STATE_PAUSED = "paused"
STATE_EMERGENCY = "emergency"
STATE_OPEN_PARTLY = "open_partly"
STATE_INSECT = "insect"
STATE_PRIVACY = "privacy"
STATE_MY = "my_position"
STATE_FROST_LOCK = "frost_lock"

SHUTTER_STATES = (
    STATE_NONE,
    STATE_UP,
    STATE_DOWN,
    STATE_INTERMEDIATE,
    STATE_SUN,
    STATE_HEAT,
    STATE_MANUAL,
    STATE_PAUSED,
    STATE_TRIGGERED,
    STATE_LOCKED,
    STATE_EMERGENCY,
    STATE_OPEN_PARTLY,
    STATE_INSECT,
    STATE_PRIVACY,
    STATE_MY,
    STATE_FROST_LOCK,
    *ALARMS,
)

SIGNAL_UPDATE = f"{DOMAIN}_update_{{}}"


# --- Field metadata -------------------------------------------------------


@dataclass(frozen=True)
class Field:
    """One configurable value.

    The same definition builds the HA config-flow forms and the panel editor,
    so both always offer exactly the same settings.
    """

    key: str
    kind: str  # bool | int | float | time | select | multiselect | entity | entities | text | daymonth
    default: Any = None
    options: tuple[str, ...] = ()
    min: float | None = None
    max: float | None = None
    step: float | None = None
    unit: str | None = None
    domains: tuple[str, ...] = ()
    optional: bool = False
    show_if: tuple[str, tuple[Any, ...]] | None = None  # (key, allowed values)

    def as_dict(self) -> dict[str, Any]:
        """Serialise for the websocket API."""
        data = asdict(self)
        data["options"] = list(self.options)
        data["domains"] = list(self.domains)
        if self.show_if:
            data["show_if"] = {"key": self.show_if[0], "values": list(self.show_if[1])}
        return data


def _pct(key: str, default: int, **kw: Any) -> Field:
    return Field(key, "int", default, min=0, max=100, step=1, unit="%", **kw)


def _area_fields(area: str, d: dict[str, str]) -> list[Field]:
    return [
        Field(f"{area}_mode", "select", "sun", options=AREA_MODES),
        Field(f"{area}_down_week", "time", d["down_week"]),
        Field(f"{area}_up_week_min", "time", d["up_week_min"]),
        Field(f"{area}_up_week_max", "time", d["up_week_max"]),
        Field(f"{area}_down_weekend", "time", d["down_weekend"]),
        Field(f"{area}_up_weekend_min", "time", d["up_weekend_min"]),
        Field(f"{area}_up_weekend_max", "time", d["up_weekend_max"]),
        Field(f"{area}_stagger", "int", 1, min=0, max=600, step=1, unit="s"),
        Field(f"{area}_school_holiday", "bool", area == "children"),
    ]


_AREA_DEFAULTS = {
    "living": {
        "down_week": "21:00:00",
        "up_week_min": "06:30:00",
        "up_week_max": "08:00:00",
        "down_weekend": "21:30:00",
        "up_weekend_min": "08:00:00",
        "up_weekend_max": "09:30:00",
    },
    "sleep": {
        "down_week": "20:30:00",
        "up_week_min": "06:30:00",
        "up_week_max": "08:00:00",
        "down_weekend": "21:00:00",
        "up_weekend_min": "09:00:00",
        "up_weekend_max": "10:30:00",
    },
    "children": {
        "down_week": "19:30:00",
        "up_week_min": "06:30:00",
        "up_week_max": "07:30:00",
        "down_weekend": "20:00:00",
        "up_weekend_min": "08:00:00",
        "up_weekend_max": "09:00:00",
    },
}

_ALARM_DEFAULT_LEVEL = {"fire": 100, "rain": 0, "wind2": 100, "wind1": 100, "frost": 10}

GLOBAL_SECTIONS: dict[str, list[Field]] = {
    "area_living": _area_fields("living", _AREA_DEFAULTS["living"]),
    "area_sleep": _area_fields("sleep", _AREA_DEFAULTS["sleep"]),
    "area_children": _area_fields("children", _AREA_DEFAULTS["children"]),
    "astro": [
        Field("astro_offset_up", "int", 0, min=-180, max=180, step=1, unit="min"),
        Field("astro_offset_down", "int", 0, min=-180, max=180, step=1, unit="min"),
        Field("sun_end_elevation", "float", 10, min=-10, max=90, step=0.5, unit="°"),
        Field("stagger", "int", 0, min=0, max=600, step=1, unit="s"),
    ],
    "days": [
        Field("workday_entity", "entity", None, domains=("binary_sensor",), optional=True),
        Field("workday_tomorrow_entity", "entity", None, domains=("binary_sensor",), optional=True),
        Field("saturday_is_workday", "bool", False),
        Field(
            "vacation_entity",
            "entity",
            None,
            domains=("binary_sensor", "input_boolean", "switch", "calendar"),
            optional=True,
        ),
        Field(
            "school_holiday_entity",
            "entity",
            None,
            domains=("binary_sensor", "input_boolean", "switch", "calendar"),
            optional=True,
        ),
    ],
    "seasons": [
        Field("summer_start", "daymonth", "01.05."),
        Field("summer_end", "daymonth", "30.09."),
        Field("xmas_start", "daymonth", "01.12."),
        Field("xmas_end", "daymonth", "06.01."),
    ],
    "brightness": [
        Field("brightness_entity", "entity", None, domains=("sensor",), optional=True),
        Field("brightness_close", "float", 50, min=0, max=200000, step=1, unit="lx"),
        Field("brightness_open", "float", 200, min=0, max=200000, step=1, unit="lx"),
        Field("brightness_delay", "int", 5, min=0, max=120, step=1, unit="min"),
        Field("brightness_open_from", "time", "04:00:00"),
        Field("brightness_close_from", "time", "12:00:00"),
    ],
    "special": [
        Field("late_close_time", "time", "22:30:00"),
        Field("intermediate_close_time", "time", "22:00:00"),
        Field("min_minutes_since_move", "int", 0, min=0, max=600, step=1, unit="min"),
        Field("random_offset", "int", 0, min=0, max=60, step=1, unit="min"),
        Field("random_only_vacation", "bool", True),
    ],
    "alarms": [
        Field(
            "emergency_entity",
            "entity",
            None,
            domains=("binary_sensor", "input_boolean", "switch"),
            optional=True,
        ),
        _pct("emergency_level", 100),
        # Frost by temperature: frost alarm below "protect", no automatic moves at all below "lock".
        Field("frost_temp_entity", "entity", None, domains=("sensor", "weather"), optional=True),
        Field("frost_protect_below", "float", -50, min=-50, max=10, step=0.5, unit="°C"),
        Field("frost_lock_below", "float", -50, min=-50, max=10, step=0.5, unit="°C"),
    ]
    + [
        item
        for alarm in ALARMS
        for item in (
            Field(
                f"alarm_{alarm}_entity",
                "entity",
                None,
                domains=("binary_sensor", "input_boolean", "switch"),
                optional=True,
            ),
            _pct(f"alarm_{alarm}_level", _ALARM_DEFAULT_LEVEL[alarm]),
        )
    ],
    "behaviour": [
        Field("wait_time", "int", 60, min=5, max=600, step=1, unit="s"),
        Field("command_gap", "float", 1, min=0, max=30, step=0.5, unit="s"),
        Field("position_tolerance", "int", 3, min=0, max=20, step=1, unit="%"),
        Field("manual_round", "select", "5", options=("0", "5", "10")),
        Field("manual_reset", "select", "next_event", options=MANUAL_RESET_MODES),
        Field(
            "manual_timeout",
            "int",
            120,
            min=5,
            max=1440,
            step=5,
            unit="min",
            show_if=("manual_reset", ("timeout",)),
        ),
    ],
    "awnings": [
        Field(
            "awning_wind_entity",
            "entity",
            None,
            domains=("binary_sensor", "sensor", "input_boolean"),
            optional=True,
        ),
        Field("awning_wind_speed", "float", 40, min=5, max=150, step=1, unit="km/h"),
        Field("awning_rain_entity", "entity", None, domains=("binary_sensor", "input_boolean", "sensor"), optional=True),
        Field("awning_temp_entity", "entity", None, domains=("sensor", "weather"), optional=True),
        Field("awning_frost_temp", "float", -50, min=-50, max=10, step=0.5, unit="°C"),
        Field("awning_min_temp", "float", 0, min=0, max=40, step=0.5, unit="°C"),
        Field("awning_retract_time", "time", "00:00:00"),
        Field("awning_sun_end_elevation", "float", 10, min=-10, max=90, step=0.5, unit="°"),
        Field(
            "awning_emergency_entities",
            "entities",
            (),
            domains=("binary_sensor", "input_boolean", "switch"),
            optional=True,
        ),
        Field("awning_emergency_alarms", "bool", True),
        Field("awning_wait_time", "int", 60, min=5, max=600, step=1, unit="s"),
        Field("awning_position_tolerance", "int", 3, min=0, max=20, step=1, unit="%"),
        Field("awning_manual_round", "select", "5", options=("0", "5", "10")),
        Field("awning_manual_reset", "select", "next_event", options=MANUAL_RESET_MODES),
        Field(
            "awning_manual_timeout",
            "int",
            120,
            min=5,
            max=1440,
            step=5,
            unit="min",
            show_if=("awning_manual_reset", ("timeout",)),
        ),
    ],
    "garages": [
        Field(
            "garage_emergency_entities",
            "entities",
            (),
            domains=("binary_sensor", "input_boolean", "switch"),
            optional=True,
        ),
        Field("garage_emergency_alarms", "bool", False),
        _pct("garage_open_level", 100),
        _pct("garage_close_level", 0),
        _pct("garage_vent_level", 20),
        Field("garage_position_tolerance", "int", 3, min=0, max=20, step=1, unit="%"),
        Field("garage_auto_close_minutes", "int", 0, min=0, max=240, step=1, unit="min"),
        Field("garage_close_time", "time", "00:00:00"),
        Field(
            "garage_presence_entity",
            "entity",
            None,
            domains=("person", "group", "zone", "binary_sensor", "device_tracker", "input_boolean"),
            optional=True,
        ),
        Field("garage_arrival_entities", "entities", (), domains=("person", "device_tracker"), optional=True),
        Field("garage_open_mode", "select", "off", options=GARAGE_COND_MODES),
        Field("garage_open_entity", "entity", None, optional=True),
        Field("garage_open_op", "select", "on", options=COND_OPS),
        Field("garage_open_value", "text", "", optional=True),
        Field("garage_close_mode", "select", "off", options=GARAGE_COND_MODES),
        Field("garage_close_entity", "entity", None, optional=True),
        Field("garage_close_op", "select", "on", options=COND_OPS),
        Field("garage_close_value", "text", "", optional=True),
        Field("garage_light_entity", "entity", None, domains=("light", "switch", "input_boolean"), optional=True),
        Field("garage_light_minutes", "int", 5, min=0, max=240, step=1, unit="min"),
        Field("garage_light_off_on_close", "bool", False),
        Field("garage_light_close_delay", "int", 60, min=0, max=3600, step=5, unit="s"),
    ],
    "roof_windows": [
        Field("roof_window_rain_entity", "entity", None, domains=("binary_sensor", "input_boolean", "sensor"), optional=True),
        Field(
            "roof_window_wind_entity",
            "entity",
            None,
            domains=("binary_sensor", "sensor", "input_boolean"),
            optional=True,
        ),
        Field("roof_window_wind_speed", "float", 40, min=5, max=150, step=1, unit="km/h"),
        _pct("roof_window_vent_level", 20),
        Field("roof_window_auto_close_minutes", "int", 0, min=0, max=480, step=1, unit="min"),
        Field("roof_window_close_time", "time", "00:00:00"),
        Field("roof_window_wait_time", "int", 60, min=5, max=600, step=1, unit="s"),
        Field("roof_window_position_tolerance", "int", 3, min=0, max=20, step=1, unit="%"),
    ],
    "appearance": [
        Field("accent", "select", "amber", options=ACCENTS),
        Field("weather_entity", "entity", None, domains=("weather",), optional=True),
        Field("forecast_entity", "entity", None, domains=("weather",), optional=True),
    ],
}

SHUTTER_SECTIONS: dict[str, list[Field]] = {
    "main": [
        Field("name", "text", "", optional=True),
        Field("cover_entity", "entity", None, domains=("cover",)),
        Field("device_type", "select", "shutter", options=DEVICE_TYPES),
        # Garage doors only: switch/button/relay that moves the door by impulse (instead of the cover services).
        Field(
            "garage_switch_entity",
            "entity",
            None,
            domains=("switch", "button", "input_button", "input_boolean", "script"),
            optional=True,
        ),
        Field("up_mode", "select", "living", options=DRIVE_MODES),
        Field("down_mode", "select", "living", options=DRIVE_MODES),
        Field("area", "select", "auto", options=GROUP_AREAS),
        _pct("open_level", 100),
        _pct("close_level", 0),
        Field("open_tilt", "int", -1, min=-1, max=100, step=1, unit="%"),
        Field("close_tilt", "int", -1, min=-1, max=100, step=1, unit="%"),
        Field("elevation", "float", 5, min=-10, max=60, step=0.5, unit="°"),
    ],
    "window": [
        Field("window_profile", "select", "custom", options=WINDOW_PROFILES),
        Field(
            "window_entity",
            "entity",
            None,
            domains=("binary_sensor", "sensor", "input_boolean"),
            optional=True,
        ),
        Field(
            "tilt_entity",
            "entity",
            None,
            domains=("binary_sensor", "sensor", "input_boolean"),
            optional=True,
        ),
        Field("window_action", "select", "open", options=WINDOW_ACTIONS),
        _pct("window_open_level", 100),
        _pct("window_tilt_level", 30),
        Field("lockout", "select", "open", options=LOCKOUT_MODES),
        Field("vent_on_close", "bool", False),
        Field("drive_after_close", "bool", True),
        Field("window_open_delay", "int", 0, min=0, max=600, step=1, unit="s"),
        Field("window_close_delay", "int", 0, min=0, max=600, step=1, unit="s"),
        _pct("vent_level", 30),
    ],
    "sun": [
        Field("sun_mode", "select", "off", options=SUN_MODES),
        _pct("sun_level", 30),
        Field("sun_tilt", "int", -1, min=-1, max=100, step=1, unit="%"),
        Field("azimuth", "int", 180, min=0, max=359, step=1, unit="°"),
        Field("azimuth_range", "int", 50, min=5, max=180, step=1, unit="°"),
        Field("out_temp_entity", "entity", None, domains=("sensor", "weather"), optional=True),
        Field("out_temp_setpoint", "float", 23, min=-30, max=60, step=0.5, unit="°C"),
        Field("out_temp_hyst", "int", 5, min=0, max=50, step=1, unit="%"),
        Field("in_temp_entity", "entity", None, domains=("sensor", "climate"), optional=True),
        Field("in_temp_setpoint", "float", 22, min=0, max=40, step=0.5, unit="°C"),
        Field("in_temp_hyst", "int", 5, min=0, max=50, step=1, unit="%"),
        Field("light_entity", "entity", None, domains=("sensor",), optional=True),
        Field("light_setpoint", "float", 30000, min=0, max=200000, step=100, unit="lx"),
        Field("light_hyst", "int", 40, min=0, max=90, step=1, unit="%"),
        Field("keep_sun", "bool", False),
        Field("sun_start_delay", "int", 0, min=0, max=120, step=1, unit="min"),
        Field("sun_end_delay", "int", 0, min=0, max=120, step=1, unit="min"),
        Field("sun_month_from", "int", 1, min=1, max=12, step=1),
        Field("sun_month_to", "int", 12, min=1, max=12, step=1),
        Field("forecast_temp", "float", 0, min=0, max=45, step=0.5, unit="°C"),
        Field("weather_conditions", "multiselect", (), options=WEATHER_CONDITIONS),
        Field("heat_protection", "bool", False),
        Field("heat_temp", "float", 30, min=15, max=50, step=0.5, unit="°C"),
    ],
    "conditions": [
        Field("cond_mode", "select", "off", options=COND_MODES),
        Field("cond_logic", "select", "and", options=COND_LOGIC),
        Field("cond1_entity", "entity", None, optional=True),
        Field("cond1_op", "select", "on", options=COND_OPS),
        Field("cond1_value", "text", "", optional=True),
        Field("cond2_entity", "entity", None, optional=True),
        Field("cond2_op", "select", "on", options=COND_OPS),
        Field("cond2_value", "text", "", optional=True),
        _pct("cond_level", 50),
    ],
    "stages": [
        Field("close1_entity", "entity", None, optional=True),
        Field("close1_from", "time", "15:00:00"),
        Field("close2_enabled", "bool", False),
        _pct("close2_level", 0),
        Field("close2_tilt", "int", -1, min=-1, max=100, step=1, unit="%"),
        Field("close2_lux", "float", 0, min=0, max=100000, step=0.5, unit="lx"),
        Field("close2_lux_entity", "entity", None, domains=("sensor",), optional=True),
        Field("close2_lux_minutes", "int", 5, min=0, max=120, step=1, unit="min"),
        Field("close2_entity", "entity", None, optional=True),
        Field("close2_from", "time", "00:00:00"),
        Field("close2_logic", "select", "and", options=COND_LOGIC),
        # Second opening stage: in the morning first a partial position, fully open later.
        Field("open2_enabled", "bool", False),
        _pct("open1_level", 30),
        Field("open2_lux", "float", 0, min=0, max=200000, step=1, unit="lx"),
        Field("open2_lux_entity", "entity", None, domains=("sensor",), optional=True),
        Field("open2_lux_minutes", "int", 5, min=0, max=120, step=1, unit="min"),
        Field("open2_entity", "entity", None, optional=True),
        Field("open2_from", "time", "00:00:00"),
        Field("open2_logic", "select", "or", options=COND_LOGIC),
    ],
    "extra": [
        Field("lamp_entity", "entity", None, domains=("light", "switch"), optional=True),
        _pct("lamp_brightness", 60),
        Field("late_close", "bool", False),
        Field("summer_no_close", "bool", False),
        Field("xmas", "bool", False),
        _pct("xmas_level", 30),
        Field("intermediate", "bool", False),
        _pct("intermediate_level", 50),
        Field("alarm_fire", "bool", False),
        Field("alarm_rain", "bool", False),
        Field("alarm_wind1", "bool", False),
        Field("alarm_wind2", "bool", False),
        Field("alarm_frost", "bool", False),
    ],
    "positions": [
        _pct("privacy_level", 30),
        _pct("my_level", 50),
        Field("frost_open_level", "int", -1, min=-1, max=100, step=1, unit="%"),
        Field("frost_lock", "bool", False),
        Field("insect_enabled", "bool", False),
        Field("insect_from", "time", "11:00:00"),
        Field("insect_to", "time", "16:00:00"),
        Field("insect_temp_entity", "entity", None, domains=("sensor", "weather"), optional=True),
        Field("insect_min_temp", "float", 15, min=-20, max=40, step=0.5, unit="°C"),
        Field("insect_entity", "entity", None, optional=True),
    ],
}


def defaults(sections: dict[str, list[Field]]) -> dict[str, Any]:
    """Default value for every field of a section map."""
    return {f.key: f.default for fields in sections.values() for f in fields}


def all_fields(sections: dict[str, list[Field]]) -> dict[str, Field]:
    """Flat key -> field lookup."""
    return {f.key: f for fields in sections.values() for f in fields}


GLOBAL_DEFAULTS = defaults(GLOBAL_SECTIONS)
SHUTTER_DEFAULTS = defaults(SHUTTER_SECTIONS)
GLOBAL_FIELDS = all_fields(GLOBAL_SECTIONS)
SHUTTER_FIELDS = all_fields(SHUTTER_SECTIONS)

# Hub-wide switches (persisted runtime flags)
HUB_FLAGS = ("master", "vacation", "school_holiday", "auto_living", "auto_sleep", "auto_children")
HUB_FLAG_DEFAULTS = {
    "master": True,
    "vacation": False,
    "school_holiday": False,
    "auto_living": True,
    "auto_sleep": True,
    "auto_children": True,
}
