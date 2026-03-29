"use client";

import {
  DAILY_PRACTICE_TARGET,
  PRACTICE_HISTORY_KEY,
} from "@/lib/constants";
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

  // Build activity map from history
  history.forEach((result) => {
    const key = toDayKey(new Date(result.completedAt));
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  });

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDayKey(today);

  // Sort dates in ascending order
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

  // Check if current streak extends to today or yesterday
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
  const history = readLocalStorage<PracticeResult[]>(PRACTICE_HISTORY_KEY, []);
  const { currentStreak, longestStreak, activityMap } = calculateStreaks(history);

  // Generate calendar grid for past 12 weeks
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 84); // 12 weeks back
  startDate.setHours(0, 0, 0, 0);

  const weeks: StreakDay[][] = [];
  let currentWeek: StreakDay[] = [];

  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    const dayKey = toDayKey(currentDate);
    const attempts = activityMap.get(dayKey) ?? 0;

    currentWeek.push({
      date: dayKey,
      attempts,
      intensity: getIntensity(attempts),
    });

    // Sunday = 0, so if it's Saturday (6) or we're at the last day, push the week
    if (currentDate.getDay() === 6 || currentDate.getTime() === today.getTime()) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthLabel =
    startDate.getMonth() === today.getMonth()
      ? today.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : `${startDate.toLocaleDateString("en-US", { month: "short" })} - ${today.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-sm text-slate-500">Current streak</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{currentStreak}d</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-sm text-slate-500">Longest streak</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{longestStreak}d</p>
        </div>
      </div>

      <div className="surface-panel space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">{monthLabel}</p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-slate-200" />
              <span className="text-slate-600">None</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-blue-200" />
              <span className="text-slate-600">1-2</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-blue-400" />
              <span className="text-slate-600">{3}-{DAILY_PRACTICE_TARGET - 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-blue-600" />
              <span className="text-slate-600">{DAILY_PRACTICE_TARGET}+</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="space-y-1">
            {/* Day labels */}
            <div className="flex gap-1 pl-8">
              {dayLabels.map((label) => (
                <div
                  className="w-2.5 text-center text-[0.65rem] font-medium text-slate-500"
                  key={label}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex flex-col gap-1">
              {weeks.map((week, weekIndex) => (
                <div className="flex gap-1" key={weekIndex}>
                  {weekIndex === 0 && (
                    <div className="w-8 flex-shrink-0" />
                  )}
                  {week.map((day) => {
                    const bgColor =
                      day.intensity === "none"
                        ? "bg-slate-100"
                        : day.intensity === "light"
                          ? "bg-blue-200"
                          : day.intensity === "medium"
                            ? "bg-blue-400"
                            : "bg-blue-600";

                    return (
                      <div
                        className={`h-2.5 w-2.5 rounded ${bgColor} transition hover:ring-1 hover:ring-slate-400`}
                        key={day.date}
                        title={`${day.date}: ${day.attempts} attempt${day.attempts === 1 ? "" : "s"}`}
                      />
                    );
                  })}
                  {weeks.length === 1 && week.length < 7 && (
                    <>
                      {Array.from({
                        length: 7 - week.length,
                      }).map((_, i) => (
                        <div className="h-2.5 w-2.5 opacity-0" key={`empty-${i}`} />
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Last 12 weeks of practice activity. Each square shows a day&apos;s drill count.
        </p>
      </div>
    </div>
  );
}
