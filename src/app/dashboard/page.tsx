import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: professor } = await supabase
    .from('professors')
    .select('id')
    .eq('user_id', user!.id)
    .single();

  let classCount = 0;
  let slotCount = 0;

  if (professor) {
    const { count: cCount } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', professor.id);
    classCount = cCount || 0;

    const { count: sCount } = await supabase
      .from('class_slots')
      .select('*, classes!inner(professor_id)', { count: 'exact', head: true })
      .eq('classes.professor_id', professor.id)
      .eq('is_booked', false);
    slotCount = sCount || 0;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Visão Geral</h1>

      {!professor ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Bem-vindo!</h2>
          <p className="text-muted mb-4">Complete seu perfil para começar a cadastrar aulas.</p>
          <Link
            href="/dashboard/profile"
            className="inline-block rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Completar Perfil
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="text-muted text-sm">Aulas Cadastradas</p>
            <p className="text-3xl font-bold mt-1">{classCount}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="text-muted text-sm">Horários Disponíveis</p>
            <p className="text-3xl font-bold mt-1">{slotCount}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-6 flex items-center justify-center">
            <Link
              href="/dashboard/classes/new"
              className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              + Nova Aula
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
