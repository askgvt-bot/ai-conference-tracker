#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from typing import Any, Dict, List, Optional

import click
import requests

DEFAULT_BASE_URL = "http://127.0.0.1:8460"


def _request(base_url: str, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    url = base_url.rstrip("/") + path
    response = requests.get(url, params=params, timeout=15)
    response.raise_for_status()
    return response.json()


def _print_json(payload: Any) -> None:
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def _format_conference(conf: Dict[str, Any]) -> str:
    dates = conf.get("dates", {})
    start = dates.get("start", "?")
    end = dates.get("end", "?")
    location = conf.get("location", {})
    city = location.get("city", "?")
    country = location.get("country", "?")
    score = conf.get("score", "?")
    return f"{conf.get('id')} | {conf.get('name')} | {start} to {end} | {city}, {country} | score {score}"


def _format_speaker(speaker: Dict[str, Any]) -> str:
    return f"{speaker.get('id')} | {speaker.get('name')} | {speaker.get('title')} @ {speaker.get('organization')}"


@click.group()
@click.option("--base-url", default=DEFAULT_BASE_URL, show_default=True, help="Conference Tracker API base URL")
@click.option("--json", "json_output", is_flag=True, help="Output JSON")
@click.pass_context
def cli(ctx: click.Context, base_url: str, json_output: bool) -> None:
    ctx.ensure_object(dict)
    ctx.obj["base_url"] = base_url
    ctx.obj["json"] = json_output


@cli.command()
@click.option("--days", default=30, show_default=True, type=int)
@click.pass_context
def upcoming(ctx: click.Context, days: int) -> None:
    payload = _request(ctx.obj["base_url"], "/api/conferences", params={"days": days, "sort": "date"})
    if ctx.obj["json"]:
        _print_json(payload)
        return
    click.echo(f"Upcoming conferences in next {days} days: {payload.get('count', 0)}")
    for conf in payload.get("results", []):
        click.echo(_format_conference(conf))


@cli.command()
@click.option("--focus", default=None, help="Focus area search terms")
@click.option("--region", default=None, help="Region filter")
@click.pass_context
def search(ctx: click.Context, focus: Optional[str], region: Optional[str]) -> None:
    params: Dict[str, Any] = {"sort": "date"}
    if focus:
        params["focus"] = focus
    if region:
        params["region"] = region
    payload = _request(ctx.obj["base_url"], "/api/conferences", params=params)
    if ctx.obj["json"]:
        _print_json(payload)
        return
    click.echo(f"Matches: {payload.get('count', 0)}")
    for conf in payload.get("results", []):
        click.echo(_format_conference(conf))


@cli.command()
@click.argument("conference_id")
@click.pass_context
def show(ctx: click.Context, conference_id: str) -> None:
    payload = _request(ctx.obj["base_url"], f"/api/conferences/{conference_id}")
    if ctx.obj["json"]:
        _print_json(payload)
        return
    click.echo(_format_conference(payload))
    click.echo(payload.get("description", ""))
    if payload.get("focus_areas"):
        click.echo("Focus: " + ", ".join(payload["focus_areas"]))


@cli.command()
@click.pass_context
def recommend(ctx: click.Context) -> None:
    payload = _request(ctx.obj["base_url"], "/api/recommend")
    if ctx.obj["json"]:
        _print_json(payload)
        return
    click.echo(f"Recommendations: {payload.get('count', 0)}")
    for conf in payload.get("results", []):
        click.echo(_format_conference(conf))
        reasons = conf.get("reasons", [])
        for reason in reasons:
            click.echo(f"  - {reason}")


@cli.command()
@click.option("--conference", "conference_id", default=None, help="Conference id")
@click.pass_context
def speakers(ctx: click.Context, conference_id: Optional[str]) -> None:
    params = {"conference_id": conference_id} if conference_id else None
    payload = _request(ctx.obj["base_url"], "/api/speakers", params=params)
    if ctx.obj["json"]:
        _print_json(payload)
        return
    click.echo(f"Speakers: {payload.get('count', 0)}")
    for speaker in payload.get("results", []):
        click.echo(_format_speaker(speaker))


@cli.command(name="list")
@click.option("--type", "conf_type", default=None, help="Conference type")
@click.option("--min-score", default=None, type=int, help="Minimum score")
@click.pass_context
def list_conferences(ctx: click.Context, conf_type: Optional[str], min_score: Optional[int]) -> None:
    params: Dict[str, Any] = {"sort": "date"}
    if conf_type:
        params["type"] = conf_type
    if min_score is not None:
        params["min_score"] = min_score
    payload = _request(ctx.obj["base_url"], "/api/conferences", params=params)
    if ctx.obj["json"]:
        _print_json(payload)
        return
    click.echo(f"Conferences: {payload.get('count', 0)}")
    for conf in payload.get("results", []):
        click.echo(_format_conference(conf))


def main() -> None:
    try:
        cli(obj={})
    except requests.RequestException as exc:
        click.echo(f"Request failed: {exc}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
