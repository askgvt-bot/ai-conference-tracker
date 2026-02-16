'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  getRecommendationsByTier, 
  getRecommendationsSummary,
  ConferenceRecommendation,
  RecommendationFilters 
} from '@/lib/recommendations';
import userProfile from '@/data/user-profile.json';

// Score bar component
function ScoreBar({ 
  scores, 
  className = '' 
}: { 
  scores: { relevance: number; network: number; geographic: number; value: number; cluster: number }; 
  className?: string;
}) {
  const total = scores.relevance + scores.network + scores.geographic + scores.value + scores.cluster;
  
  return (
    <div className={`flex h-2 rounded-full overflow-hidden bg-gray-800 ${className}`}>
      <div 
        className="bg-blue-500" 
        style={{ width: `${(scores.relevance / total) * 100}%` }}
        title={`Relevance: ${scores.relevance.toFixed(1)}`}
      />
      <div 
        className="bg-purple-500" 
        style={{ width: `${(scores.network / total) * 100}%` }}
        title={`Network: ${scores.network.toFixed(1)}`}
      />
      <div 
        className="bg-green-500" 
        style={{ width: `${(scores.geographic / total) * 100}%` }}
        title={`Geographic: ${scores.geographic.toFixed(1)}`}
      />
      <div 
        className="bg-yellow-500" 
        style={{ width: `${(scores.value / total) * 100}%` }}
        title={`Value: ${scores.value.toFixed(1)}`}
      />
      <div 
        className="bg-indigo-500" 
        style={{ width: `${(scores.cluster / total) * 100}%` }}
        title={`Cluster: ${scores.cluster.toFixed(1)}`}
      />
    </div>
  );
}

