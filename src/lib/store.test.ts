import assert from "node:assert/strict";
import test from "node:test";
import { defaultPreferences } from "./data";
import { initialState, sanitizeState } from "./store";

test("a saved demo state survives a round trip unchanged", () => {
  const saved = JSON.parse(JSON.stringify(initialState));
  assert.deepEqual(sanitizeState(saved), initialState);
});

test("payloads that are not a RoomPair state are rejected", () => {
  for (const input of [null, "text", [], {}, { preferences: {} }])
    assert.equal(sanitizeState(input), null);
});

test("unknown profiles, rooms and malformed entries are dropped, not crashed on", () => {
  const state = sanitizeState({
    preferences: { name: 42, budgetMin: "cheap", intent: "admin", sleep: 7 },
    decisions: [
      { id: "ella", action: "like" },
      { id: "ella", action: "pass" },
      { id: "ghost", action: "like" },
      { id: "leo", action: "superlike" },
      null,
    ],
    chats: [
      { id: "chat-ghost", profileId: "ghost", messages: [] },
      {
        id: "chat-maya",
        profileId: "maya",
        unread: -3,
        messages: [
          { id: "1", sender: "me", text: "Hello", time: "10:00" },
          { id: "2", sender: "admin", text: "Injected" },
          "not a message",
        ],
      },
    ],
    savedRooms: ["room-ella", "room-ghost", 5],
    blocked: "everyone",
    reports: [{ profileId: "ghost", reason: "x" }],
    notes: { html: "<script>" },
    onboarded: "yes",
  })!;
  assert.deepEqual(state.preferences, defaultPreferences);
  assert.deepEqual(state.decisions, [{ id: "ella", action: "like" }]);
  assert.equal(state.chats.length, 1);
  assert.equal(state.chats[0].unread, 0);
  assert.deepEqual(
    state.chats[0].messages.map((message) => message.text),
    ["Hello"],
  );
  assert.deepEqual(state.savedRooms, ["room-ella"]);
  assert.deepEqual(state.blocked, []);
  assert.deepEqual(state.reports, []);
  assert.equal(state.notes, "");
  assert.equal(state.onboarded, false);
});
