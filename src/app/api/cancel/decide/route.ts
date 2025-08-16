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

  const updates: Record<string, unknown> = {
    status: accepted ? 'active' : 'cancelled',
    updated_at: new Date().toISOString(),
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

  // if they accepted the downsell, set price to the offer price (current - $10)
  if (accepted) {
    const { data: sub, error: subErr } = await sb
      .from('subscriptions')
      .select('monthly_price')            // <-- make sure this is the correct column
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subErr) return Response.json({ error: subErr.message }, { status: 500 });

    const current = sub?.monthly_price ?? 0; // assumes cents
    const offer = Math.max(0, current - 1000); // $10 off
    updates.monthly_price = offer;             // <-- write to the SAME column
    // If your column is actually `price_cents`, change both lines accordingly.
  }

  const { error: updErr } = await sb
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .eq('user_id', userId);

  if (updErr) return Response.json({ error: updErr.message }, { status: 500 });

  return Response.json({ status: updates.status as 'active' | 'cancelled' });
}
