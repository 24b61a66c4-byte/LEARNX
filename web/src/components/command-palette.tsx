"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { catalogGateway } from "@/lib/gateways";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  tag: string;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const subjects = useMemo(
    () =>
      catalogGateway.getSubjects().map((subject) => ({
        id: subject.id,
        label: subject.name,
        sublabel: subject.description,
        href: `/app/subjects/${subject.id}`,
        tag: "Subject",
      })),
    [],
  );
  const quickActions = useMemo<PaletteItem[]>(
    () => [
      {
        id: "quick-ask",
        label: "Ask the AI tutor",
        sublabel: "Open the coach workspace for fast explanations or exam answers.",
        href: "/app/ask",
        tag: "Action",
      },
      {
        id: "quick-practice",
        label: "Start quick practice",
        sublabel: "Protect your streak with a short drill session.",
        href: "/app/practice",
        tag: "Action",
      },
      {
        id: "quick-progress",
        label: "Open rewards and progress",
        sublabel: "See XP, badges, streaks, and recovery targets.",
        href: "/app/progress",
        tag: "Action",
      },
    ],
    [],
  );
  const results = useMemo<PaletteItem[]>(
    () =>
      catalogGateway.search(query).map((result) => ({
        ...result,
        tag: result.sublabel === "Subject" ? "Subject" : "Topic",
      })),
    [query],
  );

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        handleClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, open]);

  if (!open) {
    return null;
  }

  function openResult(href: string) {
    handleClose();
    router.push(href);
  }

  return (
    <div
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/30 px-4 pt-[10vh] backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
    >
      <div className="surface-card w-full max-w-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-black/10 px-4 py-4 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Command center</p>
              <p className="mt-2 text-sm text-slate-600">Jump into a topic, start a drill, or open your tutor flow.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span className="command-kbd">Esc</span>
              close
            </div>
          </div>
          <label className="sr-only" htmlFor="command-palette-search">
            Jump to a subject or topic
          </label>
          <input
            autoFocus
            className="field"
            id="command-palette-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to DBMS, joins, rectifiers..."
            value={query}
          />
        </div>
        <div className="max-h-[55vh] space-y-5 overflow-y-auto px-3 py-3">
          {query.trim() ? (
            results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
                No direct match yet. Try a subject name, topic title, or switch to a quick action below.
              </div>
            ) : (
              <section className="space-y-2">
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Search results
                </p>
                <ul className="space-y-2">
                  {results.map((result) => (
                    <li key={result.id}>
                      <button
                        className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-left transition hover:bg-white"
                        onClick={() => openResult(result.href)}
                        type="button"
                      >
                        <span className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900">{result.label}</span>
                          <span className="text-sm text-slate-500">{result.sublabel}</span>
                        </span>
                        <span className="reward-chip">{result.tag}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          ) : (
            <>
              <section className="space-y-2">
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Quick actions
                </p>
                <ul className="space-y-2">
                  {quickActions.map((action) => (
                    <li key={action.id}>
                      <button
                        className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-left transition hover:bg-white"
                        onClick={() => openResult(action.href)}
                        type="button"
                      >
                        <span className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900">{action.label}</span>
                          <span className="text-sm text-slate-500">{action.sublabel}</span>
                        </span>
                        <span className="reward-chip">{action.tag}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Subjects
                </p>
                <ul className="space-y-2">
                  {subjects.map((subject) => (
                    <li key={subject.id}>
                      <button
                        className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-left transition hover:bg-white"
                        onClick={() => openResult(subject.href)}
                        type="button"
                      >
                        <span className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900">{subject.label}</span>
                          <span className="text-sm text-slate-500">{subject.sublabel}</span>
                        </span>
                        <span className="reward-chip">{subject.tag}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
        <div className="border-t border-black/10 px-4 py-3 text-xs text-slate-500 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="command-kbd">Enter</span>
            <span>open highlighted idea with one click or tap</span>
            <span className="command-kbd">Ctrl</span>
            <span className="command-kbd">K</span>
            <span>reopen anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
