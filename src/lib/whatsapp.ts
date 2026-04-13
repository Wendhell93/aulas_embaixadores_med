// URL do formulario de marcacao de aula (substituiu o fluxo via WhatsApp)
export const BOOKING_FORM_URL = 'https://wkf.ms/4tgzhQI';

interface BookingParams {
  professorName: string;
  grandeTema: string;
  subtema?: string;
  date?: string;
  time?: string;
}

/**
 * Retorna a URL do formulario de marcacao.
 * Os parametros sao mantidos para compatibilidade, mas o formulario
 * coleta as informacoes diretamente do aluno.
 */
export function buildWhatsAppUrl(_params: BookingParams): string {
  return BOOKING_FORM_URL;
}
