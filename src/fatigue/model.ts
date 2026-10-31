export const FATIGUE_LEVELS = ["Low", "Moderate", "High", "Severe"] as const;
export type FatigueLevel = (typeof FATIGUE_LEVELS)[number];
export interface FatigueReading {
  value?: number | null;
  level?: FatigueLevel | "Sleeping";
}
export interface FatigueRepository {
  get(day: number, hour: number, signal: AbortSignal): Promise<FatigueReading>;
}
const object = (x: unknown): Record<string, unknown> | undefined =>
  x !== null && typeof x === "object"
    ? (x as Record<string, unknown>)
    : undefined;
// Select the precomputed fields only. Do not infer levels, round values, or derive fatigue.
export function selectFatigue(
  database: unknown,
  day: number,
  hour: number,
): FatigueReading {
  const rows = object(database)?.daily_schedule;
  if (
    !Array.isArray(rows) ||
    !Number.isInteger(day) ||
    day < 1 ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23
  )
    return {};
  const matches = rows.filter(
    (r) => object(r)?.day === day && object(r)?.hour === hour,
  );
  if (matches.length !== 1) return {};
  const estimate = object(
    object(object(matches[0])?.derived)?.fatigue_estimate,
  );
  return normalizeFatigue({
    value: estimate?.fatigue_percent,
    level: estimate?.fatigue_level,
  });
}
export function normalizeFatigue(reading: unknown): FatigueReading {
  const r = object(reading);
  if (r?.value === null && r.level === "Sleeping") return { value: null, level: "Sleeping" };
  if (
    typeof r?.value !== "number" ||
    !Number.isFinite(r.value) ||
    r.value < 0 ||
    r.value > 100 ||
    !FATIGUE_LEVELS.includes(r.level as FatigueLevel)
  )
    return {};
  return { value: r.value, level: r.level as FatigueLevel };
}
export function fatiguePresentation(
  value: FatigueReading["value"],
  level: FatigueReading["level"],
) {
  const reading = normalizeFatigue({ value, level });
  if (reading.value === null)
    return {
      text: "Sleeping",
      label: "Sleeping",
      value: undefined,
      kind: "sleeping",
    };
  if (reading.value === undefined)
    return {
      text: "Unavailable",
      label: "Unavailable",
      value: undefined,
      kind: "unavailable",
    };
  return {
    text: `${reading.value}%`,
    label: reading.level!,
    value: reading.value,
    kind: reading.level!.toLowerCase(),
  };
}
// Existing demo DaySelector convention: 2026-10-26 corresponds to Day 3.
export function dayForDate(date: string) {
  return (
    3 +
    Math.round(
      (Date.parse(date + "T00:00:00Z") - Date.parse("2026-10-26T00:00:00Z")) /
        86400000,
    )
  );
}

// The shared store owns this UI replay mapping; no calendar dates are inferred from raw data.
export function dateForDay(day: number) {
  if (!Number.isInteger(day) || day < 1 || day > 7)
    throw new Error("Choose a dataset day between 1 and 7.");
  return new Date(Date.parse("2026-10-26T00:00:00Z") + (day - 3) * 86400000)
    .toISOString().slice(0, 10);
}
