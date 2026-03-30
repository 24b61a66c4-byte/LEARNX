"use client";

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
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
      {
        id: "quick-profile",
        label: "Open profile and exports",
        sublabel: "Review your learner setup, streak, and printable progress report.",
        href: "/app/profile",
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
  const sections = useMemo(
    () =>
      query.trim()
        ? results.length === 0
          ? []
          : [
              {
                heading: "Search results",
                items: results,
              },
            ]
        : [
            {
              heading: "Quick actions",
              items: quickActions,
            },
            {
              heading: "Subjects",
              items: subjects,
            },
          ],
    [query, quickActions, results, subjects],
  );
  const visibleItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedIndex(0);
  }, [open, query]);

  useEffect(() => {
    if (selectedIndex >= visibleItems.length) {
      setSelectedIndex(Math.max(0, visibleItems.length - 1));
    }
  }, [selectedIndex, visibleItems.length]);

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

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (visibleItems.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % visibleItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => (current - 1 + visibleItems.length) % visibleItems.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = visibleItems[selectedIndex];
      if (target) {
        openResult(target.href);
      }
    }
  }

  let itemOffset = 0;

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
            onKeyDown={handleInputKeyDown}
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
              sections.map((section) => {
                const sectionOffset = itemOffset;
                itemOffset += section.items.length;

                return (
                  <section className="space-y-2" key={section.heading}>
                    <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {section.heading}
                    </p>
                    <ul className="space-y-2">
                      {section.items.map((item, index) => {
                        const absoluteIndex = sectionOffset + index;
                        const isActive = absoluteIndex === selectedIndex;

                        return (
                          <li key={item.id}>
                            <button
                              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                isActive
                                  ? "border-teal-300 bg-teal-50"
                                  : "border-black/10 bg-white/70 hover:bg-white"
                              }`}
                              onClick={() => openResult(item.href)}
                              onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                              type="button"
                            >
                              <span className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-900">{item.label}</span>
                                <span className="text-sm text-slate-500">{item.sublabel}</span>
                              </span>
                              <span className="reward-chip">{item.tag}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })
            )
          ) : (
            <>
              {sections.map((section) => {
                const sectionOffset = itemOffset;
                itemOffset += section.items.length;

                return (
                  <section className="space-y-2" key={section.heading}>
                    <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {section.heading}
                    </p>
                    <ul className="space-y-2">
                      {section.items.map((item, index) => {
                        const absoluteIndex = sectionOffset + index;
                        const isActive = absoluteIndex === selectedIndex;

                        return (
                          <li key={item.id}>
                            <button
                              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                isActive
                                  ? "border-teal-300 bg-teal-50"
                                  : "border-black/10 bg-white/70 hover:bg-white"
                              }`}
                              onClick={() => openResult(item.href)}
                              onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                              type="button"
                            >
                              <span className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-900">{item.label}</span>
                                <span className="text-sm text-slate-500">{item.sublabel}</span>
                              </span>
                              <span className="reward-chip">{item.tag}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </>
          )}
        </div>
        <div className="border-t border-black/10 px-4 py-3 text-xs text-slate-500 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="command-kbd">Enter</span>
            <span>open highlighted result</span>
            <span className="command-kbd">↑</span>
            <span className="command-kbd">↓</span>
            <span>move through results</span>
            <span className="command-kbd">Ctrl</span>
            <span className="command-kbd">K</span>
            <span>reopen anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
