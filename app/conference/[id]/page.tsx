import { getConferences, getConference, getFlag, formatDateRange, getRegion, getSpeaker, type Conference } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getConferences().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getConference(id);
  if (!c) return { title: "Not Found" };
  return {
    title: `${c.name} — Conference Tracker`,
    description: c.description,
  };
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-gray-400 text-right shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-gray-500 text-right">{value}</span>
    </div>
  );
}

function generateICS(c: { name: string; dates: { start: string; end: string }; location: { city: string; country: string; venue: string }; description: string; website: string }): string {
  const fmt = (d: string) => d.replace(/-/g, "") + "T090000Z";
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Conference Tracker//EN
BEGIN:VEVENT
DTSTART:${fmt(c.dates.start)}
DTEND:${fmt(c.dates.end)}
SUMMARY:${c.name}
LOCATION:${c.location.venue}, ${c.location.city}, ${c.location.country}
DESCRIPTION:${c.description}\\n\\n${c.website}
URL:${c.website}
END:VEVENT
END:VCALENDAR`;
}

export default async function ConferencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getConference(id);
  if (!c) notFound();

  const conferences = getConferences();
  const region = getRegion(c.location.country);
  const related = conferences
    .filter((r) => r.id !== c.id && (getRegion(r.location.country) === region || r.focus_areas.some((f) => c.focus_areas.includes(f))))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const icsData = generateICS(c);
  const icsB64 = Buffer.from(icsData).toString("base64");
  const mapsQuery = encodeURIComponent(`${c.location.venue}, ${c.location.city}, ${c.location.country}`);

  const scoreColor = c.score >= 80 ? "text-emerald-400" : c.score >= 60 ? "text-blue-400" : c.score >= 40 ? "text-amber-400" : "text-zinc-400";

  const maxBreakdown = Math.max(...Object.values(c.score_breakdown));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors mb-6 inline-block">← Back to conferences</Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">{c.name}</h1>
          <span className={`text-4xl font-bold ${scoreColor}`}>{c.score}</span>
        </div>
        <p className="text-gray-400 text-lg mb-4">{c.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Dates:</span> <span className="text-white">{formatDateRange(c.dates.start, c.dates.end)}</span></p>
            <p><span className="text-gray-500">Location:</span> <span className="text-white">{getFlag(c.location.country)} {c.location.city}, {c.location.country}</span></p>
            <p><span className="text-gray-500">Venue:</span> <span className="text-white">{c.location.venue}</span></p>
            <p><span className="text-gray-500">Type:</span> <span className="text-white capitalize">{c.type}</span></p>
            {c.vertical && c.vertical.filter(v => v !== 'general').length > 0 && (
              <p><span className="text-gray-500">Vertical:</span> <span className="text-white">{c.vertical.filter(v => v !== 'general').map(v => {
                const labels: Record<string, string> = { "creator-economy": "Creator Economy", "ai-ml": "AI / ML", "enterprise": "Enterprise", "robotics": "Robotics", "healthcare": "Healthcare", "fintech": "Fintech" };
                return labels[v] || v;
              }).join(', ')}</span></p>
            )}
            <p><span className="text-gray-500">Size:</span> <span className="text-white capitalize">{c.size} (~{c.estimated_attendees.toLocaleString()} attendees)</span></p>
            <p><span className="text-gray-500">Price:</span> <span className="text-white">{c.ticket_price.range}</span></p>
            {c.ticket_price.note && <p className="text-gray-500 text-xs">{c.ticket_price.note}</p>}
            {c.ticket_price.student_discount && <p className="text-xs text-emerald-400">🎓 Student discount available</p>}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Score Breakdown</h3>
          <div className="space-y-2.5">
            <ScoreBar label="Speakers" value={c.score_breakdown.speakers} max={maxBreakdown} />
            <ScoreBar label="Size" value={c.score_breakdown.size} max={maxBreakdown} />
            <ScoreBar label="Relevance" value={c.score_breakdown.relevance} max={maxBreakdown} />
            <ScoreBar label="Networking" value={c.score_breakdown.networking} max={maxBreakdown} />
            <ScoreBar label="Track Record" value={c.score_breakdown.track_record} max={maxBreakdown} />
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Focus Areas</h3>
        <div className="flex flex-wrap gap-2">
          {c.focus_areas.map((f) => (
            <span key={f} className="px-3 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{f}</span>
          ))}
        </div>
      </div>

      {/* Speakers */}
      {c.speakers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Speakers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.speakers.map((s, i) => {
              const speakerData = getSpeaker(s.id);
              const isLinked = !!speakerData;
              
              return isLinked ? (
                <Link key={i} href={`/speakers/${s.id}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3 hover:bg-white/[0.06] hover:border-white/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-sm font-bold shrink-0">
                    {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.title}{s.organization && `, ${s.organization}`}</p>
                    {speakerData && speakerData.conference_count > 1 && (
                      <p className="text-xs text-cyan-400">{speakerData.conference_count} conferences</p>
                    )}
                  </div>
                  <div className="text-cyan-400">→</div>
                </Link>
              ) : (
                <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-400 text-sm font-bold shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.title}{s.organization && `, ${s.organization}`}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {c.speakers.some(s => getSpeaker(s.id)) && (
            <div className="mt-4">
              <Link href={`/speakers?conference=${c.id}`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                View all speakers →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {c.website !== "TBA" && (
          <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors text-sm">
            Visit Website ↗
          </a>
        )}
        <a href={`https://maps.google.com/?q=${mapsQuery}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-sm">
          📍 View on Maps
        </a>
        <a href={`data:text/calendar;base64,${icsB64}`} download={`${c.id}.ics`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-sm">
          📅 Add to Calendar
        </a>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Related Conferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <Link key={r.id} href={`/conference/${r.id}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/20 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-white">{r.name}</h4>
                  <span className="text-xs text-gray-500">{r.score}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{getFlag(r.location.country)} {r.location.city} · {formatDateRange(r.dates.start, r.dates.end)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
