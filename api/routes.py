from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from . import data_loader

router = APIRouter()


@router.get("/api/conferences")
def api_conferences(
    days: Optional[int] = Query(default=None, ge=1),
    conf_type: Optional[str] = Query(default=None, alias="type"),
    region: Optional[str] = None,
    focus: Optional[str] = None,
    min_score: Optional[int] = Query(default=None, ge=0, le=100),
    vertical: Optional[str] = None,
    sort: str = Query(default="date"),
    limit: Optional[int] = Query(default=None, ge=1),
):
    conferences = data_loader.list_conferences()
    filtered = data_loader.filter_conferences(
        conferences,
        days=days,
        conf_type=conf_type,
        region=region,
        focus=focus,
        min_score=min_score,
        vertical=vertical,
    )
    sorted_items = data_loader.sort_conferences(filtered, sort=sort)
    if limit:
        sorted_items = sorted_items[:limit]
    return {"count": len(sorted_items), "results": sorted_items}


@router.get("/api/conferences/{conference_id}")
def api_conference_detail(conference_id: str):
    conference = data_loader.get_conference(conference_id)
    if not conference:
        raise HTTPException(status_code=404, detail="Conference not found")
    return conference


@router.get("/api/speakers")
def api_speakers(conference_id: Optional[str] = Query(default=None)):
    speakers = data_loader.list_speakers()
    if conference_id:
        speakers = [s for s in speakers if conference_id in s.get("conferences", [])]
    return {"count": len(speakers), "results": speakers}


@router.get("/api/speakers/{speaker_id}")
def api_speaker_detail(speaker_id: str):
    speaker = data_loader.get_speaker(speaker_id)
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")
    conferences = data_loader.get_conferences_by_speaker(speaker_id)
    speaker_detail = dict(speaker)
    speaker_detail["conferences_detail"] = conferences
    return speaker_detail


@router.get("/api/upcoming")
def api_upcoming():
    conferences = data_loader.list_conferences()
    upcoming = data_loader.filter_conferences(conferences, days=30)
    upcoming = data_loader.sort_conferences(upcoming, sort="score")
    return {"count": len(upcoming), "results": upcoming}


@router.get("/api/recommend")
def api_recommendations():
    recommendations = data_loader.recommend_conferences()
    return {"count": len(recommendations), "results": recommendations}


@router.get("/health")
def health_check():
    return {"status": "ok"}
