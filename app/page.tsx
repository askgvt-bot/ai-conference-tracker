import { getConferences } from "@/lib/data";
import { ConferenceList } from "@/components/ConferenceList";

export default function Home() {
  const conferences = getConferences();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
          Conference Tracker
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          AI &amp; Creator Economy conferences worldwide, ranked and searchable
        </p>
      </div>
      <ConferenceList conferences={conferences} />
    </div>
  );
}
