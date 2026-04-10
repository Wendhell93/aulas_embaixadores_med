import { createClient } from '@/lib/supabase/server';
import { getCurrentUserRole, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
            className="h-16 w-auto mb-2 mx-auto mix-blend-screen"
          />
        </Link>
        <span className="text-xs text-center text-accent font-semibold mb-6">ADMIN</span>
        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-lg hover:bg-card-hover transition-colors text-sm font-medium"
          >
            Visao Geral
          </Link>
          <Link
            href="/admin/emails"
            className="px-4 py-2.5 rounded-lg hover:bg-card-hover transition-colors text-sm font-medium"
          >
            Emails Autorizados
          </Link>
          <Link
            href="/admin/professors"
            className="px-4 py-2.5 rounded-lg hover:bg-card-hover transition-colors text-sm font-medium"
          >
            Professores
          </Link>
          <div className="border-t border-border my-2" />
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-lg hover:bg-card-hover transition-colors text-sm font-medium text-muted"
          >
            Dashboard Professor
          </Link>
        </nav>
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-muted text-xs truncate mb-2">{user.email}</p>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-danger text-sm hover:underline">
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
