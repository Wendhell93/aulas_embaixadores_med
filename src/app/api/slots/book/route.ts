import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { slotId } = await request.json();

  if (!slotId) {
    return NextResponse.json({ error: 'slotId required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Atomico: so atualiza se status='available'
  const { data, error } = await supabase
    .from('class_slots')
    .update({ status: 'booked', status_changed_at: new Date().toISOString() })
    .eq('id', slotId)
    .eq('status', 'available')
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Slot ja reservado ou nao encontrado' },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, slot: data });
}
