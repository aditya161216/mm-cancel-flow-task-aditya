// server-only
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  const sb = supabaseAdmin;
  const userId = process.env.MOCK_USER_ID!;

  // Find active or pending subscription
  const { data: sub, error: subErr } = await sb
    .from('subscriptions')
    .select('id, monthly_price, status')
    .eq('user_id', userId)
    .in('status', ['active', 'pending_cancellation'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subErr) return Response.json({ error: subErr.message }, { status: 500 });
  if (!sub) return new Response('No subscription', { status: 404 });

  // Mark as pending (idempotent)
  await sb
    .from('subscriptions')
    .update({ status: 'pending_cancellation', updated_at: new Date().toISOString() })
    .eq('id', sub.id)
    .eq('user_id', userId);

  // Look up an existing cancellation (if the user has been here before),
  // but DO NOT create/assign anything yet.
  const { data: last } = await sb
    .from('cancellations')
    .select('downsell_variant')
    .eq('subscription_id', sub.id)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // variant can be null here (not assigned yet)
  return Response.json({
    subscriptionId: sub.id,
    priceCents: sub.monthly_price,
    variant: (last?.downsell_variant as 'A' | 'B') ?? null,
  });
}
