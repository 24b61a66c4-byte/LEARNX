import Link from "next/link";

interface QuestItem {
  id: string;
  title: string;
  detail: string;
  xp: number;
  href: string;
}

export function QuestRail({ items }: { items: QuestItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="surface-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Daily quest rail</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
            Keep the session moving with small wins
          </h3>
        </div>
        <span className="reward-chip">Micro rewards</span>
      </div>

      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            className="min-w-[260px] snap-start rounded-[24px] border border-white/35 bg-white/78 p-4 shadow-sm transition hover:-translate-y-0.5"
            href={item.href}
            key={item.id}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Quest</p>
            <h4 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="reward-chip">+{item.xp} XP</span>
              <span className="text-sm font-semibold text-slate-700">Open</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
