import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isBundledPhoto,
  isLocalPhoto,
  privatePhotos,
  profilePatch,
  reportReasonToDatabase,
  roomPatch,
  type MatchRow,
  type MessageRow,
  type PhotoUrl,
  type ProfileRow,
  type RoomRow,
  type Snapshot,
  type SwipeRow,
} from "./mapping";
import type { Operation } from "./sync";

const PROFILE_COLUMNS =
  "id,name,age,status,occupation,university,languages,gender,city,neighborhood,bio,photos,tags,prompts,intent,budget_min,budget_max,move_date,stay_months,cleanliness,social,sleep,guests,home_days,noise,sharing,smokes,has_pets,wants_smoke_free,accepts_pets,wants_verified_only,living_with,onboarded,active,verified";
const ROOM_COLUMNS =
  "id,owner_id,title,description,price,photos,bills_included,deposit,private_bathroom,furnished,flatmates,transport,house_rules";
const PROFILE_PHOTOS = "profile-photos";
const CHAT_PHOTOS = "chat-photos";

type Result = {
  data: unknown;
  error: { message: string; code?: string } | null;
};

/** Unwraps a query result; a rejected or failed request becomes an exception. */
async function rows<T>(query: PromiseLike<Result>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

// The date of birth the server has, so it is only sent again when it changes.
let savedBirthDate: string | null = null;

/** Loads everything the signed-in member may see. Row level security filters each query. */
export async function loadSnapshot(
  client: SupabaseClient,
  userId: string,
): Promise<Snapshot> {
  const [people, rooms, swipes, matches, messages, reads, blocks, reports] =
    await Promise.all([
      rows<ProfileRow>(client.from("profiles").select(PROFILE_COLUMNS)),
      rows<RoomRow>(
        client.from("rooms").select(ROOM_COLUMNS).order("created_at"),
      ),
      rows<SwipeRow>(
        client.from("swipes").select("swiper_id,target_id,action,created_at"),
      ),
      rows<MatchRow>(
        client.from("matches").select("id,user_a,user_b,created_at"),
      ),
      rows<MessageRow>(
        client
          .from("messages")
          .select("id,match_id,sender_id,body,photo_path,created_at")
          .order("created_at", { ascending: false })
          .limit(1000),
      ),
      rows<{ match_id: string; last_read_at: string }>(
        client.from("conversation_reads").select("match_id,last_read_at"),
      ),
      rows<{ blocked_id: string }>(client.from("blocks").select("blocked_id")),
      rows<{ reported_id: string; reason: string }>(
        client.from("reports").select("reported_id,reason").order("created_at"),
      ),
    ]);
  const me = people.find((person) => person.id === userId);
  if (!me) throw new Error("Your profile could not be loaded.");
  // Read last: it also moves the shown age on after a birthday.
  const { data: birthDate, error } = await client.rpc("my_birth_date");
  if (error) throw new Error(error.message);
  savedBirthDate = typeof birthDate === "string" ? birthDate : null;
  return {
    userId,
    birthDate: savedBirthDate,
    me,
    others: people.filter((person) => person.id !== userId),
    rooms,
    swipes,
    matches,
    messages,
    reads,
    blocks,
    reports,
  };
}

// ---------------------------------------------------------------------------
// Photos. Files are private; the app shows them through signed links that it
// keeps for a while, and remembers which stored file each link belongs to.
// ---------------------------------------------------------------------------

const LINK_SECONDS = 60 * 60;
const KEEP_MS = 50 * 60 * 1000;
const links = new Map<string, { url: string; until: number }>();
const references = new Map<string, string>();
const remember = (reference: string, url: string) => {
  links.set(reference, { url, until: Date.now() + KEEP_MS });
  references.set(url, reference);
};

async function sign(client: SupabaseClient, bucket: string, paths: string[]) {
  const wanted = paths.filter((path) => {
    const known = links.get(path);
    return !known || known.until < Date.now();
  });
  if (!wanted.length) return;
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrls(wanted, LINK_SECONDS);
  if (error) throw new Error(error.message);
  for (const item of data ?? [])
    if (item.path && item.signedUrl) remember(item.path, item.signedUrl);
}

/** Prepares links for every private photo in a snapshot. */
export async function photoUrls(
  client: SupabaseClient,
  snapshot: Snapshot,
): Promise<PhotoUrl> {
  const wanted = privatePhotos(snapshot);
  await Promise.all([
    sign(client, PROFILE_PHOTOS, wanted.profile),
    sign(client, CHAT_PHOTOS, wanted.chat),
  ]);
  // A photo whose link could not be made is left out rather than shown broken.
  return (reference) =>
    isBundledPhoto(reference) ? reference : (links.get(reference)?.url ?? "");
}

function blobFromDataUrl(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",", 2);
  const type = /^data:([^;]+)/.exec(head)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(body ?? ""), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type });
}

