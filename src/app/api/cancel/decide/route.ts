// server-only
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { verifyCsrf } from '../../csrf/server'

const DecideBody = z.object({
  subscriptionId: z.string().uuid(),
  accepted: z.boolean(),
  reason: z.string().trim().max(500).optional(),
});

// tiny sanitizer: normalize, drop control chars, cap length
const sanitize = (s: string) =>
  s.normalize('NFKC').replace(/\p{C}/gu, '').slice(0, 500);

export async function POST(req: Request) {
  // CSRF check
  try { await verifyCsrf(); } catch { return new Response('CSRF failed', { status: 403 }); }

  const parsed = DecideBody.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { subscriptionId, accepted } = parsed.data;
  const reason = parsed.data.reason ? sanitize(parsed.data.reason) : undefined;

  const sb = supabaseAdmin;
  const userId = process.env.MOCK_USER_ID!;

  // Ensure the subscription exists and belongs to the user
  const { data: sub, error: subErr } = await sb
    .from('subscriptions')
    .select('id, user_id, monthly_price, status')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .maybeSingle();
  if (subErr) return Response.json({ error: subErr.message }, { status: 500 });
  if (!sub)   return new Response('Subscription not found', { status: 404 });

  // Ensure/record a cancellation row
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
        downsell_variant: 'A', // don’t randomize here, per your requirement
        reason: reason ?? null,
        accepted_downsell: false,
      })
      .select('id')
      .single();
    if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
    cancelId = ins!.id;
  } else {
    const { error: updCanErr } = await sb
      .from('cancellations')
      .update({
        reason: reason ?? null,
        accepted_downsell: !!accepted,
      })
      .eq('id', cancelId);
    if (updCanErr) return Response.json({ error: updCanErr.message }, { status: 500 });
  }

  // Build the subscription update
  const updates: Record<string, unknown> = {
    status: accepted ? 'active' : 'cancelled',
    updated_at: new Date().toISOString(),
  };

  // If they accepted the downsell, set price to offer (current - $10)
  if (accepted) {
    const current = sub.monthly_price ?? 0;
    updates.monthly_price = Math.max(0, current - 1000);
  }

  const { error: updErr } = await sb
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .eq('user_id', userId);

  if (updErr) return Response.json({ error: updErr.message }, { status: 500 });

  // Don’t echo user-provided text back 
  return Response.json({ status: updates.status as 'active' | 'cancelled' });
}
