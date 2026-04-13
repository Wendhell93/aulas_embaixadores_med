/**
 * Gera slots de 2h a partir de regras de disponibilidade mensal.
 * Cada regra = {day_of_week, start_time, end_time}
 * Slots gerados = blocos de 2h sem sobreposicao (14-16, 16-18, etc)
 */

export interface AvailabilityRule {
  day_of_week: number; // 0=Dom, 6=Sab
  start_time: string;  // 'HH:MM' ou 'HH:MM:SS'
  end_time: string;
}

export interface GeneratedSlot {
  date: string;       // 'YYYY-MM-DD'
  start_time: string; // 'HH:MM:SS'
  end_time: string;
}

const SLOT_DURATION_HOURS = 2;

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}:00`;
}

/**
 * Retorna todas as datas do mes que caem em determinado dia da semana.
 * month: 'YYYY-MM' (ex: '2026-04')
 * day_of_week: 0=Dom, 1=Seg, ..., 6=Sab
 */
export function getDatesInMonthForWeekday(month: string, dayOfWeek: number): string[] {
  const [year, monthNum] = month.split('-').map(Number);
  const dates: string[] = [];

  // Primeiro dia do mes
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0); // ultimo dia

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(year, monthNum - 1, day);
    if (d.getDay() === dayOfWeek) {
      dates.push(`${year}-${pad2(monthNum)}-${pad2(day)}`);
    }
  }

  return dates;
}

/**
 * Gera array de slots 2h dentro de um range de tempo.
 * Ex: 14:00-18:00 -> [14:00-16:00, 16:00-18:00]
 */
export function generateTimeBlocks(startTime: string, endTime: string): Array<{ start: string; end: string }> {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const durationMin = SLOT_DURATION_HOURS * 60;

  const blocks: Array<{ start: string; end: string }> = [];
  for (let cur = startMin; cur + durationMin <= endMin; cur += durationMin) {
    blocks.push({
      start: minutesToTime(cur),
      end: minutesToTime(cur + durationMin),
    });
  }
  return blocks;
}

/**
 * Gera slots de 2h a partir das regras, para um mes especifico.
 */
export function generateSlotsFromRules(rules: AvailabilityRule[], month: string): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];

  for (const rule of rules) {
    const dates = getDatesInMonthForWeekday(month, rule.day_of_week);
    const blocks = generateTimeBlocks(rule.start_time, rule.end_time);

    for (const date of dates) {
      for (const block of blocks) {
        slots.push({
          date,
          start_time: block.start,
          end_time: block.end,
        });
      }
    }
  }

  return slots;
}

/**
 * Valida se uma regra esta correta:
 * - start < end
 * - diferenca e multiplo de 2h
 * - start em hora cheia
 */
export function validateRule(startTime: string, endTime: string): string | null {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (startMin >= endMin) return 'Hora final deve ser maior que inicial';
  if (startMin % 60 !== 0) return 'Hora inicial deve ser em hora cheia (ex: 14:00)';
  if (endMin % 60 !== 0) return 'Hora final deve ser em hora cheia (ex: 18:00)';

  const diff = endMin - startMin;
  if (diff < 120) return 'Janela de tempo deve ter pelo menos 2 horas';
  if (diff % 120 !== 0) return 'Janela de tempo deve ser multiplo de 2 horas';

  return null;
}

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terca' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sabado' },
  { value: 0, label: 'Domingo' },
] as const;

/**
 * Gera lista dos proximos N meses no formato 'YYYY-MM'.
 */
export function getUpcomingMonths(count: number = 12): Array<{ value: string; label: string }> {
  const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const now = new Date();
  const result: Array<{ value: string; label: string }> = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    result.push({ value, label });
  }

  return result;
}
