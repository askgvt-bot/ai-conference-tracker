from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
CONFERENCES_PATH = DATA_DIR / "conferences.json"
SPEAKERS_PATH = DATA_DIR / "speakers.json"
USER_PROFILE_PATH = DATA_DIR / "user-profile.json"

COUNTRY_FLAGS: Dict[str, str] = {
    "USA": "\U0001F1FA\U0001F1F8",
    "UK": "\U0001F1EC\U0001F1E7",
    "Canada": "\U0001F1E8\U0001F1E6",
    "Germany": "\U0001F1E9\U0001F1EA",
    "France": "\U0001F1EB\U0001F1F7",
    "Japan": "\U0001F1EF\U0001F1F5",
    "South Korea": "\U0001F1F0\U0001F1F7",
    "Singapore": "\U0001F1F8\U0001F1EC",
    "Australia": "\U0001F1E6\U0001F1FA",
    "Brazil": "\U0001F1E7\U0001F1F7",
    "Italy": "\U0001F1EE\U0001F1F9",
    "Portugal": "\U0001F1F5\U0001F1F9",
    "UAE": "\U0001F1E6\U0001F1EA",
    "Hong Kong": "\U0001F1ED\U0001F1F0",
    "China": "\U0001F1E8\U0001F1F3",
    "India": "\U0001F1EE\U0001F1F3",
    "Spain": "\U0001F1EA\U0001F1F8",
    "Netherlands": "\U0001F1F3\U0001F1F1",
    "Sweden": "\U0001F1F8\U0001F1EA",
    "Switzerland": "\U0001F1E8\U0001F1ED",
    "Austria": "\U0001F1E6\U0001F1F9",
    "Israel": "\U0001F1EE\U0001F1F1",
    "Saudi Arabia": "\U0001F1F8\U0001F1E6",
    "Thailand": "\U0001F1F9\U0001F1ED",
    "Indonesia": "\U0001F1EE\U0001F1E9",
    "Malaysia": "\U0001F1F2\U0001F1FE",
    "Vietnam": "\U0001F1FB\U0001F1F3",
    "Taiwan": "\U0001F1F9\U0001F1FC",
    "Mexico": "\U0001F1F2\U0001F1FD",
    "South Africa": "\U0001F1FF\U0001F1E6",
    "Kenya": "\U0001F1F0\U0001F1EA",
    "Nigeria": "\U0001F1F3\U0001F1EC",
    "Egypt": "\U0001F1EA\U0001F1EC",
    "Turkey": "\U0001F1F9\U0001F1F7",
    "Poland": "\U0001F1F5\U0001F1F1",
    "Czech Republic": "\U0001F1E8\U0001F1FF",
    "Belgium": "\U0001F1E7\U0001F1EA",
    "Denmark": "\U0001F1E9\U0001F1F0",
    "Finland": "\U0001F1EB\U0001F1EE",
    "Norway": "\U0001F1F3\U0001F1F4",
    "Ireland": "\U0001F1EE\U0001F1EA",
    "New Zealand": "\U0001F1F3\U0001F1FF",
    "Argentina": "\U0001F1E6\U0001F1F7",
    "Chile": "\U0001F1E8\U0001F1F1",
    "Colombia": "\U0001F1E8\U0001F1F4",
    "Peru": "\U0001F1F5\U0001F1EA",
    "Philippines": "\U0001F1F5\U0001F1ED",
}

