import Link from "next/link";

export default function LandingPage() {
  const lanes = [
    {
      label: "Chat + tutor",
      title: "Ask like ChatGPT, but keep the lesson context alive",
      detail: "Explainers, exam answers, quizzes, and follow-up search prompts should all come from one study thread.",
    },
    {
      label: "Notes",
      title: "Turn every answer into revision notes immediately",
      detail: "Students should not have to jump to a separate notes app just to keep what they learned.",
    },
    {
      label: "Search + watch",
      title: "Think like web search and video recap, inside the workspace",
      detail: "LearnX should suggest what to search, what to watch, and what to save next.",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            LearnX is the all-in-one study workspace, not just another AI web app.
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              One screen for chat, notes, lesson flow, revision, search thinking, and tutor help.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              LearnX is built for students who want the feel of ChatGPT, a lecture recap, note-making, practice, and
              web-assisted learning without opening five different tabs to study one topic.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button-primary" href="/signup">
              Open your student workspace
            </Link>
            <Link className="button-secondary" href="/login">
              Enter LearnX
            </Link>
          </div>
        </div>

        <div className="surface-card overflow-hidden p-4">
          <div className="rounded-[32px] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(249,115,22,0.16),rgba(255,255,255,0.65))] p-5">
            <div className="grid gap-4">
              <div className="rounded-[24px] bg-slate-950 px-5 py-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Workspace command</p>
                <p className="mt-3 text-lg font-semibold tracking-tight">
                  “Teach joins like a short lecture, show what I should search, and turn it into exam notes.”
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {lanes.map((lane) => (
                  <div className="rounded-[24px] bg-white/85 p-5 shadow-sm" key={lane.title}>
                    <p className="eyebrow">{lane.label}</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{lane.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{lane.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
