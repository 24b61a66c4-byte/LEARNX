"use client";

import { useMemo, useState } from "react";

interface SearchLaneProps {
  topicTitle: string;
  topicSummary: string;
  tags: string[];
  searchSuggestions: string[];
  watchLane: Array<{
    title: string;
    detail: string;
  }>;
}

function buildSearchHref(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildVideoHref(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function SearchLane({
  topicTitle,
  topicSummary,
  tags,
  searchSuggestions,
  watchLane,
}: SearchLaneProps) {
  const [query, setQuery] = useState(searchSuggestions[0] ?? `${topicTitle} explained simply`);

  const searchCards = useMemo(
    () => [
      {
        label: "Web result lane",
        title: query,
        detail: "Use this for plain-language explanations, diagrams, examples, and common mistakes.",
        href: buildSearchHref(query),
        action: "Open web search",
      },
      {
        label: "Video recap",
        title: `${topicTitle} short lecture`,
        detail: "Open a YouTube-style recap when you need the feel of a classroom or revision video.",
        href: buildVideoHref(`${topicTitle} lecture explained with examples`),
        action: "Watch recap",
      },
      {
        label: "Exam lane",
        title: `${topicTitle} 5 mark answer viva questions`,
        detail: "Search for exam wording, viva-style prompts, and concise answer frames after understanding the concept.",
        href: buildSearchHref(`${topicTitle} 5 mark answer viva questions`),
        action: "Open exam search",
      },
    ],
    [query, topicTitle],
  );

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5">
        <p className="eyebrow">Search lane</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Search like a student, not like a random tab opener</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{topicSummary}</p>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Search query</span>
          <input className="field" onChange={(event) => setQuery(event.target.value)} value={query} />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {searchSuggestions.map((item) => (
            <button
              className="rounded-full border border-black/10 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-white"
              key={item}
              onClick={() => setQuery(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {searchCards.map((card) => (
            <a
              className="block rounded-[24px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              href={card.href}
              key={card.label}
              rel="noreferrer"
              target="_blank"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
              <p className="mt-2 font-semibold text-slate-950">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
              <p className="mt-3 text-sm font-semibold text-teal-700">{card.action}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="surface-panel p-5">
        <p className="eyebrow">Watch lane</p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Keep the lecture-recapping mindset</h3>
        <div className="mt-4 space-y-3">
          {watchLane.map((item) => (
            <a
              className="block rounded-[22px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm transition hover:bg-white"
              href={buildVideoHref(`${item.title} ${topicTitle}`)}
              key={item.title}
              rel="noreferrer"
              target="_blank"
            >
              <p className="font-semibold text-slate-950">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="surface-panel p-5">
        <p className="eyebrow">Search cues</p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">What to look for while browsing</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span className="pill" key={tag}>
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-[22px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm">
          <p className="text-sm leading-6 text-slate-700">
            Focus on examples, diagrams, mistakes, and exam framing. If a result only gives definitions, search again
            with <strong>examples</strong>, <strong>mistakes</strong>, or <strong>viva questions</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
