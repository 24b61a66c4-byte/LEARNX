"use client";

import Link from "next/link";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { getServerProgressSnapshot, learnerStateGateway } from "@/lib/gateways";
import { LEVEL_XP_STEP } from "@/lib/constants";

function XPRing({ xp, level }: { xp: number; level: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const previousLevelXp = Math.max(0, (level - 1) * LEVEL_XP_STEP);
  const progress = Math.min(1, Math.max(0, (xp - previousLevelXp) / LEVEL_XP_STEP));
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90 transform">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="url(#xp-gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-tighter text-slate-500">Level</span>
        <span className="text-3xl font-black text-slate-950">{level}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "teal" }: { label: string; value: string | number; icon: React.ReactNode; color?: "teal" | "amber" | "rose" }) {
  const colors = {
    teal: "text-teal-600 bg-teal-50 border-teal-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
  };

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-xl font-black text-slate-950">{value}</p>
      </div>
    </div>
  );
}

export function ProgressPanel() {
  const snapshot = useClientSnapshot(
    () => learnerStateGateway.getProgressSnapshot(),
    () => getServerProgressSnapshot(),
  );

  const drillPlans = snapshot.weakTopics.map((topic, index) => ({
    topic,
    title: index === 0 ? "Recovery drill" : "Reinforcement cycle",
    detail:
      topic.accuracy < 50
        ? "Concept gap detected. Review the lesson summary before attempting more drills."
        : "Moderate understanding. A quick practice set will stabilize your recall.",
  }));

  const pacePercent = Math.max(2, 100 - snapshot.rewards.percentile);

  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-8">
        {/* Momentum Overview */}
        <div className="surface-card overflow-hidden p-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
            <div className="space-y-4 text-center sm:text-left">
              <p className="eyebrow">Momentum pulse</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                You're in the <span className="text-teal-600">{snapshot.rewards.leaderboardLabel}</span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-slate-600">
                Consistency is high this week. {snapshot.rewards.nextBadgeLabel}. Keep the streak alive!
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4 justify-center sm:justify-start">
                 <div className="rounded-full bg-slate-900 px-6 py-2 text-xs font-bold text-white shadow-xl shadow-slate-200">
                   {snapshot.rewards.xp} TOTAL XP
                 </div>
                 <div className="rounded-full border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-600">
                   {snapshot.rewards.xpToNextLevel} XP TO NEXT
                 </div>
              </div>
            </div>

            <XPRing xp={snapshot.rewards.xp} level={snapshot.rewards.level} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard 
              label="Attempts" 
              value={snapshot.completedAttempts} 
              color="teal"
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <StatCard 
              label="Streak" 
              value={`${snapshot.rewards.streakDays}d`} 
              color="amber"
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 3 3.333 4.667 3.333 6 0 1.5-.5 3-1.5 4 1 0 1.5-1 1.5-1z" /></svg>}
            />
            <StatCard 
              label="Percentile" 
              value={`Top ${pacePercent}%`} 
              color="rose"
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="surface-panel p-8">
          <p className="eyebrow mb-6">Recent activity</p>
          {snapshot.recentActivity.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-100 p-8 text-center">
              <p className="text-sm font-medium text-slate-500">No activity yet. Your study timeline will build as you practice.</p>
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-slate-100">
              {snapshot.recentActivity.map((item, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white bg-teal-500 shadow-sm" />
                  <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-950">{item.scorePercent}%</span>
                        <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full ${item.scorePercent >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {item.scorePercent >= 80 ? "Mastery" : "Practiced"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-600">
                        {item.subjectId.toUpperCase()} • {item.topicId || "Mixed Practice"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">{item.correctCount}/{item.totalCount} correct</span>
                      <div className="h-8 w-px bg-slate-100" />
                      <span className="text-sm font-black text-teal-600">+{item.xpEarned} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Knowledge Health */}
        <div className="surface-panel p-8">
          <p className="eyebrow mb-6">Knowledge Health</p>
          
          <div className="space-y-6">
            <div>
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Growth priority
              </p>
              {snapshot.weakTopics.length === 0 ? (
                <p className="text-sm italic text-slate-400">Scan complete. No major weak topics detected.</p>
              ) : (
                <div className="space-y-3">
                  {snapshot.weakTopics.map((topic) => (
                    <div className="group rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:bg-slate-50" key={topic.topicId}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{topic.title}</p>
                        <span className="text-xs font-black text-rose-500">{topic.accuracy}%</span>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${topic.accuracy}%` }} />
                      </div>
                      <Link className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-teal-700 opacity-0 transition-opacity group-hover:opacity-100" href={`/app/learn/${topic.subjectId}/${topic.topicId}`}>
                        Fix this now →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Strong anchors
              </p>
              {snapshot.strongTopics.length === 0 ? (
                <p className="text-sm italic text-slate-400">Complete more drills to identify your focus strengths.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {snapshot.strongTopics.map((topic) => (
                    <div className="rounded-full border border-green-100 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 shadow-sm" key={topic.topicId}>
                      {topic.title} • {topic.accuracy}%
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badge Showcase */}
        <div className="surface-panel p-8">
           <div className="mb-6 flex items-center justify-between">
             <p className="eyebrow">Achievements</p>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{snapshot.rewards.badges.length} EARNED</span>
           </div>
          
           <div className="grid grid-cols-3 gap-3">
             {snapshot.rewards.badges.map((badge) => (
               <div key={badge.id} className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-4 text-center transition-all hover:scale-105 active:scale-95" title={badge.description}>
                 <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl shadow-inner group-hover:animate-bounce">
                   🏆
                   <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 group-hover:animate-ping" />
                 </div>
                 <p className="text-[10px] font-black text-amber-900 uppercase leading-tight">{badge.label}</p>
               </div>
             ))}
             {/* Locked placeholder */}
             <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 opacity-40">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl grayscale">
                   🔒
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Coming Next</p>
             </div>
           </div>
        </div>

        {/* Smart Drill Plans */}
        <div className="surface-card bg-slate-950 p-8 text-white shadow-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-teal-400">Drill blueprints</p>
          <h3 className="mt-2 text-2xl font-black italic">Recovery Roadmap</h3>
          
          {drillPlans.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No active recovery plans. Your growth is currently optimal.</p>
          ) : (
            <div className="mt-8 space-y-6">
              {drillPlans.map((plan, idx) => (
                <div className="relative pl-8" key={plan.topic.topicId}>
                  <span className="absolute left-0 top-0 text-xl font-black text-teal-800 opacity-50">0{idx + 1}</span>
                  <p className="text-sm font-black text-white">{plan.title}</p>
                  <p className="mt-1 text-xs font-bold text-teal-400 uppercase">{plan.topic.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{plan.detail}</p>
                  <div className="mt-4 flex gap-3">
                    <Link className="rounded-full bg-white px-5 py-2 text-[10px] font-black uppercase text-slate-950 transition hover:bg-teal-400" href={`/app/learn/${plan.topic.subjectId}/${plan.topic.topicId}`}>
                      Enter Lab
                    </Link>
                    <Link className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-[10px] font-black uppercase text-white transition hover:bg-white/10" href={`/app/learn/${plan.topic.subjectId}/${plan.topic.topicId}#drill-dock`}>
                      Quick Drill
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
