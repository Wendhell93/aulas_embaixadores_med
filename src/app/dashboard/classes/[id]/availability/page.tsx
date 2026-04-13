'use client';

import { createClient } from '@/lib/supabase/client';
import AvailabilityManager from '@/components/AvailabilityManager';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Class } from '@/types/database';

export default function AvailabilityPage() {
  const params = useParams();
  const classId = params.id as string;
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      setClassData(data as Class | null);
      setLoading(false);
    }
    load();
  }, [classId]);

  if (loading) return <div className="text-muted">Carregando...</div>;
  if (!classData) return <div className="text-danger">Aula nao encontrada.</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link href="/dashboard/classes" className="text-sm text-muted hover:text-primary">
          Minhas Aulas
        </Link>
        <span className="text-muted">/</span>
        <Link href={`/dashboard/classes/${classId}/edit`} className="text-sm text-muted hover:text-primary">
          {classData.grande_tema}
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">Disponibilidade</h1>
      <p className="text-muted text-sm mb-6">
        Defina os dias da semana que voce pode dar esta aula em cada mes. O sistema vai gerar automaticamente slots de 2h.
      </p>

      <AvailabilityManager classId={classId} />
    </div>
  );
}
