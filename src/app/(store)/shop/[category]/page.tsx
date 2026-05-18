import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('name').eq('slug', category).single()
  return {
    title: data ? `${data.name} — Shop` : 'Category',
    description: `Browse ${data?.name ?? category} products at JStore.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const supabase = await createClient()

  const { data: categoryData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', category)
    .single()

  if (!categoryData) notFound()

  const { data: categoryProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('category_id', categoryData.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/shop" className="hover:text-foreground">Shop</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{categoryData.name}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{categoryData.name}</h1>
      {categoryData.description && (
        <p className="text-muted-foreground mb-8">{categoryData.description}</p>
      )}

      {!categoryProducts || categoryProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No products in this category yet.</p>
          <Link href="/shop" className="text-primary underline mt-2 inline-block">Back to shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} categorySlug={category} />
          ))}
        </div>
      )}
    </div>
  )
}
