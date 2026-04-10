import { createClient } from '@/lib/supabase/server';
import ProfessorCard from '@/components/ProfessorCard';
import type { ClassWithProfessor } from '@/types/database';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

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
          <h1 className="text-2xl font-bold">Galt</h1>
          <Link
            href="/auth/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Área do Professor
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Aulas Exclusivas</h2>
        <p className="text-muted text-lg mb-8">
          Escolha um tema e marque sua aula com nossos professores
        </p>

        {/* Grid */}
        {activeClasses.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-12 text-center">
            <p className="text-muted text-lg">Nenhuma aula disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeClasses.map((cls) => (
              <ProfessorCard key={cls.id} classData={cls} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
