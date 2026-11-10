import type { Translate } from "./translate";

/** A moment's calendar day where the reader is, as YYYY-MM-DD. */
export function localDay(date: Date = new Date()): string {
  const two = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
}

/** "Today", "Yesterday", or the date ("3 Nov"; with the year when it differs). */
export function dayLabel(
  day: string,
  t: Translate,
  now: Date = new Date(),
): string {
  if (day === localDay(now)) return t("Today");
  const before = new Date(now);
  before.setDate(now.getDate() - 1);
  if (day === localDay(before)) return t("Yesterday");
  const [year, month, date] = day.split("-").map(Number);
  const lang =
    typeof document !== "undefined" ? document.documentElement.lang : "";
  return new Date(year, month - 1, date).toLocaleDateString(
    lang && lang !== "en" ? lang : "en-GB",
    {
      day: "numeric",
      month: "short",
      ...(year === now.getFullYear() ? {} : { year: "numeric" }),
    },
  );
}
