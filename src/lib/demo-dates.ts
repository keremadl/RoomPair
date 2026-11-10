export const DAY = 86_400_000;
export const iso = (time: number) => new Date(time).toISOString().slice(0, 10);

/**
 * The month the demo people plan to move: the first of the month that starts
 * at least two months from today. Their dates are counted from it, so the
 * demo never goes stale.
 */
export function demoMoveMonth(now = new Date()): number {
  const lead = new Date(now.getTime() + 60 * DAY);
  return Date.UTC(lead.getUTCFullYear(), lead.getUTCMonth() + 1, 1);
}
/** A move-in date, as days before or after the start of the demo's move month. */
export const moveIn = (days: number) => iso(demoMoveMonth() + days * DAY);