COUNTRY_TO_REGION: Dict[str, str] = {
    "USA": "North America",
    "Canada": "North America",
    "Mexico": "North America",
    "UK": "Europe",
    "Germany": "Europe",
    "France": "Europe",
    "Italy": "Europe",
    "Portugal": "Europe",
    "Spain": "Europe",
    "Netherlands": "Europe",
    "Sweden": "Europe",
    "Switzerland": "Europe",
    "Austria": "Europe",
    "Belgium": "Europe",
    "Denmark": "Europe",
    "Finland": "Europe",
    "Norway": "Europe",
    "Ireland": "Europe",
    "Poland": "Europe",
    "Czech Republic": "Europe",
    "Turkey": "Europe",
    "Japan": "Asia",
    "South Korea": "Asia",
    "Singapore": "Asia",
    "China": "Asia",
    "Hong Kong": "Asia",
    "India": "Asia",
    "Thailand": "Asia",
    "Indonesia": "Asia",
    "Malaysia": "Asia",
    "Vietnam": "Asia",
    "Taiwan": "Asia",
    "Philippines": "Asia",
    "UAE": "Middle East",
    "Saudi Arabia": "Middle East",
    "Israel": "Middle East",
    "Australia": "Oceania",
    "New Zealand": "Oceania",
    "Brazil": "South America",
    "Argentina": "South America",
    "Chile": "South America",
    "Colombia": "South America",
    "Peru": "South America",
    "South Africa": "Africa",
    "Kenya": "Africa",
    "Nigeria": "Africa",
    "Egypt": "Africa",
}


def _load_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def get_flag(country: str) -> str:
    return COUNTRY_FLAGS.get(country, "\U0001F30D")


def get_region(country: str) -> str:
    return COUNTRY_TO_REGION.get(country, "Other")


def load_conferences() -> List[Dict[str, Any]]:
    payload = _load_json(CONFERENCES_PATH)
    return payload.get("conferences", [])


def load_speakers() -> List[Dict[str, Any]]:
    payload = _load_json(SPEAKERS_PATH)
    return payload.get("speakers", [])


def load_user_profile() -> Dict[str, Any]:
    if not USER_PROFILE_PATH.exists():
        return {}
    return _load_json(USER_PROFILE_PATH)


def _infer_vertical(conf: Dict[str, Any]) -> List[str]:
    """Infer vertical from existing data if not explicitly set."""
    if conf.get("vertical"):
        return conf["vertical"]
    
    focus = " ".join(str(f).lower() for f in conf.get("focus_areas", []))
    tags = " ".join(str(t).lower() for t in conf.get("tags", []))
    name = str(conf.get("name", "")).lower()
    combined = f"{focus} {tags} {name}"
    
    verticals = []
    if any(kw in combined for kw in ["creator", "influencer", "vidcon", "twitchcon", "mcn", "content creator", "youtube creator", "tiktok creator"]):
        verticals.append("creator-economy")
    if any(kw in combined for kw in ["ai", "machine learning", "deep learning", "llm", "neural", "nlp", "computer vision"]):
        verticals.append("ai-ml")
    if any(kw in combined for kw in ["enterprise", "saas", "cloud", "digital transformation"]):
        verticals.append("enterprise")
    if any(kw in combined for kw in ["robot", "automation"]):
        verticals.append("robotics")
    if any(kw in combined for kw in ["health", "medical", "biotech"]):
        verticals.append("healthcare")
    if any(kw in combined for kw in ["fintech", "banking", "financial"]):
        verticals.append("fintech")
    
    return verticals or ["general"]


def enrich_conference(conf: Dict[str, Any]) -> Dict[str, Any]:
    enriched = dict(conf)
    country = conf.get("location", {}).get("country", "")
    enriched["region"] = get_region(country)
    enriched["country_flag"] = get_flag(country)
    enriched["vertical"] = _infer_vertical(conf)
    return enriched


def list_conferences() -> List[Dict[str, Any]]:
    return [enrich_conference(conf) for conf in load_conferences()]


def get_conference(conference_id: str) -> Optional[Dict[str, Any]]:
    for conf in load_conferences():
        if conf.get("id") == conference_id:
            return enrich_conference(conf)
    return None


def list_speakers() -> List[Dict[str, Any]]:
    return load_speakers()


def get_speaker(speaker_id: str) -> Optional[Dict[str, Any]]:
    for speaker in load_speakers():
        if speaker.get("id") == speaker_id:
            return speaker
    return None


def get_conferences_by_speaker(speaker_id: str) -> List[Dict[str, Any]]:
    speaker = get_speaker(speaker_id)
    if not speaker:
        return []
    conference_ids = set(speaker.get("conferences", []))
    return [conf for conf in list_conferences() if conf.get("id") in conference_ids]


