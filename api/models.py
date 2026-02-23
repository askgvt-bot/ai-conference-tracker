from __future__ import annotations
# Models for conference tracker API

from typing import List, Optional
from pydantic import BaseModel


class ConferenceSpeaker(BaseModel):
    id: str
    name: str
    title: str
    organization: str


class TicketPrice(BaseModel):
    range: str
    student_discount: Optional[bool] = None
    note: Optional[str] = None


class ConferenceDates(BaseModel):
    start: str
    end: str


class ConferenceLocation(BaseModel):
    city: str
    country: str
    venue: str
    note: Optional[str] = None


class ScoreBreakdown(BaseModel):
    speakers: int
    size: int
    relevance: int
    networking: int
    track_record: int


class Conference(BaseModel):
    id: str
    name: str
    dates: ConferenceDates
    location: ConferenceLocation
    type: str
    focus_areas: List[str]
    size: str
    estimated_attendees: int
    website: str
    ticket_price: TicketPrice
    description: str
    tags: List[str]
    speakers: List[ConferenceSpeaker]
    score: int
    score_breakdown: ScoreBreakdown
    vertical: List[str] = []
    region: Optional[str] = None
    country_flag: Optional[str] = None


class Speaker(BaseModel):
    id: str
    name: str
    title: str
    organization: str
    conferences: List[str]
    conference_count: int
    focus_areas: List[str]
    bio: str
    linkedin: str
    twitter: str
    photo_url: str
    importance_score: int


class SpeakerWithConferences(Speaker):
    conferences_detail: List[Conference] = []


class Recommendation(BaseModel):
    recommendation_score: float
    reasons: List[str]
    conference: Conference
