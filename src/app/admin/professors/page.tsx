'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import ProfessorAvatar from '@/components/ProfessorAvatar';
import { GRANDE_AREAS } from '@/lib/constants';
import type { Professor } from '@/types/database';

export default function AdminProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Professor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Professor | null>(null);
  const supabase = createClient();

  async function loadData() {
    const { data: profs } = await supabase
      .from('professors')
      .select('*')
      .order('name');
    setProfessors((profs as Professor[]) || []);

    const { data: classes } = await supabase.from('classes').select('professor_id');
    const counts: Record<string, number> = {};
    (classes || []).forEach((c: { professor_id: string }) => {
      counts[c.professor_id] = (counts[c.professor_id] || 0) + 1;
    });
    setClassCounts(counts);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveEdit() {
    if (!editing) return;
    const { error } = await supabase
      .from('professors')
      .update({
        name: editing.name,
        whatsapp: editing.whatsapp,
        grande_area: editing.grande_area,
      })
      .eq('id', editing.id);

    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }
    toast.success('Professor atualizado');
    setEditing(null);
    loadData();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from('professors')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }
    toast.success(`Professor ${deleteTarget.name} excluido`);
    setDeleteTarget(null);
    loadData();
  }

  if (loading) return <div className="text-muted">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Professores Cadastrados</h1>

      {professors.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <p className="text-muted">Nenhum professor cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {professors.map(prof => (
            <div key={prof.id} className="rounded-xl bg-card border border-border p-4 flex items-center gap-4">
              <ProfessorAvatar name={prof.name} photoUrl={prof.photo_url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{prof.name}</p>
                <p className="text-xs text-muted">{prof.grande_area}</p>
                {prof.whatsapp && <p className="text-xs text-muted">WhatsApp: {prof.whatsapp}</p>}
              </div>
              <div className="text-right flex-shrink-0 mr-2">
                <p className="text-sm font-semibold">{classCounts[prof.id] || 0}</p>
                <p className="text-xs text-muted">aulas</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditing({ ...prof })}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-card-hover transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteTarget(prof)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Editar Professor</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={editing.whatsapp || ''}
                  onChange={e => setEditing({ ...editing, whatsapp: e.target.value })}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Grande Area</label>
                <select
                  value={editing.grande_area}
                  onChange={e => setEditing({ ...editing, grande_area: e.target.value })}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {GRANDE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-4 py-2 text-sm font-semibold text-white"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir professor?"
        message={`Excluir "${deleteTarget?.name}"? Todas as aulas e dados serao perdidos. Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
