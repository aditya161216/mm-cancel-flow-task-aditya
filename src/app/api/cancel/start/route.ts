// server-only
import { supabaseAdmin } from '@/lib/supabase';
import { verifyCsrf } from '../../csrf/server'

export async function POST() {
  // CSRF check
  try { await verifyCsrf(); } catch { return new Response('CSRF failed', { status: 403 }); }

  const sb = supabaseAdmin;
  const userId = process.env.MOCK_USER_ID!;

  // Find latest active/pending sub
  const { data: sub, error: subErr } = await sb
    .from('subscriptions')
    .select('id, monthly_price, status')
    .eq('user_id', userId)
    .in('status', ['active', 'pending_cancellation'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subErr) return Response.json({ error: subErr.message }, { status: 500 });
  if (!sub)   return new Response('No subscription', { status: 404 });

  // Idempotently mark as pending
  if (sub.status !== 'pending_cancellation') {
    const { error: pendingErr } = await sb
      .from('subscriptions')
      .update({ status: 'pending_cancellation', updated_at: new Date().toISOString() })
      .eq('id', sub.id)
      .eq('user_id', userId);
    if (pendingErr) return Response.json({ error: pendingErr.message }, { status: 500 });
  }

  // If they visited before, we can show the same variant
  const { data: last, error: lastErr } = await sb
    .from('cancellations')
    .select('downsell_variant')
    .eq('subscription_id', sub.id)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastErr) return Response.json({ error: lastErr.message }, { status: 500 });

  return Response.json({
    subscriptionId: sub.id,
    priceCents: sub.monthly_price,
    variant: (last?.downsell_variant as 'A' | 'B') ?? null,
  });
}
