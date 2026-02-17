import { UserProfile, ConferenceRecommendation } from './recommendations';

export interface AnalysisResult {
  code: string;
  profile: UserProfile;
  recommendations: SerializedRecommendation[];
  summary: {
    mustAttendCount: number;
    considerCount: number;
    estimatedCost: number;
    regionsCount: number;
    regions: string[];
  };
  isPaid: boolean;
  createdAt: string;
}

export interface SerializedRecommendation {
  conferenceId: string;
  conferenceName: string;
  conferenceDate: string;
  conferenceEndDate: string;
  conferenceCity: string;
  conferenceCountry: string;
  conferenceSize: string;
  conferenceAttendees: number;
  conferencePriceRange: string;
  conferenceWebsite: string;
  conferenceFocusAreas: string[];
  speakers: { name: string; organization: string }[];
  scores: {
    relevance: number;
    network: number;
    geographic: number;
    value: number;
    cluster: number;
    overall: number;
  };
  tier: 'must-attend' | 'consider' | 'skip';
  reasons: string[];
  clusterWith?: string[];
}

export function serializeRecommendation(rec: ConferenceRecommendation): SerializedRecommendation {
  return {
    conferenceId: rec.conference.id,
    conferenceName: rec.conference.name,
    conferenceDate: rec.conference.dates.start,
    conferenceEndDate: rec.conference.dates.end,
    conferenceCity: rec.conference.location.city,
    conferenceCountry: rec.conference.location.country,
    conferenceSize: rec.conference.size,
    conferenceAttendees: rec.conference.estimated_attendees,
    conferencePriceRange: rec.conference.ticket_price.range,
    conferenceWebsite: rec.conference.website,
    conferenceFocusAreas: rec.conference.focus_areas,
    speakers: rec.conference.speakers.slice(0, 5).map(s => ({ name: s.name, organization: s.organization })),
    scores: rec.scores,
    tier: rec.tier,
    reasons: rec.reasons,
    clusterWith: rec.clusterWith,
  };
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CONF-${code}`;
}

// Encode analysis to URL-safe base64 (for Vercel serverless - no filesystem)
export function encodeAnalysis(analysis: AnalysisResult): string {
  const json = JSON.stringify(analysis);
  if (typeof window !== 'undefined') {
    return btoa(encodeURIComponent(json));
  }
  return Buffer.from(json).toString('base64url');
}

export function decodeAnalysis(encoded: string): AnalysisResult | null {
  try {
    let json: string;
    if (typeof window !== 'undefined') {
      json = decodeURIComponent(atob(encoded));
    } else {
      json = Buffer.from(encoded, 'base64url').toString('utf-8');
    }
    return JSON.parse(json);
  } catch {
    return null;
  }
}
