'use client';

import { GRANDE_AREAS } from '@/lib/constants';

interface ClassFiltersProps {
  professors: string[];
  selectedArea: string;
  selectedProfessor: string;
  searchQuery: string;
  showAvailable: boolean;
  onAreaChange: (area: string) => void;
  onProfessorChange: (professor: string) => void;
  onSearchChange: (query: string) => void;
  onAvailableChange: (available: boolean) => void;
  resultCount: number;
  totalCount: number;
}

export default function ClassFilters({
  professors,
  selectedArea,
  selectedProfessor,
  searchQuery,
  showAvailable,
  onAreaChange,
  onProfessorChange,
  onSearchChange,
  onAvailableChange,
  resultCount,
  totalCount,
}: ClassFiltersProps) {
  const areas = ['Todas', ...GRANDE_AREAS];

  return (
    <div className="space-y-3 mb-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por tema..."
          className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 sm:py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
        />
      </div>

      {/* Area chips - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {areas.map((area) => {
          const isActive = area === 'Todas' ? selectedArea === '' : selectedArea === area;
          return (
            <button
              key={area}
              onClick={() => onAreaChange(area === 'Todas' ? '' : area)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#5B392D] to-[#D5A891] text-white'
                  : 'bg-card border border-border text-muted hover:text-foreground hover:border-primary/30'
              }`}
            >
              {area}
            </button>
          );
        })}
      </div>

      {/* Professor select + Available toggle */}
      <div className="flex gap-2 items-center">
        {professors.length > 1 && (
          <select
            value={selectedProfessor}
            onChange={(e) => onProfessorChange(e.target.value)}
            className="flex-1 rounded-xl bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
          >
            <option value="">Todos os professores</option>
            {professors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => onAvailableChange(!showAvailable)}
          className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
            showAvailable
              ? 'bg-primary/20 border border-primary/40 text-primary'
              : 'bg-card border border-border text-muted hover:text-foreground'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Com vagas
        </button>
      </div>

      {/* Result count */}
      {(selectedArea || selectedProfessor || searchQuery || showAvailable) && (
        <p className="text-xs text-muted">
          {resultCount} de {totalCount} aula{totalCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
