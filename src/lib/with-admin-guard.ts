import { guardAdmin } from './admin-guard'

type ActionResult = { error: string } | { success: true } | Record<string, unknown>

/**
 * Wraps a Server Action with an admin auth check.
 * The wrapped function returns { error: 'Unauthorized' } immediately if the caller
 * is not an authenticated admin — no need to call guardAdmin() manually inside.
 */
export function withAdminGuard<TArgs extends unknown[], TReturn extends ActionResult>(
  action: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn | { error: string }> {
  return async (...args: TArgs) => {
    const authError = await guardAdmin()
    if (authError) return authError
    return action(...args)
  }
}
