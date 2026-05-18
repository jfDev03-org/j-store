import { createClient } from '@/lib/supabase/server'

/**
 * Verify the current request is from an authenticated admin.
 * Call at the top of every admin Server Action.
 * Returns an error object to propagate immediately if unauthorized, or null if OK.
 */
export async function guardAdmin(): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const isAdmin = user.app_metadata?.role === 'admin'
  if (!isAdmin) return { error: 'Unauthorized' }

  return null
}
