import { createClient } from '@/lib/supabase/server'
import RepairsContent from './RepairsContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Repair Services',
  description: 'Professional phone repair services — screen, battery, charging port, water damage and more.',
}

export default async function RepairsPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('repair_services')
    .select('*')
    .eq('is_active', true)
    .order('price_from')

  return <RepairsContent services={services ?? []} />
}
