import type { MatchResult, Preferences, Profile } from "./types";
import { english, type Translate } from "./translate";

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
/**
 * What the viewer is looking for. A viewer who has a room is matched on the
 * rent they ask, not on a budget of their own.
 */
export type MatchPreferences = Preferences & { hostRoomPrice?: number };

export function getCompatibility(
  profile: Profile,
  prefs: MatchPreferences,
  /** Translates reasons, things to talk about and factor names. */
  t: Translate = english,
): MatchResult {
  const dealbreakers: string[] = [];
  const reasons: string[] = [];
  const considerations: string[] = [];

  // A host's "budget" is the single price of their room: the other person's
  // range has to include it.
  const hostPrice =
    prefs.intent === "have-room" && Number.isFinite(prefs.hostRoomPrice)
      ? prefs.hostRoomPrice
      : undefined;
  const budgetMin = hostPrice ?? prefs.budgetMin;
  const budgetMax = hostPrice ?? prefs.budgetMax;
  const validBudget =
    Number.isFinite(budgetMin) &&
    Number.isFinite(budgetMax) &&
    budgetMin >= 0 &&
    budgetMax >= budgetMin &&
    profile.budget.every(Number.isFinite) &&
    profile.budget[0] >= 0 &&
    profile.budget[1] >= profile.budget[0];
  const overlapMin = Math.max(budgetMin, profile.budget[0]);
  const overlapMax = Math.min(budgetMax, profile.budget[1]);
  const budgetOverlap = validBudget && overlapMax >= overlapMin;
  const roomPrice =
    profile.intent === "have-room" ? profile.room?.price : undefined;
  const roomInBudget =
    roomPrice === undefined ||
    (Number.isFinite(roomPrice) &&
      roomPrice >= budgetMin &&
      roomPrice <= budgetMax);
  if (!validBudget) dealbreakers.push(t("A valid monthly budget is needed."));
  else if (!budgetOverlap)
    dealbreakers.push(
      hostPrice !== undefined
        ? t("Your room at {price} per month is outside their budget.", {
            price: euros(hostPrice),
          })
        : t("Your monthly budgets do not overlap."),
    );
  else if (!roomInBudget)
    dealbreakers.push(
      t("The room at {price} per month is outside your budget.", {
        price: euros(roomPrice!),
      }),
    );

  if (
    !normalize(prefs.city) ||
    normalize(profile.city) !== normalize(prefs.city)
  )
    dealbreakers.push(
      t("Looking in {city}, outside your selected city.", {
        city: profile.city,
      }),
    );
  // Room seekers meet people with a room; people with a room meet seekers.
  if (prefs.intent === "have-room" && profile.intent === "have-room")
    dealbreakers.push(
      t("You both have a room; neither is looking to move in."),
    );
  if (prefs.intent === "find-room" && profile.intent === "find-room")
    dealbreakers.push(
      t("You are both looking for a room; neither has one to share."),
    );
  if (!profile.active)
    dealbreakers.push(t("This person has paused their search."));
  if (prefs.smokeFree && profile.habits.smoking)
    dealbreakers.push(t("You selected a smoke-free home."));
  if (!prefs.petsOkay && profile.habits.pets)
    dealbreakers.push(t("You selected a home without pets."));
  if (
    (prefs.livingWith === "women" && profile.gender !== "woman") ||
    (prefs.livingWith === "men" && profile.gender !== "man")
  )
    dealbreakers.push(
      prefs.livingWith === "women"
        ? t("You chose to live with women only.")
        : t("You chose to live with men only."),
    );
  if (prefs.verifiedOnly && !profile.verified)
    dealbreakers.push(
      t("This profile does not have a demo verification badge."),
    );

  const daysApart =
    Math.abs(parseDate(profile.moveDate) - parseDate(prefs.moveDate)) / DAY;
  const validDates = Number.isFinite(daysApart);
  if (!validDates)
    dealbreakers.push(t("Valid move-in dates are needed to compare timing."));
  else if (daysApart > 45)
    dealbreakers.push(
      t("Your move-in dates are {days} days apart (maximum 45).", {
        days: daysApart,
      }),
    );

  // Ranges sharing one exact boundary are still valid, with a small overlap score.
  const smallerRange = Math.min(
    budgetMax - budgetMin,
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
  // For whoever has the room, the number is a minimum stay: staying longer
  // is fine, only a shorter stay is a mismatch. Two people who are both
  // searching simply compare how long they plan to stay.
  const minimumStay =
    profile.intent === "have-room"
      ? { minimum: profile.stayMonths, wanted: prefs.stayMonths }
      : prefs.intent === "have-room"
        ? { minimum: prefs.stayMonths, wanted: profile.stayMonths }
        : undefined;
  const stayScore = !validStay
    ? 0
    : minimumStay
      ? clamp((minimumStay.wanted / minimumStay.minimum) * 100)
      : (Math.min(profile.stayMonths, prefs.stayMonths) /
          Math.max(profile.stayMonths, prefs.stayMonths)) *
        100;
  const staysLongEnough =
    minimumStay !== undefined && minimumStay.wanted >= minimumStay.minimum;
  if (!validStay) dealbreakers.push(t("A valid length of stay is needed."));
  if (
    !Number.isFinite(prefs.cleanliness) ||
    prefs.cleanliness < 1 ||
    prefs.cleanliness > 5 ||
    !Number.isFinite(prefs.social) ||
    prefs.social < 1 ||
    prefs.social > 5
  ) {
    dealbreakers.push(t("Lifestyle preferences must be between 1 and 5."));
  }

  if (budgetOverlap && roomInBudget)
    reasons.push(
      roomPrice !== undefined
        ? t("Room at {price} fits your budget", { price: euros(roomPrice) })
        : hostPrice !== undefined
          ? t("Your room at {price} fits their budget", {
              price: euros(hostPrice),
            })
          : t("Shared budget of {min}–{max}", {
              min: euros(overlapMin),
              max: euros(overlapMax),
            }),
    );
  if (cleanDiff === 0) reasons.push(t("You like the same level of tidiness"));
  else if (cleanDiff >= 2)
    considerations.push(
      profile.habits.cleanliness > prefs.cleanliness
        ? t("They prefer a tidier home; agree on cleaning expectations.")
        : t("You prefer a tidier home; agree on cleaning expectations."),
    );
  if (profile.habits.sleep === prefs.sleep)
    reasons.push(t("Your daily rhythms line up"));
  else if (sleepScore === 35)
    considerations.push(
      t("You keep different sleep schedules; talk about quiet hours."),
    );
  else
    considerations.push(
      t(
        "One of you has a flexible sleep schedule; compare your usual quiet hours.",
      ),
    );
  if (socialDiff >= 2)
    considerations.push(
      profile.habits.social > prefs.social
        ? t("They enjoy a more social home; talk about guests and downtime.")
        : t("They prefer a quieter home; talk about guests and downtime."),
    );
  if (validDates && daysApart <= 7)
    reasons.push(
      daysApart === 0
        ? t("Same planned move-in date")
        : t("You plan to move in the same week"),
    );
  else if (validDates && daysApart <= 45)
    considerations.push(
      daysApart === 1
        ? t("Move-in dates differ by 1 day; check flexibility.")
        : t("Move-in dates differ by {days} days; check flexibility.", {
            days: daysApart,
          }),
    );
  if (validStay && profile.stayMonths !== prefs.stayMonths && !staysLongEnough)
    considerations.push(
      t("They want a {theirs}-month stay; you selected {yours} months.", {
        theirs: profile.stayMonths,
        yours: prefs.stayMonths,
      }),
    );
  if (profile.habits.pets && prefs.petsOkay)
    considerations.push(
      t("They have a pet; meet it and discuss shared spaces."),
    );
  // The living-together answers below do not change the score; a big gap
  // becomes something to talk about.
  const freq = { rarely: 0, sometimes: 1, often: 2 } as const;
  const h = profile.habits;
  if (
    h.guests &&
    prefs.guests &&
    Math.abs(freq[h.guests] - freq[prefs.guests]) === 2
  )
    considerations.push(
      h.guests === "often"
        ? t("They often have guests over; agree on how often is fine.")
        : t("You often have guests over; agree on how often is fine."),
    );
  if (
    h.noise &&
    prefs.noise &&
    h.noise !== prefs.noise &&
    (h.noise === "low" || prefs.noise === "low")
  )
    considerations.push(
      h.noise === "low"
        ? t("They need a quiet home; talk about music and calls.")
        : t("You need a quiet home; talk about music and calls."),
    );
  if (
    h.sharing &&
    prefs.sharing &&
    h.sharing !== prefs.sharing &&
    (h.sharing === "separate" || prefs.sharing === "separate")
  )
    considerations.push(
      t(
        "You see sharing food and things differently; agree on what is shared.",
      ),
    );
  if (h.homeDays === "often" && prefs.homeDays === "often")
    considerations.push(
      t("You are both home most days; talk about space to study or work."),
    );

  const breakdown: MatchResult["breakdown"] = [
    {
      label: t("Budget"),
      score: Math.round(budgetScore),
      detail:
        roomPrice !== undefined
          ? `${euros(roomPrice)}/month · your budget ${euros(budgetMin)}–${euros(budgetMax)} · 25% weight`
          : `${euros(profile.budget[0])}–${euros(profile.budget[1])}/month · 25% weight`,
    },
    {
      label: t("Tidiness"),
      score: Math.round(cleanScore),
      detail: `You ${prefs.cleanliness}/5 · ${profile.name} ${profile.habits.cleanliness}/5 · 20% weight`,
    },
    {
      label: t("Sleep schedule"),
      score: sleepScore,
      detail: `You: ${prefs.sleep} · ${profile.name}: ${profile.habits.sleep} · 15% weight`,
    },
    {
      label: t("Social energy"),
      score: Math.round(socialScore),
      detail: `You ${prefs.social}/5 · ${profile.name} ${profile.habits.social}/5 · 15% weight`,
    },
    {
      label: t("Move-in timing"),
      score: Math.round(dateScore),
      detail: validDates
        ? `${daysApart} days apart · 15% weight`
        : "Dates unavailable · 15% weight",
    },
    {
      label: t("Length of stay"),
      score: Math.round(stayScore),
      detail: `You ${prefs.stayMonths} months · ${profile.name} ${profile.stayMonths} months · 10% weight`,
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
  prefs: MatchPreferences,
  t: Translate = english,
): { profile: Profile; match: MatchResult }[] {
  return profiles
    .map((profile) => ({ profile, match: getCompatibility(profile, prefs, t) }))
    .filter(({ match }) => match.eligible)
    .sort((a, b) => b.match.score - a.match.score);
}
