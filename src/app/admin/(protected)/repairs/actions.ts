'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'
import type { RepairRequestRow } from '@/types/database'

const VALID_REPAIR_TRANSITIONS: Record<RepairRequestRow['status'], RepairRequestRow['status'][]> = {
  pending:     ['quoted', 'cancelled'],
  quoted:      ['approved', 'cancelled'],
  approved:    ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
}

export async function updateRepairStatus(id: string, status: RepairRequestRow['status']) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()

  const { data: repair, error: fetchError } = await supabase
    .from('repair_requests')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !repair) return { error: 'Repair request not found' }

  const allowed = VALID_REPAIR_TRANSITIONS[repair.status] ?? []
  if (!allowed.includes(status)) {
    return { error: `Cannot change status from "${repair.status}" to "${status}"` }
  }

  // Atomic update: only succeeds if status hasn't changed since we read it
  const { data: updated, error } = await supabase
    .from('repair_requests')
    .update({ status })
    .eq('id', id)
    .eq('status', repair.status)
    .select('id')
    .single()

  if (!updated) {
    return { error: error?.message ?? 'Status was changed by another request — please refresh' }
  }

  revalidatePath('/admin/repairs')
  return { success: true }
}
