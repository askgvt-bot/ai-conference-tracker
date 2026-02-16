import { Conference, Speaker, getConferences, getSpeakers } from '@/lib/data';
import userProfile from '@/data/user-profile.json';

export interface UserProfile {
  name: string;
  company: string;
  base_location: string;
  focus_areas: string[];
  goals: string[];
  target_speakers: string[];
  target_orgs: string[];
  preferred_regions: string[];
  quarterly_budget: number;
  max_conferences_per_quarter: number;
}

export interface RecommendationScores {
  relevance: number;
  network: number;
  geographic: number;
  value: number;
  cluster: number;
  overall: number;
}

export interface ConferenceRecommendation {
  conference: Conference;
  scores: RecommendationScores;
  tier: 'must-attend' | 'consider' | 'skip';
  reasons: string[];
  clusterWith?: string[];
}

export interface RecommendationFilters {
  goals?: string[];
  regions?: string[];
  quarter?: number;
  scoreWeights?: {
    relevance: number;
    network: number;
    value: number;
    geographic: number;
    cluster: number;
  };
}

const DEFAULT_SCORE_WEIGHTS = {
  relevance: 0.35,
  network: 0.25,
  value: 0.20,
  geographic: 0.10,
  cluster: 0.10,
};

// Fuzzy matching for focus areas
function calculateFocusAreaMatch(conferenceAreas: string[], userAreas: string[]): number {
  let totalScore = 0;
  let maxPossibleScore = userAreas.length * 100;

  for (const userArea of userAreas) {
    let bestMatch = 0;

    for (const confArea of conferenceAreas) {
      const score = calculateAreaSimilarity(userArea.toLowerCase(), confArea.toLowerCase());
      bestMatch = Math.max(bestMatch, score);
    }

    totalScore += bestMatch;
  }

  return totalScore / maxPossibleScore * 100;
}

// Calculate similarity between two focus areas
function calculateAreaSimilarity(area1: string, area2: string): number {
  // Exact match
  if (area1 === area2) return 100;

  // Keyword matching with weights
  const area1Words = area1.split(' ').map(w => w.trim());
  const area2Words = area2.split(' ').map(w => w.trim());

  let matchScore = 0;
  const totalWords = Math.max(area1Words.length, area2Words.length);

  for (const word1 of area1Words) {
    for (const word2 of area2Words) {
      if (word1 === word2) {
        matchScore += 1;
      } else if (word1.includes(word2) || word2.includes(word1)) {
        matchScore += 0.5;
      } else if (areRelatedTerms(word1, word2)) {
        matchScore += 0.7;
      }
    }
  }

  return (matchScore / totalWords) * 100;
}

// Check if two terms are related
function areRelatedTerms(term1: string, term2: string): boolean {
  const relatedTerms: { [key: string]: string[] } = {
    'ai': ['artificial', 'intelligence', 'machine', 'learning', 'ml', 'generative', 'llm'],
    'video': ['visual', 'computer', 'vision', 'multimedia', 'media', 'content'],
    'enterprise': ['business', 'corporate', 'industry', 'commercial', 'saas'],
    'creator': ['content', 'social', 'media', 'influencer', 'youtube', 'tiktok'],
    'multimodal': ['vision', 'language', 'audio', 'text', 'image', 'speech'],
    'intelligence': ['ai', 'artificial', 'smart', 'cognitive', 'neural'],
  };

  for (const [key, synonyms] of Object.entries(relatedTerms)) {
    if ((term1.includes(key) && synonyms.some(s => term2.includes(s))) ||
        (term2.includes(key) && synonyms.some(s => term1.includes(s)))) {
      return true;
    }
  }

  return false;
}

// Calculate relevance score (0-100)
function calculateRelevanceScore(conference: Conference): number {
  const profile = userProfile as UserProfile;
  return calculateFocusAreaMatch(conference.focus_areas, profile.focus_areas);
}

