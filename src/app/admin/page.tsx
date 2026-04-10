import { createClient } from '@/lib/supabase/server';

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-card border border-border p-6">
          <p className="text-muted text-sm">Emails Autorizados</p>
          <p className="text-3xl font-bold mt-1">{emailCount || 0}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <p className="text-muted text-sm">Professores Cadastrados</p>
          <p className="text-3xl font-bold mt-1">{professorCount || 0}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <p className="text-muted text-sm">Total de Aulas</p>
          <p className="text-3xl font-bold mt-1">{classCount || 0}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <p className="text-muted text-sm">Aulas Ativas</p>
          <p className="text-3xl font-bold mt-1 text-primary">{activeClassCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
