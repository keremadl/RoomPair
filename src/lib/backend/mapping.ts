import { defaultPreferences } from "../data";
import { defaultMe } from "../profile";
import type { AppState } from "../store";
import type {
  Conversation,
  Frequency,
  Gender,
  HabitLevel,
  MyProfile,
  NoiseTolerance,
  Preferences,
  Profile,
  Prompt,
  Sharing,
  SleepSchedule,
  WorkStatus,
} from "../types";

/** Rows as the Data API returns them. Only the columns the app reads. */
export interface ProfileRow {
  id: string;
  name: string;
  age: number | null;
  status: WorkStatus | null;
  occupation: string | null;
  university: string | null;
  languages: string[];
  gender: Gender | null;
  city: string | null;
  neighborhood: string | null;
  bio: string | null;
  photos: string[];
  tags: string[];
  prompts: Prompt[];
  intent: "find-room" | "have-room" | "either" | null;
  budget_min: number | null;
  budget_max: number | null;
  move_date: string | null;
  stay_months: number | null;
  cleanliness: number | null;
  social: number | null;
  sleep: SleepSchedule | null;
  guests: Frequency | null;
  home_days: Frequency | null;
  noise: NoiseTolerance | null;
  sharing: Sharing | null;
  smokes: boolean;
  has_pets: boolean;
  wants_smoke_free: boolean;
  accepts_pets: boolean;
  wants_verified_only: boolean;
  living_with: Preferences["livingWith"];
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
  photos: string[];
  bills_included: boolean;
  deposit: number;
  private_bathroom: boolean;
  furnished: boolean;
  flatmates: number;
  transport: string | null;
  house_rules: string | null;
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
  photo_path: string | null;
  created_at: string;
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
  blocks: { blocked_id: string }[];
  reports: { reported_id: string; reason: string }[];
}

/**
 * Turns a stored photo reference into something an <img> can load. Demo
 * people use images bundled with the app; members' photos are private files
 * that need a signed link.
 */
export type PhotoUrl = (reference: string) => string;
/** A photo that still has to be uploaded: picked on this device, not stored yet. */
export const isLocalPhoto = (photo: string) => photo.startsWith("data:");
/** A photo that ships with the app. */
export const isBundledPhoto = (photo: string) => photo.startsWith("/");

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
    intent: row.intent === "have-room" ? "have-room" : "find-room",
    cleanliness: row.cleanliness ?? base.cleanliness,
    social: row.social ?? base.social,
    sleep: row.sleep ?? base.sleep,
    guests: row.guests ?? base.guests,
    homeDays: row.home_days ?? base.homeDays,
    noise: row.noise ?? base.noise,
    sharing: row.sharing ?? base.sharing,
    smokeFree: row.wants_smoke_free,
    petsOkay: row.accepts_pets,
    verifiedOnly: row.wants_verified_only,
    livingWith: row.living_with,
  };
}

/** The member's own profile page, from their row and their room listing. */
export function meFromRow(
  row: ProfileRow,
  room: RoomRow | undefined,
  url: PhotoUrl,
): MyProfile {
  const base = defaultMe;
  return {
    photos: row.photos.map(url),
    age: row.age ?? base.age,
    status: row.status ?? base.status,
    occupation: row.occupation ?? "",
    school: row.university ?? "",
    languages: row.languages,
    ...(row.gender ? { gender: row.gender } : {}),
    bio: row.bio ?? "",
    prompts: row.prompts,
    interests: row.tags,
    verified: row.verified,
    room: room
      ? {
          photos: room.photos.map(url),
          title: room.title,
          price: room.price,
          billsIncluded: room.bills_included,
          description: room.description ?? "",
          deposit: room.deposit,
          privateBathroom: room.private_bathroom,
          furnished: room.furnished,
          flatmates: room.flatmates,
          transport: room.transport ?? "",
          houseRules: room.house_rules ?? "",
        }
      : base.room,
  };
}

/**
 * The columns a member may write about themselves. `photos` must already be
 * stored references (uploaded paths or bundled images), never data URLs.
 * `verified` is deliberately absent: only the server can set it.
 */
export function profilePatch(
  preferences: Preferences,
  me: MyProfile,
  onboarded: boolean,
  photos: string[],
) {
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
    guests: preferences.guests,
    home_days: preferences.homeDays,
    noise: preferences.noise,
    sharing: preferences.sharing,
    wants_smoke_free: preferences.smokeFree,
    accepts_pets: preferences.petsOkay,
    wants_verified_only: preferences.verifiedOnly,
    living_with: preferences.livingWith,
    age: me.age,
    status: me.status,
    occupation: me.occupation,
    university: me.school,
    languages: me.languages,
    gender: me.gender ?? null,
    bio: me.bio,
    prompts: me.prompts,
    tags: me.interests,
    photos,
    photo_url: photos[0] ?? null,
    onboarded,
  };
}

