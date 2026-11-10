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

test("answers, the profile page and finishing setup are saved together", () => {
  const preferences = { ...base.preferences, city: "Tallinn" };
  const me = { ...base.me, bio: "Hello" };
  assert.deepEqual(change({ preferences, me, onboarded: true }), [
    { type: "saveProfile", preferences, me, onboarded: true },
  ]);
});

test("the demo 'verified' switch is never sent: only the server can set it", () => {
  assert.deepEqual(change({ me: { ...base.me, verified: true } }), []);
});

test("only the member's own new messages are sent, with their photo, and reading is recorded", () => {
  const chat = base.chats[0];
  const photo = "data:image/jpeg;base64,AAAA";
  const next = change({
    chats: [
      {
        ...chat,
        unread: 0,
        messages: [
          ...chat.messages,
          { id: "local-1", sender: "me", text: "Hello!", time: "10:01" },
          { id: "local-2", sender: "me", text: "", photo, time: "10:02" },
          { id: "sim-1", sender: "them", text: "Simulated", time: "10:03" },
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
    {
      type: "sendMessage",
      profileId: "ella",
      body: "",
      photo,
      localId: "local-2",
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

test("blocking sends the block once and nothing for the removed chat or swipe; unblocking is sent too", () => {
  const before = {
    ...base,
    decisions: [{ id: "ella", action: "like" as const }],
  };
  const blocked = { ...before, blocked: ["ella"], chats: [], decisions: [] };
  assert.deepEqual(diffState(before, blocked), [
    { type: "block", target: "ella" },
  ]);
  assert.deepEqual(diffState(blocked, { ...blocked, blocked: [] }), [
    { type: "unblock", target: "ella" },
  ]);
});

test("each new report is sent once", () => {
  const report = { profileId: "ella", reason: "Suspicious listing" };
  assert.deepEqual(change({ reports: [report] }), [
    { type: "report", target: "ella", reason: "Suspicious listing" },
  ]);
});

test("waiting profile saves collapse to the latest; other writes keep their order", () => {
  const save = (bio: string): Operation => ({
    type: "saveProfile",
    preferences: base.preferences,
    me: { ...base.me, bio },
    onboarded: false,
  });
  const swipe: Operation = { type: "swipe", target: "leo", action: "like" };
  assert.deepEqual(enqueue([save("a")], [save("ab"), save("abc")]), [
    save("abc"),
  ]);
  assert.deepEqual(enqueue([save("a"), swipe], [save("b")]), [
    save("a"),
    swipe,
    save("b"),
  ]);
});
