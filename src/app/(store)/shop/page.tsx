import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'
import type { Category } from '@/types/database'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full range of phone accessories and components.',
}

export default async function ShopPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: featuredProducts }, { data: allCategories }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase.from('categories').select('id, slug'),
  ])

  // Build a category slug map for products
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

      <h1 className="text-3xl font-bold mb-1">Shop</h1>
      <p className="text-muted-foreground mb-8">Accessories, cases, chargers, components and more.</p>

      {/* Category filter */}
      {categories && categories.length > 0 && (
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

      {/* Products grid */}
      {!featuredProducts || featuredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No products available yet. Check back soon!</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          aria-label="Product grid"
        >
          {featuredProducts.map((product) => {
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
