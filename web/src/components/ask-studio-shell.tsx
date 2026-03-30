import Link from "next/link";

import { Subject, Topic } from "@/lib/types";

interface AskStudioShellProps {
    subject: Subject;
    topics: Topic[];
    activeTopicId?: string;
}

export function AskStudioShell({ subject, topics, activeTopicId }: AskStudioShellProps) {
    const activeTopic = topics.find((topic) => topic.id === activeTopicId);

    return (
        <section className="surface-card overflow-hidden p-6">
            <div className={`rounded-[32px] bg-gradient-to-br ${subject.accent} p-6 sm:p-7`}>
                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.85fr]">
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="eyebrow">Ask AI studio</p>
                            <span className="rounded-full border border-black/10 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                {activeTopic ? "Topic connected" : "Pick a topic"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                                {activeTopic ? activeTopic.title : `Start with ${subject.name}`}
                            </h1>
                            <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                                {activeTopic
                                    ? activeTopic.summary
                                    : "Pick one topic to lock the tutor, search lane, and notes lane into the same study thread."}
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-white/40 bg-white/75 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Topic switcher</p>
                                <span className="text-xs font-semibold text-slate-600">{topics.length} topics available</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {topics.map((topic) => {
                                    const isActive = topic.id === activeTopic?.id;
                                    return (
                                        <Link
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${isActive
                                                    ? "border-slate-950 bg-slate-950 text-white"
                                                    : "border-black/10 bg-white/85 text-slate-700 hover:bg-white"
                                                }`}
                                            href={`/app/ask?subjectId=${subject.id}&topicId=${topic.id}`}
                                            key={topic.id}
                                        >
                                            {topic.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/40 bg-white/80 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Session quality bar</p>
                        <div className="mt-4 grid gap-3">
                            {[
                                activeTopic ? "Topic context attached" : "Attach a topic context",
                                "Ask for concept clarity",
                                "Open search lane for examples",
                                "Save at least one notes card",
                                "End with a drill in practice",
                            ].map((step, index) => (
                                <div className="flex items-center gap-3" key={step}>
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-medium text-slate-800">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
