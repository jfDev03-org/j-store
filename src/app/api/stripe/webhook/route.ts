import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = createAdminClient()

    // 0.1 — Hard idempotency: try to claim this event ID
    // If the UPDATE affects 0 rows the event was already processed → skip safely.
    const { data: claimed } = await supabase
      .from('orders')
      .update({ stripe_event_id: event.id })
      .eq('stripe_session_id', session.id)
      .eq('status', 'pending')     // only claim if still pending (not already paid/cancelled)
      .is('stripe_event_id', null) // only claim if not already set
      .select('id, items')
      .single()

    if (!claimed) {
      // Either already processed (stripe_event_id set) or order not found
      console.log('Webhook: skipping event', event.id, '— already processed or order not found')
      return NextResponse.json({ received: true })
    }

    // Mark paid — stock was reserved at checkout creation
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string | null,
      })
      .eq('id', claimed.id)

    if (updateError) {
      console.error('Webhook: failed to mark order paid', claimed.id, updateError)
    } else {
      // 0.3 — Audit log
      await supabase.from('domain_events').insert({
        type: 'order.paid',
        payload: {
          order_id: claimed.id,
          stripe_session_id: session.id,
          stripe_event_id: event.id,
          payment_intent: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        },
      })
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = createAdminClient()

    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('stripe_session_id', session.id)
      .single()

    if (!order || order.status !== 'pending') {
      return NextResponse.json({ received: true })
    }

    // Phase 2: each item may have been reserved from a different store.
    // Read fulfillment_store_id per item from order_items instead of relying
    // on a single store_id in session metadata.
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, fulfillment_store_id')
      .eq('order_id', order.id)

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (!item.fulfillment_store_id || !item.product_id) continue
        await supabase.rpc('increment_stock', {
          p_store_id: item.fulfillment_store_id,
          p_product_id: item.product_id,
          p_qty: item.quantity,
          p_reason: 'reservation_expired',
        })
      }
    }

    await supabase
      .from('orders')
      .update({ status: 'cancelled', notes: 'Stripe checkout session expired — stock restored.' })
      .eq('id', order.id)

    // 0.3 — Audit log
    await supabase.from('domain_events').insert({
      type: 'order.expired',
      payload: { order_id: order.id, stripe_session_id: session.id, stripe_event_id: event.id },
    })
  }

  return NextResponse.json({ received: true })
}
