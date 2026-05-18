import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { toCents } from '@/lib/utils/format'
import { createAdminClient } from '@/lib/supabase/server'
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customer } = body as {
      items: Array<{ product_id: string; quantity: number }>
      customer: {
        name: string
        email: string
        phone?: string
        line1: string
        line2?: string
        city: string
        postal_code: string
        country: string
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const productIds = items.map((i) => i.product_id)

    // Validate product data from DB — never trust client-supplied prices
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, price, images')
      .in('id', productIds)
      .eq('is_active', true)

    if (dbError || !dbProducts || dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // ── Phase 2: assign fulfillment store per item ────────────────
    // assign_fulfillment_store() picks the active store with the
    // most stock that can satisfy the requested quantity.
    const storeAssignments = new Map<string, string>() // product_id → store_id

    for (const item of items) {
      const { data: storeId, error: assignErr } = await supabase.rpc(
        'assign_fulfillment_store',
        { p_product_id: item.product_id, p_qty: item.quantity }
      )
      if (assignErr || !storeId) {
        const p = productMap.get(item.product_id)
        return NextResponse.json(
          { error: `"${p?.name ?? item.product_id}" is out of stock` },
          { status: 400 }
        )
      }
      storeAssignments.set(item.product_id, storeId as string)
    }
    // ─────────────────────────────────────────────────────────────

    const subtotal = items.reduce((sum, item) => {
      const p = productMap.get(item.product_id)!
      return sum + p.price * item.quantity
    }, 0)
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST

    const lineItems = items.map((item) => {
      const p = productMap.get(item.product_id)!
      const image = p.images?.[0]
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: p.name,
            images: image?.startsWith('http') ? [image] : [],
          },
          unit_amount: toCents(p.price),
        },
        quantity: item.quantity,
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      shipping_options:
        shipping > 0
          ? [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: { amount: toCents(shipping), currency: 'eur' },
                  display_name: 'Standard Shipping',
                  delivery_estimate: {
                    minimum: { unit: 'business_day', value: 2 },
                    maximum: { unit: 'business_day', value: 5 },
                  },
                },
              },
            ]
          : [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: { amount: 0, currency: 'eur' },
                  display_name: 'Free Shipping',
                },
              },
            ],
      customer_email: customer.email,
      metadata: {
        customer_name: customer.name,
        customer_phone: customer.phone ?? '',
        shipping_line1: customer.line1,
        shipping_line2: customer.line2 ?? '',
        shipping_city: customer.city,
        shipping_postal_code: customer.postal_code,
        shipping_country: customer.country,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
    })

    // Reserve stock atomically — one store per item as assigned above.
    // decrement_stock_safe raises an exception if stock is insufficient
    // (covers the race window between assign and decrement).
    const reserved: Array<{ product_id: string; store_id: string; qty: number }> = []

    for (const item of items) {
      const assignedStoreId = storeAssignments.get(item.product_id)!
      const { error: reserveErr } = await supabase.rpc('decrement_stock_safe', {
        p_store_id: assignedStoreId,
        p_product_id: item.product_id,
        p_qty: item.quantity,
      })
      if (reserveErr) {
        // Roll back already-reserved items
        for (const r of reserved) {
          await supabase.rpc('increment_stock', {
            p_store_id: r.store_id,
            p_product_id: r.product_id,
            p_qty: r.qty,
            p_reason: 'reservation_rollback',
          })
        }
        await stripe.checkout.sessions.expire(session.id).catch(() => {})
        const p = productMap.get(item.product_id)
        return NextResponse.json(
          { error: `Sorry, "${p?.name ?? item.product_id}" just sold out. Please update your cart.` },
          { status: 409 }
        )
      }
      reserved.push({ product_id: item.product_id, store_id: assignedStoreId, qty: item.quantity })
    }

    // Pre-create a pending order — webhook only marks it paid.
    const orderItems = items.map((item) => {
      const p = productMap.get(item.product_id)!
      return {
        product_id: item.product_id,
        product_name: p.name,
        price: p.price,
        quantity: item.quantity,
        product_image: p.images?.[0] ?? '',
      }
    })

    const { data: newOrder, error: orderInsertError } = await supabase.from('orders').insert({
      items: orderItems,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: 'pending',
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone ?? null,
      shipping_address: {
        line1: customer.line1,
        line2: customer.line2 || undefined,
        city: customer.city,
        postal_code: customer.postal_code,
        country: customer.country,
      },
      stripe_session_id: session.id,
    }).select('id').single()

    if (orderInsertError || !newOrder) {
      console.error('Failed to create pending order for session', session.id, orderInsertError)
    } else {
      // 0.2 — Normalised order_items with fulfillment_store_id (Phase 2)
      await supabase.from('order_items').insert(
        orderItems.map((item) => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          unit_price: item.price,
          quantity: item.quantity,
          product_image: item.product_image,
          fulfillment_store_id: storeAssignments.get(item.product_id) ?? null,
        }))
      )

      // 0.3 — Audit log
      await supabase.from('domain_events').insert({
        type: 'order.created',
        payload: {
          order_id: newOrder.id,
          stripe_session_id: session.id,
          customer_email: customer.email,
          total: subtotal + shipping,
          item_count: items.length,
          fulfillment_stores: Object.fromEntries(storeAssignments),
        },
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
