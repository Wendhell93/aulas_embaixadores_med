'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StatusBadge from '@/components/StatusBadge';
import { SLOT_STATUS_LABELS, type SlotStatus } from '@/types/database';

interface SlotRow {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
  status_changed_at: string | null;
  class_id: string;
  classes: {
    grande_tema: string;
    subtema: string | null;
    professor_id: string;
    professors: {
      name: string;
    };
  };
}

const STATUS_OPTIONS: SlotStatus[] = [
  'available',
  'booked',
  'completed',
  'cancelled_student',
  'no_show',
  'cancelled_professor',
];

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<'past' | 'upcoming' | 'all'>('past');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  async function loadSlots() {
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from('class_slots')
      .select('id, date, start_time, end_time, status, status_changed_at, class_id, classes!inner(grande_tema, subtema, professor_id, professors!inner(name))')
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(500);

    if (filterPeriod === 'past') query = query.lte('date', today);
    if (filterPeriod === 'upcoming') query = query.gte('date', today);
    if (filterStatus) query = query.eq('status', filterStatus);

    const { data } = await query;
    setSlots((data as unknown as SlotRow[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadSlots();
  }, [filterStatus, filterPeriod]);

  async function changeStatus(slotId: string, newStatus: SlotStatus) {
    setUpdating(slotId);
    const res = await fetch('/api/slots/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, status: newStatus }),
    });

    if (!res.ok) {
      const d = await res.json();
      toast.error(d.error || 'Erro ao atualizar');
      setUpdating(null);
      return;
    }

    toast.success(`Status alterado para "${SLOT_STATUS_LABELS[newStatus]}"`);
    setUpdating(null);
    loadSlots();
  }

  const filtered = slots.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.classes?.grande_tema.toLowerCase().includes(q) ||
      s.classes?.subtema?.toLowerCase().includes(q) ||
      s.classes?.professors?.name.toLowerCase().includes(q)
    );
  });

  function formatDate(d: string) {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  function formatTime(t: string) {
    return t.slice(0, 5);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Gerenciar Slots</h1>
      <p className="text-muted text-sm mb-4">
        Marque aulas como realizadas, canceladas ou no-show para atualizar o ranking dos professores.
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por tema ou professor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-lg bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterPeriod}
          onChange={e => setFilterPeriod(e.target.value as 'past' | 'upcoming' | 'all')}
          className="rounded-lg bg-card border border-border px-4 py-2.5 text-sm"
        >
          <option value="past">Datas passadas</option>
          <option value="upcoming">Datas futuras</option>
          <option value="all">Todas</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-lg bg-card border border-border px-4 py-2.5 text-sm"
        >
          <option value="">Todos status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{SLOT_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-muted">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <p className="text-muted">Nenhum slot encontrado com esses filtros.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted mb-3">{filtered.length} slot{filtered.length !== 1 ? 's' : ''}</p>
          <div className="space-y-2">
            {filtered.map(slot => (
              <div key={slot.id} className="rounded-xl bg-card border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {slot.classes.grande_tema}
                    {slot.classes.subtema && <span className="text-gold"> - {slot.classes.subtema}</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {slot.classes.professors?.name} - {formatDate(slot.date)} {formatTime(slot.start_time)}-{formatTime(slot.end_time)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={slot.status} size="sm" />
                  <select
                    value={slot.status}
                    onChange={e => changeStatus(slot.id, e.target.value as SlotStatus)}
                    disabled={updating === slot.id}
                    className="text-xs rounded-lg bg-background border border-border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{SLOT_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
