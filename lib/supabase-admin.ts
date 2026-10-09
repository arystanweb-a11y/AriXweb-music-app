import { createClient } from "@supabase/supabase-js";

export const USER_TRACKS_BUCKET = "user-tracks";

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase server credentials are missing");
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
