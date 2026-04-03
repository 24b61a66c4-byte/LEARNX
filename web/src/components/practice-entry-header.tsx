"use client";

interface PracticeEntryHeaderProps {
  subjectName: string;
  topicTitle?: string;
}

export function PracticeEntryHeader({ subjectName, topicTitle }: PracticeEntryHeaderProps) {
  return (
    <div className="surface-card relative mb-10 overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-700 via-amber-500 to-slate-950" />
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-4">
          <p className="eyebrow">Topic quiz</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Quiz yourself on {topicTitle || "this topic"}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Finish one focused quiz, then use the results page to decide whether to retry, save notes, or watch a recap.
          </p>
        </div>

        <div className="surface-panel min-w-full max-w-sm p-4 lg:min-w-[18rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quiz flow</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[20px] bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Topic</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{topicTitle || subjectName}</p>
            </div>
            <div className="rounded-[20px] bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Format</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">MCQ + short answer</p>
            </div>
            <div className="rounded-[20px] bg-white/84 px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Next</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">Results and next step</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
