import { createClient } from '@/lib/supabase/server';
import { computeProfessorScores } from '@/lib/scoring';
import RankingTable from '@/components/RankingTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminRankingPage() {
  const supabase = await createClient();
  const scores = await computeProfessorScores(supabase);

  const totalCompleted = scores.reduce((s, p) => s + p.completed, 0);
  const avgOccupancy = scores.length > 0
    ? Math.round(scores.reduce((s, p) => s + p.occupancyRate, 0) / scores.length)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Ranking de Professores</h1>
        <Link
          href="/admin/slots"
          className="text-xs rounded-lg border border-primary/30 px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
        >
          Gerenciar Status
        </Link>
      </div>
      <p className="text-muted text-sm mb-4">
        Ranking por score composto. Considera ultimos 90 dias.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-[10px] text-muted uppercase">Professores</p>
          <p className="text-xl font-bold">{scores.length}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-[10px] text-muted uppercase">Realizadas (total)</p>
          <p className="text-xl font-bold">{totalCompleted}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-[10px] text-muted uppercase">Ocupacao media</p>
          <p className="text-xl font-bold">{avgOccupancy}%</p>
        </div>
      </div>

      <RankingTable scores={scores} />
    </div>
  );
}
