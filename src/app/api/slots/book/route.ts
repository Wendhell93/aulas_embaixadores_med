import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { slotId } = await request.json();

  if (!slotId) {
    return NextResponse.json({ error: 'slotId required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Marca slot como bookado apenas se ainda nao esta bookado (atomico via WHERE)
  const { data, error } = await supabase
    .from('class_slots')
    .update({ is_booked: true })
    .eq('id', slotId)
    .eq('is_booked', false)
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
