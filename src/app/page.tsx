import { createClient } from '@/lib/supabase/server';
import HomeContent from '@/components/HomeContent';
import type { ClassWithProfessorAndSlots } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professors(*), class_slots(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const activeClasses = (classes || []) as ClassWithProfessorAndSlots[];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Image
            src="/logo-horizontal.png"
            alt="Med Review"
            width={300}
            height={100}
            className="h-12 sm:h-16 w-auto mix-blend-screen"
          />
          <Link
            href="/auth/login"
            className="text-xs sm:text-sm text-muted hover:text-primary transition-colors"
          >
            Area do Professor
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto w-full px-4 pt-6 pb-2 sm:pt-12 sm:pb-4">
        <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
          <span className="bg-gradient-to-r from-[#5B392D] via-[#D5A891] to-[#FDE5D9] bg-clip-text text-transparent">
            Aulas Exclusivas
          </span>
        </h2>
        <p className="text-muted text-sm sm:text-lg">
          Escolha um tema e marque sua aula com nossos professores
        </p>
      </section>

      {/* Filters + Grid */}
      <section className="max-w-7xl mx-auto w-full px-4 pt-4 pb-8 flex-1">
        <HomeContent classes={activeClasses} />
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          <Image
            src="/logo-horizontal.png"
            alt="Med Review"
            width={120}
            height={40}
            className="h-6 sm:h-7 w-auto opacity-60 mix-blend-screen"
          />
          <p className="text-muted text-[10px] sm:text-xs">
            Med Review - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
