"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Conference, getFlag, getRegion, formatDateRange, getPriceCategory } from "@/lib/data";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
    score >= 60 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
    score >= 40 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
    "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {score}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    academic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    industry: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    technical: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    executive: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    government: "bg-red-500/20 text-red-300 border-red-500/30",
    mixed: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs border capitalize ${colors[type] || colors.mixed}`}>
      {type}
    </span>
  );
}

function SizeDots({ size }: { size: string }) {
  const count = size === "mega" ? 4 : size === "large" ? 3 : size === "medium" ? 2 : 1;
  return (
    <span className="flex items-center gap-0.5" title={`${size} conference`}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= count ? "bg-cyan-400" : "bg-white/15"}`} />
      ))}
      <span className="ml-1 text-xs text-gray-500 capitalize">{size}</span>
    </span>
  );
}

const REGIONS = ["All", "North America", "Europe", "Asia", "Middle East", "Oceania", "South America"];
const TYPES = ["All", "Academic", "Industry", "Technical", "Executive", "Government"];
const SIZES = ["All", "Small", "Medium", "Large", "Mega"];
const PRICES = ["All", "Free", "<$500", "$500-2000", "$2000+"];
const SORTS = ["Score", "Date", "Name", "Size"];
const MONTHS = (() => {
  const m = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(2026, 2 + i, 1);
    m.push({ label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
  }
  return m;
})();

export function ConferenceList({ conferences }: { conferences: Conference[] }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");
  const [size, setSize] = useState("All");
  const [month, setMonth] = useState("All");
  const [price, setPrice] = useState("All");
  const [sort, setSort] = useState("Score");

  const sizeOrder: Record<string, number> = { small: 1, medium: 2, large: 3, mega: 4 };

  const filtered = useMemo(() => {
    let result = conferences;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.city.toLowerCase().includes(q) ||
        c.location.country.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.speakers.some((s) => s.name.toLowerCase().includes(q) || s.organization.toLowerCase().includes(q))
      );
    }
    if (region !== "All") result = result.filter((c) => getRegion(c.location.country) === region);
    if (type !== "All") result = result.filter((c) => c.type.toLowerCase() === type.toLowerCase());
    if (size !== "All") result = result.filter((c) => c.size.toLowerCase() === size.toLowerCase());
    if (month !== "All") result = result.filter((c) => c.dates.start.startsWith(month));
    if (price !== "All") result = result.filter((c) => getPriceCategory(c.ticket_price.range) === price);

    result = [...result].sort((a, b) => {
      if (sort === "Score") return b.score - a.score;
      if (sort === "Date") return a.dates.start.localeCompare(b.dates.start);
      if (sort === "Name") return a.name.localeCompare(b.name);
      if (sort === "Size") return (sizeOrder[b.size] || 0) - (sizeOrder[a.size] || 0);
      return 0;
    });
    return result;
  }, [conferences, search, region, type, size, month, price, sort, sizeOrder]);

  const activeFilters = useMemo(() => {
    const f: { label: string; clear: () => void }[] = [];
    if (region !== "All") f.push({ label: `Region: ${region}`, clear: () => setRegion("All") });
    if (type !== "All") f.push({ label: `Type: ${type}`, clear: () => setType("All") });
    if (size !== "All") f.push({ label: `Size: ${size}`, clear: () => setSize("All") });
    if (month !== "All") { const m = MONTHS.find((x) => x.value === month); f.push({ label: `Month: ${m?.label}`, clear: () => setMonth("All") }); }
    if (price !== "All") f.push({ label: `Price: ${price}`, clear: () => setPrice("All") });
    return f;
  }, [region, type, size, month, price]);

  const clearAll = useCallback(() => {
    setSearch(""); setRegion("All"); setType("All"); setSize("All"); setMonth("All"); setPrice("All"); setSort("Score");
  }, []);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="Search conferences, speakers, locations, topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select label="Region" value={region} options={REGIONS} onChange={setRegion} />
        <Select label="Type" value={type} options={TYPES} onChange={setType} />
        <Select label="Size" value={size} options={SIZES} onChange={setSize} />
        <Select label="Price" value={price} options={PRICES} onChange={setPrice} />
        <Select label="Sort" value={sort} options={SORTS} onChange={setSort} />
      </div>

      {/* Month pills */}
      <div className="flex gap-2 overflow-x-auto month-scroll pb-3 mb-4">
        <button onClick={() => setMonth("All")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${month === "All" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"}`}>All Months</button>
        {MONTHS.map((m) => (
          <button key={m.value} onClick={() => setMonth(m.value)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${month === m.value ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Active filters & count */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {activeFilters.map((f) => (
          <button key={f.label} onClick={f.clear} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all">
            {f.label} <span className="ml-0.5">×</span>
          </button>
        ))}
        {activeFilters.length > 1 && (
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-white transition-colors">Clear all</button>
        )}
        <span className="ml-auto text-sm text-gray-500">
          Showing {filtered.length} of {conferences.length} conferences
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No conferences match your filters</p>
          <button onClick={clearAll} className="text-cyan-500 hover:text-cyan-400 text-sm">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link key={c.id} href={`/conference/${c.id}`} className="group block rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur hover:bg-white/[0.06] hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2">
                  {c.name}
                </h3>
                <ScoreBadge score={c.score} />
              </div>
              <p className="text-sm text-gray-400 mb-3">
                {formatDateRange(c.dates.start, c.dates.end)}
              </p>
              <p className="text-sm text-gray-300 mb-3">
                {getFlag(c.location.country)} {c.location.city}, {c.location.country}
              </p>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <TypeBadge type={c.type} />
                <SizeDots size={c.size} />
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {c.focus_areas.slice(0, 3).map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400 border border-white/5">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">{c.ticket_price.range}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer hover:border-white/20 transition-all"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0a0a14] text-gray-300">{label}: {o}</option>
      ))}
    </select>
  );
}
