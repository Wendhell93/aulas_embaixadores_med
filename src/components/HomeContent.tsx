'use client';

import { useState, useMemo } from 'react';
import ClassFilters from './ClassFilters';
import ProfessorCard from './ProfessorCard';
import type { ClassWithProfessorAndSlots } from '@/types/database';

interface HomeContentProps {
  classes: ClassWithProfessorAndSlots[];
}

export default function HomeContent({ classes }: HomeContentProps) {
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Extract unique professor names
  const professorNames = useMemo(() => {
    const names = new Set(classes.map((c) => c.professors.name));
    return Array.from(names).sort();
  }, [classes]);

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      // Area filter
      if (selectedArea && cls.professors.grande_area !== selectedArea) {
        return false;
      }

      // Professor filter
      if (selectedProfessor && cls.professors.name !== selectedProfessor) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTema = cls.grande_tema.toLowerCase().includes(q);
        const matchSubtema = cls.subtema?.toLowerCase().includes(q);
        const matchProfessor = cls.professors.name.toLowerCase().includes(q);
        if (!matchTema && !matchSubtema && !matchProfessor) {
          return false;
        }
      }

      // Available slots filter
      if (showAvailable) {
        const hasAvailable = cls.class_slots?.some(
          (slot) => slot.date >= today && slot.status === 'available'
        );
        if (!hasAvailable) {
          return false;
        }
      }

      return true;
    });
  }, [classes, selectedArea, selectedProfessor, searchQuery, showAvailable, today]);

  return (
    <>
      <ClassFilters
        professors={professorNames}
        selectedArea={selectedArea}
        selectedProfessor={selectedProfessor}
        searchQuery={searchQuery}
        showAvailable={showAvailable}
        onAreaChange={setSelectedArea}
        onProfessorChange={setSelectedProfessor}
        onSearchChange={setSearchQuery}
        onAvailableChange={setShowAvailable}
        resultCount={filteredClasses.length}
        totalCount={classes.length}
      />

      {filteredClasses.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 sm:p-12 text-center">
          <p className="text-muted text-base sm:text-lg">
            {classes.length === 0
              ? 'Nenhuma aula disponivel no momento.'
              : 'Nenhuma aula encontrada com esses filtros.'}
          </p>
          {classes.length > 0 && (
            <button
              onClick={() => {
                setSelectedArea('');
                setSelectedProfessor('');
                setSearchQuery('');
                setShowAvailable(false);
              }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClasses.map((cls) => (
            <ProfessorCard key={cls.id} classData={cls} />
          ))}
        </div>
      )}
    </>
  );
}
