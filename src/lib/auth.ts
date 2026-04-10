import { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'professor' | null;

export async function getUserRole(supabase: SupabaseClient, email: string): Promise<UserRole> {
  const { data } = await supabase
    .from('authorized_emails')
    .select('role')
    .eq('email', email.toLowerCase().trim())
    .single();

  return (data?.role as UserRole) || null;
}

export async function getCurrentUserRole(supabase: SupabaseClient): Promise<{ email: string; role: UserRole }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { email: '', role: null };

  const role = await getUserRole(supabase, user.email);
  return { email: user.email, role };
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function isAuthorized(role: UserRole): boolean {
  return role === 'admin' || role === 'professor';
}
