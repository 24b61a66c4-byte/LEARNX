import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <div className="surface-card space-y-5 px-6 py-10">
        <p className="eyebrow">Not found</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">That page is not part of the current LearnX launch.</h1>
        <p className="text-sm leading-7 text-slate-600">
          Try going back to the subject hub or the protected app dashboard.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link className="button-primary" href="/app">
            Go to dashboard
          </Link>
          <Link className="button-secondary" href="/app/subjects">
            Open subjects
          </Link>
        </div>
      </div>
    </section>
  );
}
