"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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
  "Saudi Arabia": "🇸🇦", Thailand: "🇹🇭", Indonesia: "🇮🇩", Taiwan: "🇹🇼", Mexico: "🇲🇽",
  Turkey: "🇹🇷", Poland: "🇵🇱", Denmark: "🇩🇰", Finland: "🇫🇮", Norway: "🇳🇴", Ireland: "🇮🇪",
};

const REGION_MAP: Record<string, string> = {
  USA: "NA", Canada: "NA", Mexico: "NA", UK: "EU", Germany: "EU", France: "EU", Italy: "EU",
  Portugal: "EU", Spain: "EU", Netherlands: "EU", Sweden: "EU", Switzerland: "EU", Austria: "EU",
  Belgium: "EU", Denmark: "EU", Finland: "EU", Norway: "EU", Ireland: "EU", Poland: "EU",
  "Czech Republic": "EU", Turkey: "EU", Japan: "Asia", "South Korea": "Asia", Singapore: "Asia",
  China: "Asia", "Hong Kong": "Asia", India: "Asia", Thailand: "Asia", Indonesia: "Asia",
  Malaysia: "Asia", Vietnam: "Asia", Taiwan: "Asia", Philippines: "Asia", UAE: "ME",
  "Saudi Arabia": "ME", Israel: "ME", Australia: "OC", "New Zealand": "OC", Brazil: "SA",
  Argentina: "SA", Chile: "SA",
};

const REGION_LABELS: Record<string, string> = {
  All: "All", NA: "Americas", EU: "Europe", Asia: "Asia", ME: "Middle East", OC: "Oceania", SA: "S. America",
};

const TYPE_LABELS = ["All", "industry", "academic", "technical", "executive", "government"];

function getFlag(country: string) { return FLAGS[country] || "🌍"; }
function getRegion(country: string) { return REGION_MAP[country] || "Other"; }

function fmtDate(start: string, end: string) {
  const s = new Date(start + "T00:00:00"), e = new Date(end + "T00:00:00");
  const sm = s.toLocaleDateString("en-US", { month: "short" }), em = e.toLocaleDateString("en-US", { month: "short" });
  if (sm === em) return `${sm} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  return `${sm} ${s.getDate()} – ${em} ${e.getDate()}, ${s.getFullYear()}`;
}

function scoreColor(s: number) {
  return s >= 75 ? "bg-emerald-500/15 text-emerald-400" : s >= 50 ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400";
}

function SizeDots({ size }: { size: string }) {
  const n = size === "mega" ? 4 : size === "large" ? 3 : size === "medium" ? 2 : 1;
  return (
    <span className="inline-flex items-center gap-0.5 ml-2">
      {[1, 2, 3, 4].map(i => (
        <span key={i} className={`w-[5px] h-[5px] rounded-full ${i <= n ? "bg-cyan-400" : "bg-white/10"}`} />
      ))}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    industry: "bg-blue-500/15 text-blue-400",
    academic: "bg-purple-500/15 text-purple-400",
    technical: "bg-teal-500/15 text-teal-400",
    executive: "bg-amber-500/15 text-amber-400",
    government: "bg-red-500/15 text-red-400",
    mixed: "bg-indigo-500/15 text-indigo-400",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${colors[type] || colors.mixed}`}>
      {type}
    </span>
  );
}

export default function MobilePage() {
  const [confs, setConfs] = useState<Conference[]>([]);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/conferences")
      .then(r => r.json())
      .then(d => { setConfs(d); setLoading(false); });
  }, []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return confs
      .filter(c => (c.dates.end || c.dates.start) >= today)
      .filter(c => region === "All" || getRegion(c.location.country) === region)
      .filter(c => type === "All" || c.type === type)
      .filter(c => !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.city.toLowerCase().includes(q) ||
        c.location.country.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.focus_areas.some(f => f.toLowerCase().includes(q)) ||
        c.speakers.some(s => s.name.toLowerCase().includes(q) || s.organization.toLowerCase().includes(q))
      )
      .sort((a, b) => b.score - a.score);
  }, [confs, search, region, type, today]);

  return (
    <div className="min-h-dvh bg-[#0a0a12] text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a12]/92 backdrop-blur-xl border-b border-white/5 px-5 pt-5 pb-3">
        <h1 className="text-[26px] font-bold text-white">🎯 AI Conference Tracker</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">{confs.length} conferences worldwide · Scored & ranked</p>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search conferences, speakers, topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-[15px] placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
          />
        </div>
      </div>

      {/* Region filters */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-none">
        {Object.entries(REGION_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRegion(key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              region === key
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                : "border-white/10 text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 px-4 mt-2 overflow-x-auto scrollbar-none">
        {TYPE_LABELS.map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              type === t
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                : "border-white/10 text-slate-400"
            }`}
          >
            {t === "All" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 text-xs text-slate-500">
        {filtered.length} of {confs.length} conferences
      </div>

      {/* List */}
      <div className="px-4 pb-24">
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading conferences...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No conferences match your search</div>
        ) : (
          filtered.map(c => {
            const topSpeakers = c.speakers.slice(0, 2).map(s => s.name).join(", ");
            const extra = c.speakers.length > 2 ? ` +${c.speakers.length - 2}` : "";
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/mobile/conference?id=${c.id}`)}
                className="border border-white/8 rounded-2xl bg-white/[0.03] p-4 mb-2.5 active:scale-[0.98] active:bg-white/[0.06] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-[15px] leading-snug">{c.name}</h3>
                  <div className={`shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold ${scoreColor(c.score)}`}>
                    {c.score}
                  </div>
                </div>
                <div className="text-[13px] text-cyan-400 font-medium mb-1">{fmtDate(c.dates.start, c.dates.end)}</div>
                <div className="text-[13px] text-slate-400 mb-2">
                  {getFlag(c.location.country)} {c.location.city}, {c.location.country}
                  <SizeDots size={c.size} />
                </div>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  <TypeBadge type={c.type} />
                  {c.focus_areas.slice(0, 3).map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">{f}</span>
                  ))}
                </div>
                {topSpeakers && (
                  <div className="text-[11px] text-slate-500">
                    <span className="text-slate-400">{topSpeakers}</span>{extra}
                  </div>
                )}
                <div className="text-[11px] text-slate-600 mt-1">{c.ticket_price.range}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
