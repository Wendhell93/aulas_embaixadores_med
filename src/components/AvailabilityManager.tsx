'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { DAYS_OF_WEEK, getUpcomingMonths, generateSlotsFromRules, validateRule } from '@/lib/generateSlots';
import { useRouter } from 'next/navigation';

interface DayRule {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

interface AvailabilityManagerProps {
  classId: string;
}

export default function AvailabilityManager({ classId }: AvailabilityManagerProps) {
  const [selectedMonth, setSelectedMonth] = useState(getUpcomingMonths(1)[0].value);
  const [rules, setRules] = useState<Record<number, DayRule>>(
    DAYS_OF_WEEK.reduce((acc, d) => ({
      ...acc,
      [d.value]: { enabled: false, start_time: '14:00', end_time: '16:00' }
    }), {})
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const months = getUpcomingMonths(12);

  // Carrega regras existentes do mes selecionado
  useEffect(() => {
    async function loadRules() {
      const { data } = await supabase
        .from('class_availability')
        .select('*')
        .eq('class_id', classId)
        .eq('month', selectedMonth);

      const newRules: Record<number, DayRule> = DAYS_OF_WEEK.reduce((acc, d) => ({
        ...acc,
        [d.value]: { enabled: false, start_time: '14:00', end_time: '16:00' }
      }), {});

      if (data) {
        for (const row of data as Array<{ day_of_week: number; start_time: string; end_time: string }>) {
          newRules[row.day_of_week] = {
            enabled: true,
            start_time: row.start_time.slice(0, 5),
            end_time: row.end_time.slice(0, 5),
          };
        }
      }

      setRules(newRules);

      // Contar slots bookados futuros deste mes
      const [year, monthNum] = selectedMonth.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(Number(year), Number(monthNum), 0).toISOString().slice(0, 10);

      const { count } = await supabase
        .from('class_slots')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('is_booked', true);

      setBookedCount(count || 0);
    }
    loadRules();
  }, [classId, selectedMonth]);

  // Atualiza preview quando regras mudam
  useEffect(() => {
    const activeRules = Object.entries(rules)
      .filter(([, r]) => r.enabled)
      .map(([dow, r]) => ({
        day_of_week: Number(dow),
        start_time: r.start_time,
        end_time: r.end_time,
      }));

    const slots = generateSlotsFromRules(activeRules, selectedMonth);
    setPreview(slots.length);
  }, [rules, selectedMonth]);

  function updateRule(dow: number, field: keyof DayRule, value: string | boolean) {
    setRules(prev => ({
      ...prev,
      [dow]: { ...prev[dow], [field]: value }
    }));
  }

  async function handleSave() {
    setError('');
    setMessage('');
    setLoading(true);

    // Validar regras ativas
    const activeEntries = Object.entries(rules).filter(([, r]) => r.enabled);
    for (const [dow, r] of activeEntries) {
      const err = validateRule(r.start_time, r.end_time);
      if (err) {
        const day = DAYS_OF_WEEK.find(d => d.value === Number(dow))?.label;
        setError(`${day}: ${err}`);
        setLoading(false);
        return;
      }
    }

    // Deletar regras antigas do mes
    await supabase
      .from('class_availability')
      .delete()
      .eq('class_id', classId)
      .eq('month', selectedMonth);

    // Inserir novas regras
    if (activeEntries.length > 0) {
      const newRules = activeEntries.map(([dow, r]) => ({
        class_id: classId,
        month: selectedMonth,
        day_of_week: Number(dow),
        start_time: r.start_time,
        end_time: r.end_time,
      }));

      const { error: insertError } = await supabase
        .from('class_availability')
        .insert(newRules);

      if (insertError) {
        setError('Erro ao salvar regras: ' + insertError.message);
        setLoading(false);
        return;
      }
    }

    // Gerar slots
    const activeRulesData = activeEntries.map(([dow, r]) => ({
      day_of_week: Number(dow),
      start_time: r.start_time,
      end_time: r.end_time,
    }));
    const generatedSlots = generateSlotsFromRules(activeRulesData, selectedMonth);

    // Deletar slots NAO bookados do mes (preserva bookados)
    const [year, monthNum] = selectedMonth.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const endDate = new Date(Number(year), Number(monthNum), 0).toISOString().slice(0, 10);

    await supabase
      .from('class_slots')
      .delete()
      .eq('class_id', classId)
      .eq('is_booked', false)
      .gte('date', startDate)
      .lte('date', endDate);

    // Buscar slots bookados para nao duplicar
    const { data: bookedSlots } = await supabase
      .from('class_slots')
      .select('date, start_time')
      .eq('class_id', classId)
      .eq('is_booked', true)
      .gte('date', startDate)
      .lte('date', endDate);

    const bookedKeys = new Set(
      (bookedSlots || []).map(s => `${s.date}_${(s.start_time as string).slice(0, 5)}`)
    );

    // Inserir novos slots (exceto os que conflitam com bookados)
    const slotsToInsert = generatedSlots.filter(
      s => !bookedKeys.has(`${s.date}_${s.start_time.slice(0, 5)}`)
    ).map(s => ({
      class_id: classId,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      is_booked: false,
    }));

    if (slotsToInsert.length > 0) {
      const { error: slotsError } = await supabase
        .from('class_slots')
        .insert(slotsToInsert);

      if (slotsError) {
        setError('Erro ao gerar slots: ' + slotsError.message);
        setLoading(false);
        return;
      }
    }

    setMessage(`${slotsToInsert.length} slots gerados! ${bookedCount > 0 ? `(${bookedCount} ja bookados preservados)` : ''}`);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Seletor de mes */}
      <div>
        <label className="block text-sm font-medium mb-2">Mes</label>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full sm:w-auto rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Regras por dia da semana */}
      <div className="space-y-2">
        {DAYS_OF_WEEK.map(day => {
          const rule = rules[day.value];
          return (
            <div
              key={day.value}
              className={`rounded-xl border p-4 transition-colors ${
                rule.enabled ? 'bg-card border-primary/30' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={e => updateRule(day.value, 'enabled', e.target.checked)}
                    className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                  />
                  <span className="font-semibold">{day.label}</span>
                </label>

                {rule.enabled && (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      step="3600"
                      value={rule.start_time}
                      onChange={e => updateRule(day.value, 'start_time', e.target.value)}
                      className="rounded-lg bg-background border border-border px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-muted">ate</span>
                    <input
                      type="time"
                      step="3600"
                      value={rule.end_time}
                      onChange={e => updateRule(day.value, 'end_time', e.target.value)}
                      className="rounded-lg bg-background border border-border px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview */}
      <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
        <p className="text-sm">
          <span className="font-semibold text-primary">{preview} slots</span> de 2h serao gerados para{' '}
          {months.find(m => m.value === selectedMonth)?.label}.
          {bookedCount > 0 && (
            <span className="block mt-1 text-xs text-muted">
              {bookedCount} slot(s) ja bookado(s) serao preservados.
            </span>
          )}
        </p>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
      {message && <p className="text-primary text-sm">{message}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-6 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar Disponibilidade'}
      </button>
    </div>
  );
}
