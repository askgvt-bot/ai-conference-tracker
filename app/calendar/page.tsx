import { getConferences, getFlag } from "@/lib/data";
import Link from "next/link";
import type { Metadata } from "next";
import { CalendarView } from "@/components/CalendarView";

export const metadata: Metadata = {
  title: "Calendar — Conference Tracker",
  description: "View all conferences on a monthly calendar grid.",
};

export default function CalendarPage() {
  const conferences = getConferences();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Conference Calendar</h1>
      <CalendarView conferences={conferences} />
    </div>
  );
}
