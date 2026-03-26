import Link from "next/link";

import { Topic } from "@/lib/types";

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link
      className="surface-panel block p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
      href={`/app/learn/${topic.subjectId}/${topic.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Topic</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{topic.title}</h3>
        </div>
        <span className="pill">{Math.round(topic.examImportance * 100)}% exam weight</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{topic.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {topic.tags.map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
