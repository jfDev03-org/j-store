import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetail from '@/components/shop/ProductDetail'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single()
  return {
    title: data?.name ?? 'Product',
    description: data?.description?.slice(0, 160),
  }
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-8">
        <ol className="flex items-center gap-2 flex-wrap">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/shop" className="hover:text-foreground">Shop</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/shop/${category}`} className="hover:text-foreground capitalize">{category}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <ProductDetail product={product} categorySlug={category} />
    </div>
  )
}
