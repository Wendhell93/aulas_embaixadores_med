import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const supabase = await createClient();

  const { data: slots, error } = await supabase
    .from('class_slots')
    .select('*')
    .eq('class_id', classId)
    .eq('status', 'available')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(slots);
}
