import { createClient } from '@/lib/supabase/server';
import { computeProfessorScores } from '@/lib/scoring';
import RankingTable from '@/components/RankingTable';

export const dynamic = 'force-dynamic';

export default async function ProfessorRankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: professor } = await supabase
    .from('professors')
    .select('id')
    .eq('user_id', user!.id)
    .single();

  const scores = await computeProfessorScores(supabase);
  const myId = (professor as { id?: string } | null)?.id;
  const myScore = scores.find(s => s.professor_id === myId);
  const myPosition = myId ? scores.findIndex(s => s.professor_id === myId) + 1 : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Ranking de Professores</h1>
      <p className="text-muted text-sm mb-6">
        Desempenho baseado em aulas realizadas (50%), taxa de ocupacao (30%) e diversidade de horarios (20%).
        Considera ultimos 90 dias.
      </p>

      {myScore && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#5B392D]/20 to-[#D5A891]/20 border border-primary/40 p-4">
          <p className="text-xs text-muted mb-1">SUA POSICAO</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-[#5B392D] to-[#D5A891] bg-clip-text text-transparent">
            #{myPosition} - {myScore.totalScore} pontos
          </p>
          <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
            <div>
              <p className="text-muted">Realizadas</p>
              <p className="font-semibold">{myScore.completed}</p>
            </div>
            <div>
              <p className="text-muted">Ocupacao</p>
              <p className="font-semibold">{myScore.occupancyRate}%</p>
            </div>
            <div>
              <p className="text-muted">Diversidade</p>
              <p className="font-semibold">{myScore.diversityScore}%</p>
            </div>
          </div>
        </div>
      )}

      <RankingTable scores={scores} highlightProfessorId={myId} />
    </div>
  );
}
