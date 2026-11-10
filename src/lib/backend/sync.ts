import type { AppState } from "../store";
import type { Preferences } from "../types";

/** One write the server needs to hear about. */
export type Operation =
  | { type: "saveProfile"; preferences: Preferences; onboarded: boolean }
  | { type: "swipe"; target: string; action: "like" | "pass" }
  | { type: "unswipe"; target: string }
  | { type: "saveRoom"; room: string }
  | { type: "unsaveRoom"; room: string }
  | { type: "savePlan"; checklist: string[]; notes: string; viewing: string }
  | { type: "block"; target: string }
  | { type: "report"; target: string; reason: string }
  | { type: "sendMessage"; profileId: string; body: string; localId: string }
  | { type: "markRead"; profileId: string };

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * The interface edits its state optimistically; this turns one edit into the
 * writes that make the server agree. It is a pure function of the two states,
 * so every rule here is unit-tested without a network.
 *
 * Deliberately ignored: conversations appearing or disappearing (matches are
 * created and removed by the database) and messages from the other person.
 */
export function diffState(previous: AppState, next: AppState): Operation[] {
  const operations: Operation[] = [];

  if (
    !same(previous.preferences, next.preferences) ||
    previous.onboarded !== next.onboarded
  )
    operations.push({
      type: "saveProfile",
      preferences: next.preferences,
      onboarded: next.onboarded,
    });

  const before = new Map(previous.decisions.map((d) => [d.id, d.action]));
  const after = new Map(next.decisions.map((d) => [d.id, d.action]));
  // A block clears both swipes on the server, so no separate undo is needed.
  const newlyBlocked = new Set(
    next.blocked.filter((id) => !previous.blocked.includes(id)),
  );
  for (const id of before.keys())
    if (!after.has(id) && !newlyBlocked.has(id))
      operations.push({ type: "unswipe", target: id });
  for (const [id, action] of after)
    if (before.get(id) !== action)
      operations.push({ type: "swipe", target: id, action });

  for (const room of previous.savedRooms)
    if (!next.savedRooms.includes(room))
      operations.push({ type: "unsaveRoom", room });
  for (const room of next.savedRooms)
    if (!previous.savedRooms.includes(room))
      operations.push({ type: "saveRoom", room });

  if (
    !same(previous.checklist, next.checklist) ||
    previous.notes !== next.notes ||
    previous.viewing !== next.viewing
  )
    operations.push({
      type: "savePlan",
      checklist: next.checklist,
      notes: next.notes,
      viewing: next.viewing,
    });

  for (const report of next.reports.slice(previous.reports.length))
    operations.push({
      type: "report",
      target: report.profileId,
      reason: report.reason,
    });
  for (const target of newlyBlocked) operations.push({ type: "block", target });

  for (const chat of next.chats) {
    if (newlyBlocked.has(chat.profileId)) continue;
    const earlier = previous.chats.find((c) => c.profileId === chat.profileId);
    const sent = new Set(earlier?.messages.map((message) => message.id));
    for (const message of chat.messages)
      if (message.sender === "me" && !sent.has(message.id))
        operations.push({
          type: "sendMessage",
          profileId: chat.profileId,
          body: message.text,
          localId: message.id,
        });
    if (earlier && earlier.unread > 0 && chat.unread === 0)
      operations.push({ type: "markRead", profileId: chat.profileId });
  }
  return operations;
}

/**
 * Adds operations to the waiting list. Typing in the notes produces one plan
 * save per keystroke; only the latest one waiting is worth sending.
 */
export function enqueue(queue: Operation[], added: Operation[]): Operation[] {
  const result = [...queue];
  for (const operation of added) {
    const last = result.at(-1);
    if (
      last &&
      (operation.type === "savePlan" || operation.type === "saveProfile") &&
      last.type === operation.type
    )
      result[result.length - 1] = operation;
    else result.push(operation);
  }
  return result;
}
