'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'

export async function transferStock(
  fromStoreId: string,
  toStoreId: string,
  productId: string,
  qty: number
) {
  const authError = await guardAdmin()
  if (authError) return authError

  if (qty <= 0) return { error: 'A quantidade deve ser maior que zero' }
  if (!fromStoreId) return { error: 'Seleciona a loja de origem' }
  if (!toStoreId) return { error: 'Seleciona a loja de destino' }
  if (!productId) return { error: 'Seleciona um produto' }
  if (fromStoreId === toStoreId) return { error: 'A loja de origem e destino não podem ser iguais' }

  const supabase = createAdminClient()

  const { error } = await supabase.rpc('transfer_stock', {
    p_from_store_id: fromStoreId,
    p_to_store_id: toStoreId,
    p_product_id: productId,
    p_qty: qty,
  })

  if (error) {
    if (error.message.includes('insufficient_stock')) return { error: 'Stock insuficiente na loja de origem' }
    if (error.message.includes('same_store')) return { error: 'A loja de origem e destino não podem ser iguais' }
    return { error: error.message }
  }

  revalidatePath('/admin/stock')
  revalidatePath('/admin/stock/transfers')
  return { success: true }
}
