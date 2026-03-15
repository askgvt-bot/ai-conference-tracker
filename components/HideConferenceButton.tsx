"use client";

import { useHiddenConferences } from "@/lib/useHiddenConferences";

export function HideConferenceButton({ conferenceId }: { conferenceId: string }) {
  const { isHidden, toggleHidden } = useHiddenConferences();
  const hidden = isHidden(conferenceId);

  return (
    <button
      onClick={() => toggleHidden(conferenceId)}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
        hidden
          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
          : "border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20"
      }`}
    >
      {hidden ? "✓ Interested Again" : "✕ Not Interested"}
    </button>
  );
}
