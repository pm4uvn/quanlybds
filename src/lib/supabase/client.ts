import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// A placeholder client when env vars are missing keeps the app from
// crashing on import; auth/session-store treats "not configured" as
// "signed out" so the UI can show a clear setup message instead of a stack
// trace. See .env.local.example for the two required variables.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
