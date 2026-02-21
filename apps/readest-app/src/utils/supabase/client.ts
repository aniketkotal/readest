import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/runtimeConfig';
import { isTauriAppPlatform } from '@/services/environment';

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (browserClient) return browserClient;

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (isTauriAppPlatform()) {
    browserClient = createClient(url, key);
  } else {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
};
