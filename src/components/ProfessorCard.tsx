'use client';

import { useState } from 'react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import AvailableDatesModal from './AvailableDatesModal';
import ProfessorAvatar from './ProfessorAvatar';
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
        {/* Thumbnail - aspect 1:1 mobile, 16:9 desktop */}
        <div className="relative aspect-square sm:aspect-video bg-gradient-to-br from-[#090413] to-[#262033] overflow-hidden">
          {classData.thumbnail_url ? (
            <img
              src={classData.thumbnail_url}
              alt={classData.grande_tema}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#090413] to-[#262033]">
              <span className="text-3xl sm:text-2xl font-bold text-primary/40 text-center px-6 uppercase tracking-wider">
                {classData.grande_tema}
              </span>
            </div>
          )}
        </div>

        {/* Professor info */}
        <div className="p-5 sm:p-4 flex-1 flex flex-col">
          <div className="flex items-start gap-3 mb-4">
            <ProfessorAvatar
              name={professor.name}
              photoUrl={professor.photo_url}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                {professor.grande_area}
              </p>
              <p className="text-base sm:text-sm font-bold uppercase truncate">
                {classData.grande_tema}
              </p>
              {classData.subtema && (
                <p className="text-base sm:text-sm font-bold uppercase truncate text-gold">
                  {classData.subtema}
                </p>
              )}
              <p className="text-sm text-muted mt-0.5">{professor.name}</p>
            </div>
          </div>

          {/* Buttons - larger touch targets on mobile */}
          <div className="mt-auto space-y-2.5 sm:space-y-2">
            <button
              onClick={() => setShowDates(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 py-3.5 sm:py-2.5 text-sm font-bold text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors"
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              CONSULTAR DATAS
            </button>
            <button
              onClick={handleMarcarAula}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-4 py-3.5 sm:py-2.5 text-sm font-bold text-white hover:opacity-90 active:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
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
