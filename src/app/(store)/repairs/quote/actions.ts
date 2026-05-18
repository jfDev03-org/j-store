'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { EMAIL_REGEX } from '@/lib/utils/format'

type QuoteData = {
  device_brand: string
  device_model: string
  issue_description: string
  customer_name: string
  customer_email: string
  customer_phone: string
}

export async function submitQuote(data: QuoteData) {
  const supabase = createAdminClient()

  const normalizedEmail = data.customer_email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { error: 'Please enter a valid email address.', success: false as const }
  }

  // Rate limiting: max 3 quote requests per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('repair_requests')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', normalizedEmail)
    .gte('created_at', oneHourAgo)

  if (count !== null && count >= 3) {
    return { error: 'Too many requests submitted recently. Please wait before trying again.', success: false as const }
  }

  const { error } = await supabase.from('repair_requests').insert({
    device_brand: data.device_brand.trim(),
    device_model: data.device_model.trim(),
    issue_description: data.issue_description.trim(),
    customer_name: data.customer_name.trim(),
    customer_email: normalizedEmail,
    customer_phone: data.customer_phone.trim(),
    status: 'pending',
  })

  if (error) return { error: error.message, success: false as const }
  return { success: true as const }
}
