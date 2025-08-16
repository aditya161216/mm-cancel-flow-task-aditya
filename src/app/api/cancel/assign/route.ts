// server-only
import { randomInt } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { verifyCsrf } from '../../csrf/server'

const AssignBody = z.object({
  subscriptionId: z.string().uuid(),
});

export async function POST(req: Request) {
  // // CSRF check
  try { await verifyCsrf(); } catch { return new Response('CSRF failed', { status: 403 }); }

  const parsed = AssignBody.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }
  const { subscriptionId } = parsed.data;

  const sb = supabaseAdmin;
  const userId = process.env.MOCK_USER_ID!;

  // Ownership + existence
  const { data: sub, error: subErr } = await sb
    .from('subscriptions')
    .select('id, monthly_price, user_id, status')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (subErr)   return Response.json({ error: subErr.message }, { status: 500 });
  if (!sub)     return new Response('Subscription not found', { status: 404 });
  if (sub.status === 'cancelled') {
    return new Response('Subscription already cancelled', { status: 409 });
  }

  // If the user already has a cancellation row, reuse the variant
  const { data: last, error: lastErr } = await sb
    .from('cancellations')
    .select('id, downsell_variant')
    .eq('subscription_id', subscriptionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastErr) return Response.json({ error: lastErr.message }, { status: 500 });

  let variant: 'A' | 'B' | null = (last?.downsell_variant as 'A' | 'B') ?? null;

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
