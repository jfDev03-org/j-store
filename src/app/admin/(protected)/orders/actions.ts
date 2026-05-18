'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'
import type { OrderRow } from '@/types/database'

const VALID_ORDER_TRANSITIONS: Record<OrderRow['status'], OrderRow['status'][]> = {
  pending:   ['paid', 'cancelled'],
  paid:      ['shipped', 'cancelled'],
  shipped:   ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export async function updateOrderStatus(id: string, status: OrderRow['status']) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !order) return { error: 'Order not found' }

  const allowed = VALID_ORDER_TRANSITIONS[order.status] ?? []
  if (!allowed.includes(status)) {
    return { error: `Cannot change status from "${order.status}" to "${status}"` }
  }

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .eq('status', order.status) // atomic: only succeeds if status hasn't changed since we read it
    .select('id')
    .single()

  if (!updated) {
    return { error: updateError?.message ?? 'Status was changed by another request — please refresh' }
  }
  revalidatePath('/admin/orders')
  return { success: true }
}
