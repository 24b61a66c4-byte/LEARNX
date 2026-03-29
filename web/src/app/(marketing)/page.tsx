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
  const proofStats = [
    "One doubt clarified -> one drill completed",
    "One explanation -> one saved revision card",
    "One topic session -> no tab switching",
  ];
  const workflow = [
    {
      step: "1",
      title: "Open one topic",
      detail: "Start from a subject shelf, not from a blank AI prompt.",
    },
    {
      step: "2",
      title: "Study in one lane",
      detail: "Keep the lesson, tutor, search cues, and notes visible together.",
    },
    {
      step: "3",
      title: "Close with a drill",
      detail: "Turn understanding into retention before you leave the workspace.",
    },
  ];

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:pb-12">
        <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              LearnX is the all-in-one study workspace, not just another AI web app.
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
                Study smarter. One workspace. Zero tab-switching.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                LearnX is built for engineering students who want the feel of ChatGPT, YouTube recap, notes, web search,
                tutor help, and drills without breaking the study flow every five minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {proofStats.map((stat) => (
                <span className="reward-chip" key={stat}>
                  {stat}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="button-primary" href="/signup">
                Try LearnX Free
              </Link>
              <Link className="button-secondary" href="#workspace-proof">
                See the workspace
              </Link>
            </div>
          </div>

          <div className="surface-card overflow-hidden p-4" id="workspace-proof">
            <div className="rounded-[32px] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(249,115,22,0.16),rgba(255,255,255,0.65))] p-5">
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/78 px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live proof</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">Outcome-first study loop</p>
                  </div>
                  <span className="reward-chip">Clarify -&gt; Save -&gt; Drill</span>
                </div>
                <div className="rounded-[24px] bg-slate-950 px-5 py-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] hero-float">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Student command</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight">
                    &ldquo;Teach this topic like a short lecture, show what to search next, and convert it into revision notes.&rdquo;
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[28px] border border-black/10 bg-white/88 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="eyebrow">Workspace preview</p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Lesson + chat + notes + drill</h2>
                      </div>
                      <span className="reward-chip">Live flow</span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-[22px] border border-black/10 bg-slate-950 px-4 py-4 text-white">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Tutor thread</p>
                        <div className="mt-3 space-y-3 text-sm leading-6">
                          <div className="rounded-[18px] bg-white/12 px-3 py-3">Explain full-wave rectifier with one diagram idea.</div>
                          <div className="rounded-[18px] bg-teal-500/18 px-3 py-3">
                            I&apos;ll explain the waveform, output, ripple advantage, and then turn it into a 5-mark answer.
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-[22px] border border-black/10 bg-white px-4 py-4 shadow-sm">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Notes</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            Full-wave rectifier uses both half cycles, gives higher average DC output, and lower ripple than half-wave.
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-black/10 bg-white px-4 py-4 shadow-sm">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next drill</p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">2-question quick check ready</p>
                          <div className="momentum-meter mt-3">
                            <span data-active="true" />
                            <span data-active="true" />
                            <span data-active="false" />
                            <span data-active="false" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-1">
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
          </div>
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {workflow.map((item) => (
            <div className="surface-panel p-5" key={item.step}>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  {item.step}
                </span>
                <p className="font-semibold text-slate-950">{item.title}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-black/10 bg-white/82 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Student proof block</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Built for measurable study outcomes</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Every session should end with visible output: one concept understood, one note card saved, and one
                drill result recorded.
              </p>
            </div>
            <Link className="button-primary" href="/signup">
              Start your first loop
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] border border-black/10 bg-slate-950 px-4 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Session speed</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">~10 min</p>
              <p className="mt-1 text-sm text-slate-300">Topic open -&gt; tutor answer -&gt; drill score</p>
            </div>
            <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Flow integrity</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">1 workspace</p>
              <p className="mt-1 text-sm text-slate-600">Lesson, tutor, search cues, notes, and drill in one lane</p>
            </div>
            <div className="rounded-[20px] border border-black/10 bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Retention move</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Note + drill closeout</p>
              <p className="mt-1 text-sm text-slate-600">Convert explanation into revision and recall before exit</p>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <div className="surface-card flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Start studying</p>
            <p className="text-sm font-semibold text-slate-950">Open one topic and close it with a drill</p>
          </div>
          <Link className="button-primary whitespace-nowrap" href="/signup">
            Try LearnX
          </Link>
        </div>
      </div>
    </>
  );
}
