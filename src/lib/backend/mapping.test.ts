import assert from "node:assert/strict";
import test from "node:test";
import { defaultPreferences } from "../data";
import { getCompatibility } from "../matching";
import {
  appDataFromSnapshot,
  fromLocalInput,
  preferencesFromRow,
  profilePatch,
  toLocalInput,
  type ProfileRow,
  type Snapshot,
} from "./mapping";

const ME = "00000000-0000-4000-8000-00000000000a";
const ELLA = "00000000-0000-4000-8000-00000000000b";
const LEO = "00000000-0000-4000-8000-00000000000c";

const row = (id: string, patch: Partial<ProfileRow> = {}): ProfileRow => ({
  id,
  name: "Member",
  age: null,
  occupation: null,
  university: null,
  city: "Riga",
  neighborhood: null,
  bio: null,
  photo_url: null,
  photos: [],
  tags: [],
  prompt_question: null,
  prompt_answer: null,
  intent: "find-room",
  budget_min: 350,
  budget_max: 650,
  move_date: "2027-02-01",
  stay_months: 12,
  cleanliness: 4,
  social: 4,
  sleep: "flexible",
  smokes: false,
  has_pets: false,
  wants_smoke_free: true,
  accepts_pets: true,
  wants_verified_only: false,
  onboarded: true,
  active: true,
  verified: false,
  ...patch,
});

const snapshot: Snapshot = {
  userId: ME,
  me: row(ME, { name: "Alex" }),
  others: [
    row(ELLA, { name: "Ella", intent: "have-room", has_pets: true }),
    row(LEO, { name: "Leo" }),
  ],
  rooms: [
    {
      id: "room-1",
      owner_id: ELLA,
      title: "A sunny room",
      description: null,
      price: 420,
      photo_url: null,
      city: "Riga",
      neighborhood: "Centrs",
    },
  ],
  swipes: [
    {
      swiper_id: ELLA,
      target_id: ME,
      action: "like",
      created_at: "2027-01-01T10:00:00Z",
    },
    {
      swiper_id: ME,
      target_id: LEO,
      action: "pass",
      created_at: "2027-01-02T10:00:00Z",
    },
    {
      swiper_id: ME,
      target_id: ELLA,
      action: "like",
      created_at: "2027-01-01T11:00:00Z",
    },
  ],
  matches: [
    {
      id: "match-1",
      user_a: ME,
      user_b: ELLA,
      created_at: "2027-01-01T11:00:00Z",
    },
  ],
  messages: [
    {
      id: "2",
      match_id: "match-1",
      sender_id: ELLA,
      body: "Second",
      created_at: "2027-01-01T12:05:00Z",
    },
    {
      id: "1",
      match_id: "match-1",
      sender_id: ME,
      body: "First",
      created_at: "2027-01-01T12:00:00Z",
    },
    {
      id: "0",
      match_id: "match-1",
      sender_id: ELLA,
      body: "Earlier",
      created_at: "2027-01-01T11:30:00Z",
    },
  ],
  reads: [{ match_id: "match-1", last_read_at: "2027-01-01T12:01:00Z" }],
  savedRooms: [{ room_id: "room-1" }],
  plan: { checklist: ["budget"], notes: "Balcony?", viewing_at: null },
  blocks: [],
  reports: [{ reported_id: LEO, reason: "suspicious-listing" }],
};

test("a snapshot becomes the state the interface already understands", () => {
  const { state, profiles, rooms, matchIds } = appDataFromSnapshot(snapshot);
  assert.equal(state.preferences.name, "Alex");
  assert.equal(state.onboarded, true);
  assert.deepEqual(state.decisions, [
    { id: ELLA, action: "like" },
    { id: LEO, action: "pass" },
  ]);
  assert.deepEqual(state.savedRooms, ["room-1"]);
  assert.deepEqual(state.checklist, ["budget"]);
  assert.equal(state.notes, "Balcony?");
  assert.deepEqual(state.reports, [
    { profileId: LEO, reason: "Suspicious listing" },
  ]);
  assert.deepEqual(matchIds, { [ELLA]: "match-1" });

  const ella = profiles.find((profile) => profile.id === ELLA)!;
  assert.equal(ella.likesYou, true);
  assert.equal(ella.room?.price, 420);
  assert.equal(profiles.find((profile) => profile.id === LEO)!.likesYou, false);
  assert.equal(rooms[0].ownerId, ELLA);
  assert.deepEqual(rooms[0].tags.slice(0, 1), ["Pet friendly"]);
});

test("conversations are ordered, attributed and count only unread incoming messages", () => {
  const [chat] = appDataFromSnapshot(snapshot).state.chats;
  assert.equal(chat.id, `chat-${ELLA}`);
  assert.deepEqual(
    chat.messages.map((message) => [message.sender, message.text]),
    [
      ["them", "Earlier"],
      ["me", "First"],
      ["them", "Second"],
    ],
  );
  assert.equal(chat.unread, 1);
});

test("a member without answers yet gets the default search, and it round-trips", () => {
  const blank = row(ME, {
    name: "New member",
    city: null,
    intent: null,
    budget_min: null,
    budget_max: null,
    move_date: null,
    stay_months: null,
    cleanliness: null,
    social: null,
    sleep: null,
    onboarded: false,
  });
  const preferences = preferencesFromRow(blank);
  assert.deepEqual(preferences, { ...defaultPreferences, name: "New member" });
  const patch = profilePatch(preferences, true);
  assert.equal(patch.onboarded, true);
  assert.equal(patch.budget_max, defaultPreferences.budgetMax);
  assert.equal(patch.wants_smoke_free, defaultPreferences.smokeFree);
});

test("mapped profiles work with the matching rules", () => {
  const { profiles, state } = appDataFromSnapshot(snapshot);
  const match = getCompatibility(profiles[0], state.preferences);
  assert.equal(match.eligible, true);
  assert.ok(match.score > 50);
});

test("viewing times survive the trip to the database and back", () => {
  assert.equal(toLocalInput(null), "");
  assert.equal(fromLocalInput(""), null);
  assert.equal(fromLocalInput("not a date"), null);
  assert.equal(
    toLocalInput(fromLocalInput("2027-02-03T14:30")),
    "2027-02-03T14:30",
  );
});
