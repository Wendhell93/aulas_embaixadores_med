export const GRANDE_AREAS = [
  'Clínica Médica',
  'Cirurgia Geral',
  'Medicina Preventiva',
  'Pediatria',
  'Ginecologia e Obstetrícia',
] as const;

export type GrandeArea = (typeof GRANDE_AREAS)[number];

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
