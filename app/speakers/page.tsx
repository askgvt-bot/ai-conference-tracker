'use client';

import { getSpeakers, getConferences, Speaker, Conference } from "@/lib/data";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SpeakersContent() {
  /* inner component wrapped by Suspense for useSearchParams */
  const speakers = getSpeakers();
  const conferences = getConferences();
  const searchParams = useSearchParams();
  const conferenceParam = searchParams.get('conference') || '';
  
  const conferenceInfo = conferenceParam ? conferences.find(c => c.id === conferenceParam) : null;
  
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [focusFilter, setFocusFilter] = useState('');
  const [sortBy, setSortBy] = useState('conference_count');
  const [confFilter, setConfFilter] = useState(conferenceParam);

  // Get unique organizations and focus areas for filters
  const organizations = useMemo(() => {
    const orgs = new Set(speakers.map(s => s.organization).filter(Boolean));
    return Array.from(orgs).sort();
  }, [speakers]);

  const focusAreas = useMemo(() => {
    const areas = new Set(speakers.flatMap(s => s.focus_areas));
    return Array.from(areas).sort();
  }, [speakers]);

  // Filter and sort speakers
  const filteredSpeakers = useMemo(() => {
    let filtered = speakers.filter(speaker => {
      const matchesConf = confFilter === '' || speaker.conferences.includes(confFilter);
      if (!matchesConf) return false;
      const matchesSearch = search === '' || 
        speaker.name.toLowerCase().includes(search.toLowerCase()) ||
        speaker.organization.toLowerCase().includes(search.toLowerCase()) ||
        speaker.title.toLowerCase().includes(search.toLowerCase());
      
      const matchesOrg = orgFilter === '' || speaker.organization === orgFilter;
      const matchesFocus = focusFilter === '' || speaker.focus_areas.includes(focusFilter);
      
      return matchesSearch && matchesOrg && matchesFocus;
    });

    // Sort speakers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'importance_score':
          return b.importance_score - a.importance_score;
        case 'conference_count':
        default:
          return b.conference_count - a.conference_count;
      }
    });

    return filtered;
  }, [speakers, search, orgFilter, focusFilter, sortBy, confFilter]);

  // Top speakers (importance score >= 80)
  const topSpeakers = speakers.filter(s => s.importance_score >= 80).sort((a, b) => b.importance_score - a.importance_score);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors mb-6 inline-block">← Back to conferences</Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">AI Conference Speakers</h1>
        <p className="text-gray-400 text-lg">Browse {speakers.length} speakers across 300+ AI conferences worldwide</p>
      </div>

      {/* Conference filter banner */}
      {conferenceInfo && confFilter && (
        <div className="mb-8 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.05] p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Showing speakers for</p>
            <p className="text-lg font-bold text-white">{conferenceInfo.name}</p>
          </div>
          <button
            onClick={() => setConfFilter('')}
            className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/20 transition-colors"
          >
            Show all speakers
          </button>
        </div>
      )}

      {/* Top Speakers Section */}
      {topSpeakers.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Featured Speakers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSpeakers.slice(0, 6).map((speaker) => (
              <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {speaker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{speaker.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{speaker.title}</p>
                    <p className="text-xs text-cyan-400 font-medium">{speaker.organization}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">{speaker.importance_score}</div>
                    <div className="text-xs text-gray-500">importance</div>
                  </div>
                </div>
                
                {speaker.bio && (
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{speaker.bio}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{speaker.conference_count} conference{speaker.conference_count !== 1 ? 's' : ''}</span>
                  <div className="flex gap-2">
                    {speaker.linkedin && (
                      <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" 
                         onClick={(e) => e.stopPropagation()}
                         className="text-blue-400 hover:text-blue-300 transition-colors">
                        LinkedIn
                      </a>
                    )}
                    {speaker.twitter && (
                      <a href={`https://twitter.com/${speaker.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                         onClick={(e) => e.stopPropagation()}
                         className="text-sky-400 hover:text-sky-300 transition-colors">
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
                
                {speaker.focus_areas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {speaker.focus_areas.slice(0, 3).map((area) => (
                      <span key={area} className="px-2 py-1 rounded text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search speakers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
          
          <select
            value={focusFilter}
            onChange={(e) => setFocusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">All Focus Areas</option>
            {focusAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="conference_count">By Conference Count</option>
            <option value="importance_score">By Importance</option>
            <option value="name">By Name</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-400">
          Showing {filteredSpeakers.length} of {speakers.length} speakers
        </p>
      </div>

      {/* All Speakers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpeakers.map((speaker) => {
          const speakerConferences = conferences.filter(c => speaker.conferences.includes(c.id));
          
          return (
            <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/20 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-sm font-bold shrink-0">
                  {speaker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-white mb-1 truncate">{speaker.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{speaker.title}</p>
                  <p className="text-xs text-cyan-400 truncate">{speaker.organization}</p>
                </div>
                {speaker.importance_score > 50 && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{speaker.importance_score}</div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{speaker.conference_count} conference{speaker.conference_count !== 1 ? 's' : ''}</span>
                <div className="flex gap-2">
                  {speaker.linkedin && (
                    <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" 
                       onClick={(e) => e.stopPropagation()}
                       className="text-blue-400 hover:text-blue-300 transition-colors">
                      in
                    </a>
                  )}
                  {speaker.twitter && (
                    <a href={`https://twitter.com/${speaker.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                       onClick={(e) => e.stopPropagation()}
                       className="text-sky-400 hover:text-sky-300 transition-colors">
                      tw
                    </a>
                  )}
                </div>
              </div>
              
              {/* Conference List */}
              {speakerConferences.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Speaking at:</div>
                  <div className="space-y-1">
                    {speakerConferences.slice(0, 3).map((conf) => (
                      <Link key={conf.id} href={`/conference/${conf.id}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="block text-xs text-cyan-400 hover:text-cyan-300 truncate transition-colors">
                        {conf.name}
                      </Link>
                    ))}
                    {speakerConferences.length > 3 && (
                      <div className="text-xs text-gray-500">+{speakerConferences.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Focus Areas */}
              {speaker.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {speaker.focus_areas.slice(0, 2).map((area) => (
                    <span key={area} className="px-2 py-1 rounded text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {area}
                    </span>
                  ))}
                  {speaker.focus_areas.length > 2 && (
                    <span className="px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-500 border border-gray-500/20">
                      +{speaker.focus_areas.length - 2}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filteredSpeakers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No speakers found matching your criteria</p>
          <button
            onClick={() => {
              setSearch('');
              setOrgFilter('');
              setFocusFilter('');
            }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function SpeakersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8 text-gray-400">Loading speakers...</div>}>
      <SpeakersContent />
    </Suspense>
  );
}