/** Format a number as currency (GBP/EUR – change locale/currency as needed) */
export function formatPrice(amount: number, currency = 'EUR'): string {
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Convert cents (Stripe) to decimal */
export function fromCents(cents: number): number {
  return cents / 100
}

/** Convert decimal to cents (Stripe). Uses EPSILON to avoid floating-point precision errors (e.g. 1.015 * 100). */
export function toCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100)
}

/** Build a Supabase public image URL */
export function getImageUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

/** Truncate a string to a max length */
export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/** Basic e-mail format check */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