def filter_conferences(
    conferences: Iterable[Dict[str, Any]],
    days: Optional[int] = None,
    conf_type: Optional[str] = None,
    region: Optional[str] = None,
    focus: Optional[str] = None,
    min_score: Optional[int] = None,
    vertical: Optional[str] = None,
) -> List[Dict[str, Any]]:
    results = list(conferences)

    if days is not None:
        today = date.today()
        horizon = today + timedelta(days=days)
        def in_window(conf: Dict[str, Any]) -> bool:
            start = conf.get("dates", {}).get("start")
            if not start:
                return False
            start_date = _parse_date(start)
            return today <= start_date <= horizon
        results = [conf for conf in results if in_window(conf)]

    if conf_type:
        wanted = conf_type.strip().lower()
        results = [conf for conf in results if str(conf.get("type", "")).lower() == wanted]

    if region:
        wanted_region = region.strip().lower()
        results = [conf for conf in results if str(conf.get("region", "")).lower() == wanted_region]

    if focus:
        parts = [part.strip().lower() for part in focus.split(",") if part.strip()]
        def focus_match(conf: Dict[str, Any]) -> bool:
            conf_focus = [str(item).lower() for item in conf.get("focus_areas", [])]
            return any(any(term in focus_item for focus_item in conf_focus) for term in parts)
        results = [conf for conf in results if focus_match(conf)]

    if min_score is not None:
        results = [conf for conf in results if conf.get("score", 0) >= min_score]

    if vertical:
        wanted_vertical = vertical.strip().lower()
        results = [conf for conf in results if wanted_vertical in [v.lower() for v in conf.get("vertical", [])]]

    return results


def sort_conferences(conferences: Iterable[Dict[str, Any]], sort: str = "date") -> List[Dict[str, Any]]:
    results = list(conferences)
    if sort == "score":
        results.sort(key=lambda conf: conf.get("score", 0), reverse=True)
    elif sort == "attendees":
        results.sort(key=lambda conf: conf.get("estimated_attendees", 0), reverse=True)
    else:
        results.sort(key=lambda conf: conf.get("dates", {}).get("start", ""))
    return results


def recommend_conferences() -> List[Dict[str, Any]]:
    profile = load_user_profile()
    conferences = list_conferences()

    focus_terms = [str(item).lower() for item in profile.get("focus_areas", [])]
    preferred_regions = {str(item).lower() for item in profile.get("preferred_regions", [])}
    target_speakers = {str(item).lower() for item in profile.get("target_speakers", [])}
    target_orgs = {str(item).lower() for item in profile.get("target_orgs", [])}

    recommendations: List[Dict[str, Any]] = []

    for conf in conferences:
        reasons: List[str] = []
        score = float(conf.get("score", 0))
        reasons.append(f"Base score {conf.get('score', 0)}")

        if conf.get("region", "").lower() in preferred_regions:
            score += 10
            reasons.append(f"Preferred region: {conf.get('region')}")

        conf_focus = [str(item).lower() for item in conf.get("focus_areas", [])]
        focus_matches = [term for term in focus_terms if any(term in focus_item for focus_item in conf_focus)]
        if focus_matches:
            score += 5 * min(3, len(focus_matches))
            for term in focus_matches[:3]:
                reasons.append(f"Focus match: {term}")

        speaker_names = [str(s.get("name", "")).lower() for s in conf.get("speakers", [])]
        speaker_orgs = [str(s.get("organization", "")).lower() for s in conf.get("speakers", [])]

        speaker_hits = [name for name in speaker_names if name in target_speakers]
        if speaker_hits:
            score += 15 * len(speaker_hits)
            for hit in speaker_hits:
                reasons.append(f"Target speaker: {hit.title()}")

        org_hits = [org for org in speaker_orgs if org in target_orgs]
        if org_hits:
            score += 8 * len(org_hits)
            for hit in org_hits:
                reasons.append(f"Target org present: {hit}")

        enriched = dict(conf)
        enriched["recommendation_score"] = round(score, 2)
        enriched["reasons"] = reasons
        recommendations.append(enriched)

    recommendations.sort(key=lambda item: item.get("recommendation_score", 0), reverse=True)

    limit = profile.get("max_conferences_per_quarter")
    if isinstance(limit, int) and limit > 0:
        return recommendations[:limit]
    return recommendations
