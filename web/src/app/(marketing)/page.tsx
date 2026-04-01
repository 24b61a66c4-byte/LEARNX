import Link from "next/link";

const workspacePreview = [
  {
    label: "Lesson lane",
    title: "Keep the concept open",
    detail: "Read one topic without losing the thread.",
  },
  {
    label: "Tutor lane",
    title: "Ask for clarity in place",
    detail: "Get a short lecture or exam-ready answer without leaving the topic.",
  },
  {
    label: "Notebook lane",
    title: "Save the useful line",
    detail: "Turn one explanation into one revision note before you move on.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-black/10 bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            LearnX keeps the lesson, tutor, notes, and drills together.
          </div>

          <div className="space-y-4">
            <p className="eyebrow">Study OS</p>
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              One topic. One tutor. One study loop.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Sign in to reopen your workspace, keep the current topic alive, and move from lesson to notes to drill
              without losing context.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="button-primary" href="/signup">
              Start free
            </Link>
            <Link className="button-secondary" href="/login">
              Log in
            </Link>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Built for kids, teens, and adults. The same page adapts to the learner instead of asking them to rebuild
            context.
          </p>
        </div>

        <div className="surface-card overflow-hidden p-4">
          <div className="rounded-[34px] bg-[linear-gradient(145deg,rgba(15,118,110,0.12),rgba(251,146,60,0.16),rgba(255,255,255,0.72))] p-5">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/82 px-4 py-3 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live loop</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">Topic studio in motion</p>
                </div>
                <span className="reward-chip">Study -&gt; Save -&gt; Drill</span>
              </div>

              <div className="rounded-[28px] bg-slate-950 px-5 py-5 text-white shadow-[0_22px_54px_rgba(15,23,42,0.18)] hero-float">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Tutor prompt</p>
                <p className="mt-3 text-lg font-semibold tracking-tight">
                  Explain the topic like a short lecture, tell me what to search next, and turn it into revision notes
                  before a drill.
                </p>
              </div>

              <div className="grid gap-3">
                {workspacePreview.map((lane, index) => (
                  <div
                    className={`rounded-[24px] border px-4 py-4 shadow-sm ${
                      index === 1 ? "border-black/10 bg-slate-950 text-white" : "border-black/10 bg-white"
                    }`}
                    key={lane.title}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                        index === 1 ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {lane.label}
                    </p>
                    <p
                      className={`mt-2 text-lg font-semibold tracking-tight ${
                        index === 1 ? "text-white" : "text-slate-950"
                      }`}
                    >
                      {lane.title}
                    </p>
                    <p className={`mt-2 text-sm leading-6 ${index === 1 ? "text-slate-200" : "text-slate-600"}`}>
                      {lane.detail}
                    </p>
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
