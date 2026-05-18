'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'
import { getDefaultStoreId } from '@/lib/store'

export type PurchaseLineItem = {
  product_id: string
  quantity_ordered: number
  unit_cost: number
}

export async function createPurchase(supplier: string, notes: string, items: PurchaseLineItem[]) {
  const authError = await guardAdmin()
  if (authError) return authError

  if (!supplier.trim()) return { error: 'O nome do fornecedor é obrigatório' }
  if (items.length === 0) return { error: 'É necessário pelo menos um artigo' }

  const supabase = createAdminClient()

  const { data: purchase, error: purchaseErr } = await supabase
    .from('purchases')
    .insert({ supplier: supplier.trim(), status: 'pending' as const, notes: notes.trim() || null })
    .select('id')
    .single()

  if (purchaseErr || !purchase) return { error: purchaseErr?.message ?? 'Erro ao criar a compra' }

  const { error: itemsErr } = await supabase.from('purchase_items').insert(
    items.map((i) => ({ ...i, purchase_id: purchase.id, quantity_received: 0 }))
  )
  if (itemsErr) {
    // Rollback: delete the orphaned header row so we don't leave partial data
    await supabase.from('purchases').delete().eq('id', purchase.id)
    return { error: itemsErr.message }
  }

  revalidatePath('/admin/purchases')
  return { success: true, id: purchase.id }
}

export async function receivePurchase(purchaseId: string) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()
  const storeId = await getDefaultStoreId()

  const { error } = await supabase.rpc('receive_purchase', {
    p_purchase_id: purchaseId,
    p_store_id: storeId,
  })

  if (error) {
    if (error.message.includes('purchase_not_pending')) return { error: 'Esta compra já foi recebida ou cancelada' }
    return { error: error.message }
  }

  revalidatePath('/admin/purchases')
  revalidatePath('/admin/stock')
  return { success: true }
}

export async function cancelPurchase(purchaseId: string) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('purchases')
    .update({ status: 'cancelled' })
    .eq('id', purchaseId)
    .eq('status', 'pending')
    .select('id')
    .single()

  if (error || !data) return { error: 'Compra não encontrada ou já finalizada' }
  revalidatePath('/admin/purchases')
  return { success: true }
}
