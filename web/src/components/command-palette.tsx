"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { catalogGateway } from "@/lib/gateways";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const results = useMemo(() => catalogGateway.search(query), [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/30 px-4 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
    >
      <div className="surface-card w-full max-w-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-black/10 px-4 py-4 sm:px-6">
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
        <div className="max-h-[55vh] overflow-y-auto px-3 py-3">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
              Search for subjects and topics only in v1.
            </div>
          ) : (
            <ul className="space-y-2">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-left transition hover:bg-white"
                    onClick={() => {
                      onClose();
                      router.push(result.href);
                    }}
                    type="button"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">{result.label}</span>
                      <span className="text-sm text-slate-500">{result.sublabel}</span>
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
