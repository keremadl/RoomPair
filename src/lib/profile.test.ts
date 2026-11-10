import { test } from "node:test";
import assert from "node:assert/strict";
import { ageFrom, birthDateRange, isAdultBirthDate } from "./profile";

test("an age is the number of full years since the date of birth", () => {
  const today = new Date(2026, 10, 10); // 10 November 2026
  assert.equal(ageFrom("2004-05-14", today), 22);
  assert.equal(ageFrom("2004-11-10", today), 22, "the birthday itself counts");
  assert.equal(ageFrom("2004-11-11", today), 21, "the day before it does not");
  assert.ok(Number.isNaN(ageFrom("2004-02-30", today)), "not a real day");
  assert.ok(
    Number.isNaN(ageFrom("14.05.2004", today)),
    "not the expected form",
  );
});

test("only adults pass, and the date field offers exactly that range", () => {
  const now = new Date();
  const { min, max } = birthDateRange(now);
  assert.equal(isAdultBirthDate(max), true, "18 today");
  const dayAfter = new Date(`${max}T12:00:00Z`);
  dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);
  assert.equal(isAdultBirthDate(dayAfter.toISOString().slice(0, 10)), false);
  assert.ok(min < max);
  assert.equal(isAdultBirthDate(""), false);
});
