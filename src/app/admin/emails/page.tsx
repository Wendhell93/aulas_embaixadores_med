'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

interface AuthorizedEmail {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<AuthorizedEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('professor');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AuthorizedEmail | null>(null);
  const supabase = createClient();

  async function loadEmails() {
    const { data } = await supabase
      .from('authorized_emails')
      .select('*')
      .order('created_at', { ascending: false });
    setEmails((data as AuthorizedEmail[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadEmails();
  }, []);

  async function addEmail(e: React.FormEvent) {
    e.preventDefault();

    if (!newEmail.trim()) {
      toast.error('Informe um email');
      return;
    }

    const { error: insertError } = await supabase
      .from('authorized_emails')
      .insert({ email: newEmail.toLowerCase().trim(), role: newRole });

    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        toast.error('Este email ja esta cadastrado');
      } else {
        toast.error(insertError.message);
      }
      return;
    }

    toast.success(`${newEmail} adicionado como ${newRole}`);
    setNewEmail('');
    loadEmails();
  }

  async function confirmRemove() {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from('authorized_emails')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }
    toast.success('Email removido');
    setDeleteTarget(null);
    loadEmails();
  }

  async function toggleRole(id: string, currentRole: string) {
    const newR = currentRole === 'admin' ? 'professor' : 'admin';
    const { error } = await supabase
      .from('authorized_emails')
      .update({ role: newR })
      .eq('id', id);

    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }
    toast.success(`Role alterada para ${newR}`);
    loadEmails();
  }

  if (loading) return <div className="text-muted">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Emails Autorizados</h1>

      <form onSubmit={addEmail} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="email@exemplo.com"
          className="flex-1 rounded-lg bg-background border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          className="rounded-lg bg-background border border-border px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="professor">Professor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {emails.map(item => (
          <div key={item.id} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.email}</p>
              <p className="text-xs text-muted">
                Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleRole(item.id, item.role)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                  item.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                }`}
              >
                {item.role}
              </button>
              <button
                onClick={() => setDeleteTarget(item)}
                className="text-xs px-3 py-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {emails.length === 0 && (
        <p className="text-muted text-center py-8">Nenhum email cadastrado.</p>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remover email?"
        message={`Remover ${deleteTarget?.email} da lista de autorizados? Esta pessoa nao podera mais se cadastrar.`}
        confirmLabel="Remover"
        danger
        onConfirm={confirmRemove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
