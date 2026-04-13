import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

export default async function AdminPage() {
  const supabase = await createClient();

  const { count: emailCount } = await supabase
    .from('authorized_emails')
    .select('*', { count: 'exact', head: true });

  const { count: professorCount } = await supabase
    .from('professors')
    .select('*', { count: 'exact', head: true });

  const { count: classCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true });

  const { count: activeClassCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: bookedCount } = await supabase
    .from('class_slots')
    .select('*', { count: 'exact', head: true })
    .eq('is_booked', true);

  const { count: availableCount } = await supabase
    .from('class_slots')
    .select('*', { count: 'exact', head: true })
    .eq('is_booked', false)
    .gte('date', new Date().toISOString().slice(0, 10));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <StatCard label="Emails Autorizados" value={emailCount || 0} />
        <StatCard label="Professores" value={professorCount || 0} />
        <StatCard label="Total de Aulas" value={classCount || 0} />
        <StatCard label="Aulas Ativas" value={activeClassCount || 0} highlight />
        <StatCard label="Slots Reservados" value={bookedCount || 0} />
        <StatCard label="Slots Disponiveis" value={availableCount || 0} />
      </div>

      <h2 className="text-sm font-semibold text-muted mb-3">ACOES RAPIDAS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/admin/emails" className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors">
          <p className="font-semibold">Emails Autorizados</p>
          <p className="text-xs text-muted mt-1">Adicionar/remover quem pode se cadastrar</p>
        </Link>
        <Link href="/admin/professors" className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors">
          <p className="font-semibold">Professores</p>
          <p className="text-xs text-muted mt-1">Editar perfis e excluir professores</p>
        </Link>
        <Link href="/admin/classes" className="rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-colors">
          <p className="font-semibold">Todas as Aulas</p>
          <p className="text-xs text-muted mt-1">Ativar/desativar/excluir aulas de qualquer professor</p>
        </Link>
      </div>
    </div>
  );
}
