"use client";

import { type ReactNode, useState } from "react";

type SupportTab = "search" | "notes";

interface StudySupportDockProps {
  title: string;
  description: string;
  search: ReactNode;
  notes: ReactNode;
  defaultTab?: SupportTab;
}

const TAB_META: Record<SupportTab, { label: string; hint: string }> = {
  search: {
    label: "Search",
    hint: "Web examples & video",
  },
  notes: {
    label: "Notes",
    hint: "Save and revise",
  },
};

export function StudySupportDock({
  title,
  description,
  search,
  notes,
  defaultTab = "search",
}: StudySupportDockProps) {
  const [activeTab, setActiveTab] = useState<SupportTab>(defaultTab);

  return (
    <section className="surface-card space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Support tools</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="reward-chip">Secondary</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_META) as SupportTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const meta = TAB_META[tab];

          return (
            <button
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-2 text-left transition ${
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-black/10 bg-white/84 text-slate-700 hover:bg-white"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{meta.label}</span>
              <span className={`block text-[11px] ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                {meta.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-black/10 bg-white/70 p-1 shadow-sm">
        {activeTab === "search" ? search : notes}
      </div>
    </section>
  );
}
