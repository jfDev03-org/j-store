import { createClient } from '@/lib/supabase/server'
import ShopContent from './ShopContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full range of phone accessories and components.',
}

// Revalidate at most once per hour; busted immediately by admin revalidatePath().
export const revalidate = 3600

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  const [{ data: categories }, { data: allCategories }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('categories').select('id, slug'),
  ])

  const productsQuery = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  const { data: products } = q
    ? await productsQuery.textSearch('search_vector', q, { type: 'websearch' }).limit(48)
    : await productsQuery.order('created_at', { ascending: false }).limit(48)

  const categorySlugMap = Object.fromEntries(
    (allCategories ?? []).map((c) => [c.id, c.slug])
  )

  return (
    <ShopContent
      categories={categories ?? []}
      products={products ?? []}
      categorySlugMap={categorySlugMap}
      q={q}
    />
  )
}
