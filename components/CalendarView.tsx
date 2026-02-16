"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Conference } from "@/lib/data";

const typeColors: Record<string, string> = {
  academic: "bg-purple-500/30 text-purple-300 border-purple-500/40",
  industry: "bg-blue-500/30 text-blue-300 border-blue-500/40",
  technical: "bg-teal-500/30 text-teal-300 border-teal-500/40",
  executive: "bg-amber-500/30 text-amber-300 border-amber-500/40",
  government: "bg-red-500/30 text-red-300 border-red-500/40",
  mixed: "bg-indigo-500/30 text-indigo-300 border-indigo-500/40",
};

export function CalendarView({ conferences }: { conferences: Conference[] }) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // March = 2 (0-indexed)

  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const confsThisMonth = useMemo(() => {
    const ym = `${year}-${String(month + 1).padStart(2, "0")}`;
    return conferences.filter((c) => {
      const start = c.dates.start;
      const end = c.dates.end;
      const monthStart = `${ym}-01`;
      const monthEnd = `${ym}-${String(daysInMonth).padStart(2, "0")}`;
      return start <= monthEnd && end >= monthStart;
    });
  }, [conferences, year, month, daysInMonth]);

  const dayConfs = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return confsThisMonth.filter((c) => c.dates.start <= dateStr && c.dates.end >= dateStr);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={prev} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm">← Prev</button>
        <h2 className="text-xl font-semibold text-white">{monthName}</h2>
        <button onClick={next} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm">Next →</button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {Object.entries(typeColors).map(([t, c]) => (
          <span key={t} className={`px-2 py-0.5 rounded border capitalize ${c}`}>{t}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/10">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-[#0a0a14] p-2 text-center text-xs text-gray-500 font-medium">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} className="bg-[#0a0a14] min-h-[80px] sm:min-h-[100px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const confs = dayConfs(day);
          return (
            <div key={day} className="bg-[#0a0a14] min-h-[80px] sm:min-h-[100px] p-1.5">
              <span className={`text-xs ${confs.length > 0 ? "text-white font-medium" : "text-gray-600"}`}>{day}</span>
              <div className="mt-1 space-y-0.5">
                {confs.slice(0, 3).map((c) => (
                  <Link key={c.id} href={`/conference/${c.id}`} className={`block px-1 py-0.5 rounded text-[9px] sm:text-[10px] truncate border ${typeColors[c.type] || typeColors.mixed} hover:opacity-80 transition-opacity`} title={c.name}>
                    {c.name.length > 20 ? c.name.slice(0, 18) + "…" : c.name}
                  </Link>
                ))}
                {confs.length > 3 && <span className="text-[9px] text-gray-500">+{confs.length - 3} more</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conference list for this month */}
      {confsThisMonth.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Conferences in {monthName} ({confsThisMonth.length})</h3>
          <div className="space-y-2">
            {confsThisMonth.sort((a, b) => a.dates.start.localeCompare(b.dates.start)).map((c) => (
              <Link key={c.id} href={`/conference/${c.id}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${typeColors[c.type]?.split(" ")[0] || "bg-gray-500"}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.location.city}, {c.location.country} · {c.dates.start.slice(5)} → {c.dates.end.slice(5)}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-2">{c.score}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
