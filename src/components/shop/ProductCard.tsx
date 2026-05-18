'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Check } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types/database'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  categorySlug: string
}

const NEW_PRODUCT_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000

export default function ProductCard({ product, categorySlug }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const isNew = Date.now() - new Date(product.created_at).getTime() < NEW_PRODUCT_THRESHOLD_MS
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '/placeholder.png',
      slug: product.slug,
      category_slug: categorySlug,
    })
    toast.success(`${product.name} added to cart`, {
      action: { label: 'View cart', onClick: openCart },
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Card className="group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 border border-border hover:border-primary/20">
      <Link
        href={`/shop/${categorySlug}/${product.slug}`}
        className="relative block aspect-square bg-muted overflow-hidden"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={product.images[0] ?? '/placeholder.png'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
        {isNew && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
            NEW
          </span>
        )}
        {!isNew && product.stock > 0 && product.stock < 5 && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-0 text-xs">
            Only {product.stock} left
          </Badge>
        )}
      </Link>

      <CardContent className="flex-1 p-4 space-y-1">
        {product.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>
        )}
        <Link
          href={`/shop/${categorySlug}/${product.slug}`}
          className="font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        <p className="font-bold text-amber-600">{formatPrice(product.price)}</p>
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || added}
          aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          className={[
            'shrink-0 transition-colors',
            added ? 'bg-green-600 hover:bg-green-600' : 'bg-primary hover:bg-primary/90',
          ].join(' ')}
        >
          {added ? (
            <Check className="h-4 w-4 mr-1.5" aria-hidden="true" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-1.5" aria-hidden="true" />
          )}
          {added ? 'Added!' : 'Add'}
        </Button>
      </CardFooter>
    </Card>
  )
}
