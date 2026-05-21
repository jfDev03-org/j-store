import { createClient } from '@/lib/supabase/server'
import HomeContent from './HomeContent'

export const metadata = {
  title: 'JStore — Phone Repair & Accessories',
  description:
    'Professional mobile phone repairs and a wide selection of accessories and components. Fast, reliable, affordable.',
}

// Revalidate at most once per hour. Admin actions use revalidatePath() to bust
// this cache immediately when products or categories change.
export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: categories }, { data: latestProducts }] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
  ])
  const categorySlugMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.slug]))

  return (
    <HomeContent
      categories={categories ?? []}
      latestProducts={latestProducts ?? []}
      categorySlugMap={categorySlugMap}
    />
  )
}
