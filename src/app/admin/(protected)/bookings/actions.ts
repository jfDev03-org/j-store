'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'
import type { BookingRow } from '@/types/database'

const VALID_BOOKING_TRANSITIONS: Record<BookingRow['status'], BookingRow['status'][]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export async function updateBookingStatus(id: string, status: BookingRow['status']) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !booking) return { error: 'Booking not found' }

  const allowed = VALID_BOOKING_TRANSITIONS[booking.status] ?? []
  if (!allowed.includes(status)) {
    return { error: `Cannot change status from "${booking.status}" to "${status}"` }
  }

  // Atomic update: only succeeds if status hasn't changed since we read it
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .eq('status', booking.status)
    .select('id')
    .single()

  if (!updated) {
    return { error: error?.message ?? 'Status was changed by another request — please refresh' }
  }

  revalidatePath('/admin/bookings')
  return { success: true }
}
