'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import ProductCard from '@/components/shop/ProductCard'
import SearchBar from '@/components/shop/SearchBar'
import { useTranslations } from '@/lib/i18n'
import type { Product } from '@/types/database'

type Category = {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  image_url: string | null
  created_at: string
}

interface ShopContentProps {
  categories: Category[] | null
  products: Product[]
  categorySlugMap: Record<string, string>
  q: string | undefined
}

export default function ShopContent({ categories, products, categorySlugMap, q }: ShopContentProps) {
  const t = useTranslations()

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">{t.shop.breadcrumbHome}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{t.shop.breadcrumbShop}</li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">{t.shop.title}</h1>
          <p className="text-muted-foreground">{t.shop.subtitle}</p>
        </div>
        {/* SearchBar uses useSearchParams — must be wrapped in Suspense */}
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Category filter — hidden when searching to avoid confusion */}
      {!q && categories && categories.length > 0 && (
        <div className="mb-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t.shop.browseByCat}</p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Filter by category">
            <Link href="/shop" role="listitem">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap">
                {t.shop.allCategory}
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
            ? `${products.length} ${products.length === 1 ? t.shop.resultSuffix : t.shop.resultsSuffix} ${t.shop.resultFor} "${q}"`
            : `${t.shop.noResults} "${q}"`}
        </p>
      )}

      {/* Products grid */}
      {!products || products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {q ? (
            <>
              <p className="text-lg">{t.shop.noResults} &ldquo;{q}&rdquo;</p>
              <Link href="/shop" className="text-primary underline mt-2 inline-block text-sm">
                {t.shop.clearSearch}
              </Link>
            </>
          ) : (
            <p className="text-lg">{t.shop.noProducts}</p>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          aria-label="Product grid"
        >
          {products.map((product) => {
            const slug = product.category_id
              ? (categorySlugMap[product.category_id] ?? 'uncategorised')
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
