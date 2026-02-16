import { getSpeaker, getSpeakers, getConferencesBySpeaker, formatDateRange, getFlag } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getSpeakers().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const speaker = getSpeaker(id);
  if (!speaker) return { title: "Speaker Not Found" };
  return {
    title: `${speaker.name} — AI Conference Tracker`,
    description: `${speaker.name}, ${speaker.title} at ${speaker.organization}. Speaking at ${speaker.conference_count} AI conferences. ${speaker.bio}`,
  };
}

export default async function SpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const speaker = getSpeaker(id);
  if (!speaker) notFound();

  const speakerConferences = getConferencesBySpeaker(id);

  // Calculate stats for this speaker
  const totalAttendees = speakerConferences.reduce((sum, conf) => sum + conf.estimated_attendees, 0);
  const avgConferenceScore = speakerConferences.length > 0 
    ? Math.round(speakerConferences.reduce((sum, conf) => sum + conf.score, 0) / speakerConferences.length)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/speakers" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors mb-6 inline-block">← Back to speakers</Link>

      {/* Speaker Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {speaker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{speaker.name}</h1>
            <p className="text-lg text-gray-300 mb-2">{speaker.title}</p>
            <p className="text-cyan-400 font-semibold text-lg">{speaker.organization}</p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              {speaker.linkedin && (
                <a 
                  href={speaker.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                >
                  LinkedIn ↗
                </a>
              )}
              {speaker.twitter && (
                <a 
                  href={`https://twitter.com/${speaker.twitter.replace('@', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm hover:bg-sky-600 transition-colors"
                >
                  Twitter ↗
                </a>
              )}
            </div>
          </div>
          
          {/* Importance Score */}
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-400">{speaker.importance_score}</div>
            <div className="text-sm text-gray-500">importance</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <div className="text-2xl font-bold text-white mb-1">{speaker.conference_count}</div>
          <div className="text-sm text-gray-400">Conference{speaker.conference_count !== 1 ? 's' : ''}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <div className="text-2xl font-bold text-white mb-1">{totalAttendees.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Reach</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <div className="text-2xl font-bold text-white mb-1">{avgConferenceScore}</div>
          <div className="text-sm text-gray-400">Avg Conference Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bio & Focus Areas */}
        <div>
          {speaker.bio && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Bio</h3>
              <p className="text-gray-300 leading-relaxed">{speaker.bio}</p>
            </div>
          )}

          {/* Focus Areas */}
          {speaker.focus_areas.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {speaker.focus_areas.map((area) => (
                  <span 
                    key={area} 
                    className="px-3 py-1.5 rounded-full text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Facts */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Quick Facts</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Organization</span>
              <span className="text-white font-medium">{speaker.organization}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Speaking Events</span>
              <span className="text-white font-medium">{speaker.conference_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Attendees</span>
              <span className="text-white font-medium">{totalAttendees.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Focus Areas</span>
              <span className="text-white font-medium">{speaker.focus_areas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Importance Score</span>
              <span className="text-emerald-400 font-bold">{speaker.importance_score}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conferences */}
      {speakerConferences.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Speaking at {speakerConferences.length} Conference{speakerConferences.length !== 1 ? 's' : ''}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speakerConferences.map((conference) => {
              const scoreColor = conference.score >= 80 ? "text-emerald-400" : 
                                conference.score >= 60 ? "text-blue-400" : 
                                conference.score >= 40 ? "text-amber-400" : "text-zinc-400";
              
              return (
                <Link 
                  key={conference.id} 
                  href={`/conference/${conference.id}`}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-base font-semibold text-white line-clamp-2">{conference.name}</h4>
                    <span className={`text-lg font-bold ${scoreColor} shrink-0`}>{conference.score}</span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span>{getFlag(conference.location.country)} {conference.location.city}</span>
                    </div>
                    <div>{formatDateRange(conference.dates.start, conference.dates.end)}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{conference.size} • {conference.estimated_attendees.toLocaleString()} attendees</span>
                    <span className="text-cyan-400">View details →</span>
                  </div>
                  
                  {conference.focus_areas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {conference.focus_areas.slice(0, 3).map((area) => (
                        <span key={area} className="px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          {area}
                        </span>
                      ))}
                      {conference.focus_areas.length > 3 && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-500 border border-gray-500/20">
                          +{conference.focus_areas.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Speakers - speakers from same organization or with overlapping focus areas */}
      {(() => {
        const allSpeakers = getSpeakers();
        const relatedSpeakers = allSpeakers
          .filter((s) => s.id !== speaker.id)
          .filter((s) => 
            s.organization === speaker.organization || 
            s.focus_areas.some((area) => speaker.focus_areas.includes(area))
          )
          .sort((a, b) => {
            // Prioritize same organization, then importance score
            if (a.organization === speaker.organization && b.organization !== speaker.organization) return -1;
            if (b.organization === speaker.organization && a.organization !== speaker.organization) return 1;
            return b.importance_score - a.importance_score;
          })
          .slice(0, 4);

        return relatedSpeakers.length > 0 ? (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Related Speakers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedSpeakers.map((relatedSpeaker) => (
                <Link 
                  key={relatedSpeaker.id} 
                  href={`/speakers/${relatedSpeaker.id}`}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-sm font-bold shrink-0">
                      {relatedSpeaker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1 truncate">{relatedSpeaker.name}</h4>
                      <p className="text-xs text-gray-400 mb-1 truncate">{relatedSpeaker.title}</p>
                      <p className="text-xs text-cyan-400 truncate">{relatedSpeaker.organization}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{relatedSpeaker.conference_count} conference{relatedSpeaker.conference_count !== 1 ? 's' : ''}</span>
                        {relatedSpeaker.importance_score >= 70 && (
                          <span className="text-emerald-400">★ {relatedSpeaker.importance_score}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}