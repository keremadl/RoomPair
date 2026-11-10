import english from "./locales/en.json";
import type { MatchResult, Preferences, Profile } from "./types";

/** Same contract as the interface translator, so explanations follow the UI language. */
export type Translate = (
  key: string,
  vars?: Record<string, string | number>,
) => string;
const catalog: Record<string, string> = english;
/** English fallback used by tests and any caller without a translator. */
export const englishText: Translate = (key, vars) =>
  (catalog[key] ?? key).replace(
    /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,
    (token, name: string) =>
      vars && Object.hasOwn(vars, name) ? String(vars[name]) : token,
  );

const DAY = 86_400_000;
const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));
const normalize = (value: string) =>
  value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const euros = (value: number) => `€${Math.round(value)}`;

function parseDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return Number.NaN;
  const date = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(date) &&
    new Date(date).toISOString().slice(0, 10) === value
    ? date
    : Number.NaN;
}

/**
 * Transparent, deterministic fit score: budget 25%, cleanliness 20%, sleep 15%,
 * social rhythm 15%, move date 15%, stay length 10%. Demographics, popularity,
 * likes and verification never improve the score. Strict filters run separately.
 * A score describes declared preferences; it is not a probability of success.
 */
export function getCompatibility(
  profile: Profile,
  prefs: Preferences,
  t: Translate = englishText,
): MatchResult {
  const dealbreakers: string[] = [];
  const reasons: string[] = [];
  const considerations: string[] = [];

  const validBudget =
    Number.isFinite(prefs.budgetMin) &&
    Number.isFinite(prefs.budgetMax) &&
    prefs.budgetMin >= 0 &&
    prefs.budgetMax >= prefs.budgetMin &&
    profile.budget.every(Number.isFinite) &&
    profile.budget[0] >= 0 &&
    profile.budget[1] >= profile.budget[0];
  const overlapMin = Math.max(prefs.budgetMin, profile.budget[0]);
  const overlapMax = Math.min(prefs.budgetMax, profile.budget[1]);
  const budgetOverlap = validBudget && overlapMax >= overlapMin;
  const roomPrice =
    profile.intent === "have-room" ? profile.room?.price : undefined;
  const roomInBudget =
    roomPrice === undefined ||
    (Number.isFinite(roomPrice) &&
      roomPrice >= prefs.budgetMin &&
      roomPrice <= prefs.budgetMax);
  if (!validBudget) dealbreakers.push(t("fit.needBudget"));
  else if (!budgetOverlap) dealbreakers.push(t("fit.noOverlap"));
  else if (!roomInBudget)
    dealbreakers.push(t("fit.roomOutside", { price: euros(roomPrice!) }));

  if (
    !normalize(prefs.city) ||
    normalize(profile.city) !== normalize(prefs.city)
  )
    dealbreakers.push(t("fit.otherCity", { city: profile.city }));
  if (prefs.intent === "have-room" && profile.intent === "have-room")
    dealbreakers.push(t("fit.bothHaveRoom"));
  if (!profile.active) dealbreakers.push(t("fit.paused"));
  if (prefs.smokeFree && profile.habits.smoking)
    dealbreakers.push(t("fit.smokeFree"));
  if (!prefs.petsOkay && profile.habits.pets)
    dealbreakers.push(t("fit.noPets"));
  if (prefs.verifiedOnly && !profile.verified)
    dealbreakers.push(t("fit.notVerified"));

  const daysApart =
    Math.abs(parseDate(profile.moveDate) - parseDate(prefs.moveDate)) / DAY;
  const validDates = Number.isFinite(daysApart);
  if (!validDates) dealbreakers.push(t("fit.needDates"));
  else if (daysApart > 45)
    dealbreakers.push(t("fit.datesTooFar", { days: daysApart }));

  // Ranges sharing one exact boundary are still valid, with a small overlap score.
  const smallerRange = Math.min(
    prefs.budgetMax - prefs.budgetMin,
    profile.budget[1] - profile.budget[0],
  );
  const budgetScore =
    !budgetOverlap || !roomInBudget
      ? 0
      : roomPrice !== undefined
        ? 100
        : smallerRange === 0
          ? 100
          : clamp(50 + ((overlapMax - overlapMin) / smallerRange) * 50);
  const cleanDiff = Math.abs(profile.habits.cleanliness - prefs.cleanliness);
  const socialDiff = Math.abs(profile.habits.social - prefs.social);
  const cleanScore = Number.isFinite(cleanDiff)
    ? clamp(100 - cleanDiff * 25)
    : 0;
  const socialScore = Number.isFinite(socialDiff)
    ? clamp(100 - socialDiff * 25)
    : 0;
  const sleepScore =
    profile.habits.sleep === prefs.sleep
      ? 100
      : profile.habits.sleep === "flexible" || prefs.sleep === "flexible"
        ? 80
        : 35;
  const dateScore = validDates
    ? clamp(100 - Math.max(0, daysApart - 7) * (60 / 38))
    : 0;
  const validStay =
    Number.isFinite(prefs.stayMonths) &&
    Number.isFinite(profile.stayMonths) &&
    prefs.stayMonths > 0 &&
    profile.stayMonths > 0;
  const stayScore = validStay
    ? (Math.min(profile.stayMonths, prefs.stayMonths) /
        Math.max(profile.stayMonths, prefs.stayMonths)) *
      100
    : 0;
  if (!validStay) dealbreakers.push(t("fit.needStay"));
  if (
    !Number.isFinite(prefs.cleanliness) ||
    prefs.cleanliness < 1 ||
    prefs.cleanliness > 5 ||
    !Number.isFinite(prefs.social) ||
    prefs.social < 1 ||
    prefs.social > 5
  ) {
    dealbreakers.push(t("fit.lifestyleRange"));
  }

  if (budgetOverlap && roomInBudget)
    reasons.push(
      roomPrice !== undefined
        ? t("fit.roomFits", { price: euros(roomPrice) })
        : t("fit.sharedBudget", {
            min: euros(overlapMin),
            max: euros(overlapMax),
          }),
    );
  if (cleanDiff === 0) reasons.push(t("fit.sameTidiness"));
  else if (cleanDiff >= 2)
    considerations.push(
      profile.habits.cleanliness > prefs.cleanliness
        ? t("fit.theyTidier")
        : t("fit.youTidier"),
    );
  if (profile.habits.sleep === prefs.sleep) reasons.push(t("fit.sameRhythm"));
  else if (sleepScore === 35) considerations.push(t("fit.differentSleep"));
  else considerations.push(t("fit.flexibleSleep"));
  if (socialDiff >= 2)
    considerations.push(
      profile.habits.social > prefs.social
        ? t("fit.theyMoreSocial")
        : t("fit.theyQuieter"),
    );
  if (validDates && daysApart <= 7)
    reasons.push(daysApart === 0 ? t("fit.sameDate") : t("fit.sameWeek"));
  else if (validDates && daysApart <= 45)
    considerations.push(t("fit.datesDiffer", { days: daysApart }));
  if (validStay && profile.stayMonths !== prefs.stayMonths)
    considerations.push(
      t("fit.stayDiffers", {
        theirs: profile.stayMonths,
        yours: prefs.stayMonths,
      }),
    );
  if (profile.habits.pets && prefs.petsOkay) considerations.push(t("fit.pet"));
  if (prefs.intent === "find-room" && profile.intent === "find-room")
    considerations.push(t("fit.bothSearching"));

  const breakdown: MatchResult["breakdown"] = [
    {
      label: t("fit.label.budget"),
      score: Math.round(budgetScore),
      detail:
        roomPrice !== undefined
          ? t("fit.detail.room", {
              price: euros(roomPrice),
              min: euros(prefs.budgetMin),
              max: euros(prefs.budgetMax),
            })
          : t("fit.detail.budget", {
              min: euros(profile.budget[0]),
              max: euros(profile.budget[1]),
            }),
    },
    {
      label: t("fit.label.tidiness"),
      score: Math.round(cleanScore),
      detail: t("fit.detail.scale", {
        you: prefs.cleanliness,
        name: profile.name,
        them: profile.habits.cleanliness,
        weight: 20,
      }),
    },
    {
      label: t("fit.label.sleep"),
      score: sleepScore,
      detail: t("fit.detail.sleep", {
        you: t(`fit.sleep.${prefs.sleep}`),
        name: profile.name,
        them: t(`fit.sleep.${profile.habits.sleep}`),
      }),
    },
    {
      label: t("fit.label.social"),
      score: Math.round(socialScore),
      detail: t("fit.detail.scale", {
        you: prefs.social,
        name: profile.name,
        them: profile.habits.social,
        weight: 15,
      }),
    },
    {
      label: t("fit.label.timing"),
      score: Math.round(dateScore),
      detail: validDates
        ? t("fit.detail.days", { days: daysApart })
        : t("fit.detail.noDates"),
    },
    {
      label: t("fit.label.stay"),
      score: Math.round(stayScore),
      detail: t("fit.detail.stay", {
        you: prefs.stayMonths,
        name: profile.name,
        them: profile.stayMonths,
      }),
    },
  ];
  const score = Math.round(
    budgetScore * 0.25 +
      cleanScore * 0.2 +
      sleepScore * 0.15 +
      socialScore * 0.15 +
      dateScore * 0.15 +
      stayScore * 0.1,
  );
  return {
    score: clamp(score),
    eligible: dealbreakers.length === 0,
    reasons,
    considerations,
    breakdown,
    dealbreakers,
  };
}

/** Stable ordering preserves curated order when two people have equal scores. */
export function rankProfiles(
  profiles: Profile[],
  prefs: Preferences,
  t: Translate = englishText,
): { profile: Profile; match: MatchResult }[] {
  return profiles
    .map((profile) => ({ profile, match: getCompatibility(profile, prefs, t) }))
    .filter(({ match }) => match.eligible)
    .sort((a, b) => b.match.score - a.match.score);
}
