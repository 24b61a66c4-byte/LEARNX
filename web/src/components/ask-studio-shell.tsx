import Link from "next/link";

import { getPublicAskHref } from "@/lib/public-routes";
import { Subject, Topic } from "@/lib/types";

interface AskStudioShellProps {
    subject: Subject;
    topics: Topic[];
    activeTopicId?: string;
}

export function AskStudioShell({ subject, topics, activeTopicId }: AskStudioShellProps) {
    const activeTopic = topics.find((topic) => topic.id === activeTopicId);

    return (
        <section className="surface-card overflow-hidden p-5 sm:p-6">
            <div className={`rounded-[30px] bg-gradient-to-br ${subject.accent} p-5 sm:p-6`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="eyebrow">Tutor studio</p>
                            <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                {activeTopic ? "Topic connected" : "Pick a topic"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                {activeTopic ? activeTopic.title : `Start with ${subject.name}`}
                            </h1>
                            <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                                {activeTopic
                                    ? activeTopic.summary
                                    : "Choose one topic to keep the tutor, search, and notes tied to the same study thread."}
                            </p>
                        </div>
                    </div>

                    <div className="surface-panel w-full max-w-sm space-y-3 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Topic switcher</p>
                        <p className="text-sm leading-6 text-slate-600">
                            Keep the tutor dominant. Search and notes stay secondary until you need them.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {topics.map((topic) => {
                                const isActive = topic.id === activeTopic?.id;
                                return (
                                    <Link
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                            isActive
                                                ? "border-slate-950 bg-slate-950 text-white"
                                                : "border-black/10 bg-white/85 text-slate-700 hover:bg-white"
                                        }`}
                                        href={getPublicAskHref(subject.id, topic.id)}
                                        key={topic.id}
                                    >
                                        {topic.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
