import { createClient } from '@/lib/supabase/server';
import { getCurrentUserRole, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

const VALID_STATUSES = [
  'available',
  'booked',
  'completed',
  'cancelled_student',
  'no_show',
  'cancelled_professor',
] as const;

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { role } = await getCurrentUserRole(supabase);
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { slotId, status } = await request.json();

  if (!slotId || !status) {
    return NextResponse.json({ error: 'slotId e status obrigatorios' }, { status: 400 });
  }

  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'status invalido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('class_slots')
    .update({
      status,
      status_changed_at: new Date().toISOString(),
      status_changed_by: user.id,
    })
    .eq('id', slotId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, slot: data });
}
