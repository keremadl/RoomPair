import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * With both values set the app uses accounts and the shared database.
 * Without them it stays the self-contained demo that keeps everything in the
 * browser. The publishable key is safe to ship: row level security, not the
 * key, decides what a visitor can read or write.
 */
export const isRemote = Boolean(url && key);

let client: SupabaseClient | null = null;
export function getClient(): SupabaseClient {
  if (!url || !key) throw new Error("Supabase is not configured.");
  client ??= createClient(url, key);
  return client;
}
