"""Config flow (hub), options flow (global settings) and shutter subentry flow."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
from homeassistant.core import callback
from homeassistant.helpers import selector

from . import logic
from .const import (
    DOMAIN,
    GLOBAL_DEFAULTS,
    GLOBAL_SECTIONS,
    NAME,
    SHUTTER_DEFAULTS,
    SHUTTER_SECTIONS,
    SUBENTRY_SHUTTER,
    Field,
)


def _selector(field: Field) -> Any:
    if field.kind == "bool":
        return selector.BooleanSelector()
    if field.kind in ("int", "float"):
        return selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=field.min,
                max=field.max,
                step=field.step or 1,
                unit_of_measurement=field.unit,
                mode=selector.NumberSelectorMode.BOX,
            )
        )
    if field.kind == "time":
        return selector.TimeSelector()
    if field.kind == "select":
        return selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=list(field.options),
                translation_key=field.key.split("_", 1)[1]
                if field.key.startswith(("living_", "sleep_", "children_"))
                else field.key,
                mode=selector.SelectSelectorMode.DROPDOWN,
            )
        )
    if field.kind == "entity":
        return selector.EntitySelector(selector.EntitySelectorConfig(domain=list(field.domains)))
    return selector.TextSelector()


def build_schema(fields: list[Field], values: dict[str, Any]) -> vol.Schema:
    """Voluptuous schema for a list of fields, pre-filled with `values`."""
    schema: dict[Any, Any] = {}
    for field in fields:
        current = values.get(field.key, field.default)
        if field.optional:
            key = vol.Optional(field.key, description={"suggested_value": current})
        elif current is None:
            key = vol.Required(field.key)
        else:
            key = vol.Required(field.key, default=current)
        schema[key] = _selector(field)
    return vol.Schema(schema)


def clean(fields: list[Field], user_input: dict[str, Any]) -> tuple[dict[str, Any], dict[str, str]]:
    """Normalise input: cleared optional fields become None, numbers get their type."""
    data: dict[str, Any] = {}
    errors: dict[str, str] = {}
    for field in fields:
        value = user_input.get(field.key)
        if value in (None, "") and field.optional:
            data[field.key] = None
            continue
        if field.kind == "int" and value is not None:
            value = int(value)
        elif field.kind == "float" and value is not None:
            value = float(value)
        elif field.kind == "daymonth" and not logic.valid_day_month(value):
            errors[field.key] = "invalid_day_month"
        data[field.key] = value
    return data, errors


# --------------------------------------------------------------------- hub


class ShutterPilotConfigFlow(ConfigFlow, domain=DOMAIN):
    """Create the single Shutter Pilot hub."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Confirm and create."""
        if user_input is not None:
            return self.async_create_entry(title=NAME, data={}, options=dict(GLOBAL_DEFAULTS))
        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Global settings."""
        return ShutterPilotOptionsFlow()

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry: ConfigEntry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        """Shutters are subentries of the hub."""
        return {SUBENTRY_SHUTTER: ShutterSubentryFlow}


# ----------------------------------------------------------------- options


class ShutterPilotOptionsFlow(OptionsFlow):
    """Menu with one page per settings group."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Menu."""
        return self.async_show_menu(step_id="init", menu_options=list(GLOBAL_SECTIONS))

    async def _section(self, section: str, user_input: dict[str, Any] | None) -> ConfigFlowResult:
        fields = GLOBAL_SECTIONS[section]
        current = {**GLOBAL_DEFAULTS, **self.config_entry.options}
        errors: dict[str, str] = {}
        if user_input is not None:
            data, errors = clean(fields, user_input)
            if not errors:
                return self.async_create_entry(data={**current, **data})
            current.update(user_input)
        return self.async_show_form(
            step_id=section, data_schema=build_schema(fields, current), errors=errors
        )

    async def async_step_area_living(self, user_input=None) -> ConfigFlowResult:
        """Living area times."""
        return await self._section("area_living", user_input)

    async def async_step_area_sleep(self, user_input=None) -> ConfigFlowResult:
        """Sleeping area times."""
        return await self._section("area_sleep", user_input)

    async def async_step_area_children(self, user_input=None) -> ConfigFlowResult:
        """Children area times."""
        return await self._section("area_children", user_input)

    async def async_step_astro(self, user_input=None) -> ConfigFlowResult:
        """Astro settings."""
        return await self._section("astro", user_input)

    async def async_step_days(self, user_input=None) -> ConfigFlowResult:
        """Workdays, holidays, vacation."""
        return await self._section("days", user_input)

    async def async_step_seasons(self, user_input=None) -> ConfigFlowResult:
        """Summer and Christmas."""
        return await self._section("seasons", user_input)

    async def async_step_brightness(self, user_input=None) -> ConfigFlowResult:
        """Brightness sensor."""
        return await self._section("brightness", user_input)

    async def async_step_special(self, user_input=None) -> ConfigFlowResult:
        """Special times."""
        return await self._section("special", user_input)

    async def async_step_alarms(self, user_input=None) -> ConfigFlowResult:
        """Alarms."""
        return await self._section("alarms", user_input)

    async def async_step_behaviour(self, user_input=None) -> ConfigFlowResult:
        """General behaviour."""
        return await self._section("behaviour", user_input)


