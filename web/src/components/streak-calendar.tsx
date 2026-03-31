"use client";

import { DAILY_PRACTICE_TARGET, PRACTICE_HISTORY_KEY } from "@/lib/constants";
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
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 83);
  const startDay = startDate.getDay();
  const diffToMonday = startDay === 0 ? 6 : startDay - 1;
  startDate.setDate(startDate.getDate() - diffToMonday);
  startDate.setHours(0, 0, 0, 0);

  const grid: StreakDay[][] = [];
  const currentCursor = new Date(startDate);

  for (let weekIndex = 0; weekIndex < 13; weekIndex += 1) {
    const week: StreakDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      if (currentCursor > today) {
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

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface-card p-6">
          <p className="eyebrow">Current streak</p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl font-semibold tracking-tight text-slate-950">{currentStreak}</span>
            <span className="text-lg font-medium text-slate-500">days</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Practice on consecutive days to keep this number moving.
          </p>
        </div>

        <div className="surface-card p-6">
          <p className="eyebrow">Longest run</p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl font-semibold tracking-tight text-slate-950">{longestStreak}</span>
            <span className="text-lg font-medium text-slate-500">days</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your personal best shows how far the current study routine has already stretched.
          </p>
        </div>
      </div>

      <div className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Activity map</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Past 12 weeks</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Darker squares mean more drill sessions. Build a rhythm first, then chase a streak.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-[3px] bg-slate-100" />
              <div className="h-2.5 w-2.5 rounded-[3px] bg-teal-100" />
              <div className="h-2.5 w-2.5 rounded-[3px] bg-teal-300" />
              <div className="h-2.5 w-2.5 rounded-[3px] bg-teal-500" />
              <div className="h-2.5 w-2.5 rounded-[3px] bg-amber-500" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto pb-2">
          <div className="inline-flex min-w-full gap-2">
            <div className="flex flex-col gap-1 pr-2 pt-5">
              {dayLabels.map((label, index) => (
                <div key={`${label || "blank"}-${index}`} className="h-4 text-right text-[10px] font-semibold text-slate-400">
                  {label}
                </div>
              ))}
            </div>

            <div className="flex gap-1.5">
              {grid.map((week, weekIndex) => (
                <div className="flex flex-col gap-1" key={`week-${weekIndex}`}>
                  {week.map((day, dayIndex) => {
                    const tone =
                      day.intensity === "none"
                        ? "bg-slate-100"
                        : day.intensity === "light"
                          ? "bg-teal-100"
                          : day.intensity === "medium"
                            ? "bg-teal-400"
                            : "bg-amber-500";

                    return (
                      <div
                        aria-label={day.date ? `${day.date}: ${day.attempts} drill${day.attempts === 1 ? "" : "s"}` : "Future day"}
                        className={`h-3.5 w-3.5 rounded-[3px] border border-black/5 ${tone} ${!day.date ? "opacity-20" : ""}`}
                        key={day.date || `empty-${weekIndex}-${dayIndex}`}
                        title={day.date ? `${day.date}: ${day.attempts} drills` : ""}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 text-sm text-slate-500">
          <span>{history.length} practice sessions logged</span>
          <span>{currentStreak > 0 ? `${currentStreak} day streak` : "Start the streak today"}</span>
        </div>
      </div>
    </section>
  );
}
