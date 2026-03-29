"use client";

import { useMemo, useState } from "react";

import { useClientSnapshot } from "@/lib/client-snapshot";
import { notesGateway } from "@/lib/gateways";
import { StudyNote, SubjectId } from "@/lib/types";

interface TopicNotesPanelProps {
  subjectId: SubjectId;
  topicId: string;
  topicTitle: string;
  seedNotes: string[];
}

const sourceLabel: Record<StudyNote["source"], string> = {
  manual: "Manual note",
  seed: "Seed card",
  lesson: "Lesson clip",
  tutor: "Tutor note",
  practice: "Correction card",
};

export function TopicNotesPanel({
  subjectId,
  topicId,
  topicTitle,
  seedNotes,
}: TopicNotesPanelProps) {
  const [notesVersion, setNotesVersion] = useState(0);
  const [title, setTitle] = useState(`${topicTitle} quick note`);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const notes = useClientSnapshot(
    () => {
      void notesVersion;
      return notesGateway.getTopicNotes(topicId);
    },
    () => [] as StudyNote[],
  );

  const uniqueSeeds = useMemo(
    () => [...new Set(seedNotes.map((seed) => seed.trim()).filter(Boolean))].slice(0, 4),
    [seedNotes],
  );

  function appendSeed(seed: string) {
    setDraft((current) => {
      const prefix = current.trim() ? `${current.trim()}\n` : "";
      return `${prefix}- ${seed}`;
    });
  }

  function saveNote(source: StudyNote["source"] = "manual") {
    try {
      notesGateway.saveTopicNote({
        subjectId,
        topicId,
        title,
        content: draft,
        source,
      });
      setNotesVersion((current) => current + 1);
      setDraft("");
      setTitle(`${topicTitle} quick note`);
      setError(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message.replace("validation:", "Validation error:") : "Could not save note.");
    }
  }

  function quickSaveSeed(seed: string, index: number) {
    try {
      notesGateway.saveTopicNote({
        subjectId,
        topicId,
        title: `${topicTitle} key idea ${notes.length + index + 1}`,
        content: seed,
        source: "seed",
      });
      setNotesVersion((current) => current + 1);
      setError(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message.replace("validation:", "Validation error:") : "Could not save note.");
    }
  }

  return (
    <section className="surface-card space-y-5 p-5" id="topic-notes">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Notes lane</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Capture the topic while it is still clear</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep quick notes, exam lines, and correction cards beside the lesson instead of losing them in another app.
          </p>
        </div>
        <span className="reward-chip">{notes.length} saved cards</span>
      </div>

      <div className="rounded-[24px] border border-white/35 bg-white/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">Note starters from this topic</p>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Tap to add or save</span>
        </div>
        <div className="mt-4 grid gap-3">
          {uniqueSeeds.map((seed, index) => (
            <div className="rounded-[22px] border border-black/10 bg-slate-50 px-4 py-4" key={seed}>
              <p className="text-sm leading-6 text-slate-700">{seed}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="button-secondary" onClick={() => appendSeed(seed)} type="button">
                  Add to draft
                </button>
                <button className="button-secondary" onClick={() => quickSaveSeed(seed, index)} type="button">
                  Save card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-panel space-y-4 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Draft note</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Use this like a scratchpad for lecture takeaways, definitions, exam points, and drill corrections.
          </p>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">Card title</span>
          <input
            className="field"
            onChange={(event) => setTitle(event.target.value)}
            placeholder={`${topicTitle} quick note`}
            value={title}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">Card content</span>
          <textarea
            className="field min-h-36 resize-y"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write the explanation in your own words, then keep the one line you would revise tomorrow."
            value={draft}
          />
        </label>
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
        <button className="button-primary w-full" disabled={!draft.trim()} onClick={() => saveNote()} type="button">
          Save to notebook
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">Saved topic notebook</p>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Local preview storage</span>
        </div>
        {notes.length ? (
          notes.map((note) => (
            <article className="rounded-[24px] border border-black/10 bg-white/82 px-4 py-4 shadow-sm" key={note.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{note.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{sourceLabel[note.source]}</p>
                </div>
                <button
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    notesGateway.deleteTopicNote(note.id);
                    setNotesVersion((current) => current + 1);
                  }}
                  type="button"
                >
                  Remove
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{note.content}</p>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-slate-500">
            Save one definition, one exam line, or one correction card and the topic notebook starts here.
          </div>
        )}
      </div>
    </section>
  );
}
