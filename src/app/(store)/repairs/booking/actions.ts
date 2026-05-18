'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { EMAIL_REGEX } from '@/lib/utils/format'

type BookingData = {
  scheduled_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  device_info?: string
  notes?: string
}

export async function submitBooking(data: BookingData) {
  const supabase = createAdminClient()

  const normalizedEmail = data.customer_email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { error: 'Please enter a valid email address.', success: false as const }
  }

  // Rate limiting: max 3 bookings per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', normalizedEmail)
    .gte('created_at', oneHourAgo)

  if (recentCount !== null && recentCount >= 3) {
    return { error: 'Too many bookings submitted recently. Please wait before trying again.', success: false as const }
  }

  // Check slot availability (exclude cancelled bookings)
  const { count: slotCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('scheduled_at', data.scheduled_at)
    .neq('status', 'cancelled')

  if ((slotCount ?? 0) >= 1) {
    return { error: 'This time slot is no longer available. Please choose another.', success: false as const }
  }

  const { error } = await supabase.from('bookings').insert({
    scheduled_at: data.scheduled_at,
    customer_name: data.customer_name.trim(),
    customer_email: normalizedEmail,
    customer_phone: data.customer_phone.trim(),
    device_info: data.device_info?.trim() || null,
    notes: data.notes?.trim() || null,
    status: 'pending',
  })

  if (error) return { error: error.message, success: false as const }
  return { success: true as const }
}
