'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { type SlotStatus } from '@/types/database';

interface BookedSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
  class_id: string;
  classes: {
    grande_tema: string;
    subtema: string | null;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'other'>('upcoming');
  const supabase = createClient();

  async function loadBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: professor } = await supabase
      .from('professors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!professor) {
      setLoading(false);
      return;
    }

    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('professor_id', (professor as { id: string }).id);

    const classIds = (classes || []).map((c: { id: string }) => c.id);
    if (classIds.length === 0) {
      setBookings([]);
      setLoading(false);
      return;
    }

    // Buscar tudo exceto available
    const { data } = await supabase
      .from('class_slots')
      .select('*, classes(grande_tema, subtema)')
      .in('class_id', classIds)
      .neq('status', 'available')
      .order('date', { ascending: false });

    setBookings((data as BookedSlot[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function formatTime(t: string) {
    return t.slice(0, 5);
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter(b => b.status === 'booked' && b.date >= today);
  const completed = bookings.filter(b => b.status === 'completed');
  const other = bookings.filter(
    b => !(b.status === 'booked' && b.date >= today) && b.status !== 'completed'
  );

  const tabs = [
    { id: 'upcoming' as const, label: 'Proximas', count: upcoming.length },
    { id: 'completed' as const, label: 'Realizadas', count: completed.length },
    { id: 'other' as const, label: 'Outras', count: other.length },
  ];

  const current = tab === 'upcoming' ? upcoming : tab === 'completed' ? completed : other;

  if (loading) return <div className="text-muted">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Aulas Marcadas</h1>
      <p className="text-muted text-sm mb-4">
        Horarios reservados. Status e controlado pela administracao apos a aula acontecer.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {current.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-6 text-center">
          <p className="text-muted text-sm">Nenhuma aula nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {current.map(b => (
            <div key={b.id} className="rounded-xl bg-card border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">
                  {b.classes.grande_tema}
                  {b.classes.subtema && <span className="text-gold"> - {b.classes.subtema}</span>}
                </p>
                <p className="text-sm text-muted">
                  {formatDate(b.date)} - {formatTime(b.start_time)} as {formatTime(b.end_time)}
                </p>
              </div>
              <StatusBadge status={b.status} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
