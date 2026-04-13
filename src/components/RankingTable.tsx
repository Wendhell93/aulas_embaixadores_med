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
            className={`rounded-xl p-4 transition-colors ${
              isHighlight
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-card border border-border'
            }`}
          >
            <div className="flex items-center gap-4">
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
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold bg-gradient-to-r from-[#5B392D] to-[#D5A891] bg-clip-text text-transparent">
                  {score.totalScore}
                </p>
                <p className="text-[10px] text-muted">pontos</p>
              </div>
            </div>

            {showBreakdown && (
              <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                <BreakdownItem
                  label="Realizadas"
                  value={`${score.completed}`}
                  sub={`${score.completedScore}pts`}
                  color="text-green-400"
                />
                <BreakdownItem
                  label="Disponiveis"
                  value={`${score.totalFutureOffered}`}
                  sub={`${score.availabilityScore}pts`}
                  color="text-accent"
                />
                <BreakdownItem
                  label="Ocupacao"
                  value={`${score.occupancyRate}%`}
                  sub={`${score.occupancyRate}pts`}
                  color="text-primary"
                />
                <BreakdownItem
                  label="Diversidade"
                  value={`${score.diversityScore}%`}
                  sub={`${score.diversityScore}pts`}
                  color="text-yellow-400"
                />
                <BreakdownItem
                  label="Aulas"
                  value={`${score.classesCount}`}
                  sub={`${score.varietyScore}pts`}
                  color="text-orange-400"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BreakdownItem({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-muted uppercase tracking-wider">{label}</span>
      <span className={`font-bold text-sm ${color}`}>{value}</span>
      <span className="text-muted">{sub}</span>
    </div>
  );
}
