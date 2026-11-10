import { defaultPreferences } from "../data";
import type { AppState } from "../store";
import type {
  Conversation,
  HabitLevel,
  Preferences,
  Profile,
  Room,
  SleepSchedule,
} from "../types";

/** Rows as the Data API returns them. Only the columns the app reads. */
export interface ProfileRow {
  id: string;
  name: string;
  age: number | null;
  occupation: string | null;
  university: string | null;
  city: string | null;
  neighborhood: string | null;
  bio: string | null;
  photo_url: string | null;
  photos: string[];
  tags: string[];
  prompt_question: string | null;
  prompt_answer: string | null;
  intent: "find-room" | "have-room" | "either" | null;
  budget_min: number | null;
  budget_max: number | null;
  move_date: string | null;
  stay_months: number | null;
  cleanliness: number | null;
  social: number | null;
  sleep: SleepSchedule | null;
  smokes: boolean;
  has_pets: boolean;
  wants_smoke_free: boolean;
  accepts_pets: boolean;
  wants_verified_only: boolean;
  onboarded: boolean;
  active: boolean;
  verified: boolean;
}
export interface RoomRow {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  city: string;
  neighborhood: string | null;
}
export interface SwipeRow {
  swiper_id: string;
  target_id: string;
  action: "like" | "pass";
  created_at: string;
}
export interface MatchRow {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
}
export interface MessageRow {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}
export interface PlanRow {
  checklist: string[];
  notes: string;
  viewing_at: string | null;
}
/** Everything one signed-in member is allowed to see, as loaded in one pass. */
export interface Snapshot {
  userId: string;
  me: ProfileRow;
  others: ProfileRow[];
  rooms: RoomRow[];
  swipes: SwipeRow[];
  matches: MatchRow[];
  messages: MessageRow[];
  reads: { match_id: string; last_read_at: string }[];
  savedRooms: { room_id: string }[];
  plan: PlanRow | null;
  blocks: { blocked_id: string }[];
  reports: { reported_id: string; reason: string }[];
}

/** Shown for members who have not added a photo yet. */
export const PLACEHOLDER_PHOTO = "/icon.svg";

const REPORT_REASONS: Record<string, string> = {
  "Misleading profile": "misleading-profile",
  "Inappropriate messages": "inappropriate-messages",
  "Suspicious listing": "suspicious-listing",
  "Something else": "other",
};
export const reportReasonToDatabase = (label: string) =>
  REPORT_REASONS[label] ?? "other";
const reportReasonFromDatabase = (value: string) =>
  Object.keys(REPORT_REASONS).find((key) => REPORT_REASONS[key] === value) ??
  "Something else";

const level = (value: number | null, fallback: number): HabitLevel =>
  (value && value >= 1 && value <= 5 ? value : fallback) as HabitLevel;

export function preferencesFromRow(row: ProfileRow): Preferences {
  const base = defaultPreferences;
  return {
    name: row.name,
    city: row.city ?? base.city,
    budgetMin: row.budget_min ?? base.budgetMin,
    budgetMax: row.budget_max ?? base.budgetMax,
    moveDate: row.move_date ?? base.moveDate,
    stayMonths: row.stay_months ?? base.stayMonths,
    intent: row.intent ?? base.intent,
    cleanliness: row.cleanliness ?? base.cleanliness,
    social: row.social ?? base.social,
    sleep: row.sleep ?? base.sleep,
    smokeFree: row.wants_smoke_free,
    petsOkay: row.accepts_pets,
    verifiedOnly: row.wants_verified_only,
  };
}

/** The columns a member may write about themselves, from the app's form state. */
export function profilePatch(preferences: Preferences, onboarded: boolean) {
  return {
    name: preferences.name,
    city: preferences.city,
    budget_min: preferences.budgetMin,
    budget_max: preferences.budgetMax,
    move_date: preferences.moveDate,
    stay_months: preferences.stayMonths,
    intent: preferences.intent,
    cleanliness: preferences.cleanliness,
    social: preferences.social,
    sleep: preferences.sleep,
    wants_smoke_free: preferences.smokeFree,
    accepts_pets: preferences.petsOkay,
    wants_verified_only: preferences.verifiedOnly,
    onboarded,
  };
}

export function roomFromRow(row: RoomRow, owner?: ProfileRow): Room {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    city: row.city,
    neighborhood: row.neighborhood ?? "",
    price: row.price,
    photo: row.photo_url ?? PLACEHOLDER_PHOTO,
    tags: owner
      ? [
          owner.has_pets ? "Pet friendly" : "No pets",
          "Furnished",
          `${owner.stay_months ?? 12}-month stay`,
        ]
      : [],
    description: row.description ?? "",
  };
}

