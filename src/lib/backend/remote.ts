import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fromLocalInput,
  profilePatch,
  reportReasonToDatabase,
  type MatchRow,
  type MessageRow,
  type PlanRow,
  type ProfileRow,
  type RoomRow,
  type Snapshot,
  type SwipeRow,
} from "./mapping";
import type { Operation } from "./sync";

const PROFILE_COLUMNS =
  "id,name,age,occupation,university,city,neighborhood,bio,photo_url,photos,tags,prompt_question,prompt_answer,intent,budget_min,budget_max,move_date,stay_months,cleanliness,social,sleep,smokes,has_pets,wants_smoke_free,accepts_pets,wants_verified_only,onboarded,active,verified";

/** Unwraps a query result; a rejected or failed request becomes an exception. */
async function rows<T>(
  query: PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

/** Loads everything the signed-in member may see. Row level security filters each query. */
export async function loadSnapshot(
  client: SupabaseClient,
  userId: string,
): Promise<Snapshot> {
  const [
    people,
    rooms,
    swipes,
    matches,
    messages,
    reads,
    savedRooms,
    plans,
    blocks,
    reports,
  ] = await Promise.all([
    rows<ProfileRow>(client.from("profiles").select(PROFILE_COLUMNS)),
    rows<RoomRow>(
      client
        .from("rooms")
        .select(
          "id,owner_id,title,description,price,photo_url,city,neighborhood",
        )
        .order("created_at"),
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
        .select("id,match_id,sender_id,body,created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
    ),
    rows<{ match_id: string; last_read_at: string }>(
      client.from("conversation_reads").select("match_id,last_read_at"),
    ),
    rows<{ room_id: string }>(client.from("saved_rooms").select("room_id")),
    rows<PlanRow>(
      client.from("moving_plans").select("checklist,notes,viewing_at"),
    ),
    rows<{ blocked_id: string }>(client.from("blocks").select("blocked_id")),
    rows<{ reported_id: string; reason: string }>(
      client.from("reports").select("reported_id,reason").order("created_at"),
    ),
  ]);
  const me = people.find((person) => person.id === userId);
  if (!me) throw new Error("Your profile could not be loaded.");
  return {
    userId,
    me,
    others: people.filter((person) => person.id !== userId),
    rooms,
    swipes,
    matches,
    messages,
    reads,
    savedRooms,
    plan: plans[0] ?? null,
    blocks,
    reports,
  };
}

/**
 * Column grants do not allow a blind upsert (it would rewrite key columns), so
 * "save" means: update the existing row, and insert only if there was none.
 */
async function updateOrInsert(
  update: PromiseLike<{ data: unknown; error: { message: string } | null }>,
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
    case "saveProfile":
      return run(
        client
          .from("profiles")
          .update(profilePatch(operation.preferences, operation.onboarded))
          .eq("id", userId),
      );
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
    case "saveRoom":
      return run(
        client.from("saved_rooms").insert({ room_id: operation.room }),
        true,
      );
    case "unsaveRoom":
      return run(
        client
          .from("saved_rooms")
          .delete()
          .eq("user_id", userId)
          .eq("room_id", operation.room),
      );
    case "savePlan": {
      const plan = {
        checklist: operation.checklist,
        notes: operation.notes,
        viewing_at: fromLocalInput(operation.viewing),
      };
      return updateOrInsert(
        client
          .from("moving_plans")
          .update(plan)
          .eq("user_id", userId)
          .select("user_id"),
        () => client.from("moving_plans").insert(plan),
      );
    }
    case "block":
      return run(
        client.from("blocks").insert({ blocked_id: operation.target }),
        true,
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
      return run(
        client
          .from("messages")
          .insert({ match_id: match, body: operation.body }),
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
