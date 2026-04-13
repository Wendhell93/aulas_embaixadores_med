import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { slotId } = await request.json();

  if (!slotId) {
    return NextResponse.json({ error: 'slotId required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Tenta atualizar usando status (nova migration)
  let { data, error } = await supabase
    .from('class_slots')
    .update({ status: 'booked', status_changed_at: new Date().toISOString() })
    .eq('id', slotId)
    .eq('status', 'available')
    .select()
    .single();

  // Fallback para bancos sem a coluna status (usa is_booked)
  if (error && error.message?.includes('column') && error.message?.includes('status')) {
    const res = await supabase
      .from('class_slots')
      .update({ is_booked: true })
      .eq('id', slotId)
      .eq('is_booked', false)
      .select()
      .single();
    data = res.data;
    error = res.error;
  }

  if (error || !data) {
    return NextResponse.json(
      { error: 'Slot ja reservado ou nao encontrado' },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, slot: data });
}
