import { ProgressPanel } from "@/components/progress-panel";

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <p className="eyebrow">Insights</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 italic">Your Mastery Progress</h1>
        <p className="mt-3 max-w-2xl text-lg font-medium text-slate-500">
          Visualizing your growth across subjects. Every drill, mistake, and breakthrough recorded for your study roadmap.
        </p>
      </header>

      <ProgressPanel />
    </div>
  );
}

