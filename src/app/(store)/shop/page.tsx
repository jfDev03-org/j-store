import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import SearchBar from '@/components/shop/SearchBar'
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

  // If a search query is provided, use full-text search via the generated tsvector column.
  // Otherwise fall back to the latest 48 products.
  const productsQuery = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  const { data: products } = q
    ? await productsQuery.textSearch('search_vector', q, { type: 'websearch' }).limit(48)
    : await productsQuery.order('created_at', { ascending: false }).limit(48)

  const categorySlugMap = new Map<string, string>(
    (allCategories ?? []).map((c) => [c.id, c.slug])
  )

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Shop</li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Shop</h1>
          <p className="text-muted-foreground">Accessories, cases, chargers, components and more.</p>
        </div>
        {/* SearchBar uses useSearchParams — must be wrapped in Suspense */}
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Category filter — hidden when searching to avoid confusion */}
      {!q && categories && categories.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Browse by category</p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Filter by category">
            <Link href="/shop" role="listitem">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap">
                All
              </span>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/shop/${cat.slug}`} role="listitem">
                <span className="inline-flex items-center px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search results label */}
      {q && (
        <p className="text-sm text-muted-foreground mb-6">
          {products && products.length > 0
            ? `${products.length} result${products.length === 1 ? '' : 's'} for "${q}"`
            : `No results for "${q}"`}
        </p>
      )}

      {/* Products grid */}
      {!products || products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {q ? (
            <>
              <p className="text-lg">No products found for &ldquo;{q}&rdquo;</p>
              <Link href="/shop" className="text-primary underline mt-2 inline-block text-sm">
                Clear search
              </Link>
            </>
          ) : (
            <p className="text-lg">No products available yet. Check back soon!</p>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          aria-label="Product grid"
        >
          {products.map((product) => {
            const slug = product.category_id
              ? (categorySlugMap.get(product.category_id) ?? 'uncategorised')
              : 'uncategorised'
            return (
              <ProductCard
                key={product.id}
                product={product}
                categorySlug={slug}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
