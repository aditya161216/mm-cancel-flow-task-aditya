// server-only
import { randomInt } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const sb = supabaseAdmin;
  const userId = process.env.MOCK_USER_ID!;
  const { subscriptionId } = (await req.json()) as { subscriptionId: string };

  // Get subscription for price
  const { data: sub, error: subErr } = await sb
    .from('subscriptions')
    .select('id, monthly_price')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .maybeSingle();
  if (subErr) return Response.json({ error: subErr.message }, { status: 500 });
  if (!sub) return new Response('Subscription not found', { status: 404 });

  // Reuse if exists
  const { data: last } = await sb
    .from('cancellations')
    .select('id, downsell_variant')
    .eq('subscription_id', subscriptionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let variant: 'A' | 'B' | null = (last?.downsell_variant as 'A' | 'B') ?? null;

  // Assign only if none exists yet
  if (!variant) {
    variant = randomInt(0, 2) === 0 ? 'A' : 'B';
    const { error: insErr } = await sb.from('cancellations').insert({
      user_id: userId,
      subscription_id: subscriptionId,
      downsell_variant: variant,
    });
    if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
  }

  const offerCents = variant === 'B' ? Math.max(0, sub.monthly_price - 1000) : sub.monthly_price;

  return Response.json({
    variant,
    priceCents: sub.monthly_price,
    offerCents,
  });
}
