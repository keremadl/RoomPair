import assert from "node:assert/strict";
import test from "node:test";
import { defaultPreferences, profiles } from "./data";
import { getCompatibility, rankProfiles } from "./matching";
import type { Preferences, Profile } from "./types";

const baseProfile = profiles[0];
const withProfile = (change: Partial<Profile>): Profile => ({
  ...baseProfile,
  ...change,
});
const withPrefs = (change: Partial<Preferences>): Preferences => ({
  ...defaultPreferences,
  ...change,
});

test("an exact preference fit scores 100 with six independently explained dimensions", () => {
  const match = getCompatibility(
    baseProfile,
    withPrefs({ social: baseProfile.habits.social }),
  );
  assert.equal(match.eligible, true);
  assert.equal(match.score, 100);
  assert.equal(match.breakdown.length, 6);
  assert.ok(match.reasons.length >= 3);
  assert.deepEqual(match.dealbreakers, []);
});

test("strict filters cannot be overridden by a high lifestyle score", () => {
  const match = getCompatibility(
    withProfile({
      city: "Tallinn",
      active: false,
      verified: false,
      habits: { ...baseProfile.habits, smoking: true, pets: true },
    }),
    withPrefs({ petsOkay: false, verifiedOnly: true, intent: "have-room" }),
  );
  assert.equal(match.eligible, false);
  assert.equal(match.dealbreakers.length, 6);
});

test("actual room price is checked even when profile budget ranges overlap", () => {
  const match = getCompatibility(
    withProfile({ room: { ...baseProfile.room!, price: 900 } }),
    defaultPreferences,
  );
  assert.equal(match.eligible, false);
  assert.ok(match.dealbreakers.some((reason) => reason.includes("€900")));
});

test("budget ranges support exact boundaries and reject disjoint ranges", () => {
  // A host comparing budgets with a room seeker.
  const host = withPrefs({ intent: "have-room" });
  const seeker = withProfile({
    intent: "find-room",
    room: undefined,
    budget: [650, 800],
  });
  assert.equal(getCompatibility(seeker, host).eligible, true);
  assert.equal(
    getCompatibility({ ...seeker, budget: [651, 800] }, host).eligible,
    false,
  );
  assert.equal(
    getCompatibility({ ...seeker, budget: [500, 500] }, host).eligible,
    true,
  );
});

test("move dates are inclusive at 45 days, strict beyond it, and calendar-valid", () => {
  assert.equal(
    getCompatibility(
      withProfile({ moveDate: "2027-03-18" }),
      defaultPreferences,
    ).eligible,
    true,
  );
  assert.equal(
    getCompatibility(
      withProfile({ moveDate: "2027-03-19" }),
      defaultPreferences,
    ).eligible,
    false,
  );
  assert.equal(
    getCompatibility(
      withProfile({ moveDate: "2027-02-30" }),
      defaultPreferences,
    ).eligible,
    false,
  );
});

test("room seekers see only people with a room; hosts see only room seekers", () => {
  const seeker = withProfile({ intent: "find-room", room: undefined });
  // Looking for a room (the default): hosts yes, other seekers no.
  assert.equal(
    getCompatibility(baseProfile, defaultPreferences).eligible,
    true,
  );
  assert.equal(getCompatibility(seeker, defaultPreferences).eligible, false);
  // Having a room: seekers yes, other hosts no.
  assert.equal(
    getCompatibility(baseProfile, withPrefs({ intent: "have-room" })).eligible,
    false,
  );
  assert.equal(
    getCompatibility(seeker, withPrefs({ intent: "have-room" })).eligible,
    true,
  );
});

test("lifestyle differences reduce fit and produce actionable considerations", () => {
  const match = getCompatibility(
    withProfile({
      stayMonths: 6,
      habits: {
        ...baseProfile.habits,
        cleanliness: 1,
        social: 5,
        sleep: "late",
      },
    }),
    withPrefs({ sleep: "early", social: 3 }),
  );
  assert.equal(match.eligible, true);
  assert.ok(match.score < 70);
  assert.ok(match.considerations.some((text) => text.includes("quiet hours")));
  assert.ok(match.considerations.some((text) => text.includes("cleaning")));
  assert.ok(match.considerations.some((text) => text.includes("guests")));
});

test("age, name, likes and verification have no influence on compatibility score", () => {
  const original = getCompatibility(baseProfile, defaultPreferences);
  const different = getCompatibility(
    withProfile({
      age: 57,
      name: "Another person",
      likesYou: false,
      verified: false,
    }),
    defaultPreferences,
  );
  assert.equal(original.score, different.score);
  assert.equal(different.eligible, true);
});

test("ranking is descending, stable, excludes ineligible profiles and leaves input untouched", () => {
  const input = [
    withProfile({ id: "first" }),
    withProfile({ id: "second" }),
    withProfile({ id: "paused", active: false }),
  ];
  const ranked = rankProfiles(input, defaultPreferences);
  assert.deepEqual(
    ranked.map(({ profile }) => profile.id),
    ["first", "second"],
  );
  assert.equal(input.length, 3);
  const seedRanked = rankProfiles(profiles, defaultPreferences);
  assert.equal(seedRanked[0].profile.id, "ella");
  assert.equal(seedRanked[0].match.score, 96);
  assert.ok(
    seedRanked.every(
      ({ match }, index) =>
        index === 0 || seedRanked[index - 1].match.score >= match.score,
    ),
  );
  assert.ok(
    seedRanked.every(
      ({ profile }) => !["lucas", "nora", "james"].includes(profile.id),
    ),
  );
});

test("invalid preferences fail closed and always return a finite score", () => {
  const match = getCompatibility(
    baseProfile,
    withPrefs({
      budgetMin: Number.NaN,
      cleanliness: Number.NaN,
      social: 8,
      stayMonths: 0,
      moveDate: "invalid",
    }),
  );
  assert.equal(match.eligible, false);
  assert.ok(Number.isFinite(match.score));
  assert.ok(match.score >= 0 && match.score <= 100);
});

test("city matching ignores whitespace, case and diacritical spelling differences", () => {
  assert.equal(
    getCompatibility(baseProfile, withPrefs({ city: " RĪGA " })).eligible,
    true,
  );
});
