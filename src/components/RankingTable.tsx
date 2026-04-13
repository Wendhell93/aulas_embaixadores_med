import ProfessorAvatar from './ProfessorAvatar';
import type { ProfessorScore } from '@/lib/scoring';

interface RankingTableProps {
  scores: ProfessorScore[];
  highlightProfessorId?: string;
  showBreakdown?: boolean;
}

function medalFor(position: number): string {
  if (position === 0) return '🥇';
  if (position === 1) return '🥈';
  if (position === 2) return '🥉';
  return `${position + 1}.`;
}

export default function RankingTable({ scores, highlightProfessorId, showBreakdown = true }: RankingTableProps) {
  if (scores.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        <p className="text-muted">Nenhum professor para exibir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scores.map((score, idx) => {
        const isHighlight = score.professor_id === highlightProfessorId;
        return (
          <div
            key={score.professor_id}
            className={`rounded-xl p-4 flex items-center gap-4 transition-colors ${
              isHighlight
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-card border border-border'
            }`}
          >
            <span className="text-2xl font-bold min-w-[3rem] text-center">
              {medalFor(idx)}
            </span>
            <ProfessorAvatar name={score.name} photoUrl={score.photo_url} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {score.name}
                {isHighlight && <span className="ml-2 text-xs text-primary">(voce)</span>}
              </p>
              <p className="text-xs text-muted truncate">{score.grande_area}</p>
              {showBreakdown && (
                <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-muted">
                  <span>{score.completed} realizadas</span>
                  <span>{score.occupancyRate}% ocupacao</span>
                  <span>{score.diversityScore}% diversidade</span>
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold bg-gradient-to-r from-[#5B392D] to-[#D5A891] bg-clip-text text-transparent">
                {score.totalScore}
              </p>
              <p className="text-[10px] text-muted">pontos</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
