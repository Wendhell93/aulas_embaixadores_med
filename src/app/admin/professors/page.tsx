import { createClient } from '@/lib/supabase/server';
import type { Professor } from '@/types/database';

export default async function AdminProfessorsPage() {
  const supabase = await createClient();

  const { data: professors } = await supabase
    .from('professors')
    .select('*')
    .order('name', { ascending: true });

  const allProfessors = (professors || []) as Professor[];

  // Get class count per professor
  const { data: classCounts } = await supabase
    .from('classes')
    .select('professor_id');

  const countMap: Record<string, number> = {};
  (classCounts || []).forEach((c: { professor_id: string }) => {
    countMap[c.professor_id] = (countMap[c.professor_id] || 0) + 1;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Professores Cadastrados</h1>

      {allProfessors.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <p className="text-muted">Nenhum professor cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allProfessors.map((prof) => (
            <div
              key={prof.id}
              className="rounded-xl bg-card border border-border p-4 flex items-center gap-4"
            >
              {prof.photo_url ? (
                <img
                  src={prof.photo_url}
                  alt={prof.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B392D] to-[#D5A891] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-white">
                    {prof.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{prof.name}</p>
                <p className="text-xs text-muted">{prof.grande_area}</p>
                {prof.whatsapp && (
                  <p className="text-xs text-muted">WhatsApp: {prof.whatsapp}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">{countMap[prof.id] || 0}</p>
                <p className="text-xs text-muted">aulas</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
