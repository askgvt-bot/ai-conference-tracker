import conferencesData from '@/data/conferences.json';
import speakersData from '@/data/speakers.json';

export interface ConferenceSpeaker {
  id: string;
  name: string;
  title: string;
  organization: string;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  conferences: string[];
  conference_count: number;
  focus_areas: string[];
  bio: string;
  linkedin: string;
  twitter: string;
  photo_url: string;
  importance_score: number;
}

export interface Conference {
  id: string;
  name: string;
  dates: { start: string; end: string };
  location: { city: string; country: string; venue: string; note?: string };
  type: string;
  focus_areas: string[];
  size: string;
  estimated_attendees: number;
  website: string;
  ticket_price: { range: string; student_discount?: boolean; note?: string };
  description: string;
  tags: string[];
  speakers: ConferenceSpeaker[];
  score: number;
  score_breakdown: {
    speakers: number;
    size: number;
    relevance: number;
    networking: number;
    track_record: number;
  };
}

export function getConferences(): Conference[] {
  return conferencesData.conferences as Conference[];
}

export function getConference(id: string): Conference | undefined {
  return getConferences().find((c) => c.id === id);
}

export function getSpeakers(): Speaker[] {
  return speakersData.speakers as Speaker[];
}

export function getSpeaker(id: string): Speaker | undefined {
  return getSpeakers().find((s) => s.id === id);
}

export function getConferencesBySpeaker(speakerId: string): Conference[] {
  const speaker = getSpeaker(speakerId);
  if (!speaker) return [];
  
  return getConferences().filter((c) => speaker.conferences.includes(c.id));
}

const countryFlags: Record<string, string> = {
  'USA': '🇺🇸', 'UK': '🇬🇧', 'Canada': '🇨🇦', 'Germany': '🇩🇪', 'France': '🇫🇷',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Singapore': '🇸🇬', 'Australia': '🇦🇺',
  'Brazil': '🇧🇷', 'Italy': '🇮🇹', 'Portugal': '🇵🇹', 'UAE': '🇦🇪', 'Hong Kong': '🇭🇰',
  'China': '🇨🇳', 'India': '🇮🇳', 'Spain': '🇪🇸', 'Netherlands': '🇳🇱', 'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Israel': '🇮🇱', 'Saudi Arabia': '🇸🇦',
  'Thailand': '🇹🇭', 'Indonesia': '🇮🇩', 'Malaysia': '🇲🇾', 'Vietnam': '🇻🇳',
  'Taiwan': '🇹🇼', 'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'Kenya': '🇰🇪',
  'Nigeria': '🇳🇬', 'Egypt': '🇪🇬', 'Turkey': '🇹🇷', 'Poland': '🇵🇱',
  'Czech Republic': '🇨🇿', 'Belgium': '🇧🇪', 'Denmark': '🇩🇰', 'Finland': '🇫🇮',
  'Norway': '🇳🇴', 'Ireland': '🇮🇪', 'New Zealand': '🇳🇿', 'Argentina': '🇦🇷',
  'Chile': '🇨🇱', 'Colombia': '🇨🇴', 'Peru': '🇵🇪', 'Philippines': '🇵🇭',
};

export function getFlag(country: string): string {
  return countryFlags[country] || '🌍';
}

const countryToRegion: Record<string, string> = {
  'USA': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
  'UK': 'Europe', 'Germany': 'Europe', 'France': 'Europe', 'Italy': 'Europe',
  'Portugal': 'Europe', 'Spain': 'Europe', 'Netherlands': 'Europe', 'Sweden': 'Europe',
  'Switzerland': 'Europe', 'Austria': 'Europe', 'Belgium': 'Europe', 'Denmark': 'Europe',
  'Finland': 'Europe', 'Norway': 'Europe', 'Ireland': 'Europe', 'Poland': 'Europe',
  'Czech Republic': 'Europe', 'Turkey': 'Europe',
  'Japan': 'Asia', 'South Korea': 'Asia', 'Singapore': 'Asia', 'China': 'Asia',
  'Hong Kong': 'Asia', 'India': 'Asia', 'Thailand': 'Asia', 'Indonesia': 'Asia',
  'Malaysia': 'Asia', 'Vietnam': 'Asia', 'Taiwan': 'Asia', 'Philippines': 'Asia',
  'UAE': 'Middle East', 'Saudi Arabia': 'Middle East', 'Israel': 'Middle East',
  'Australia': 'Oceania', 'New Zealand': 'Oceania',
  'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
  'Colombia': 'South America', 'Peru': 'South America',
  'South Africa': 'Africa', 'Kenya': 'Africa', 'Nigeria': 'Africa', 'Egypt': 'Africa',
};

export function getRegion(country: string): string {
  return countryToRegion[country] || 'Other';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
  if (sMonth === eMonth) {
    return `${sMonth} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${s.getFullYear()}`;
}

export function getPriceCategory(range: string): string {
  const lower = range.toLowerCase();
  if (lower.includes('free') || lower === '$0') return 'Free';
  if (lower.includes('invitation') || lower.includes('invite')) return '$2000+';
  const nums = range.match(/\d[\d,]*/g);
  if (!nums) return 'Unknown';
  const max = Math.max(...nums.map(n => parseInt(n.replace(/,/g, ''))));
  if (max < 500) return '<$500';
  if (max <= 2000) return '$500-2000';
  return '$2000+';
}
