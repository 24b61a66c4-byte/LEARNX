import Link from "next/link";

const workspaceLanes = [
  {
    label: "Lesson lane",
    title: "Keep the concept open while you study",
    detail: "Read the topic, keep the context alive, and stop restarting your thinking from scratch.",
  },
  {
    label: "Tutor lane",
    title: "Ask for clarity without leaving the page",
    detail: "Short lectures, exam-ready answers, web-search cues, and quiz prompts all stay attached to the same topic.",
  },
  {
    label: "Notebook lane",
    title: "Turn explanations into revision cards immediately",
    detail: "One useful answer should become one saved note and one stronger memory trace before you move on.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Open one topic",
    detail: "Start from a study track, not a blank prompt.",
  },
  {
    step: "02",
    title: "Clarify in context",
    detail: "Ask the tutor, search deeper, and save note-ready lines without breaking the session.",
  },
  {
    step: "03",
    title: "Close with a drill",
    detail: "Use one short question set to turn understanding into retention.",
  },
];

const audienceCards = [
  {
    label: "Kids and tweens",
    detail: "Gentler explanations, simpler pacing, and more guided topic flow.",
  },
  {
    label: "Teens",
    detail: "Exam-focused support with note capture, recovery drills, and momentum tracking.",
  },
  {
    label: "Adults",
    detail: "Direct explanations, faster navigation, and one-place revision without tab fatigue.",
  },
];

const productSignals = [
  "One explanation -> one saved note",
  "One topic session -> one drill result",
  "One workspace -> fewer lost study loops",
];

export default function LandingPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-10 sm:px-6 lg:px-8 lg:pb-14">
        <section className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-black/10 bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              LearnX is a study workspace, not another disconnected AI tab.
            </div>

            <div className="space-y-4">
              <p className="eyebrow">Study OS</p>
              <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
                Ask, read, save, and drill from one calm study screen.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                LearnX keeps the lesson, tutor, notes, search cues, and practice loop in one place so students stop
                losing momentum between tabs, tools, and half-finished explanations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {productSignals.map((signal) => (
                <span className="reward-chip" key={signal}>
                  {signal}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="button-primary" href="/signup">
                Start free
              </Link>
              <Link className="button-secondary" href="/login">
                Log in
              </Link>
            </div>
          </div>

          <div className="surface-card overflow-hidden p-4">
            <div className="rounded-[34px] bg-[linear-gradient(145deg,rgba(15,118,110,0.12),rgba(251,146,60,0.16),rgba(255,255,255,0.72))] p-5">
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/82 px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live loop</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">Topic studio in motion</p>
                  </div>
                  <span className="reward-chip">Clarify -&gt; Save -&gt; Drill</span>
                </div>

                <div className="rounded-[28px] bg-slate-950 px-5 py-5 text-white shadow-[0_22px_54px_rgba(15,23,42,0.18)] hero-float">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Student command</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight">
                    “Explain the topic like a short lecture, tell me what to search next, and convert it into revision
                    notes before I take a drill.”
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
                  <div className="rounded-[28px] border border-black/10 bg-white/88 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow">Workspace preview</p>
                        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                          One topic. Four coordinated lanes.
                        </h2>
                      </div>
                      <span className="reward-chip shrink-0">Premium flow</span>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {workspaceLanes.map((lane, index) => (
                        <div
                          className={`rounded-[24px] border px-4 py-4 shadow-sm ${index === 1
                              ? "border-black/10 bg-slate-950 text-white"
                              : "border-black/10 bg-white"
                            }`}
                          key={lane.title}
                        >
                          <p
                            className={`text-xs font-semibold uppercase tracking-[0.18em] ${index === 1 ? "text-slate-300" : "text-slate-500"
                              }`}
                          >
                            {lane.label}
                          </p>
                          <p
                            className={`mt-2 text-lg font-semibold tracking-tight ${index === 1 ? "text-white" : "text-slate-950"
                              }`}
                          >
                            {lane.title}
                          </p>
                          <p
                            className={`mt-2 text-sm leading-6 ${index === 1 ? "text-slate-200" : "text-slate-600"
                              }`}
                          >
                            {lane.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-black/10 bg-white/86 p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Study rhythm
                      </p>
                      <div className="mt-4 grid gap-3">
                        <div className="rounded-[20px] bg-slate-50 px-4 py-4">
                          <p className="text-sm text-slate-500">Topic open</p>
                          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">1 studio</p>
                        </div>
                        <div className="rounded-[20px] bg-slate-50 px-4 py-4">
                          <p className="text-sm text-slate-500">Saved output</p>
                          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Notes + drill</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-black/10 bg-white/86 p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Best use
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        Semester prep, recovery loops, fast topic refresh, and note-first revision for all learner
                        ages.
                      </p>
                    </div>
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
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  {item.step}
                </span>
                <p className="font-semibold text-slate-950">{item.title}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="surface-card p-6">
            <p className="eyebrow">Why It Feels Different</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              The product is built around study flow, not just text generation.
            </h2>
            <div className="mt-5 grid gap-4">
              <div className="rounded-[24px] border border-black/10 bg-slate-950 px-5 py-5 text-white shadow-[0_20px_48px_rgba(15,23,42,0.14)]">
                <p className="text-sm font-semibold">Context stays alive</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  The lesson, tutor, notes, and drill all stay tied to the same topic instead of forcing context resets.
                </p>
              </div>
              <div className="rounded-[24px] border border-black/10 bg-white px-5 py-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Output is visible</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Every study loop should end with something tangible: one clearer concept, one saved note, and one
                  practice result.
                </p>
              </div>
              <div className="rounded-[24px] border border-black/10 bg-white px-5 py-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">It adapts by learner age</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  LearnX already supports age-aware explanations so kids, teens, and adults don’t get the same tone or
                  pacing.
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="eyebrow">Built For All Learners</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              One product, tuned to different study styles and ages.
            </h2>
            <div className="mt-5 grid gap-4">
              {audienceCards.map((card) => (
                <div className="rounded-[24px] border border-black/10 bg-white/86 px-5 py-5 shadow-sm" key={card.label}>
                  <p className="font-semibold text-slate-950">{card.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[30px] border border-black/10 bg-white/84 p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Ready To Start</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Open one topic and keep the whole loop in view.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Create an account, finish onboarding, and LearnX will open the next study studio instead of throwing
                you into a blank AI page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="button-primary" href="/signup">
                Create account
              </Link>
              <Link className="button-secondary" href="/login">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <div className="surface-card flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Start your loop</p>
            <p className="text-sm font-semibold text-slate-950">Open one topic. Save one note. Finish one drill.</p>
          </div>
          <Link className="button-primary whitespace-nowrap" href="/signup">
            Start
          </Link>
        </div>
      </div>
    </>
  );
}