/** The room listing columns, or null while the listing is not ready to publish. */
export function roomPatch(
  preferences: Preferences,
  me: MyProfile,
  photos: string[],
) {
  const { room } = me;
  if (preferences.intent !== "have-room" || !room.title.trim()) return null;
  return {
    title: room.title.trim(),
    description: room.description,
    price: room.price,
    city: preferences.city,
    photos,
    photo_url: photos[0] ?? null,
    bills_included: room.billsIncluded,
    deposit: room.deposit,
    private_bathroom: room.privateBathroom,
    furnished: room.furnished,
    flatmates: room.flatmates,
    transport: room.transport,
    house_rules: room.houseRules,
  };
}

export function profileFromRow(
  row: ProfileRow,
  likesYou: boolean,
  room: RoomRow | undefined,
  url: PhotoUrl,
): Profile {
  const photos = row.photos.map(url);
  const roomPhotos = room?.photos.map(url) ?? [];
  return {
    id: row.id,
    name: row.name,
    age: row.age ?? 0,
    status: row.status ?? "student",
    occupation: row.occupation ?? "",
    university: row.university ?? "",
    languages: row.languages,
    ...(row.gender ? { gender: row.gender } : {}),
    city: row.city ?? "",
    neighborhood: row.neighborhood ?? row.city ?? "",
    bio: row.bio ?? "",
    photo: photos[0] ?? "",
    photos,
    budget: [row.budget_min ?? 0, row.budget_max ?? 0],
    moveDate: row.move_date ?? "",
    stayMonths: row.stay_months ?? 0,
    // Someone with a published room is a host; everyone else is searching.
    intent: row.intent === "have-room" && room ? "have-room" : "find-room",
    tags: row.tags,
    prompts: row.prompts,
    habits: {
      cleanliness: level(row.cleanliness, 3),
      social: level(row.social, 3),
      sleep: row.sleep ?? "flexible",
      smoking: row.smokes,
      pets: row.has_pets,
      guests: row.guests ?? "sometimes",
      homeDays: row.home_days ?? "sometimes",
      noise: row.noise ?? "medium",
      sharing: row.sharing ?? "some",
    },
    verified: row.verified,
    active: row.active,
    likesYou,
    room: room && {
      title: room.title,
      price: room.price,
      photo: roomPhotos[0] ?? "",
      photos: roomPhotos,
      description: room.description ?? "",
      billsIncluded: room.bills_included,
      deposit: room.deposit,
      privateBathroom: room.private_bathroom,
      furnished: room.furnished,
      flatmates: room.flatmates,
      transport: room.transport ?? "",
      houseRules: room.house_rules ?? "",
    },
  };
}

const clock = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** A conversation is addressed by the other person, so its id survives reloads. */
export const chatId = (profileId: string) => `chat-${profileId}`;

export interface AppData {
  state: AppState;
  profiles: Profile[];
  /** Other member's id → match id, needed to send messages. */
  matchIds: Record<string, string>;
}

export function appDataFromSnapshot(
  snapshot: Snapshot,
  url: PhotoUrl = (reference) => reference,
): AppData {
  const { userId } = snapshot;
  const likedBy = new Set(
    snapshot.swipes
      .filter((swipe) => swipe.target_id === userId && swipe.action === "like")
      .map((swipe) => swipe.swiper_id),
  );
  const roomByOwner = new Map(
    snapshot.rooms.map((room) => [room.owner_id, room]),
  );
  // A listing without a photo is not shown yet, and neither is a member
  // without one: a card needs a picture.
  const listed = (ownerId: string) => {
    const room = roomByOwner.get(ownerId);
    return room?.photos.length ? room : undefined;
  };
  const profiles = snapshot.others
    .filter((row) => row.photos.length > 0)
    .map((row) =>
      profileFromRow(row, likedBy.has(row.id), listed(row.id), url),
    );
  const known = new Set(profiles.map((profile) => profile.id));

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
        ...(message.photo_path ? { photo: url(message.photo_path) } : {}),
        time: clock(message.created_at),
      })),
    });
  }
  chats.sort((a, b) => a.matchedAt.localeCompare(b.matchedAt));

  return {
    profiles,
    matchIds,
    state: {
      preferences: preferencesFromRow(snapshot.me),
      me: meFromRow(snapshot.me, roomByOwner.get(userId), url),
      onboarded: snapshot.me.onboarded,
      decisions: snapshot.swipes
        .filter(
          (swipe) => swipe.swiper_id === userId && known.has(swipe.target_id),
        )
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((swipe) => ({ id: swipe.target_id, action: swipe.action })),
      chats,
      blocked: snapshot.blocks.map((block) => block.blocked_id),
      reports: snapshot.reports.map((report) => ({
        profileId: report.reported_id,
        reason: reportReasonFromDatabase(report.reason),
      })),
    },
  };
}

/** Every stored photo reference in a snapshot that needs a signed link. */
export function privatePhotos(snapshot: Snapshot): {
  profile: string[];
  chat: string[];
} {
  const profile = [
    ...snapshot.me.photos,
    ...snapshot.others.flatMap((row) => row.photos),
    ...snapshot.rooms.flatMap((room) => room.photos),
  ].filter((photo) => !isBundledPhoto(photo));
  const chat = snapshot.messages.flatMap((message) =>
    message.photo_path ? [message.photo_path] : [],
  );
  return { profile: [...new Set(profile)], chat: [...new Set(chat)] };
}
