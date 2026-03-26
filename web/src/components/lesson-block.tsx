import { LessonBlock as LessonBlockType } from "@/lib/types";

const labelByKind: Record<LessonBlockType["kind"], string> = {
  summary: "Quick overview",
  "deep-dive": "Go deeper",
  steps: "Step by step",
  example: "Worked example",
  exam: "Exam mode",
  "mistake-watch": "Watch out",
  formula: "Memory anchors",
};

export function LessonBlock({ block }: { block: LessonBlockType }) {
  return (
    <article className="surface-panel space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{labelByKind[block.kind]}</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{block.title}</h3>
        </div>
      </div>
      <div className="space-y-3 text-sm leading-7 text-slate-700">
        {block.content.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </article>
  );
}