const fileName = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.jpg`;

/** Uploads a photo picked on this device and returns its stored reference. */
async function upload(
  client: SupabaseClient,
  bucket: string,
  folder: string,
  dataUrl: string,
): Promise<string> {
  const path = `${folder}/${fileName()}`;
  const { error } = await client.storage
    .from(bucket)
    .upload(path, blobFromDataUrl(dataUrl), { contentType: "image/jpeg" });
  if (error) throw new Error(error.message);
  // Keep showing the local copy; no need to download what was just sent.
  remember(path, dataUrl);
  return path;
}

/** Stored references for a photo list, uploading the ones that are new. */
async function store(
  client: SupabaseClient,
  folder: string,
  photos: string[],
): Promise<string[]> {
  const stored: string[] = [];
  for (const photo of photos) {
    if (isBundledPhoto(photo)) stored.push(photo);
    else if (isLocalPhoto(photo) && !references.has(photo))
      stored.push(await upload(client, PROFILE_PHOTOS, folder, photo));
    else {
      const reference = references.get(photo);
      if (reference) stored.push(reference);
    }
  }
  return stored;
}

/** The stored files in one folder, as full paths. */
async function filesIn(client: SupabaseClient, bucket: string, folder: string) {
  const { data, error } = await client.storage
    .from(bucket)
    .list(folder, { limit: 1000 });
  if (error) throw new Error(error.message);
  return (data ?? []).map((file) => `${folder}/${file.name}`);
}

/** Deletes the member's stored photos that no profile or listing uses any more. */
async function removeUnused(
  client: SupabaseClient,
  userId: string,
  inUse: string[],
) {
  try {
    const unused = (await filesIn(client, PROFILE_PHOTOS, userId)).filter(
      (path) => !inUse.includes(path),
    );
    if (unused.length) await client.storage.from(PROFILE_PHOTOS).remove(unused);
  } catch {
    // Tidying up must never fail a save; the next save tries again.
  }
}

/**
 * Deletes the signed-in member's account for good: first their photo files,
 * then the account, which takes the profile, listing, likes, matches and
 * messages with it.
 */
export async function deleteAccount(
  client: SupabaseClient,
  userId: string,
  matchIds: string[],
): Promise<void> {
  const own = await filesIn(client, PROFILE_PHOTOS, userId);
  if (own.length) {
    const { error } = await client.storage.from(PROFILE_PHOTOS).remove(own);
    if (error) throw new Error(error.message);
  }
  // Photos sent in chats: the database only lets a member remove their own.
  await Promise.all(
    matchIds.map(async (match) => {
      try {
        const sent = await filesIn(client, CHAT_PHOTOS, match);
        if (sent.length) await client.storage.from(CHAT_PHOTOS).remove(sent);
      } catch {
        // Unreachable once the match is gone; not worth stopping for.
      }
    }),
  );
  const { error } = await client.rpc("delete_account");
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Moderation. The database decides who is a moderator; for everyone else the
// queue is empty and closing a report is refused.
// ---------------------------------------------------------------------------

export type ReportRow = {
  id: string;
  created_at: string;
  reason: string;
  status: "open" | "reviewed" | "dismissed";
  reporter_name: string;
  reported_id: string;
  reported_name: string;
  reports_against: number;
  suspended: boolean;
};

/** The review queue, or null when the signed-in member is not a moderator. */
export async function loadModeration(
  client: SupabaseClient,
): Promise<ReportRow[] | null> {
  const { data: moderator, error } = await client.rpc("is_moderator");
  if (error || moderator !== true) return null;
  return rows<ReportRow>(client.rpc("moderation_queue"));
}

/** Closes a report; `suspend` also hides the reported member from everyone. */
export async function reviewReport(
  client: SupabaseClient,
  report: string,
  outcome: "reviewed" | "dismissed",
  suspend: boolean,
): Promise<void> {
  const { error } = await client.rpc("review_report", {
    report,
    outcome,
    suspend,
  });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/**
 * Column grants do not allow a blind upsert (it would rewrite key columns), so
 * "save" means: update the existing row, and insert only if there was none.
 */
async function updateOrInsert(
  update: PromiseLike<Result>,
  insert: () => PromiseLike<{ error: { message: string } | null }>,
) {
  const updated = await rows<unknown>(update);
  if (updated.length) return;
  const { error } = await insert();
  if (error) throw new Error(error.message);
}

async function matchIdFor(
  client: SupabaseClient,
  userId: string,
  other: string,
  known: Record<string, string>,
): Promise<string> {
  if (known[other]) return known[other];
  const [first, second] = [userId, other].sort();
  const found = await rows<{ id: string }>(
    client
      .from("matches")
      .select("id")
      .eq("user_a", first)
      .eq("user_b", second),
  );
  if (!found.length)
    throw new Error("This conversation is no longer available.");
  known[other] = found[0].id;
  return found[0].id;
}

/** Sends one write. Authorization is decided by the database, not here. */
export async function applyOperation(
  client: SupabaseClient,
  userId: string,
  operation: Operation,
  matchIds: Record<string, string>,
): Promise<void> {
  const run = async (
    query: PromiseLike<{ error: { message: string; code?: string } | null }>,
    ignoreDuplicate = false,
  ) => {
    const { error } = await query;
    if (error && !(ignoreDuplicate && error.code === "23505"))
      throw new Error(error.message);
  };
  switch (operation.type) {
    case "saveProfile": {
      const { preferences, me, onboarded } = operation;
      if (me.birthDate && me.birthDate !== savedBirthDate) {
        // Sets the age too; the server refuses anyone under 18.
        await run(client.rpc("set_birth_date", { birth: me.birthDate }));
        savedBirthDate = me.birthDate;
      }
      const photos = await store(client, userId, me.photos);
      await run(
        client
          .from("profiles")
          .update(profilePatch(preferences, me, onboarded, photos))
          .eq("id", userId),
      );
      const roomPhotos = await store(client, userId, me.room.photos);
      const room = roomPatch(preferences, me, roomPhotos);
      if (room)
        await updateOrInsert(
          client.from("rooms").update(room).eq("owner_id", userId).select("id"),
          () => client.from("rooms").insert({ ...room, owner_id: userId }),
        );
      return removeUnused(client, userId, [...photos, ...roomPhotos]);
    }
    case "swipe":
      return updateOrInsert(
        client
          .from("swipes")
          .update({ action: operation.action })
          .eq("swiper_id", userId)
          .eq("target_id", operation.target)
          .select("target_id"),
        () =>
          client
            .from("swipes")
            .insert({ target_id: operation.target, action: operation.action }),
      );
    case "unswipe":
      return run(
        client
          .from("swipes")
          .delete()
          .eq("swiper_id", userId)
          .eq("target_id", operation.target),
      );
    case "block":
      return run(
        client.from("blocks").insert({ blocked_id: operation.target }),
        true,
      );
    case "unblock":
      return run(
        client
          .from("blocks")
          .delete()
          .eq("blocker_id", userId)
          .eq("blocked_id", operation.target),
      );
    case "report":
      return run(
        client.from("reports").insert({
          reported_id: operation.target,
          reason: reportReasonToDatabase(operation.reason),
        }),
      );
    case "sendMessage": {
      const match = await matchIdFor(
        client,
        userId,
        operation.profileId,
        matchIds,
      );
      const photo =
        operation.photo && isLocalPhoto(operation.photo)
          ? await upload(client, CHAT_PHOTOS, match, operation.photo)
          : null;
      return run(
        client.from("messages").insert({
          match_id: match,
          body: operation.body,
          ...(photo ? { photo_path: photo } : {}),
        }),
      );
    }
    case "markRead": {
      const match = await matchIdFor(
        client,
        userId,
        operation.profileId,
        matchIds,
      );
      const now = new Date().toISOString();
      return updateOrInsert(
        client
          .from("conversation_reads")
          .update({ last_read_at: now })
          .eq("user_id", userId)
          .eq("match_id", match)
          .select("match_id"),
        () =>
          client
            .from("conversation_reads")
            .insert({ match_id: match, last_read_at: now }),
      );
    }
  }
}
