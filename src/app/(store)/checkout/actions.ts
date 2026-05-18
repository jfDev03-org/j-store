'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import type { CartItem } from '@/types/cart'

type CustomerData = {
  name: string
  email: string
  phone: string
  line1: string
  line2?: string
  city: string
  postal_code: string
  country: string
}

export async function createTestOrder(items: CartItem[], customer: CustomerData) {
  const supabase = createAdminClient()

  // Validate prices from DB — never trust client-supplied prices
  const productIds = items.map((i) => i.product_id)
  const { data: dbProducts, error: dbError } = await supabase
    .from('products')
    .select('id, name, price, stock, images')
    .in('id', productIds)
    .eq('is_active', true)

  if (dbError || !dbProducts || dbProducts.length !== productIds.length) {
    return { error: 'One or more products are unavailable' }
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))

  // Check stock before inserting
  for (const item of items) {
    const p = productMap.get(item.product_id)
    if (!p || p.stock < item.quantity) {
      return { error: `"${item.name}" is out of stock` }
    }
  }

  const subtotal = items.reduce((sum, i) => {
    const p = productMap.get(i.product_id)!
    return sum + p.price * i.quantity
  }, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST

  const orderItems = items.map((i) => {
    const p = productMap.get(i.product_id)!
    return {
      product_id: i.product_id,
      product_name: p.name,
      product_image: p.images?.[0] ?? '',
      price: p.price,
      quantity: i.quantity,
    }
  })

  const { error } = await supabase.from('orders').insert({
    items: orderItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: 'pending',
    customer_name: customer.name,
    customer_email: customer.email,
    customer_phone: customer.phone || null,
    shipping_address: {
      line1: customer.line1,
      line2: customer.line2 || undefined,
      city: customer.city,
      postal_code: customer.postal_code,
      country: customer.country,
    },
    stripe_session_id: null,
    stripe_payment_intent_id: null,
  })

  if (error) return { error: error.message }

  // Decrement stock atomically for each purchased item
  for (const item of items) {
    const { error: stockError } = await supabase.rpc(
      'decrement_stock_safe',
      { p_product_id: item.product_id, p_qty: item.quantity }
    )
    if (stockError) {
      console.error('createTestOrder: stock decrement failed for product', item.product_id, stockError)
    }
  }

  return { success: true }
}
