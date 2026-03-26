import Link from "next/link";

import { Subject } from "@/lib/types";

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link
      className="surface-card block overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
      href={`/app/subjects/${subject.id}`}
    >
      <div className={`rounded-[20px] bg-gradient-to-br ${subject.accent} p-4`}>
        <p className="eyebrow">Flagship subject</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{subject.name}</h2>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{subject.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {subject.tags.map((tag) => (
          <span className={`pill ${subject.backdrop}`} key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
