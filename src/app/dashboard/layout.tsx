import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

  const { data: professor } = await supabase
    .from('professors')
    .select('id, name')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Med Review"
            width={120}
            height={120}
            className="h-16 w-auto mb-6 mx-auto"
          />
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-lg hover:bg-card-hover transition-colors text-sm font-medium"
          >
            Visao Geral
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2.5 rounded-lg hover:bg-card-hover transition-colors text-sm font-medium"
          >
            Meu Perfil
          </Link>
          {professor && (
            <Link
              href="/dashboard/classes"
              className="px-4 py-2.5 rounded-lg hover:bg-card-hover transition-colors text-sm font-medium"
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
