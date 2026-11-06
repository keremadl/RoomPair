import type { MatchResult, Preferences, Profile } from "./types";

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
  if (!validBudget) dealbreakers.push("A valid monthly budget is needed.");
  else if (!budgetOverlap)
    dealbreakers.push("Your monthly budgets do not overlap.");
  else if (!roomInBudget)
    dealbreakers.push(
      `The room at ${euros(roomPrice!)} per month is outside your budget.`,
    );

  if (
    !normalize(prefs.city) ||
    normalize(profile.city) !== normalize(prefs.city)
  )
    dealbreakers.push(
      `Looking in ${profile.city}, outside your selected city.`,
    );
  // Room seekers meet people with a room; people with a room meet seekers.
  if (prefs.intent === "have-room" && profile.intent === "have-room")
    dealbreakers.push("You both have a room; neither is looking to move in.");
  if (prefs.intent === "find-room" && profile.intent === "find-room")
    dealbreakers.push(
      "You are both looking for a room; neither has one to share.",
    );
  if (!profile.active)
    dealbreakers.push("This person has paused their search.");
  if (prefs.smokeFree && profile.habits.smoking)
    dealbreakers.push("You selected a smoke-free home.");
  if (!prefs.petsOkay && profile.habits.pets)
    dealbreakers.push("You selected a home without pets.");
  if (prefs.verifiedOnly && !profile.verified)
    dealbreakers.push("This profile does not have a demo verification badge.");

  const daysApart =
    Math.abs(parseDate(profile.moveDate) - parseDate(prefs.moveDate)) / DAY;
  const validDates = Number.isFinite(daysApart);
  if (!validDates)
    dealbreakers.push("Valid move-in dates are needed to compare timing.");
  else if (daysApart > 45)
    dealbreakers.push(
      `Your move-in dates are ${daysApart} days apart (maximum 45).`,
    );

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
  if (!validStay) dealbreakers.push("A valid length of stay is needed.");
  if (
    !Number.isFinite(prefs.cleanliness) ||
    prefs.cleanliness < 1 ||
    prefs.cleanliness > 5 ||
    !Number.isFinite(prefs.social) ||
    prefs.social < 1 ||
    prefs.social > 5
  ) {
    dealbreakers.push("Lifestyle preferences must be between 1 and 5.");
  }

  if (budgetOverlap && roomInBudget)
    reasons.push(
      roomPrice !== undefined
        ? `Room at ${euros(roomPrice)} fits your budget`
        : `Shared budget of ${euros(overlapMin)}–${euros(overlapMax)}`,
    );
  if (cleanDiff === 0) reasons.push("You like the same level of tidiness");
  else if (cleanDiff >= 2)
    considerations.push(
      profile.habits.cleanliness > prefs.cleanliness
        ? "They prefer a tidier home; agree on cleaning expectations."
        : "You prefer a tidier home; agree on cleaning expectations.",
    );
  if (profile.habits.sleep === prefs.sleep)
    reasons.push("Your daily rhythms line up");
  else if (sleepScore === 35)
    considerations.push(
      "You keep different sleep schedules; talk about quiet hours.",
    );
  else
    considerations.push(
      "One of you has a flexible sleep schedule; compare your usual quiet hours.",
    );
  if (socialDiff >= 2)
    considerations.push(
      profile.habits.social > prefs.social
        ? "They enjoy a more social home; talk about guests and downtime."
        : "They prefer a quieter home; talk about guests and downtime.",
    );
  if (validDates && daysApart <= 7)
    reasons.push(
      daysApart === 0
        ? "Same planned move-in date"
        : "You plan to move in the same week",
    );
  else if (validDates && daysApart <= 45)
    considerations.push(
      `Move-in dates differ by ${daysApart} days; check flexibility.`,
    );
  if (validStay && profile.stayMonths !== prefs.stayMonths)
    considerations.push(
      `They want a ${profile.stayMonths}-month stay; you selected ${prefs.stayMonths} months.`,
    );
  if (profile.habits.pets && prefs.petsOkay)
    considerations.push("They have a pet; meet it and discuss shared spaces.");

  const breakdown: MatchResult["breakdown"] = [
    {
      label: "Budget",
      score: Math.round(budgetScore),
      detail:
        roomPrice !== undefined
          ? `${euros(roomPrice)}/month · your budget ${euros(prefs.budgetMin)}–${euros(prefs.budgetMax)} · 25% weight`
          : `${euros(profile.budget[0])}–${euros(profile.budget[1])}/month · 25% weight`,
    },
    {
      label: "Tidiness",
      score: Math.round(cleanScore),
      detail: `You ${prefs.cleanliness}/5 · ${profile.name} ${profile.habits.cleanliness}/5 · 20% weight`,
    },
    {
      label: "Sleep schedule",
      score: sleepScore,
      detail: `You: ${prefs.sleep} · ${profile.name}: ${profile.habits.sleep} · 15% weight`,
    },
    {
      label: "Social energy",
      score: Math.round(socialScore),
      detail: `You ${prefs.social}/5 · ${profile.name} ${profile.habits.social}/5 · 15% weight`,
    },
    {
      label: "Move-in timing",
      score: Math.round(dateScore),
      detail: validDates
        ? `${daysApart} days apart · 15% weight`
        : "Dates unavailable · 15% weight",
    },
    {
      label: "Length of stay",
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
  prefs: Preferences,
): { profile: Profile; match: MatchResult }[] {
  return profiles
    .map((profile) => ({ profile, match: getCompatibility(profile, prefs) }))
    .filter(({ match }) => match.eligible)
    .sort((a, b) => b.match.score - a.match.score);
}
