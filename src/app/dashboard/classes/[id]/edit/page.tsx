'use client';

import { createClient } from '@/lib/supabase/client';
import ClassForm from '@/components/ClassForm';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Class } from '@/types/database';

export default function EditClassPage() {
  const params = useParams();
  const classId = params.id as string;
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: cls } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      setClassData(cls as Class | null);
      setLoading(false);
    }
    load();
  }, [classId]);

  if (loading) return <div className="text-muted">Carregando...</div>;
  if (!classData) return <div className="text-danger">Aula nao encontrada.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar Aula</h1>
      <ClassForm classData={classData} />
    </div>
  );
}
