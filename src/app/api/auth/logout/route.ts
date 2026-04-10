import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const headersList = await headers();
  const origin = headersList.get('origin') || 'http://localhost:3000';

  return NextResponse.redirect(`${origin}/auth/login`, { status: 302 });
}
