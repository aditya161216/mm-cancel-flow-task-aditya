// server-only
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const sb = supabaseAdmin;
  const userId = process.env.MOCK_USER_ID!;
  const { subscriptionId, accepted, reason } = (await req.json()) as {
    subscriptionId: string;
    accepted: boolean;
    reason?: string;
  };

  // Ensure we have a cancellation row; if none (e.g., found-job branch), insert with A
  const { data: last } = await sb
    .from('cancellations')
    .select('id, downsell_variant')
    .eq('subscription_id', subscriptionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let cancelId = last?.id;

  if (!cancelId) {
    const { data: ins, error: insErr } = await sb
      .from('cancellations')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        // no randomization here; requirement: do not generate variant in the found-job branch
        downsell_variant: 'A',
        reason: reason ?? null,
        accepted_downsell: false,
      })
      .select('id')
      .single();
    if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
    cancelId = ins!.id;
  } else {
    await sb
      .from('cancellations')
      .update({
        reason: (reason ?? '').toString().slice(0, 500),
        accepted_downsell: !!accepted,
      })
      .eq('id', cancelId);
  }

  // Flip subscription out of "pending_cancellation"
  const newStatus = accepted ? 'active' : 'cancelled';
  const { error: updErr } = await sb
    .from('subscriptions')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', subscriptionId)
    .eq('user_id', userId);
  if (updErr) return Response.json({ error: updErr.message }, { status: 500 });

  return Response.json({ status: newStatus as 'active' | 'cancelled' });
}
