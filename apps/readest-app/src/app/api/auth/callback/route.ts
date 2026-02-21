import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/library';

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const baseUrl = request.nextUrl.origin;
      return NextResponse.redirect(new URL(next, baseUrl));
    }
  }

  const baseUrl = request.nextUrl.origin;
  return NextResponse.redirect(new URL('/auth/error', baseUrl));
}
