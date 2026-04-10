'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Class } from '@/types/database';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
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

  async function toggleActive(classId: string, currentActive: boolean) {
    await supabase
      .from('classes')
      .update({ is_active: !currentActive })
      .eq('id', classId);
    loadClasses();
  }

  async function deleteClass(classId: string) {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return;
    await supabase.from('classes').delete().eq('id', classId);
    loadClasses();
  }

  if (loading) return <div className="text-muted">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minhas Aulas</h1>
        <Link
          href="/dashboard/classes/new"
          className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover transition-colors"
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
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded-xl bg-card border border-border p-4 flex items-center gap-4"
            >
              {cls.thumbnail_url && (
                <img
                  src={cls.thumbnail_url}
                  alt={cls.grande_tema}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{cls.grande_tema}</h3>
                {cls.subtema && (
                  <p className="text-muted text-sm truncate">{cls.subtema}</p>
                )}
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    cls.is_active
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted/20 text-muted'
                  }`}
                >
                  {cls.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(cls.id, cls.is_active)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-card-hover transition-colors"
                >
                  {cls.is_active ? 'Desativar' : 'Ativar'}
                </button>
                <Link
                  href={`/dashboard/classes/${cls.id}/edit`}
                  className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-card-hover transition-colors"
                >
                  Editar
                </Link>
                <button
                  onClick={() => deleteClass(cls.id)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
