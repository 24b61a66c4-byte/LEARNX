import Link from "next/link";

const studyLanes = [
  {
    label: "Lesson lane",
    title: "Keep the concept open while you study",
    detail: "Read one topic without jumping away from the context that explains it.",
  },
  {
    label: "Tutor lane",
    title: "Ask for clarity in the same workspace",
    detail: "Turn a question into a short lecture, exam answer, or search prompt without starting over.",
  },
  {
    label: "Drill lane",
    title: "Finish with one scored pass",
    detail: "Use a short practice set to turn understanding into something you can trust under pressure.",
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
  "One explanation becomes one note",
  "One topic session becomes one drill result",
  "One workspace keeps the study loop alive",
];

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <section className="grid gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            LearnX keeps the lesson, tutor, notes, and drill in one workspace.
          </div>

          <div className="space-y-4">
            <p className="eyebrow">Study OS</p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Ask, study, note, and practice without losing the thread.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              LearnX is built for students who want one calm surface for explanations, search cues, revision cards,
              and scored drills.
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

        <div className="surface-card overflow-hidden p-5">
          <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live loop</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">One topic becomes one study chain.</h2>
            <div className="mt-6 space-y-3">
              {studyLanes.map((lane, index) => (
                <div
                  className={`rounded-[22px] border px-4 py-4 ${
                    index === 1 ? "border-white/18 bg-white/10" : "border-white/10 bg-white/6"
                  }`}
                  key={lane.title}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{lane.label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-white">{lane.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{lane.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
              <p className="text-sm leading-6 text-slate-300">
                The workspace keeps the lesson, tutor, notes, and practice tied to the same topic instead of turning
                into a loose chat thread.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {workflow.map((item) => (
          <div className="surface-panel p-5" key={item.step}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {item.step}
              </span>
              <p className="font-semibold text-slate-950">{item.title}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="surface-card p-6">
          <p className="eyebrow">Why It Feels Different</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            The app is structured around study flow, not isolated prompts.
          </h2>
          <div className="mt-5 space-y-4">
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
                LearnX tunes explanation style and pacing so kids, teens, and adults do not get the same tone by
                default.
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="eyebrow">Built For All Learners</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
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
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
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
    </main>
  );
}
