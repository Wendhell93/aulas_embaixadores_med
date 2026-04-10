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

  const displayTitle = classData.subtema
    ? `${classData.grande_tema} - ${classData.subtema}`
    : classData.grande_tema;

  return (
    <>
      <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {classData.thumbnail_url ? (
            <img
              src={classData.thumbnail_url}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-2xl font-bold text-white/30 text-center px-4">
                {classData.grande_tema.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Professor info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start gap-3 mb-3">
            {professor.photo_url ? (
              <img
                src={professor.photo_url}
                alt={professor.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-border flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border-2 border-border">
                <span className="text-lg font-bold text-white/50">
                  {professor.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-muted uppercase tracking-wider">
                {professor.grande_area}
              </p>
              <p className="text-sm font-bold uppercase truncate">
                {classData.grande_tema}
              </p>
              {classData.subtema && (
                <p className="text-sm font-bold uppercase truncate">
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent/10 border border-accent/30 px-4 py-2.5 text-sm font-bold text-accent hover:bg-accent/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              CONSULTAR DATAS
            </button>
            <button
              onClick={handleMarcarAula}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors"
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
        className={displayTitle}
        isOpen={showDates}
        onClose={() => setShowDates(false)}
        onSelectSlot={handleSelectSlot}
      />
    </>
  );
}