// Calculate network score (0-100)
function calculateNetworkScore(conference: Conference, speakers: Speaker[]): number {
  const profile = userProfile as UserProfile;
  let targetSpeakerCount = 0;
  let targetOrgCount = 0;

  for (const confSpeaker of conference.speakers) {
    // Check if speaker is in target list
    if (profile.target_speakers.some(ts => 
      ts.toLowerCase() === confSpeaker.name.toLowerCase()
    )) {
      targetSpeakerCount += 1;
    }

    // Check if organization is in target list
    if (profile.target_orgs.some(org => 
      confSpeaker.organization.toLowerCase().includes(org.toLowerCase()) ||
      org.toLowerCase().includes(confSpeaker.organization.toLowerCase())
    )) {
      targetOrgCount += 1;
    }
  }

  // Weight: Target speakers are more valuable than orgs
  const speakerScore = Math.min(targetSpeakerCount * 25, 60); // Max 60 points for speakers
  const orgScore = Math.min(targetOrgCount * 8, 40); // Max 40 points for orgs

  return speakerScore + orgScore;
}

// Calculate geographic score (0-100)
function calculateGeographicScore(conference: Conference): number {
  const profile = userProfile as UserProfile;
  const country = conference.location.country.toLowerCase();
  const city = conference.location.city.toLowerCase();

  // Middle East
  const middleEastCountries = ['uae', 'saudi arabia', 'qatar', 'bahrain', 'kuwait', 'oman'];
  if (middleEastCountries.some(c => country.includes(c)) || city.includes('dubai') || city.includes('riyadh')) {
    return 100;
  }

  // Europe
  const europeanCountries = ['uk', 'united kingdom', 'germany', 'france', 'netherlands', 'switzerland', 'spain', 'italy', 'austria', 'belgium'];
  if (europeanCountries.some(c => country.includes(c)) || city.includes('london') || city.includes('berlin') || city.includes('paris')) {
    return 80;
  }

  // Asia (close to Dubai)
  const asiaCountries = ['singapore', 'india', 'japan', 'south korea', 'china', 'thailand'];
  if (asiaCountries.some(c => country.includes(c))) {
    return 70;
  }

  // North America
  if (country.includes('usa') || country.includes('canada') || city.includes('san francisco') || city.includes('new york')) {
    return 60;
  }

  // Australia
  if (country.includes('australia')) {
    return 50;
  }

  // Others
  return 30;
}

// Calculate value score (0-100) - conference quality vs price
function calculateValueScore(conference: Conference): number {
  // Extract numeric price from range string
  let price = 1000; // Default assumption
  const priceStr = conference.ticket_price.range.toLowerCase();
  
  if (priceStr.includes('free')) {
    price = 0;
  } else if (priceStr.includes('$')) {
    const matches = priceStr.match(/\$(\d+)/);
    if (matches) {
      price = parseInt(matches[1]);
    }
  }

  // Size factor (bigger conferences generally have more value)
  const sizeMultiplier = {
    'mega': 1.5,
    'large': 1.2,
    'medium': 1.0,
    'small': 0.8,
  }[conference.size] || 1.0;

  // Base conference score (from existing scoring system)
  const baseScore = conference.score * sizeMultiplier;

  // Calculate value: higher score and lower price = better value
  if (price === 0) {
    return 100; // Free conferences are always great value
  }

  // Value formula: conference_quality * size_factor / (price / 100)
  const valueScore = (baseScore / (price / 100)) * 10;
  
  return Math.min(valueScore, 100);
}

