import Link from "next/link";

const workspacePreview = [
  {
    label: "Lesson",
    title: "Continue topic",
    detail: "Read the current lesson.",
  },
  {
    label: "Tutor",
    title: "Ask a question",
    detail: "Get a short answer in place.",
  },
  {
    label: "Notes",
    title: "Save a recap",
    detail: "Keep one clean reminder.",
  },
];

export default function LandingPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Open your study workspace.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Sign in to return to the same lesson, tutor, notes, and drill flow without rebuilding context.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="button-primary" href="/signup">
              Sign up
            </Link>
            <Link className="button-secondary" href="/login">
              Log in
            </Link>
          </div>
        </div>

        <div className="surface-card overflow-hidden p-4">
          <div className="rounded-[32px] border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">Study loop</p>
              </div>
              <span className="reward-chip">Active</span>
            </div>

            <div className="mt-4 space-y-3">
              {workspacePreview.map((lane, index) => (
                <div
                  className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 ${
                    index === 1 ? "border-slate-950 bg-slate-950 text-white" : "border-black/5 bg-slate-50"
                  }`}
                  key={lane.title}
                >
                  <div className="space-y-1">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                      index === 1 ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {lane.label}
                  </p>
                    <p className={`text-sm font-semibold tracking-tight ${index === 1 ? "text-white" : "text-slate-950"}`}>
                      {lane.title}
                    </p>
                  </div>
                  <p className={`max-w-[13rem] text-right text-sm leading-6 ${index === 1 ? "text-slate-200" : "text-slate-600"}`}>
                    {lane.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