export function profileFromRow(
  row: ProfileRow,
  likesYou: boolean,
  room?: RoomRow,
): Profile {
  const photo = row.photo_url ?? PLACEHOLDER_PHOTO;
  return {
    id: row.id,
    name: row.name,
    age: row.age ?? 0,
    occupation: row.occupation ?? "",
    university: row.university ?? "",
    city: row.city ?? "",
    neighborhood: row.neighborhood ?? "",
    bio: row.bio ?? "",
    photo,
    photos: row.photos.length ? row.photos : [photo],
    budget: [row.budget_min ?? 0, row.budget_max ?? 0],
    moveDate: row.move_date ?? "",
    stayMonths: row.stay_months ?? 0,
    // Someone open to both is shown as searching unless they list a room.
    intent:
      row.intent === "have-room" || (row.intent === "either" && room)
        ? "have-room"
        : "find-room",
    tags: row.tags,
    prompt: {
      question: row.prompt_question ?? "",
      answer: row.prompt_answer ?? "",
    },
    habits: {
      cleanliness: level(row.cleanliness, 3),
      social: level(row.social, 3),
      sleep: row.sleep ?? "flexible",
      smoking: row.smokes,
      pets: row.has_pets,
    },
    verified: row.verified,
    active: row.active,
    likesYou,
    room: room && {
      title: room.title,
      price: room.price,
      photo: room.photo_url ?? PLACEHOLDER_PHOTO,
      description: room.description ?? "",
    },
  };
}

const clock = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** `<input type="datetime-local">` value in the user's time zone. */
export function toLocalInput(timestamp: string | null): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}
export function fromLocalInput(value: string): string | null {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

/** A conversation is addressed by the other person, so its id survives reloads. */
export const chatId = (profileId: string) => `chat-${profileId}`;

export interface AppData {
  state: AppState;
  profiles: Profile[];
  rooms: Room[];
  /** Other member's id → match id, needed to send messages. */
  matchIds: Record<string, string>;
}

export function appDataFromSnapshot(snapshot: Snapshot): AppData {
  const { userId } = snapshot;
  const likedBy = new Set(
    snapshot.swipes
      .filter((swipe) => swipe.target_id === userId && swipe.action === "like")
      .map((swipe) => swipe.swiper_id),
  );
  const roomByOwner = new Map(
    snapshot.rooms.map((room) => [room.owner_id, room]),
  );
  const ownerById = new Map(snapshot.others.map((row) => [row.id, row]));
  const profiles = snapshot.others.map((row) =>
    profileFromRow(row, likedBy.has(row.id), roomByOwner.get(row.id)),
  );
  const known = new Set(profiles.map((profile) => profile.id));
  const rooms = snapshot.rooms
    .filter((room) => room.owner_id !== userId)
    .map((room) => roomFromRow(room, ownerById.get(room.owner_id)));

  const matchIds: Record<string, string> = {};
  const readAt = new Map(
    snapshot.reads.map((read) => [read.match_id, read.last_read_at]),
  );
  const chats: Conversation[] = [];
  for (const match of snapshot.matches) {
    const other = match.user_a === userId ? match.user_b : match.user_a;
    if (!known.has(other)) continue;
    matchIds[other] = match.id;
    const messages = snapshot.messages
      .filter((message) => message.match_id === match.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    const lastRead = readAt.get(match.id);
    chats.push({
      id: chatId(other),
      profileId: other,
      matchedAt: match.created_at,
      unread: messages.filter(
        (message) =>
          message.sender_id !== userId &&
          (!lastRead || message.created_at > lastRead),
      ).length,
      messages: messages.map((message) => ({
        id: message.id,
        sender: message.sender_id === userId ? "me" : "them",
        text: message.body,
        time: clock(message.created_at),
      })),
    });
  }
  chats.sort((a, b) => a.matchedAt.localeCompare(b.matchedAt));

  return {
    profiles,
    rooms,
    matchIds,
    state: {
      preferences: preferencesFromRow(snapshot.me),
      onboarded: snapshot.me.onboarded,
      decisions: snapshot.swipes
        .filter(
          (swipe) => swipe.swiper_id === userId && known.has(swipe.target_id),
        )
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((swipe) => ({ id: swipe.target_id, action: swipe.action })),
      chats,
      savedRooms: snapshot.savedRooms.map((saved) => saved.room_id),
      checklist: snapshot.plan?.checklist ?? [],
      notes: snapshot.plan?.notes ?? "",
      viewing: toLocalInput(snapshot.plan?.viewing_at ?? null),
      blocked: snapshot.blocks.map((block) => block.blocked_id),
      reports: snapshot.reports.map((report) => ({
        profileId: report.reported_id,
        reason: reportReasonFromDatabase(report.reason),
      })),
    },
  };
}