// Calculate cluster bonus for conferences in same region within 2 weeks
function calculateClusterBonus(conference: Conference, allConferences: Conference[]): { score: number; clusteredWith: string[] } {
  const clusteredWith: string[] = [];
  const confStart = new Date(conference.dates.start);
  
  for (const other of allConferences) {
    if (other.id === conference.id) continue;
    
    const otherStart = new Date(other.dates.start);
    const daysDiff = Math.abs((confStart.getTime() - otherStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Same region (country) and within 14 days
    if (daysDiff <= 14 && conference.location.country === other.location.country) {
      clusteredWith.push(other.id);
    }
  }
  
  // More clustered conferences = higher bonus
  const clusterScore = clusteredWith.length > 0 ? Math.min(clusteredWith.length * 15, 30) : 0;
  
  return { score: clusterScore, clusteredWith };
}

// Main recommendation function
export function getConferenceRecommendations(filters?: RecommendationFilters): ConferenceRecommendation[] {
  const conferences = getConferences();
  const speakers = getSpeakers();
  const weights = { ...DEFAULT_SCORE_WEIGHTS, ...filters?.scoreWeights };
  
  const recommendations: ConferenceRecommendation[] = [];
  
  for (const conference of conferences) {
    // Apply filters
    if (filters?.quarter) {
      const confDate = new Date(conference.dates.start);
      const confQuarter = Math.ceil((confDate.getMonth() + 1) / 3);
      if (confQuarter !== filters.quarter) continue;
    }

    if (filters?.regions && filters.regions.length > 0) {
      const matchesRegion = filters.regions.some(region => {
        if (region === 'Middle East') {
          return calculateGeographicScore(conference) >= 95;
        } else if (region === 'Europe') {
          return calculateGeographicScore(conference) >= 75 && calculateGeographicScore(conference) < 95;
        } else if (region === 'North America') {
          return conference.location.country.toLowerCase().includes('usa') || conference.location.country.toLowerCase().includes('canada');
        }
        return false;
      });
      if (!matchesRegion) continue;
    }
    
    // Calculate scores
    const relevance = calculateRelevanceScore(conference);
    const network = calculateNetworkScore(conference, speakers);
    const geographic = calculateGeographicScore(conference);
    const value = calculateValueScore(conference);
    const { score: cluster, clusteredWith } = calculateClusterBonus(conference, conferences);
    
    // Calculate overall weighted score
    const overall = (
      relevance * weights.relevance +
      network * weights.network +
      value * weights.value +
      geographic * weights.geographic +
      cluster * weights.cluster
    );
    
    // Determine tier
    let tier: 'must-attend' | 'consider' | 'skip';
    if (overall >= 75) {
      tier = 'must-attend';
    } else if (overall >= 50) {
      tier = 'consider';
    } else {
      tier = 'skip';
    }
    
    // Generate reasons
    const reasons: string[] = [];
    if (network > 60) {
      const speakerCount = conference.speakers.filter(s => 
        userProfile.target_speakers.some(ts => ts.toLowerCase() === s.name.toLowerCase())
      ).length;
      if (speakerCount > 0) {
        reasons.push(`${speakerCount} target speaker${speakerCount > 1 ? 's' : ''} attending`);
      }
    }
    
    if (relevance > 70) {
      reasons.push('Strong focus area alignment');
    }
    
    if (geographic >= 80) {
      reasons.push('Excellent location proximity');
    }
    
    if (value > 80) {
      reasons.push('Outstanding value for money');
    }
    
    if (clusteredWith.length > 0) {
      reasons.push(`Can combine with ${clusteredWith.length} other conference${clusteredWith.length > 1 ? 's' : ''}`);
    }
    
    recommendations.push({
      conference,
      scores: { relevance, network, geographic, value, cluster, overall },
      tier,
      reasons,
      clusterWith: clusteredWith.length > 0 ? clusteredWith : undefined,
    });
  }
  
  // Sort by overall score descending, then by date
  return recommendations.sort((a, b) => {
    if (b.scores.overall !== a.scores.overall) {
      return b.scores.overall - a.scores.overall;
    }
    return new Date(a.conference.dates.start).getTime() - new Date(b.conference.dates.start).getTime();
  });
}

// Get recommendations grouped by tier
export function getRecommendationsByTier(filters?: RecommendationFilters) {
  const recommendations = getConferenceRecommendations(filters);
  
  return {
    'must-attend': recommendations.filter(r => r.tier === 'must-attend'),
    'consider': recommendations.filter(r => r.tier === 'consider'),
    'skip': recommendations.filter(r => r.tier === 'skip'),
  };
}

// Calculate total cost and summary statistics
export function getRecommendationsSummary(filters?: RecommendationFilters) {
  const recommendations = getConferenceRecommendations(filters);
  const mustAttend = recommendations.filter(r => r.tier === 'must-attend');
  
  // Rough cost calculation (simplified)
  let estimatedCost = 0;
  const regions = new Set<string>();
  
  for (const rec of mustAttend) {
    regions.add(rec.conference.location.country);
    
    // Extract rough price
    const priceStr = rec.conference.ticket_price.range.toLowerCase();
    if (priceStr.includes('$')) {
      const matches = priceStr.match(/\$(\d+)/);
      if (matches) {
        estimatedCost += parseInt(matches[1]);
      }
    }
  }
  
  return {
    mustAttendCount: mustAttend.length,
    considerCount: recommendations.filter(r => r.tier === 'consider').length,
    estimatedCost,
    regionsCount: regions.size,
    regions: Array.from(regions),
  };
}