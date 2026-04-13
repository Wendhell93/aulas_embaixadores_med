'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Link from 'next/link';

interface ClassRow {
  id: string;
  grande_tema: string;
  subtema: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  professor_id: string;
  professors: {
    name: string;
    grande_area: string;
  };
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ClassRow | null>(null);
  const supabase = createClient();

  async function loadClasses() {
    const { data } = await supabase
      .from('classes')
      .select('*, professors(name, grande_area)')
      .order('created_at', { ascending: false });
    setClasses((data as ClassRow[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  async function toggleActive(cls: ClassRow) {
    const { error } = await supabase
      .from('classes')
      .update({ is_active: !cls.is_active })
      .eq('id', cls.id);

    if (error) {
      toast.error('Erro ao atualizar: ' + error.message);
      return;
    }

    toast.success(`Aula ${!cls.is_active ? 'ativada' : 'desativada'}`);
    loadClasses();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      toast.error('Erro ao excluir: ' + error.message);
      return;
    }

    toast.success(`Aula "${deleteTarget.grande_tema}" excluida`);
    setDeleteTarget(null);
    loadClasses();
  }

  const filtered = classes.filter(cls => {
    if (search) {
      const q = search.toLowerCase();
      const matchTema = cls.grande_tema.toLowerCase().includes(q);
      const matchSub = cls.subtema?.toLowerCase().includes(q);
      const matchProf = cls.professors?.name.toLowerCase().includes(q);
      if (!matchTema && !matchSub && !matchProf) return false;
    }
    if (filterArea && cls.professors?.grande_area !== filterArea) return false;
    return true;
  });

  const areas = Array.from(new Set(classes.map(c => c.professors?.grande_area).filter(Boolean)));

  if (loading) return <div className="text-muted">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Todas as Aulas</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por tema, subtema ou professor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-lg bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          className="rounded-lg bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas as areas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted mb-3">
        {filtered.length} de {classes.length} aula{classes.length !== 1 ? 's' : ''}
      </p>

      {/* Classes list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <p className="text-muted">Nenhuma aula encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(cls => (
            <div key={cls.id} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
              {cls.thumbnail_url ? (
                <img src={cls.thumbnail_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#090413] to-[#262033] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{cls.grande_tema}</p>
                {cls.subtema && <p className="text-sm text-muted truncate">{cls.subtema}</p>}
                <p className="text-xs text-muted mt-1">
                  {cls.professors?.name} - {cls.professors?.grande_area}
                </p>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                  cls.is_active ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted'
                }`}>
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
        message={`Excluir "${deleteTarget?.grande_tema}"? Todos os slots e disponibilidades serao deletados. Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
