import { LessonBlock as LessonBlockType } from "@/lib/types";

const labelByKind: Record<LessonBlockType["kind"], string> = {
  summary: "Lecture snapshot",
  "deep-dive": "Go deeper",
  steps: "Guided steps",
  example: "Worked example",
  exam: "Exam-ready notes",
  "mistake-watch": "Common mistakes",
  formula: "Memory anchors",
};

export function LessonBlock({ block }: { block: LessonBlockType }) {
  const useStructuredList =
    block.kind === "steps" || block.kind === "formula" || block.kind === "mistake-watch";

  return (
    <article className="surface-panel space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{labelByKind[block.kind]}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{block.title}</h3>
        </div>
        <a className="pill" href="#topic-notes">
          Send to notes lane
        </a>
      </div>

      {useStructuredList ? (
        <ol className="grid gap-3">
          {block.content.map((line, index) => (
            <li
              className="rounded-[24px] border border-black/10 bg-white/82 px-4 py-4 text-sm leading-7 text-slate-700 shadow-sm"
              key={line}
            >
              <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                {index + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
      ) : (
        <div className="space-y-3 text-sm leading-7 text-slate-700">
          {block.content.map((line) => (
            <p
              className="rounded-[22px] border border-black/10 bg-white/78 px-4 py-4 shadow-sm"
              key={line}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}