// Conference card component
function ConferenceCard({ recommendation }: { recommendation: ConferenceRecommendation }) {
  const { conference, scores, tier, reasons } = recommendation;
  
  const tierConfig = {
    'must-attend': {
      badge: '🔴 Must-Attend',
      bgClass: 'bg-red-500/10 border-red-500/30',
      textClass: 'text-red-400',
      glowClass: 'shadow-red-500/20'
    },
    'consider': {
      badge: '🟡 Consider',
      bgClass: 'bg-amber-500/10 border-amber-500/30',
      textClass: 'text-amber-400',
      glowClass: 'shadow-amber-500/20'
    },
    'skip': {
      badge: '⚪ Skip',
      bgClass: 'bg-gray-500/10 border-gray-500/30',
      textClass: 'text-gray-400',
      glowClass: 'shadow-gray-500/20'
    }
  };
  
  const config = tierConfig[tier];
  
  return (
    <Link href={`/conference/${conference.id}`} className="block group">
      <div className={`relative rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] p-6 ${config.bgClass} ${config.glowClass} shadow-2xl hover:shadow-3xl`}>
        {/* Tier badge */}
        <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold border ${config.bgClass} ${config.textClass}`}>
          {config.badge}
        </div>
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              {conference.name}
            </h3>
            <p className="text-sm text-gray-400">
              {new Date(conference.dates.start).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })} - {new Date(conference.dates.end).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-500">
              📍 {conference.location.city}, {conference.location.country}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${config.textClass}`}>
              {scores.overall.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
        
        {/* Score breakdown */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Score Breakdown</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-blue-500" />
                Relevance
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-purple-500" />
                Network
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-green-500" />
                Location
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded bg-yellow-500" />
                Value
              </span>
            </div>
          </div>
          <ScoreBar scores={scores} />
        </div>
        
        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Why recommended:</div>
            <div className="flex flex-wrap gap-1">
              {reasons.map((reason, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Cluster info */}
        {recommendation.clusterWith && recommendation.clusterWith.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-indigo-400">
            <span>🔗</span>
            <span>Can combine with {recommendation.clusterWith.length} other conference{recommendation.clusterWith.length > 1 ? 's' : ''}</span>
          </div>
        )}
        
        {/* Conference details */}
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>{conference.size} ({conference.estimated_attendees?.toLocaleString()} attendees)</span>
            <span>{conference.ticket_price.range}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Travel planner component
function TravelPlanner({ recommendations }: { recommendations: ConferenceRecommendation[] }) {
  // Group conferences by region and proximity in time
  const trips = useMemo(() => {
    const mustAttend = recommendations.filter(r => r.tier === 'must-attend');
    const tripGroups: { [key: string]: ConferenceRecommendation[] } = {};
    
    for (const rec of mustAttend) {
      const country = rec.conference.location.country;
      const startDate = new Date(rec.conference.dates.start);
      const quarter = `Q${Math.ceil((startDate.getMonth() + 1) / 3)} ${startDate.getFullYear()}`;
      const regionQuarter = `${country} - ${quarter}`;
      
      if (!tripGroups[regionQuarter]) {
        tripGroups[regionQuarter] = [];
      }
      tripGroups[regionQuarter].push(rec);
    }
    
    // Only show regions with multiple conferences or single high-value conferences
    return Object.entries(tripGroups)
      .filter(([_, conferences]) => conferences.length >= 1)
      .map(([region, conferences]) => ({
        region,
        conferences: conferences.sort((a, b) => 
          new Date(a.conference.dates.start).getTime() - new Date(b.conference.dates.start).getTime()
        ),
        estimatedCost: conferences.reduce((sum, c) => {
          const priceStr = c.conference.ticket_price.range.toLowerCase();
          if (priceStr.includes('$')) {
            const matches = priceStr.match(/\$(\d+)/);
            if (matches) {
              return sum + parseInt(matches[1]);
            }
          }
          return sum;
        }, 0)
      }))
      .sort((a, b) => a.conferences.length > 1 ? -1 : 1); // Multi-conference trips first
  }, [recommendations]);
  
  if (trips.length === 0) return null;
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
        ✈️ Recommended Travel Plan
      </h2>
      <div className="grid gap-4">
        {trips.map((trip, index) => (
          <div key={trip.region} className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-400">Trip {index + 1}: {trip.region}</h3>
                <p className="text-sm text-gray-400">
                  {trip.conferences.length} conference{trip.conferences.length > 1 ? 's' : ''} • 
                  Est. ${trip.estimatedCost.toLocaleString()} tickets
                </p>
              </div>
              {trip.conferences.length > 1 && (
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  Multi-Conference Trip
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              {trip.conferences.map((rec) => (
                <div key={rec.conference.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="text-red-400 font-bold">🔴</div>
                    <div>
                      <div className="text-white font-medium">{rec.conference.name}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(rec.conference.dates.start).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })} - {new Date(rec.conference.dates.end).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })} • {rec.conference.location.city}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{rec.conference.ticket_price.range}</div>
                    <div className="text-xs text-gray-400">{rec.scores.overall.toFixed(0)} score</div>
                  </div>
                </div>
              ))}
            </div>
            
            {trip.conferences.length > 1 && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="text-sm text-green-400">
                  💡 <strong>Travel Tip:</strong> Combining these conferences can save on flights and extend your networking opportunities in {trip.region}.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Filter component
function FilterSidebar({ filters, onFiltersChange }: {
  filters: RecommendationFilters;
  onFiltersChange: (filters: RecommendationFilters) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Filters</h3>
      </div>
      
      {/* Goals */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Goals</label>
        <div className="space-y-2">
          {userProfile.goals.map((goal) => (
            <label key={goal} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.goals?.includes(goal) ?? true}
                onChange={(e) => {
                  const newGoals = e.target.checked
                    ? [...(filters.goals || []), goal]
                    : (filters.goals || []).filter(g => g !== goal);
                  onFiltersChange({ ...filters, goals: newGoals });
                }}
                className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="ml-2 text-sm text-gray-300 capitalize">{goal}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Quarters */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Quarter</label>
        <select
          value={filters.quarter || ''}
          onChange={(e) => onFiltersChange({ 
            ...filters, 
            quarter: e.target.value ? parseInt(e.target.value) : undefined 
          })}
          className="w-full rounded border-gray-600 bg-gray-800 text-gray-300 focus:ring-cyan-500"
        >
          <option value="">All quarters</option>
          <option value="1">Q1 (Jan-Mar)</option>
          <option value="2">Q2 (Apr-Jun)</option>
          <option value="3">Q3 (Jul-Sep)</option>
          <option value="4">Q4 (Oct-Dec)</option>
        </select>
      </div>
      
      {/* Regions */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Regions</label>
        <div className="space-y-2">
          {userProfile.preferred_regions.map((region) => (
            <label key={region} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.regions?.includes(region) ?? true}
                onChange={(e) => {
                  const newRegions = e.target.checked
                    ? [...(filters.regions || []), region]
                    : (filters.regions || []).filter(r => r !== region);
                  onFiltersChange({ ...filters, regions: newRegions });
                }}
                className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="ml-2 text-sm text-gray-300">{region}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const [filters, setFilters] = useState<RecommendationFilters>({});
  
  const recommendations = useMemo(() => getRecommendationsByTier(filters), [filters]);
  const summary = useMemo(() => getRecommendationsSummary(filters), [filters]);
  
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Conference Recommendations for {userProfile.name}
          </h1>
          <p className="text-gray-400">
            Personalized conference recommendations based on your focus areas, goals, and preferences
          </p>
        </div>
        
        {/* Strategy Summary */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">📊 Your Conference Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{summary.mustAttendCount}</div>
              <div className="text-sm text-gray-400">Must-Attend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{summary.considerCount}</div>
              <div className="text-sm text-gray-400">Consider</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${summary.estimatedCost.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Est. Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{summary.regionsCount}</div>
              <div className="text-sm text-gray-400">Regions</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {/* Travel Planner */}
            <TravelPlanner recommendations={[...recommendations['must-attend'], ...recommendations.consider]} />
            
            {/* Must-attend */}
            {recommendations['must-attend'].length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                  🔴 Must-Attend Conferences
                  <span className="text-sm text-gray-500 font-normal">
                    ({recommendations['must-attend'].length})
                  </span>
                </h2>
                <div className="grid gap-6">
                  {recommendations['must-attend'].map((rec) => (
                    <ConferenceCard key={rec.conference.id} recommendation={rec} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Consider */}
            {recommendations.consider.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                  🟡 Worth Considering
                  <span className="text-sm text-gray-500 font-normal">
                    ({recommendations.consider.length})
                  </span>
                </h2>
                <div className="grid gap-6">
                  {recommendations.consider.map((rec) => (
                    <ConferenceCard key={rec.conference.id} recommendation={rec} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {recommendations['must-attend'].length === 0 && recommendations.consider.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">No recommendations found</h3>
                <p className="text-gray-400">Try adjusting your filters to see more conferences.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}