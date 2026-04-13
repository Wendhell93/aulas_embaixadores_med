'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BookedSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  class_id: string;
  classes: {
    grande_tema: string;
    subtema: string | null;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(true);
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

    const { data } = await supabase
      .from('class_slots')
      .select('*, classes(grande_tema, subtema)')
      .in('class_id', classIds)
      .eq('is_booked', true)
      .order('date', { ascending: true });

    setBookings((data as BookedSlot[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function unbook(slotId: string) {
    const { error } = await supabase
      .from('class_slots')
      .update({ is_booked: false })
      .eq('id', slotId);

    if (error) {
      toast.error('Erro ao liberar: ' + error.message);
      return;
    }
    toast.success('Horario liberado novamente');
    loadBookings();
  }

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function formatTime(t: string) {
    return t.slice(0, 5);
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter(b => b.date >= today);
  const past = bookings.filter(b => b.date < today);

  if (loading) return <div className="text-muted">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Aulas Marcadas</h1>
      <p className="text-muted text-sm mb-6">
        Horarios que alunos reservaram. Se algum aluno desistiu, libere o slot para outros.
      </p>

      {/* Upcoming */}
      <h2 className="text-sm font-semibold text-primary mb-2">PROXIMAS</h2>
      {upcoming.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-6 text-center mb-6">
          <p className="text-muted text-sm">Nenhuma aula marcada.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {upcoming.map(b => (
            <div key={b.id} className="rounded-xl bg-card border border-primary/30 p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">
                  {b.classes.grande_tema}
                  {b.classes.subtema && <span className="text-gold"> - {b.classes.subtema}</span>}
                </p>
                <p className="text-sm text-muted">
                  {formatDate(b.date)} - {formatTime(b.start_time)} as {formatTime(b.end_time)}
                </p>
              </div>
              <button
                onClick={() => unbook(b.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors flex-shrink-0"
              >
                Liberar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-muted mb-2">HISTORICO</h2>
          <div className="space-y-2">
            {past.map(b => (
              <div key={b.id} className="rounded-xl bg-card border border-border p-4 opacity-60">
                <p className="font-semibold text-sm">
                  {b.classes.grande_tema}
                  {b.classes.subtema && <span> - {b.classes.subtema}</span>}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(b.date)} - {formatTime(b.start_time)} as {formatTime(b.end_time)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
