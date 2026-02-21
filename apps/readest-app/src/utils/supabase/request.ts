import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/runtimeConfig';

export const getSupabaseRequestClient = (request: Request) => {
  const cookieHeader = request.headers.get('cookie') ?? '';
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return parseCookieHeader(cookieHeader).map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll() {},
    },
  });
};
