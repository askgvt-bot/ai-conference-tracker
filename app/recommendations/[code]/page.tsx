'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AnalysisResult, SerializedRecommendation } from '@/lib/analysis-store';

function ScoreBar({ scores }: { scores: SerializedRecommendation['scores'] }) {
  const total = scores.relevance + scores.network + scores.geographic + scores.value + scores.cluster;
  if (total === 0) return null;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
      <div className="bg-blue-500" style={{ width: `${(scores.relevance / total) * 100}%` }} title={`Relevance: ${scores.relevance.toFixed(1)}`} />
      <div className="bg-purple-500" style={{ width: `${(scores.network / total) * 100}%` }} title={`Network: ${scores.network.toFixed(1)}`} />
      <div className="bg-green-500" style={{ width: `${(scores.geographic / total) * 100}%` }} title={`Geographic: ${scores.geographic.toFixed(1)}`} />
      <div className="bg-yellow-500" style={{ width: `${(scores.value / total) * 100}%` }} title={`Value: ${scores.value.toFixed(1)}`} />
      <div className="bg-indigo-500" style={{ width: `${(scores.cluster / total) * 100}%` }} title={`Cluster: ${scores.cluster.toFixed(1)}`} />
    </div>
  );
}

function ConferenceCard({ rec }: { rec: SerializedRecommendation }) {
  const tierConfig = {
    'must-attend': { badge: '🔴 Must Attend', bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' },
    'consider': { badge: '🟡 Recommended', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
    'skip': { badge: '⚪ Consider', bg: 'bg-gray-500/10 border-gray-500/30', text: 'text-gray-400' },
  };
  const config = tierConfig[rec.tier];

  return (
    <div className={`relative rounded-xl border backdrop-blur-sm p-6 ${config.bg} transition-all hover:scale-[1.01]`}>
      <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text}`}>
        {config.badge}
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <Link href={`/conference/${rec.conferenceId}`} className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors">
            {rec.conferenceName}
          </Link>
          <p className="text-sm text-gray-400">
            {new Date(rec.conferenceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' - '}
            {new Date(rec.conferenceEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-sm text-gray-500">📍 {rec.conferenceCity}, {rec.conferenceCountry}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${config.text}`}>{rec.scores.overall.toFixed(0)}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Score Breakdown</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500" />Relevance</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-purple-500" />Network</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-green-500" />Location</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-yellow-500" />Value</span>
          </div>
        </div>
        <ScoreBar scores={rec.scores} />
      </div>

      {rec.reasons.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Why recommended:</div>
          <div className="flex flex-wrap gap-1">
            {rec.reasons.map((reason, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {rec.speakers.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Key speakers:</div>
          <div className="flex flex-wrap gap-1">
            {rec.speakers.slice(0, 4).map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300">
                {s.name} <span className="text-gray-500">({s.organization})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400 flex justify-between items-center">
        <span>{rec.conferenceSize} • {rec.conferenceAttendees?.toLocaleString()} attendees</span>
        <span className="font-medium">{rec.conferencePriceRange}</span>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const code = params.code as string;
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'price'>('score');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Handle demo code
    if (code === 'demo') {
      // Redirect to form with demo note
      return;
    }
    try {
      const stored = localStorage.getItem(`analysis-${code}`);
      if (stored) {
        setAnalysis(JSON.parse(stored));
      }
    } catch {}
  }, [code]);

  const filteredRecs = useMemo(() => {
    if (!analysis) return [];
    let recs = [...analysis.recommendations];
    
    if (filterTier !== 'all') {
      recs = recs.filter(r => r.tier === filterTier);
    }

    if (sortBy === 'date') {
      recs.sort((a, b) => new Date(a.conferenceDate).getTime() - new Date(b.conferenceDate).getTime());
    } else if (sortBy === 'price') {
      recs.sort((a, b) => {
        const getPrice = (s: string) => { const m = s.match(/\$(\d+)/); return m ? parseInt(m[1]) : 999; };
        return getPrice(a.conferencePriceRange) - getPrice(b.conferencePriceRange);
      });
    }
    // score is default sort from API

    return recs;
  }, [analysis, sortBy, filterTier]);

  const mustAttend = analysis?.recommendations.filter(r => r.tier === 'must-attend') || [];
  const consider = analysis?.recommendations.filter(r => r.tier === 'consider') || [];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Analysis not found</h2>
          <p className="text-gray-400 mb-6">This analysis may have expired or the link is incorrect.</p>
          <Link href="/recommendations" className="px-6 py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-all">
            Run New Analysis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/recommendations" className="text-cyan-400 hover:text-cyan-300 text-sm mb-2 inline-block">
              ← New Analysis
            </Link>
            <h1 className="text-3xl font-bold text-white">Your Conference Strategy</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm tracking-wider">
                {code}
              </span>
              <button
                onClick={copyLink}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                {copied ? '✅ Copied!' : '📋 Share this analysis'}
              </button>
            </div>
          </div>
          <Link
            href="/recommendations"
            className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
          >
            🔄 Run New Analysis
          </Link>
        </div>

        {/* Profile summary */}
        <div className="mb-8 p-6 rounded-xl bg-white/[0.03] border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-3">Your Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Name</div>
              <div className="text-white font-medium">{analysis.profile.name}</div>
            </div>
            {analysis.profile.company && (
              <div>
                <div className="text-gray-500">Company</div>
                <div className="text-white font-medium">{analysis.profile.company}</div>
              </div>
            )}
            <div>
              <div className="text-gray-500">Location</div>
              <div className="text-white font-medium">{analysis.profile.base_location || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-gray-500">Budget</div>
              <div className="text-white font-medium">${analysis.profile.quarterly_budget.toLocaleString()}/conf</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {analysis.profile.focus_areas.map(area => (
              <span key={area} className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-400">{mustAttend.length}</div>
              <div className="text-sm text-gray-400">Must Attend</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{consider.length}</div>
              <div className="text-sm text-gray-400">Recommended</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">${analysis.summary.estimatedCost.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Est. Ticket Cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{analysis.summary.regionsCount}</div>
              <div className="text-sm text-gray-400">Regions</div>
            </div>
          </div>
        </div>

        {/* Filters & sort */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'must-attend', label: '🔴 Must Attend' },
              { value: 'consider', label: '🟡 Recommended' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterTier(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  filterTier === opt.value
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
            <span>Sort:</span>
            {[
              { value: 'score' as const, label: 'Score' },
              { value: 'date' as const, label: 'Date' },
              { value: 'price' as const, label: 'Price' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  sortBy === opt.value ? 'text-white bg-white/10' : 'hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filterTier === 'all' ? (
            <>
              {mustAttend.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    🔴 Must Attend <span className="text-sm text-gray-500 font-normal">({mustAttend.length})</span>
                  </h2>
                  <div className="grid gap-4">
                    {mustAttend.map(rec => <ConferenceCard key={rec.conferenceId} rec={rec} />)}
                  </div>
                </div>
              )}
              {consider.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                    🟡 Highly Recommended <span className="text-sm text-gray-500 font-normal">({consider.length})</span>
                  </h2>
                  <div className="grid gap-4">
                    {consider.map(rec => <ConferenceCard key={rec.conferenceId} rec={rec} />)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-4">
              {filteredRecs.map(rec => <ConferenceCard key={rec.conferenceId} rec={rec} />)}
            </div>
          )}

          {filteredRecs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No conferences match this filter</h3>
              <p className="text-gray-400">Try a different filter to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
