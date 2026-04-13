import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const supabase = await createClient();

  // Tenta primeiro com a coluna status (nova migration). Se falhar, fallback para is_booked.
  let { data: slots, error } = await supabase
    .from('class_slots')
    .select('*')
    .eq('class_id', classId)
    .eq('status', 'available')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  // Fallback para bancos sem a coluna status
  if (error && error.message?.includes('column') && error.message?.includes('status')) {
    const res = await supabase
      .from('class_slots')
      .select('*')
      .eq('class_id', classId)
      .eq('is_booked', false)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    slots = res.data;
    error = res.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(slots);
}
