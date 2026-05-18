import { createAdminClient } from './supabase/server'

const TTL_MS = 5 * 60 * 1000 // 5 minutes

let cache: { id: string; expiresAt: number } | null = null

/**
 * Returns the ID of the default (first active) store.
 * Result is cached for 5 minutes to avoid repeated DB round-trips while
 * still picking up store changes (e.g. deactivation) within a reasonable window.
 */
export async function getDefaultStoreId(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) return cache.id

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    throw new Error('No active store found. Run migration 006_phase1.sql first.')
  }

  cache = { id: data.id, expiresAt: Date.now() + TTL_MS }
  return cache.id
}
