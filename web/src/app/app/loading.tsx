export default function ProtectedLoading() {
  return (
    <section className="surface-card p-6">
      <p className="eyebrow">Loading</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Opening your LearnX workspace...</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        The app shell is ready. The current slice is preparing the protected route content.
      </p>
    </section>
  );
}
