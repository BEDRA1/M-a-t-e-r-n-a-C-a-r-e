import type { Pregnancy } from "./types";

const DAY_MS = 86_400_000;
const FULL_TERM_DAYS = 280;
export const TOTAL_WEEKS = 40;

export const TRIMESTER_LABELS = ["الثلث الأول", "الثلث الثاني", "الثلث الثالث"] as const;

/** 1-13 الأول، 14-27 الثاني، 28+ الثالث */
export function trimesterIndex(weeks: number): 0 | 1 | 2 {
  return weeks < 14 ? 0 : weeks < 28 ? 1 : 2;
}

/** الشهر من 1 إلى 9 — 280 يومًا مقسومة على 9 أشهر */
export function pregnancyMonth(totalDays: number): number {
  return Math.min(9, Math.floor(totalDays / (FULL_TERM_DAYS / 9)) + 1);
}

export function daysUntil(isoDate: string, now = Date.now()): number {
  return Math.ceil((new Date(isoDate).getTime() - now) / DAY_MS);
}

/** أسبوع المحتوى المعروض: الأسابيع المكتملة محصورة بين 1 و40 */
export function contentWeek(weeks: number): number {
  return Math.min(TOTAL_WEEKS, Math.max(1, weeks));
}

/** تاريخ البداية المحسوب في المستقبل يعني أن التاريخ المُدخل خاطئ (عمر الحمل يظهر 0) */
export function hasFutureStartDate(p: Pregnancy, now = Date.now()): boolean {
  return p.gestationalAge.totalDays === 0 && new Date(p.dueDate).getTime() - now > FULL_TERM_DAYS * DAY_MS;
}

const toInputDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** حدود حقل تاريخ آخر دورة: لا مستقبل، ولا أقدم من 42 أسبوعًا (حمل منتهٍ) */
export function lmpInputBounds(now = new Date()): { min: string; max: string } {
  return { min: toInputDate(new Date(now.getTime() - 42 * 7 * DAY_MS)), max: toInputDate(now) };
}
