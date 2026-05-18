'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'
import { getDefaultStoreId } from '@/lib/store'

const VALID_REASONS = ['adjustment', 'damaged', 'returned', 'inventory_count', 'other'] as const
type StockReason = typeof VALID_REASONS[number]

export async function adjustStock(productId: string, delta: number, reason: string) {
  const authError = await guardAdmin()
  if (authError) return authError

  if (delta === 0) return { error: 'Delta cannot be zero' }
  if (!VALID_REASONS.includes(reason as StockReason)) return { error: 'Invalid reason' }

  const supabase = createAdminClient()
  const storeId = await getDefaultStoreId()

  if (delta > 0) {
    const { error } = await supabase.rpc('increment_stock', {
      p_store_id: storeId,
      p_product_id: productId,
      p_qty: delta,
      p_reason: reason,
    })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.rpc('decrement_stock_safe', {
      p_store_id: storeId,
      p_product_id: productId,
      p_qty: Math.abs(delta),
    })
    if (error) {
      if (error.message.includes('insufficient_stock')) return { error: 'Insufficient stock for this adjustment' }
      return { error: error.message }
    }
  }

  revalidatePath('/admin/stock')
  return { success: true }
}

export async function initializeStock(
  storeId: string,
  productId: string,
  quantity: number,
  minQuantity: number,
) {
  const authError = await guardAdmin()
  if (authError) return authError

  if (quantity < 0) return { error: 'A quantidade não pode ser negativa' }
  if (minQuantity < 0) return { error: 'O mínimo não pode ser negativo' }
  if (!storeId) return { error: 'Seleciona uma loja' }
  if (!productId) return { error: 'Seleciona um produto' }

  const supabase = createAdminClient()

  // Insert the store_stock row — fail if already exists
  const { error: insertError } = await supabase
    .from('store_stock')
    .insert({ store_id: storeId, product_id: productId, quantity, min_quantity: minQuantity })

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'Este produto já tem stock nesta loja. Usa o ajuste para modificar a quantidade.' }
    }
    return { error: insertError.message }
  }

  // Record the initial quantity in the audit trail (if qty > 0)
  if (quantity > 0) {
    await supabase.from('stock_movements').insert({
      store_id: storeId,
      product_id: productId,
      delta: quantity,
      reason: 'adjustment',
    })
  }

  revalidatePath('/admin/stock')
  return { success: true }
}
