'use client';

import { useState } from 'react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import AvailableDatesModal from './AvailableDatesModal';
import type { ClassWithProfessor, ClassSlot } from '@/types/database';

interface ProfessorCardProps {
  classData: ClassWithProfessor;
}

export default function ProfessorCard({ classData }: ProfessorCardProps) {
  const [showDates, setShowDates] = useState(false);
  const professor = classData.professors;

  function handleSelectSlot(slot: ClassSlot) {
    const [year, month, day] = slot.date.split('-');
    const dateStr = `${day}/${month}/${year}`;
    const timeStr = slot.start_time.slice(0, 5);

    const url = buildWhatsAppUrl({
      professorName: professor.name,
      grandeTema: classData.grande_tema,
      subtema: classData.subtema || undefined,
      date: dateStr,
      time: timeStr,
    });

    window.open(url, '_blank');
  }

  function handleMarcarAula() {
    const url = buildWhatsAppUrl({
      professorName: professor.name,
      grandeTema: classData.grande_tema,
      subtema: classData.subtema || undefined,
    });
    window.open(url, '_blank');
  }

  return (
    <>
      <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-[#090413] to-[#262033] overflow-hidden">
          {classData.thumbnail_url ? (
            <img
              src={classData.thumbnail_url}
              alt={classData.grande_tema}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#090413] to-[#262033]">
              <span className="text-2xl font-bold text-primary/40 text-center px-4 uppercase tracking-wider">
                {classData.grande_tema}
              </span>
            </div>
          )}
        </div>

        {/* Professor info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start gap-3 mb-4">
            {professor.photo_url ? (
              <img
                src={professor.photo_url}
                alt={professor.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B392D] to-[#D5A891] flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">
                  {professor.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                {professor.grande_area}
              </p>
              <p className="text-sm font-bold uppercase truncate">
                {classData.grande_tema}
              </p>
              {classData.subtema && (
                <p className="text-sm font-bold uppercase truncate text-gold">
                  {classData.subtema}
                </p>
              )}
              <p className="text-sm text-muted mt-0.5">{professor.name}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-auto space-y-2">
            <button
              onClick={() => setShowDates(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              CONSULTAR DATAS
            </button>
            <button
              onClick={handleMarcarAula}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              MARCAR AULA
            </button>
          </div>
        </div>
      </div>

      <AvailableDatesModal
        classId={classData.id}
        className={classData.subtema ? `${classData.grande_tema} - ${classData.subtema}` : classData.grande_tema}
        isOpen={showDates}
        onClose={() => setShowDates(false)}
        onSelectSlot={handleSelectSlot}
      />
    </>
  );
}
