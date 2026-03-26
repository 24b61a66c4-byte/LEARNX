import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            LearnX is web-only, but designed to feel like your main study app.
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Learn engineering topics with a lesson flow, tutor flow, and practice flow in one place.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              LearnX launches with DBMS and EDC, wraps learning in a clean app shell, and keeps the path tight:
              choose a subject, understand the topic, ask a doubt, and run a quick drill.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button-primary" href="/signup">
              Create your workspace
            </Link>
            <Link className="button-secondary" href="/login">
              Enter the app
            </Link>
          </div>
        </div>

        <div className="surface-card overflow-hidden p-4">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(245,158,11,0.18))] p-5">
            <div className="grid gap-4">
              <div className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                <p className="eyebrow">Dashboard</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Resume, recommendation, quick practice
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                  <p className="eyebrow">Lesson-first</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Topic pages stay clean, then open tutor and practice in focused work panels.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                  <p className="eyebrow">Exam-aware</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Switch between explanation, exam answer mode, and quick self-check without leaving context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
