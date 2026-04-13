import { SupabaseClient } from '@supabase/supabase-js';

export interface ProfessorScore {
  professor_id: string;
  name: string;
  photo_url: string | null;
  grande_area: string;

  // Metricas brutas
  completed: number;       // aulas realizadas
  totalOffered: number;    // slots ofertados (passados)
  totalFutureOffered: number; // slots disponibilizados no futuro (disponibilidade)
  totalBooked: number;     // reservados (incluindo realizados)
  classesCount: number;    // numero de aulas (temas) ativas do professor

  // Sub-scores (0-100)
  completedScore: number;  // volume realizado
  occupancyRate: number;   // taxa de ocupacao
  availabilityScore: number; // volume ofertado futuro
  diversityScore: number;  // variedade de horarios/dias
  varietyScore: number;    // variedade de aulas/temas

  // Score composto (0-100)
  totalScore: number;
}

const PERIOD_DAYS = 90;

// Pesos do score composto (soma = 100)
const WEIGHTS = {
  completed: 30,      // aulas realizadas
  occupancy: 20,      // taxa de ocupacao
  availability: 25,   // volume de slots futuros ofertados
  diversity: 15,      // variedade de dias/horarios
  variety: 10,        // variedade de aulas (temas)
};

export async function computeProfessorScores(supabase: SupabaseClient): Promise<ProfessorScore[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PERIOD_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const { data: professors } = await supabase
    .from('professors')
    .select('id, name, photo_url, grande_area');

  if (!professors || professors.length === 0) return [];

  // Buscar slots do periodo e futuros
  const { data: slotsData } = await supabase
    .from('class_slots')
    .select('id, date, start_time, status, class_id, classes!inner(professor_id, is_active)')
    .gte('date', cutoffStr);

  const slots = (slotsData || []) as unknown as Array<{
    id: string;
    date: string;
    start_time: string;
    status: string;
    class_id: string;
    classes: { professor_id: string; is_active: boolean };
  }>;

  // Contar classes ativas por professor
  const { data: classesData } = await supabase
    .from('classes')
    .select('id, professor_id')
    .eq('is_active', true);
  const classesByProfessor = new Map<string, Set<string>>();
  for (const c of (classesData || []) as Array<{ id: string; professor_id: string }>) {
    if (!classesByProfessor.has(c.professor_id)) {
      classesByProfessor.set(c.professor_id, new Set());
    }
    classesByProfessor.get(c.professor_id)!.add(c.id);
  }

  type SlotAgg = {
    completed: number;
    booked: number;           // reservados no passado
    offered: number;          // ofertados no passado (para calcular ocupacao)
    futureAvailable: number;  // slots disponiveis no futuro
    daysOfWeek: Set<number>;
    timeSlots: Set<string>;
  };

  const byProfessor = new Map<string, SlotAgg>();
  for (const prof of professors) {
    byProfessor.set(prof.id, {
      completed: 0,
      booked: 0,
      offered: 0,
      futureAvailable: 0,
      daysOfWeek: new Set(),
      timeSlots: new Set(),
    });
  }

  for (const slot of slots) {
    const profId = slot.classes?.professor_id;
    if (!profId) continue;
    const agg = byProfessor.get(profId);
    if (!agg) continue;

    const isPast = slot.date <= today;
    const isFuture = slot.date > today;

    // Volume de realizadas (so conta completed, nao tem limite temporal)
    if (slot.status === 'completed') agg.completed += 1;

    // Ocupacao: baseada em slots passados
    if (isPast) {
      agg.offered += 1;
      if (['booked', 'completed', 'no_show', 'cancelled_student'].includes(slot.status)) {
        agg.booked += 1;
      }
    }

    // Disponibilidade: slots futuros com status available
    if (isFuture && slot.status === 'available') {
      agg.futureAvailable += 1;
    }

    // Diversidade (considera todos slots ofertados no periodo)
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

  // Maximos do grupo (para normalizacao)
  let maxCompleted = 0;
  let maxFutureAvailable = 0;
  let maxClassesCount = 0;

  for (const prof of professors) {
    const agg = byProfessor.get(prof.id)!;
    if (agg.completed > maxCompleted) maxCompleted = agg.completed;
    if (agg.futureAvailable > maxFutureAvailable) maxFutureAvailable = agg.futureAvailable;
    const cc = classesByProfessor.get(prof.id)?.size || 0;
    if (cc > maxClassesCount) maxClassesCount = cc;
  }

  const scores: ProfessorScore[] = professors.map(p => {
    const agg = byProfessor.get(p.id)!;
    const classesCount = classesByProfessor.get(p.id)?.size || 0;

    const completedScore = maxCompleted > 0 ? (agg.completed / maxCompleted) * 100 : 0;
    const occupancyRate = agg.offered > 0 ? (agg.booked / agg.offered) * 100 : 0;
    const availabilityScore = maxFutureAvailable > 0 ? (agg.futureAvailable / maxFutureAvailable) * 100 : 0;
    const diversityScore = (agg.daysOfWeek.size / 7) * 50 + (agg.timeSlots.size / 4) * 50;
    const varietyScore = maxClassesCount > 0 ? (classesCount / maxClassesCount) * 100 : 0;

    const totalScore =
      (WEIGHTS.completed / 100) * completedScore +
      (WEIGHTS.occupancy / 100) * occupancyRate +
      (WEIGHTS.availability / 100) * availabilityScore +
      (WEIGHTS.diversity / 100) * diversityScore +
      (WEIGHTS.variety / 100) * varietyScore;

    return {
      professor_id: p.id,
      name: p.name,
      photo_url: p.photo_url,
      grande_area: p.grande_area,
      completed: agg.completed,
      totalOffered: agg.offered,
      totalFutureOffered: agg.futureAvailable,
      totalBooked: agg.booked,
      classesCount,
      completedScore: Math.round(completedScore),
      occupancyRate: Math.round(occupancyRate),
      availabilityScore: Math.round(availabilityScore),
      diversityScore: Math.round(diversityScore),
      varietyScore: Math.round(varietyScore),
      totalScore: Math.round(totalScore),
    };
  });

  scores.sort((a, b) => b.totalScore - a.totalScore);
  return scores;
}

export const SCORE_WEIGHTS_LABEL =
  '30% realizadas + 25% disponibilidade + 20% ocupacao + 15% diversidade + 10% variedade de aulas';