# ----------------------------------------------------------------- shutter


class ShutterSubentryFlow(ConfigSubentryFlow):
    """Add or edit one shutter in four steps."""

    def __init__(self) -> None:
        """Init."""
        self._data: dict[str, Any] = {}
        self._reconfigure = False

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """New shutter."""
        self._data = dict(SHUTTER_DEFAULTS)
        return await self.async_step_main()

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Edit an existing shutter."""
        self._reconfigure = True
        self._data = {**SHUTTER_DEFAULTS, **self._get_reconfigure_subentry().data}
        return await self.async_step_main()

    async def _step(
        self, step: str, nxt: str | None, user_input: dict[str, Any] | None
    ) -> SubentryFlowResult:
        fields = SHUTTER_SECTIONS[step]
        errors: dict[str, str] = {}
        if user_input is not None:
            data, errors = clean(fields, user_input)
            if step == "main" and not errors:
                errors = self._check_cover(data["cover_entity"])
            if not errors:
                self._data.update(data)
                if nxt is None:
                    return self._finish()
                return await getattr(self, f"async_step_{nxt}")()
            self._data.update(user_input)
        return self.async_show_form(
            step_id=step,
            data_schema=build_schema(fields, self._data),
            errors=errors,
            last_step=nxt is None,
        )

    def _check_cover(self, cover: str) -> dict[str, str]:
        own = self._get_reconfigure_subentry().subentry_id if self._reconfigure else None
        for sub in self._get_entry().subentries.values():
            if sub.subentry_id != own and sub.data.get("cover_entity") == cover:
                return {"cover_entity": "already_configured"}
        return {}

    async def async_step_main(self, user_input=None) -> SubentryFlowResult:
        """Cover, modes and heights."""
        return await self._step("main", "window", user_input)

    async def async_step_window(self, user_input=None) -> SubentryFlowResult:
        """Window/door contact."""
        return await self._step("window", "sun", user_input)

    async def async_step_sun(self, user_input=None) -> SubentryFlowResult:
        """Sun protection."""
        return await self._step("sun", "extra", user_input)

    async def async_step_extra(self, user_input=None) -> SubentryFlowResult:
        """Extras and alarms."""
        return await self._step("extra", None, user_input)

    def _finish(self) -> SubentryFlowResult:
        cover = self._data["cover_entity"]
        title = self._data.get("name") or _friendly(self.hass, cover)
        if self._reconfigure:
            return self.async_update_and_abort(
                self._get_entry(),
                self._get_reconfigure_subentry(),
                title=title,
                data=self._data,
                unique_id=cover,
            )
        return self.async_create_entry(title=title, data=self._data, unique_id=cover)


def _friendly(hass, entity_id: str) -> str:
    state = hass.states.get(entity_id)
    if state and state.attributes.get("friendly_name"):
        return str(state.attributes["friendly_name"])
    return entity_id
