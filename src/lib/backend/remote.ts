import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isBundledPhoto,
  isLocalPhoto,
  isPrivatePhotoPath,
  privatePhotos,
  profilePatch,
  reportReasonToDatabase,
  roomPatch,
  type MatchRow,
  type MessageRow,
  type PhotoBucket,
  type PhotoUrl,
  type ProfileRow,
  type RoomRow,
  type Snapshot,
  type SwipeRow,
} from "./mapping";
import type { Operation } from "./sync";

const PUBLIC_PROFILE_COLUMNS =
  "id,name,age,status,occupation,university,languages,gender,city,neighborhood,bio,photos,tags,prompts,intent,budget_min,budget_max,move_date,stay_months,cleanliness,social,sleep,guests,home_days,noise,sharing,smokes,has_pets,onboarded,active,verified";
const ROOM_COLUMNS =
  "id,owner_id,title,description,price,photos,bills_included,deposit,private_bathroom,furnished,flatmates,transport,house_rules";
const PROFILE_PHOTOS = "profile-photos";
const CHAT_PHOTOS = "chat-photos";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

type FilterRow = {
  wants_smoke_free: boolean;
  accepts_pets: boolean;
  wants_verified_only: boolean;
  living_with: ProfileRow["living_with"];
};

/** Loads everything the signed-in member may see. Row level security filters each query. */
export async function loadSnapshot(
  client: SupabaseClient,
  userId: string,
): Promise<Snapshot> {
  const [
    meRows,
    filterRows,
    others,
    rooms,
    swipes,
    matches,
    messages,
    reads,
    blocks,
    reports,
  ] = await Promise.all([
    rows<ProfileRow>(
      client.from("profiles").select(PUBLIC_PROFILE_COLUMNS).eq("id", userId),
    ),
    rows<FilterRow>(client.rpc("my_filter_preferences")),
    rows<ProfileRow>(
      client.from("profiles").select(PUBLIC_PROFILE_COLUMNS).neq("id", userId),
    ),
    rows<RoomRow>(client.from("rooms").select(ROOM_COLUMNS).order("created_at")),
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
    rows<{ blocked_id: string; blocked_name?: string }>(
      client.rpc("my_blocks"),
    ),
    rows<{ reported_id: string; reason: string }>(
      client.from("reports").select("reported_id,reason").order("created_at"),
    ),
  ]);
  const rawMe = meRows[0];
  if (!rawMe) throw new Error("Your profile could not be loaded.");
  const me: ProfileRow = { ...rawMe, ...(filterRows[0] ?? {}) };
  // Read last: it also moves the shown age on after a birthday.
  const { data: birthDate, error } = await client.rpc("my_birth_date");
  if (error) throw new Error(error.message);
  savedBirthDate = typeof birthDate === "string" ? birthDate : null;
  return {
    userId,
    birthDate: savedBirthDate,
    me,
    others,
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
// Photos. Files are private; the app shows them through short-lived signed
// links keyed by bucket + path, and remembers which stored file each link
// belongs to so saving a profile preserves existing stored paths.
// ---------------------------------------------------------------------------

const LINK_SECONDS = 15 * 60;
const KEEP_MS = 12 * 60 * 1000;
const MAX_CACHED_LINKS = 2000;
const links = new Map<string, { url: string; until: number }>();
const references = new Map<string, string>();

const cacheKey = (bucket: string, reference: string) =>
  `${bucket}:${reference}`;

const pruneCache = () => {
  if (links.size <= MAX_CACHED_LINKS) return;
  const now = Date.now();
  for (const [key, entry] of links) {
    if (entry.until < now) {
      references.delete(entry.url);
      links.delete(key);
    }
  }
  while (links.size > MAX_CACHED_LINKS) {
    const oldest = links.keys().next().value;
    if (!oldest) break;
    const entry = links.get(oldest);
    if (entry) references.delete(entry.url);
    links.delete(oldest);
  }
};

const remember = (bucket: string, reference: string, url: string) => {
  links.set(cacheKey(bucket, reference), { url, until: Date.now() + KEEP_MS });
  references.set(url, reference);
  pruneCache();
};

/** Clears per-session signed URLs and cached birth date on sign-out. */
export function clearSessionCache() {
  savedBirthDate = null;
  links.clear();
  references.clear();
}

async function sign(client: SupabaseClient, bucket: string, paths: string[]) {
  const wanted = paths.filter((path) => {
    const known = links.get(cacheKey(bucket, path));
    return !known || known.until < Date.now();
  });
  if (!wanted.length) return;
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrls(wanted, LINK_SECONDS);
  if (error) throw new Error(error.message);
  for (const item of data ?? [])
    if (item.path && item.signedUrl) remember(bucket, item.path, item.signedUrl);
}

const bucketName = (kind: PhotoBucket = "profile") =>
  kind === "chat" ? CHAT_PHOTOS : PROFILE_PHOTOS;

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
  return (reference, kind = "profile") =>
    isBundledPhoto(reference)
      ? reference
      : (links.get(cacheKey(bucketName(kind), reference))?.url ?? "");
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
  remember(bucket, path, dataUrl);
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
    else if (isPrivatePhotoPath(photo)) stored.push(photo);
    else if (isLocalPhoto(photo) && !references.has(photo))
      stored.push(await upload(client, PROFILE_PHOTOS, folder, photo));
    else {
      const reference = references.get(photo);
      if (reference) stored.push(reference);
    }
  }
  return stored;
}

