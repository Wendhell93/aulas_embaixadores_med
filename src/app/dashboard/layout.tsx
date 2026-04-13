import { createClient } from '@/lib/supabase/server';
import { getCurrentUserRole, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { role } = await getCurrentUserRole(supabase);

  const { data: professor } = await supabase
    .from('professors')
    .select('id, name')
    .eq('user_id', user.id)
    .single();

  const items = [
    { href: '/dashboard', label: 'Visao Geral' },
    { href: '/dashboard/profile', label: 'Meu Perfil' },
    { href: '/dashboard/classes', label: 'Minhas Aulas', show: !!professor },
    { href: '/dashboard/bookings', label: 'Aulas Marcadas', show: !!professor },
    { href: '/dashboard/ranking', label: 'Ranking' },
    { href: '', label: '', divider: true, show: isAdmin(role) },
    { href: '/admin', label: 'Painel Admin', show: isAdmin(role), accent: true },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <DashboardNav
        items={items}
        userLabel={(professor as { name?: string } | null)?.name || user.email || ''}
        adminBadge={isAdmin(role)}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {!professor && (
          <div className="mb-6 rounded-lg bg-primary/10 border border-primary/30 p-4">
            <p className="text-sm">
              Complete seu{' '}
              <Link href="/dashboard/profile" className="text-primary font-medium hover:underline">
                perfil de professor
              </Link>{' '}
              para comecar a cadastrar aulas.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
