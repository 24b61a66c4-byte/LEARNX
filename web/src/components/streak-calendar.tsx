"use client";

import {
  DAILY_PRACTICE_TARGET,
  PRACTICE_HISTORY_KEY,
} from "@/lib/constants";
import { useClientSnapshot } from "@/lib/client-snapshot";
import { readLocalStorage } from "@/lib/storage";
import { PracticeResult } from "@/lib/types";

interface StreakDay {
  date: string;
  attempts: number;
  intensity: "none" | "light" | "medium" | "strong";
}

function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayDifference(from: string, to: string): number {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateStreaks(history: PracticeResult[]): {
  currentStreak: number;
  longestStreak: number;
  activityMap: Map<string, number>;
} {
  const activityMap = new Map<string, number>();

  history.forEach((result) => {
    const key = toDayKey(new Date(result.completedAt));
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  });

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDayKey(today);

  const sortedDates = Array.from(activityMap.keys())
    .sort()
    .map((key) => new Date(`${key}T00:00:00`));

  sortedDates.forEach((date) => {
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const diff = getDayDifference(toDayKey(lastDate), toDayKey(date));
      if (diff === 1) {
        tempStreak += 1;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = date;
  });

  if (lastDate) {
    const lastDateKey = toDayKey(lastDate);
    const daysSinceLast = getDayDifference(lastDateKey, todayKey);
    if (daysSinceLast === 0 || daysSinceLast === 1) {
      currentStreak = tempStreak;
    }
  }

  return { currentStreak, longestStreak, activityMap };
}

function getIntensity(attempts: number): StreakDay["intensity"] {
  if (attempts === 0) return "none";
  if (attempts === 1) return "light";
  if (attempts < DAILY_PRACTICE_TARGET) return "medium";
  return "strong";
}

export function StreakCalendar() {
  const history = useClientSnapshot(
    () => readLocalStorage<PracticeResult[]>(PRACTICE_HISTORY_KEY, []),
    () => [],
  );

  const { currentStreak, longestStreak, activityMap } = calculateStreaks(history);

  // Generate calendar grid for past 12 weeks
  const today = new Date();

  // We want to end the grid exactly at today, but aligned to full weeks if possible
  // GitHub style: Rows are Sun-Sat OR Mon-Sun. Let's go Mon-Sun (1-0).
  const endDate = new Date(today);
  const startDate = new Date(endDate);
  // Subtract 12 weeks (84 days) and adjust to previous Monday
  startDate.setDate(endDate.getDate() - 83);
  const startDay = startDate.getDay();
  const diffToMonday = startDay === 0 ? 6 : startDay - 1;
  startDate.setDate(startDate.getDate() - diffToMonday);
  startDate.setHours(0, 0, 0, 0);

  const grid: StreakDay[][] = []; // grid[weekIdx][dayIdx]
  const currentCursor = new Date(startDate);
  
  // Create 12 weeks of data
  for (let w = 0; w < 13; w++) {
    const week: StreakDay[] = [];
    for (let d = 0; d < 7; d++) {
      if (currentCursor > today) {
        // Future days (placeholders)
        week.push({ date: "", attempts: 0, intensity: "none" });
      } else {
        const dayKey = toDayKey(currentCursor);
        const attempts = activityMap.get(dayKey) ?? 0;
        week.push({
          date: dayKey,
          attempts,
          intensity: getIntensity(attempts),
        });
      }
      currentCursor.setDate(currentCursor.getDate() + 1);
    }
    grid.push(week);
  }

  const dayLabels = ["M", "", "W", "", "F", "", "S"];
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Animated Streak Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group relative overflow-hidden rounded-3xl border border-teal-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute -right-4 -top-4 text-6xl opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12">
            {currentStreak > 0 ? "🔥" : "❄️"}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600/70">Current Streak</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-slate-950">
              {currentStreak}
            </span>
            <span className="text-lg font-bold text-slate-400">days</span>
          </div>
          {currentStreak > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
              </span>
              ON FIRE
            </div>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
           <div className="absolute -right-4 -top-4 text-6xl opacity-10 transition-transform group-hover:scale-110 group-hover:-rotate-12">
            🏆
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600/70">Longest Streak</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-slate-950">
              {longestStreak}
            </span>
            <span className="text-lg font-bold text-slate-400">days</span>
          </div>
          <p className="mt-3 text-[10px] font-bold text-amber-700/60 uppercase">Personal Best</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="surface-panel p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{monthLabel} Activity</h3>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Consistency is the key to mastery</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Less</span>
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-[2px] bg-slate-100" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-teal-100" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-teal-300" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-teal-500" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">More</span>
          </div>
        </div>

        <div className="relative overflow-x-auto pb-2">
          <div className="inline-flex gap-1.5 min-w-full">
            {/* Days Column Labels */}
            <div className="flex flex-col gap-1 pr-2 pt-1.5">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-2.5 text-[8px] font-bold text-slate-400 text-right leading-[10px]">
                  {label}
                </div>
              ))}
            </div>

            {/* Grid Weeks */}
            <div className="flex gap-1.5">
              {grid.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const bgColor =
                      day.intensity === "none"
                        ? "bg-slate-100"
                        : day.intensity === "light"
                          ? "bg-teal-100"
                          : day.intensity === "medium"
                            ? "bg-teal-400"
                            : "bg-amber-500 shadow-[0_0_8px_-2px_rgba(245,158,11,0.5)]";

                    return (
                      <div
                        key={day.date || `empty-${weekIdx}-${dayIdx}`}
                        className={`
                          h-2.5 w-2.5 rounded-[2px] transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer
                          ${bgColor} 
                          ${!day.date ? "opacity-20 pointer-events-none" : ""}
                        `}
                        title={day.date ? `${day.date}: ${day.attempts} drills` : ""}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
           <p className="text-[10px] font-medium text-slate-400">
            Current streak: <span className="font-bold text-teal-600">{currentStreak} days</span>
          </p>
          <div className="flex items-center gap-1.5">
             <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Syncing Momentum</span>
          </div>
        </div>
      </div>
    </div>
  );
}

