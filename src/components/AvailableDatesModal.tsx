'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { ClassSlot } from '@/types/database';

interface AvailableDatesModalProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSlot?: (slot: ClassSlot) => void;
}

export default function AvailableDatesModal({
  classId,
  className,
  isOpen,
  onClose,
  onSelectSlot,
}: AvailableDatesModalProps) {
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');
      fetch(`/api/slots/${classId}`)
        .then((res) => res.json())
        .then((data) => {
          setSlots(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, classId]);

  if (!isOpen) return null;

  const groupedSlots: Record<string, ClassSlot[]> = {};
  slots.forEach((slot) => {
    if (!groupedSlots[slot.date]) {
      groupedSlots[slot.date] = [];
    }
    groupedSlots[slot.date].push(slot);
  });

  function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatTime(time: string) {
    return time.slice(0, 5);
  }

  async function handleSlotClick(slot: ClassSlot) {
    setError('');
    setBooking(slot.id);

    try {
      const res = await fetch('/api/slots/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: slot.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error || 'Erro ao reservar horario';
        setError(msg);
        toast.error(msg);
        setBooking(null);
        setSlots(prev => prev.filter(s => s.id !== slot.id));
        return;
      }

      toast.success('Horario reservado! Abrindo WhatsApp...');
      onSelectSlot?.(slot);
      setSlots(prev => prev.filter(s => s.id !== slot.id));
    } catch {
      setError('Erro de conexao. Tente novamente.');
      setBooking(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold bg-gradient-to-r from-[#5B392D] to-[#D5A891] bg-clip-text text-transparent">
            {className}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <h3 className="text-sm font-medium text-muted mb-3">Datas e Horarios Disponiveis</h3>

        {error && (
          <p className="text-danger text-sm mb-3 rounded-lg bg-danger/10 border border-danger/30 px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-muted text-sm">Carregando...</p>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <p className="text-muted text-sm">Nenhum horario disponivel no momento.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSlots).map(([date, dateSlots]) => (
              <div key={date}>
                <p className="text-sm font-semibold text-primary mb-2">{formatDate(date)}</p>
                <div className="flex flex-wrap gap-2">
                  {dateSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={booking === slot.id}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-gradient-to-r hover:from-[#5B392D] hover:to-[#D5A891] hover:text-white hover:border-transparent transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                      {booking === slot.id ? 'Reservando...' : `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
