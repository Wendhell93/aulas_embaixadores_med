import { createClient } from '@/lib/supabase/server';
import { getCurrentUserRole, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

export default async function AdminLayout({
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

  if (!isAdmin(role)) {
    redirect('/dashboard');
  }

  const items = [
    { href: '/admin', label: 'Visao Geral' },
    { href: '/admin/ranking', label: 'Ranking' },
    { href: '/admin/slots', label: 'Gerenciar Slots' },
    { href: '/admin/classes', label: 'Todas as Aulas' },
    { href: '/admin/professors', label: 'Professores' },
    { href: '/admin/emails', label: 'Emails Autorizados' },
    { href: '', label: '', divider: true },
    { href: '/dashboard', label: 'Dashboard Professor' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <DashboardNav
        items={items}
        userLabel={user.email || ''}
        adminBadge
        section="ADMIN"
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
