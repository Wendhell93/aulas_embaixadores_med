'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Class } from '@/types/database';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);
  const supabase = createClient();

  async function loadClasses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: professor } = await supabase
      .from('professors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!professor) return;
    const professorId = (professor as { id: string }).id;

    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false });

    setClasses((data as Class[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  async function toggleActive(cls: Class) {
    const { error } = await supabase
      .from('classes')
      .update({ is_active: !cls.is_active })
      .eq('id', cls.id);

    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }
    toast.success(`Aula ${!cls.is_active ? 'ativada' : 'desativada'}`);
    loadClasses();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from('classes').delete().eq('id', deleteTarget.id);
    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }
    toast.success('Aula excluida');
    setDeleteTarget(null);
    loadClasses();
  }

  if (loading) return <div className="text-muted">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minhas Aulas</h1>
        <Link
          href="/dashboard/classes/new"
          className="rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-5 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity text-sm"
        >
          + Nova Aula
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <p className="text-muted">Nenhuma aula cadastrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(cls => (
            <div key={cls.id} className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
              {cls.thumbnail_url && (
                <img src={cls.thumbnail_url} alt={cls.grande_tema} className="w-16 h-16 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{cls.grande_tema}</h3>
                {cls.subtema && <p className="text-muted text-sm truncate">{cls.subtema}</p>}
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    cls.is_active ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted'
                  }`}
                >
                  {cls.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(cls)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-card-hover transition-colors"
                >
                  {cls.is_active ? 'Desativar' : 'Ativar'}
                </button>
                <Link
                  href={`/dashboard/classes/${cls.id}/availability`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-card-hover transition-colors text-center"
                >
                  Datas
                </Link>
                <Link
                  href={`/dashboard/classes/${cls.id}/edit`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-card-hover transition-colors text-center"
                >
                  Editar
                </Link>
                <button
                  onClick={() => setDeleteTarget(cls)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir aula?"
        message={`Excluir "${deleteTarget?.grande_tema}"? Todos os horarios e disponibilidades serao perdidos.`}
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
