"use client";

import { useEffect, useMemo, useState } from "react";

interface StudyVideoDemoProps {
  prompt?: string;
  subjectLabel?: string;
  topicTitle?: string;
  topicSummary?: string;
}

type DemoScene = {
  title: string;
  caption: string;
  chips: string[];
};

const PLANET_SCENES: DemoScene[] = [
  {
    title: "Meet the planets",
    caption: "A kid-friendly pass through the solar system with names always visible on screen.",
    chips: ["Mercury", "Venus", "Earth", "Mars"],
  },
  {
    title: "Outer space tour",
    caption: "Bigger planets show up next so the learner can spot size, color, and order easily.",
    chips: ["Jupiter", "Saturn", "Uranus", "Neptune"],
  },
  {
    title: "Quick memory finish",
    caption: "End with one simple order recap so the names stay easy to remember.",
    chips: ["Sun", "Inner", "Outer", "Order"],
  },
];

function buildGenericScenes(topicTitle: string, topicSummary: string, subjectLabel?: string): DemoScene[] {
  const compactSummary = topicSummary.trim() || `A short visual walkthrough for ${topicTitle}.`;

  return [
    {
      title: `${topicTitle} in one minute`,
      caption: compactSummary,
      chips: [subjectLabel ?? "Study", "Overview", "Simple language"],
    },
    {
      title: "Show one real example",
      caption: `Turn ${topicTitle} into one clear example before moving to formal wording.`,
      chips: ["Example", "Visual cue", "Step by step"],
    },
    {
      title: "End with revision points",
      caption: "Close with one short recap the learner can remember before the quiz starts.",
      chips: ["Recap", "Key idea", "Quiz-ready"],
    },
  ];
}

export function StudyVideoDemo({
  prompt = "",
  subjectLabel,
  topicTitle,
  topicSummary = "",
}: StudyVideoDemoProps) {
  const [playing, setPlaying] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);

  const sourceText = `${prompt} ${topicTitle ?? ""}`.toLowerCase();
  const isPlanetDemo = sourceText.includes("planet") || sourceText.includes("solar");
  const resolvedTopicTitle = topicTitle || prompt || "This topic";
  const scenes = useMemo(
    () => (isPlanetDemo ? PLANET_SCENES : buildGenericScenes(resolvedTopicTitle, topicSummary, subjectLabel)),
    [isPlanetDemo, resolvedTopicTitle, subjectLabel, topicSummary],
  );
  const activeScene = scenes[sceneIndex] ?? scenes[0];

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [playing, scenes.length]);

  return (
    <section className="rounded-[30px] border border-black/10 bg-white/78 p-5 backdrop-blur-sm shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Video demo</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">AI visual recap</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Demo mode for class: turn the current topic into a short visual explainer.
          </p>
        </div>
        <span className="rounded-full border border-black/10 bg-slate-950 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white">
          Demo
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-[28px] bg-slate-950 p-4 text-white shadow-[0_22px_60px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-teal-200">
            Scene {sceneIndex + 1}
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/14"
              onClick={() => setPlaying((current) => !current)}
              type="button"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/14"
              onClick={() => {
                setSceneIndex(0);
                setPlaying(false);
              }}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.25),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.24),transparent_30%),rgba(15,23,42,0.84)] px-5 py-6">
          <p className="text-2xl font-bold tracking-tight">{activeScene.title}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">{activeScene.caption}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {activeScene.chips.map((chip) => (
              <span
                className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85"
                key={chip}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {scenes.map((scene, index) => (
            <button
              aria-label={`Open video scene ${index + 1}: ${scene.title}`}
              className={`h-2 flex-1 rounded-full transition ${
                index === sceneIndex ? "bg-teal-300" : "bg-white/14 hover:bg-white/24"
              }`}
              key={scene.title}
              onClick={() => {
                setSceneIndex(index);
                setPlaying(false);
              }}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
