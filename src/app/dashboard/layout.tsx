import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

  // Check if professor profile exists
  const { data: professor } = await supabase
    .from('professors')
    .select('id, name')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8">Galt</h2>
        <nav className="flex flex-col gap-2 flex-1">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg hover:bg-card-hover transition-colors text-sm"
          >
            Visão Geral
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 rounded-lg hover:bg-card-hover transition-colors text-sm"
          >
            Meu Perfil
          </Link>
          {professor && (
            <Link
              href="/dashboard/classes"
              className="px-4 py-2 rounded-lg hover:bg-card-hover transition-colors text-sm"
            >
              Minhas Aulas
            </Link>
          )}
        </nav>
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-muted text-xs truncate mb-2">
            {professor?.name || user.email}
          </p>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-danger text-sm hover:underline"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {!professor && (
          <div className="mb-6 rounded-lg bg-accent/10 border border-accent/30 p-4">
            <p className="text-sm">
              Complete seu{' '}
              <Link href="/dashboard/profile" className="text-accent font-medium hover:underline">
                perfil de professor
              </Link>{' '}
              para começar a cadastrar aulas.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
