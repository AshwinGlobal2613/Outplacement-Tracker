import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only initialised when first used, not at module load time.
// This prevents a crash when NEXT_PUBLIC_SUPABASE_URL is missing (e.g. local dev
// before credentials are added to .env.local).
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase credentials missing. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local"
    );
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

// Proxy so all existing `supabase.xxx` call sites continue to work unchanged.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    const client = getClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
