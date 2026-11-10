import assert from "node:assert/strict";
import test from "node:test";
import { defaultPreferences } from "./data";
import { defaultMe } from "./profile";
import { initialState, sanitizeState } from "./store";

const saved = () => JSON.parse(JSON.stringify(initialState));

test("a saved demo state survives a round trip unchanged", () => {
  assert.deepEqual(sanitizeState(saved()), initialState);
});

test("payloads that are not a RoomPair state are rejected", () => {
  for (const input of [null, "text", [], {}, { preferences: {} }])
    assert.equal(sanitizeState(input), null);
});

test("people who are not in the demo are dropped from decisions, chats, blocks and reports", () => {
  const state = sanitizeState({
    ...saved(),
    decisions: [
      { id: "ella", action: "like" },
      { id: "ella", action: "pass" },
      { id: "ghost", action: "like" },
      { id: "leo", action: "superlike" },
      null,
    ],
    chats: [
      { id: "chat-ghost", profileId: "ghost", messages: [] },
      { id: "chat-maya", profileId: "maya" },
      { id: "chat-maya-again", profileId: "maya", messages: [] },
    ],
    blocked: { not: "an array" },
    reports: [{ profileId: "ghost", reason: "x" }, "nonsense"],
  })!;
  assert.deepEqual(state.decisions, [{ id: "ella", action: "like" }]);
  assert.deepEqual(
    state.chats.map((chat) => [chat.id, chat.messages.length, chat.unread]),
    [["chat-maya", 0, 0]],
  );
  assert.deepEqual(state.blocked, []);
  assert.deepEqual(state.reports, []);
});

test("malformed answers fall back to defaults instead of reaching a page", () => {
  const state = sanitizeState({
    ...saved(),
    preferences: {
      name: 42,
      budgetMin: "cheap",
      sleep: "sometimes",
      guests: 7,
      noise: null,
      sharing: "everything",
      livingWith: "robots",
      intent: "either",
      smokeFree: "yes",
    },
  })!;
  assert.deepEqual(state.preferences, defaultPreferences);
});

test("messages keep only valid text and real photos", () => {
  const state = sanitizeState({
    ...saved(),
    chats: [
      {
        id: "chat-maya",
        profileId: "maya",
        unread: -3,
        messages: [
          { id: "1", sender: "me", text: "Hello", time: "10:00" },
          {
            id: "2",
            sender: "me",
            text: "",
            photo: "data:image/jpeg;base64,AAAA",
          },
          { id: "3", sender: "me", text: "x", photo: "javascript:alert(1)" },
          { id: "4", sender: "admin", text: "Injected" },
          "not a message",
        ],
      },
    ],
  })!;
  assert.deepEqual(
    state.chats[0].messages.map((message) => [message.id, message.photo]),
    [
      ["1", undefined],
      ["2", "data:image/jpeg;base64,AAAA"],
      ["3", undefined],
    ],
  );
});

test("the member's own profile is repaired field by field", () => {
  const state = sanitizeState({
    ...saved(),
    me: {
      photos: "nope",
      age: "old",
      status: "retired",
      languages: ["English", 5],
      gender: "other",
      prompts: [
        { question: "My ideal Sunday at home", answer: "Pancakes" },
        { question: "A question that was removed", answer: "x" },
        "junk",
      ],
      interests: ["a", "b", "c", "d", "e", "f", "g"],
      room: {
        photos: ["/images/x.jpg", "https://evil.example/x.jpg"],
        price: "free",
      },
    },
  })!;
  assert.deepEqual(state.me.photos, defaultMe.photos);
  assert.equal(state.me.age, defaultMe.age);
  assert.equal(state.me.status, defaultMe.status);
  assert.deepEqual(state.me.languages, ["English"]);
  assert.equal("gender" in state.me, false);
  assert.deepEqual(state.me.prompts, [
    { question: "My ideal Sunday at home…", answer: "Pancakes" },
  ]);
  assert.equal(state.me.interests.length, 5);
  assert.deepEqual(state.me.room.photos, ["/images/x.jpg"]);
  assert.equal(state.me.room.price, defaultMe.room.price);
});

test("a save from before the profile existed gets the default profile", () => {
  const old = saved();
  delete old.me;
  assert.deepEqual(sanitizeState(old)!.me, defaultMe);
});
