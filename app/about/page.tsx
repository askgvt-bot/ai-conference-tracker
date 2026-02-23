import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Conference Tracker",
  description: "About the Conference Tracker project.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">About</h1>
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          <strong className="text-white">Conference Tracker</strong> is a comprehensive directory of AI &amp; Creator Economy conferences happening around the world. We track conferences across academic, industry, creator, technical, executive, and government categories.
        </p>
        <p>
          Each conference is scored based on five factors: <span className="text-cyan-400">speaker quality</span>, <span className="text-cyan-400">event size</span>, <span className="text-cyan-400">topic relevance</span>, <span className="text-cyan-400">networking value</span>, and <span className="text-cyan-400">track record</span>. This helps you quickly identify the most valuable events for your goals.
        </p>
        <p>
          Use the search and filters on the home page to find conferences by region, type, size, date, or price range. The calendar view gives you a month-by-month overview.
        </p>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mt-8">
          <p className="text-sm text-gray-400">
            Data compiled by <strong className="text-white">GVTLabs</strong>. Updated February 2026.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Information may be incomplete or change. Always verify details on the official conference website.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Have a correction or want to add a conference? <a href="mailto:nick@nickhalstead.com" className="text-cyan-500 hover:text-cyan-400">Get in touch</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
