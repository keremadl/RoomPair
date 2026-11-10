import assert from "node:assert/strict";
import test from "node:test";
import { initialState, type AppState } from "../store";
import { diffState, enqueue, type Operation } from "./sync";

const base: AppState = {
  ...initialState,
  decisions: [],
  chats: [
    {
      id: "chat-ella",
      profileId: "ella",
      unread: 2,
      matchedAt: "2027-01-01",
      messages: [{ id: "m1", sender: "them", text: "Hi", time: "10:00" }],
    },
  ],
  savedRooms: ["room-a"],
  checklist: [],
  blocked: [],
  reports: [],
};
const change = (patch: Partial<AppState>) =>
  diffState(base, { ...base, ...patch });

test("an unchanged state produces no writes", () => {
  assert.deepEqual(diffState(base, structuredClone(base)), []);
});

test("likes, passes, changes of mind and undo become swipe writes", () => {
  const liked = {
    ...base,
    decisions: [{ id: "leo", action: "like" as const }],
  };
  assert.deepEqual(diffState(base, liked), [
    { type: "swipe", target: "leo", action: "like" },
  ]);
  assert.deepEqual(
    diffState(liked, { ...liked, decisions: [{ id: "leo", action: "pass" }] }),
    [{ type: "swipe", target: "leo", action: "pass" }],
  );
  assert.deepEqual(diffState(liked, base), [
    { type: "unswipe", target: "leo" },
  ]);
});

test("profile answers and finishing onboarding are saved together", () => {
  const preferences = { ...base.preferences, city: "Tallinn" };
  assert.deepEqual(change({ preferences, onboarded: true }), [
    { type: "saveProfile", preferences, onboarded: true },
  ]);
});

test("saving and unsaving rooms, and the moving plan", () => {
  assert.deepEqual(change({ savedRooms: ["room-b"] }), [
    { type: "unsaveRoom", room: "room-a" },
    { type: "saveRoom", room: "room-b" },
  ]);
  assert.deepEqual(
    change({ notes: "Ask about heating", checklist: ["budget"] }),
    [
      {
        type: "savePlan",
        checklist: ["budget"],
        notes: "Ask about heating",
        viewing: "",
      },
    ],
  );
});

test("only the member's own new messages are sent, and reading is recorded", () => {
  const chat = base.chats[0];
  const next = change({
    chats: [
      {
        ...chat,
        unread: 0,
        messages: [
          ...chat.messages,
          { id: "local-1", sender: "me", text: "Hello!", time: "10:01" },
          { id: "sim-1", sender: "them", text: "Simulated", time: "10:02" },
        ],
      },
    ],
  });
  assert.deepEqual(next, [
    {
      type: "sendMessage",
      profileId: "ella",
      body: "Hello!",
      localId: "local-1",
    },
    { type: "markRead", profileId: "ella" },
  ]);
});

test("conversations created or removed locally are left to the database", () => {
  assert.deepEqual(change({ chats: [] }), []);
  assert.deepEqual(
    change({
      chats: [
        ...base.chats,
        {
          id: "chat-leo",
          profileId: "leo",
          unread: 0,
          matchedAt: "",
          messages: [],
        },
      ],
    }),
    [],
  );
});

test("blocking sends the block once and nothing for the removed chat or swipe", () => {
  const before = {
    ...base,
    decisions: [{ id: "ella", action: "like" as const }],
  };
  assert.deepEqual(
    diffState(before, {
      ...before,
      blocked: ["ella"],
      chats: [],
      decisions: [],
    }),
    [{ type: "block", target: "ella" }],
  );
});

test("each new report is sent once", () => {
  const report = { profileId: "ella", reason: "Suspicious listing" };
  assert.deepEqual(change({ reports: [report] }), [
    { type: "report", target: "ella", reason: "Suspicious listing" },
  ]);
});

test("waiting plan and profile saves collapse to the latest; other writes keep their order", () => {
  const plan = (notes: string): Operation => ({
    type: "savePlan",
    checklist: [],
    notes,
    viewing: "",
  });
  const swipe: Operation = { type: "swipe", target: "leo", action: "like" };
  assert.deepEqual(enqueue([plan("a")], [plan("ab"), plan("abc")]), [
    plan("abc"),
  ]);
  assert.deepEqual(enqueue([plan("a"), swipe], [plan("b")]), [
    plan("a"),
    swipe,
    plan("b"),
  ]);
});
