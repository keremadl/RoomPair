import assert from "node:assert/strict";
import test from "node:test";
import { defaultPreferences } from "../data";
import { getCompatibility } from "../matching";
import { defaultMe } from "../profile";
import {
  appDataFromSnapshot,
  preferencesFromRow,
  privatePhotos,
  profilePatch,
  roomPatch,
  type ProfileRow,
  type RoomRow,
  type Snapshot,
} from "./mapping";

const ME = "00000000-0000-4000-8000-00000000000a";
const ELLA = "00000000-0000-4000-8000-00000000000b";
const LEO = "00000000-0000-4000-8000-00000000000c";

const row = (id: string, patch: Partial<ProfileRow> = {}): ProfileRow => ({
  id,
  name: "Member",
  age: 23,
  status: "student",
  occupation: "Student",
  university: "RTU",
  languages: ["English"],
  gender: null,
  city: "Riga",
  neighborhood: null,
  bio: null,
  photos: ["/images/ella-1.jpg"],
  tags: [],
  prompts: [],
  intent: "find-room",
  budget_min: 350,
  budget_max: 650,
  move_date: "2027-02-01",
  stay_months: 12,
  cleanliness: 4,
  social: 4,
  sleep: "flexible",
  guests: "sometimes",
  home_days: "sometimes",
  noise: "medium",
  sharing: "some",
  smokes: false,
  has_pets: false,
  wants_smoke_free: true,
  accepts_pets: true,
  wants_verified_only: false,
  living_with: "anyone",
  onboarded: true,
  active: true,
  verified: false,
  ...patch,
});
const room: RoomRow = {
  id: "room-1",
  owner_id: ELLA,
  title: "A sunny room",
  description: null,
  price: 420,
  photos: [`${ELLA}/room.jpg`],
  bills_included: true,
  deposit: 420,
  private_bathroom: false,
  furnished: true,
  flatmates: 1,
  transport: null,
  house_rules: null,
};

const snapshot: Snapshot = {
  userId: ME,
  me: row(ME, { name: "Alex", photos: [`${ME}/me.jpg`] }),
  others: [
    row(ELLA, { name: "Ella", intent: "have-room" }),
    row(LEO, { name: "Leo", intent: "have-room" }),
  ],
  rooms: [room],
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
      body: "",
      photo_path: "match-1/a.jpg",
      created_at: "2027-01-01T12:05:00Z",
    },
    {
      id: "1",
      match_id: "match-1",
      sender_id: ME,
      body: "First",
      photo_path: null,
      created_at: "2027-01-01T12:00:00Z",
    },
    {
      id: "0",
      match_id: "match-1",
      sender_id: ELLA,
      body: "Earlier",
      photo_path: null,
      created_at: "2027-01-01T11:30:00Z",
    },
  ],
  reads: [{ match_id: "match-1", last_read_at: "2027-01-01T12:01:00Z" }],
  blocks: [],
  reports: [{ reported_id: LEO, reason: "suspicious-listing" }],
};
const signed = (reference: string) =>
  reference.startsWith("/") ? reference : `https://files.example/${reference}`;

test("a snapshot becomes the state the interface already understands", () => {
  const { state, profiles, matchIds } = appDataFromSnapshot(snapshot, signed);
  assert.equal(state.preferences.name, "Alex");
  assert.equal(state.onboarded, true);
  assert.deepEqual(state.me.photos, [`https://files.example/${ME}/me.jpg`]);
  assert.deepEqual(state.decisions, [
    { id: ELLA, action: "like" },
    { id: LEO, action: "pass" },
  ]);
  assert.deepEqual(state.reports, [
    { profileId: LEO, reason: "Suspicious listing" },
  ]);
  assert.deepEqual(matchIds, { [ELLA]: "match-1" });

  const ella = profiles.find((profile) => profile.id === ELLA)!;
  assert.equal(ella.likesYou, true);
  assert.equal(ella.intent, "have-room");
  assert.equal(ella.room?.price, 420);
  assert.equal(ella.room?.photo, `https://files.example/${ELLA}/room.jpg`);
  // Saying "I have a room" without publishing one does not make a host.
  const leo = profiles.find((profile) => profile.id === LEO)!;
  assert.equal(leo.intent, "find-room");
  assert.equal(leo.likesYou, false);
});

test("conversations are ordered, attributed, carry photos and count unread incoming messages", () => {
  const [chat] = appDataFromSnapshot(snapshot, signed).state.chats;
  assert.equal(chat.id, `chat-${ELLA}`);
  assert.deepEqual(
    chat.messages.map((message) => [
      message.sender,
      message.text,
      message.photo,
    ]),
    [
      ["them", "Earlier", undefined],
      ["me", "First", undefined],
      ["them", "", "https://files.example/match-1/a.jpg"],
    ],
  );
  assert.equal(chat.unread, 1);
});

test("only private photos ask for signed links; bundled demo images do not", () => {
  assert.deepEqual(privatePhotos(snapshot), {
    profile: [`${ME}/me.jpg`, `${ELLA}/room.jpg`],
    chat: ["match-1/a.jpg"],
  });
});

test("a member without answers yet gets the default search", () => {
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
    guests: null,
    home_days: null,
    noise: null,
    sharing: null,
  });
  assert.deepEqual(preferencesFromRow(blank), {
    ...defaultPreferences,
    name: "New member",
  });
});

test("what is written never includes the verified flag, and a room is published only when ready", () => {
  const patch = profilePatch(
    defaultPreferences,
    { ...defaultMe, smokes: true, hasPets: true, neighborhood: " Centrs " },
    true,
    ["a/b.jpg"],
  );
  // What a member says about themselves is stored, not only what they accept.
  assert.equal(patch.smokes, true);
  assert.equal(patch.has_pets, true);
  assert.equal(patch.neighborhood, "Centrs");
  assert.equal("verified" in patch, false);
  assert.equal(patch.photo_url, "a/b.jpg");
  assert.equal(patch.university, defaultMe.school);
  assert.equal(roomPatch(defaultPreferences, defaultMe, []), null);
  const host = { ...defaultPreferences, intent: "have-room" as const };
  assert.equal(roomPatch(host, defaultMe, []), null);
  const ready = {
    ...defaultMe,
    room: { ...defaultMe.room, title: " Sunny room " },
  };
  assert.equal(roomPatch(host, ready, ["a/r.jpg"])?.title, "Sunny room");
});

test("mapped profiles work with the matching rules", () => {
  const { profiles, state } = appDataFromSnapshot(snapshot, signed);
  const match = getCompatibility(profiles[0], state.preferences);
  assert.equal(match.eligible, true);
  assert.ok(match.score > 50);
});
