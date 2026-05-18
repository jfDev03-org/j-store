'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils/format'
import { useCartStore } from '@/store/cart'
import { toast } from 'sonner'
import type { Product } from '@/types/database'

interface Props {
  product: Product
  categorySlug: string
}

export default function ProductDetail({ product, categorySlug }: Props) {
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem, openCart } = useCartStore()
  const images = product.images.length > 0 ? product.images : ['/placeholder.png']

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: images[0],
        slug: product.slug,
        category_slug: categorySlug,
      })
    }
    toast.success(`${quantity}× ${product.name} added to cart`, {
      action: { label: 'View cart', onClick: openCart },
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Images */}
      <div className="space-y-3">
        <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
          <Image
            src={images[activeImage]}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {images.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                onClick={() => setActiveImage((i) => (i + 1) % images.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={[
                  'relative h-16 w-16 rounded-md overflow-hidden border-2 shrink-0 transition-colors',
                  activeImage === i ? 'border-primary' : 'border-transparent',
                ].join(' ')}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-5">
        {product.brand && (
          <p className="text-sm text-muted-foreground uppercase tracking-wider">{product.brand}</p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
        {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}

        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
          {product.stock === 0 ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : product.stock < 5 ? (
            <Badge className="bg-amber-500 text-white border-0">Only {product.stock} left</Badge>
          ) : (
            <Badge variant="secondary" className="text-green-700 bg-green-50">In Stock</Badge>
          )}
        </div>

        <Separator />

        <p className="text-muted-foreground leading-relaxed">{product.description}</p>

        <Separator />

        {/* Quantity + Add to cart */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md">
            <button
              aria-label="Decrease quantity"
              className="px-3 py-2 text-lg hover:bg-muted transition-colors disabled:opacity-50"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center" aria-live="polite">
              {quantity}
            </span>
            <button
              aria-label="Increase quantity"
              className="px-3 py-2 text-lg hover:bg-muted transition-colors disabled:opacity-50"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock || product.stock === 0}
            >
              +
            </button>
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Add ${quantity} ${product.name} to cart`}
          >
            <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
            Add to Cart
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Free shipping on orders over €50. 90-day warranty on all products.
        </p>
      </div>
    </div>
  )
}
