import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="mx-auto min-h-[calc(100vh-77px)] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid min-h-[calc(100vh-10rem)] gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
        <section className="surface-card hidden overflow-hidden lg:block">
          <div className="flex h-full flex-col justify-between bg-[linear-gradient(160deg,rgba(15,118,110,0.14),rgba(249,115,22,0.18),rgba(255,255,255,0.84))] p-8">
            <div className="space-y-6">
              <div>
                <p className="eyebrow">LearnX Workspace</p>
                <h1 className="mt-3 max-w-lg text-5xl font-bold tracking-tight text-slate-950">
                  Keep the whole study loop in one place.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
                  LearnX already connects the lesson, tutor, notes, search cues, and drill flow. Sign in and step
                  straight back into the topic studio instead of rebuilding context from scratch.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[26px] bg-slate-950 px-5 py-5 text-white shadow-[0_24px_52px_rgba(15,23,42,0.18)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Study loop</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight">Lesson → tutor → notes → drill</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    One explanation should become one saved note and one stronger recall cycle before you move on.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    {
                      label: "Topic studios",
                      detail: "Resume one subject without losing the active context.",
                    },
                    {
                      label: "Age-adaptive tutor",
                      detail: "Explanations already tune themselves to the learner profile.",
                    },
                    {
                      label: "Signed-in sync",
                      detail: "Notes, onboarding, and drill results stay attached to your account when you sign in.",
                    },
                  ].map((item) => (
                    <div className="rounded-[22px] border border-white/40 bg-white/84 px-4 py-4 shadow-sm" key={item.label}>
                      <p className="font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/40 bg-white/82 px-5 py-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What feels better here</p>
              <div className="mt-4 space-y-3">
                {[
                  "No blank AI screen as the product",
                  "No lost notes in another app",
                  "No tab-switching between learning and revision",
                ].map((line) => (
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-800" key={line}>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                      ✓
                    </span>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-xl space-y-5">
            <div className="surface-card p-5 lg:hidden">
              <p className="eyebrow">LearnX Workspace</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Return to one calm study loop.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Sign in to reopen your topic studio, saved notes, and latest drill flow.
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
