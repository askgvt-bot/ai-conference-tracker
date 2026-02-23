"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface Speaker {
  id: string;
  name: string;
  title: string;
  organization: string;
}

interface Conference {
  id: string;
  name: string;
  dates: { start: string; end: string };
  location: { city: string; country: string; venue: string };
  type: string;
  focus_areas: string[];
  size: string;
  estimated_attendees: number;
  website: string;
  ticket_price: { range: string; student_discount?: boolean; note?: string };
  description: string;
  tags: string[];
  speakers: Speaker[];
  score: number;
  score_breakdown: { speakers: number; size: number; relevance: number; networking: number; track_record: number };
}

const FLAGS: Record<string, string> = {
  USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦", Germany: "🇩🇪", France: "🇫🇷", Japan: "🇯🇵",
  "South Korea": "🇰🇷", Singapore: "🇸🇬", Australia: "🇦🇺", Brazil: "🇧🇷", Italy: "🇮🇹",
  Portugal: "🇵🇹", UAE: "🇦🇪", "Hong Kong": "🇭🇰", China: "🇨🇳", India: "🇮🇳", Spain: "🇪🇸",
  Netherlands: "🇳🇱", Sweden: "🇸🇪", Switzerland: "🇨🇭", Austria: "🇦🇹", Israel: "🇮🇱",
  "Saudi Arabia": "🇸🇦", Thailand: "🇹🇭",
};

function getFlag(country: string) { return FLAGS[country] || "🌍"; }

function fmtDate(start: string, end: string) {
  const s = new Date(start + "T00:00:00"), e = new Date(end + "T00:00:00");
  const sm = s.toLocaleDateString("en-US", { month: "short" }), em = e.toLocaleDateString("en-US", { month: "short" });
  if (sm === em) return `${sm} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  return `${sm} ${s.getDate()} – ${em} ${e.getDate()}, ${s.getFullYear()}`;
}

function scoreColor(s: number) {
  return s >= 75 ? "text-emerald-400" : s >= 50 ? "text-blue-400" : "text-amber-400";
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="w-20 text-[11px] text-slate-500 text-right shrink-0 capitalize">{label.replace("_", " ")}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-6 text-[11px] text-slate-400 text-right">{value}</span>
    </div>
  );
}

function ConferenceDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [conf, setConf] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch("/api/conferences")
      .then(r => r.json())
      .then(confs => {
        setConf(confs.find((c: Conference) => c.id === id) || null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (!conf) return <div className="text-center py-20 text-slate-500">Conference not found</div>;

  const c = conf;
  const maxB = Math.max(...Object.values(c.score_breakdown));
  const mapsQ = encodeURIComponent(`${c.location.venue}, ${c.location.city}, ${c.location.country}`);

  return (
    <div className="min-h-dvh bg-[#0a0a12] text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 bg-[#0a0a12]/95 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => router.push("/mobile")} className="text-[22px] text-cyan-400">‹</button>
        <h2 className="text-[15px] font-semibold truncate">{c.name}</h2>
      </div>

      <div className="px-4 py-5 pb-24">
        {/* Hero */}
        <div className={`text-5xl font-extrabold mb-1 ${scoreColor(c.score)}`}>{c.score}</div>
        <h1 className="text-[22px] font-bold leading-tight mb-1.5">{c.name}</h1>
        <div className="text-sm text-cyan-400 font-medium mb-1">{fmtDate(c.dates.start, c.dates.end)}</div>
        <div className="text-[13px] text-slate-400 mb-4">
          {getFlag(c.location.country)} {c.location.city}, {c.location.country} · {c.location.venue}
        </div>
        <p className="text-sm text-slate-400 leading-relaxed mb-5">{c.description}</p>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Type", value: c.type, sub: "" },
            { label: "Size", value: c.size, sub: `~${c.estimated_attendees.toLocaleString()} attendees` },
            { label: "Price", value: c.ticket_price.range, sub: c.ticket_price.note || (c.ticket_price.student_discount ? "🎓 Student discount" : "") },
            { label: "Region", value: `${getFlag(c.location.country)} ${c.location.country}`, sub: "" },
          ].map(item => (
            <div key={item.label} className="border border-white/8 rounded-xl bg-white/[0.03] p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-600 mb-1.5">{item.label}</div>
              <div className="text-sm text-white font-medium capitalize">{item.value}</div>
              {item.sub && <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>}
            </div>
          ))}
        </div>

        {/* Score breakdown */}
        <div className="text-[11px] uppercase tracking-wider text-slate-600 mb-2.5">Score Breakdown</div>
        <div className="mb-6">
          {(["speakers", "size", "relevance", "networking", "track_record"] as const).map(k => (
            <ScoreBar key={k} label={k} value={c.score_breakdown[k]} max={maxB} />
          ))}
        </div>

        {/* Focus areas */}
        <div className="text-[11px] uppercase tracking-wider text-slate-600 mb-2.5">Focus Areas</div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {c.focus_areas.map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full bg-cyan-500/8 text-cyan-400 border border-cyan-500/15">{f}</span>
          ))}
        </div>

        {/* Speakers */}
        {c.speakers.length > 0 && (
          <>
            <div className="text-[11px] uppercase tracking-wider text-slate-600 mb-2.5">Speakers ({c.speakers.length})</div>
            <div className="space-y-1.5 mb-5">
              {c.speakers.slice(0, 10).map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 border border-white/5 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center text-[13px] font-bold text-cyan-400 shrink-0">
                    {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">{s.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{s.title}{s.organization ? `, ${s.organization}` : ""}</div>
                  </div>
                </div>
              ))}
              {c.speakers.length > 10 && (
                <div className="text-xs text-slate-500 mt-2">+{c.speakers.length - 10} more speakers</div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {c.website !== "TBA" && (
            <a href={c.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-cyan-400 text-[#0a0a12] text-[13px] font-semibold inline-flex items-center gap-1.5">
              Visit Website ↗
            </a>
          )}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 text-[13px] font-medium inline-flex items-center gap-1.5">
            📍 Maps
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ConferencePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0a0a12] flex items-center justify-center text-slate-500">Loading...</div>}>
      <ConferenceDetail />
    </Suspense>
  );
}