/** All stored files in one folder, paged in batches of 100. */
async function filesIn(client: SupabaseClient, bucket: string, folder: string) {
  const all: string[] = [];
  const pageSize = 100;
  for (let offset = 0; offset < 5000; offset += pageSize) {
    const { data, error } = await client.storage
      .from(bucket)
      .list(folder, { limit: pageSize, offset });
    if (error) throw new Error(error.message);
    const items = data ?? [];
    for (const file of items) if (file.name) all.push(`${folder}/${file.name}`);
    if (items.length < pageSize) break;
  }
  return all;
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

async function assertSameSession(
  client: SupabaseClient,
  expectedUserId: string,
) {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session || session.user.id !== expectedUserId)
    throw new Error("Active account changed.");
}

/**
 * Deletes the signed-in member's account for good: verifies the active session
 * still matches `userId`, removes their profile and chat photos (including any
 * from ended matches), and invokes the session-pinned `delete_account` RPC.
 */
export async function deleteAccount(
  client: SupabaseClient,
  userId: string,
  matchIds: string[],
): Promise<void> {
  await assertSameSession(client, userId);
  const own = await filesIn(client, PROFILE_PHOTOS, userId);
  if (own.length) {
    const { error } = await client.storage.from(PROFILE_PHOTOS).remove(own);
    if (error) throw new Error(error.message);
  }
  // Collect all chat photos owned by this member, including from past matches.
  const chatPaths = new Set<string>();
  try {
    const owned = await rows<{ path: string }>(client.rpc("my_chat_photo_paths"));
    for (const row of owned) if (row.path) chatPaths.add(row.path);
  } catch {
    // Fall back to listing known match folders if the RPC is unavailable.
    for (const match of matchIds) {
      try {
        for (const path of await filesIn(client, CHAT_PHOTOS, match))
          chatPaths.add(path);
      } catch {}
    }
  }
  if (chatPaths.size) {
    await client.storage.from(CHAT_PHOTOS).remove([...chatPaths]);
  }
  await assertSameSession(client, userId);
  const { error } = await client.rpc("delete_account", {
    expected_user: userId,
  });
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
  insert: () => PromiseLike<{ error: { message: string; code?: string } | null }>,
) {
  const updated = await rows<unknown>(update);
  if (updated.length) return;
  const { error } = await insert();
  if (error && error.code !== "23505") throw new Error(error.message);
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
      else
        await run(
          client
            .from("rooms")
            .update({ available: false })
            .eq("owner_id", userId),
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
        true,
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
      const clientUuid = UUID_PATTERN.test(operation.localId)
        ? operation.localId
        : undefined;
      return run(
        client.from("messages").insert({
          ...(clientUuid ? { id: clientUuid } : {}),
          match_id: match,
          body: operation.body,
          ...(photo ? { photo_path: photo } : {}),
        }),
        Boolean(clientUuid),
      );
    }
    case "markRead": {
      const match = await matchIdFor(
        client,
        userId,
        operation.profileId,
        matchIds,
      );
      return run(client.rpc("mark_conversation_read", { p_match: match }));
    }
  }
}
