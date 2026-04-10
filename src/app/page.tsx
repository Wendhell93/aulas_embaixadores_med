import { createClient } from '@/lib/supabase/server';
import ProfessorCard from '@/components/ProfessorCard';
import type { ClassWithProfessor } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professors(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const activeClasses = (classes || []) as ClassWithProfessor[];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Image
            src="/logo-horizontal.png"
            alt="Med Review"
            width={180}
            height={60}
            className="h-10 w-auto mix-blend-screen"
          />
          <Link
            href="/auth/login"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Area do Professor
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#5B392D] via-[#D5A891] to-[#FDE5D9] bg-clip-text text-transparent">
              Aulas Exclusivas
            </span>
          </h2>
          <p className="text-muted text-lg">
            Escolha um tema e marque sua aula com nossos professores
          </p>
        </div>

        {/* Grid */}
        {activeClasses.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-12 text-center">
            <p className="text-muted text-lg">Nenhuma aula disponivel no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeClasses.map((cls) => (
              <ProfessorCard key={cls.id} classData={cls} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Image
            src="/logo-horizontal.png"
            alt="Med Review"
            width={120}
            height={40}
            className="h-7 w-auto opacity-60 mix-blend-screen"
          />
          <p className="text-muted text-xs">
            Med Review - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
