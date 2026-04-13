import { SupabaseClient } from '@supabase/supabase-js';

export interface ProfessorScore {
  professor_id: string;
  name: string;
  photo_url: string | null;
  grande_area: string;
  completed: number;       // aulas realizadas
  totalOffered: number;    // slots ofertados (passados + futuros)
  totalBooked: number;     // reservados (incluindo realizados)
  occupancyRate: number;   // 0-100
  diversityScore: number;  // 0-100
  completedScore: number;  // 0-100 (normalizado vs maior do grupo)
  totalScore: number;      // 0-100 composto
}

const PERIOD_DAYS = 90;

export async function computeProfessorScores(supabase: SupabaseClient): Promise<ProfessorScore[]> {
  // Periodo de analise: ultimos 90 dias (slots no passado)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  // Buscar todos professores
  const { data: professors } = await supabase
    .from('professors')
    .select('id, name, photo_url, grande_area');

  if (!professors || professors.length === 0) return [];

  // Buscar todos slots do periodo com info da classe
  const { data: slotsData } = await supabase
    .from('class_slots')
    .select('id, date, start_time, status, class_id, classes!inner(professor_id)')
    .gte('date', cutoffStr);

  const slots = (slotsData || []) as unknown as Array<{
    id: string;
    date: string;
    start_time: string;
    status: string;
    class_id: string;
    classes: { professor_id: string };
  }>;

  // Agrupar por professor
  type SlotAgg = {
    completed: number;
    booked: number;
    offered: number;
    daysOfWeek: Set<number>;
    timeSlots: Set<string>; // manha/tarde/noite/madrugada
  };

  const byProfessor = new Map<string, SlotAgg>();

  for (const prof of professors) {
    byProfessor.set(prof.id, {
      completed: 0,
      booked: 0,
      offered: 0,
      daysOfWeek: new Set(),
      timeSlots: new Set(),
    });
  }

  for (const slot of slots) {
    const profId = slot.classes?.professor_id;
    if (!profId) continue;
    const agg = byProfessor.get(profId);
    if (!agg) continue;

    // Contabiliza ofertas apenas de datas passadas (ocupacao real)
    if (slot.date <= today) {
      agg.offered += 1;
    }

    if (slot.status === 'completed') agg.completed += 1;
    if (['booked', 'completed', 'no_show', 'cancelled_student'].includes(slot.status)) {
      if (slot.date <= today) agg.booked += 1;
    }

    // Diversidade (todos slots ofertados)
    const [y, m, d] = slot.date.split('-').map(Number);
    const jsDate = new Date(y, m - 1, d);
    agg.daysOfWeek.add(jsDate.getDay());

    const hour = parseInt(slot.start_time.split(':')[0]);
    let timeSlot = '';
    if (hour >= 6 && hour < 12) timeSlot = 'manha';
    else if (hour >= 12 && hour < 18) timeSlot = 'tarde';
    else if (hour >= 18 && hour < 22) timeSlot = 'noite';
    else timeSlot = 'madrugada';
    agg.timeSlots.add(timeSlot);
  }

  // maxCompleted para normalizar
  let maxCompleted = 0;
  for (const agg of byProfessor.values()) {
    if (agg.completed > maxCompleted) maxCompleted = agg.completed;
  }

  // Montar score final
  const scores: ProfessorScore[] = professors.map(p => {
    const agg = byProfessor.get(p.id)!;
    const completedScore = maxCompleted > 0 ? (agg.completed / maxCompleted) * 100 : 0;
    const occupancyRate = agg.offered > 0 ? (agg.booked / agg.offered) * 100 : 0;
    const diversityScore =
      (agg.daysOfWeek.size / 7) * 50 + (agg.timeSlots.size / 4) * 50;

    const totalScore =
      0.5 * completedScore + 0.3 * occupancyRate + 0.2 * diversityScore;

    return {
      professor_id: p.id,
      name: p.name,
      photo_url: p.photo_url,
      grande_area: p.grande_area,
      completed: agg.completed,
      totalOffered: agg.offered,
      totalBooked: agg.booked,
      occupancyRate: Math.round(occupancyRate),
      diversityScore: Math.round(diversityScore),
      completedScore: Math.round(completedScore),
      totalScore: Math.round(totalScore),
    };
  });

  // Ordenar por score decrescente
  scores.sort((a, b) => b.totalScore - a.totalScore);
  return scores;
}
