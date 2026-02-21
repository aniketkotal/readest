import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/runtimeConfig';

export const getSupabasePagesClient = (req: NextApiRequest, res: NextApiResponse) => {
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie ?? '').map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.appendHeader(
            'Set-Cookie',
            serializeCookieHeader(name, value, options),
          );
        });
      },
    },
  });
};
