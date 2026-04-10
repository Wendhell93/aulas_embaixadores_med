import { WHATSAPP_NUMBER } from './constants';

interface WhatsAppParams {
  professorName: string;
  grandeTema: string;
  subtema?: string;
  date?: string;
  time?: string;
}

export function buildWhatsAppUrl(params: WhatsAppParams): string {
  const { professorName, grandeTema, subtema, date, time } = params;

  let message = `Olá! Gostaria de marcar uma aula de ${grandeTema}`;
  if (subtema) {
    message += ` - ${subtema}`;
  }
  message += ` com ${professorName}.`;
  if (date && time) {
    message += ` Data: ${date} às ${time}.`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
