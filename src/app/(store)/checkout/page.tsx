'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils/format'
import { Loader2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createTestOrder } from './actions'
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

const STRIPE_DISABLED = process.env.NEXT_PUBLIC_STRIPE_DISABLED === 'true'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const subtotal = total()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const orderTotal = subtotal + shipping

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    postal_code: '',
    country: 'PT',
  })

  function update(field: keyof typeof customer, value: string) {
    setCustomer((c) => ({ ...c, [field]: value }))
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return

    if (!customer.name || !customer.email || !customer.line1 || !customer.city || !customer.postal_code) {
      toast.error('Please fill in all required fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      toast.error('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      if (STRIPE_DISABLED) {
        const result = await createTestOrder(items, customer)
        if (result.error) throw new Error(result.error)
        clearCart()
        router.push('/checkout/success?test=1')
        return
      }

      // Send only product_id + quantity — prices are validated server-side
      const orderItems = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, customer }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Checkout failed')
      }

      window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
        <Button asChild>
          <Link href="/shop">Browse Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Checkout</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleCheckout} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-8 lg:gap-10">
          {/* Customer & Shipping form */}
          <div className="space-y-8">
            <fieldset className="space-y-4">
              <legend className="text-base font-semibold mb-2">Contact Information</legend>
              <div className="space-y-1.5">
                <Label htmlFor="co_name">Full Name <span aria-hidden="true" className="text-destructive">*</span></Label>
                <Input id="co_name" required value={customer.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" placeholder="João Silva" maxLength={100} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="co_email">Email <span aria-hidden="true" className="text-destructive">*</span></Label>
                  <Input id="co_email" type="email" required value={customer.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" placeholder="your@email.com" maxLength={254} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="co_phone">Phone</Label>
                  <Input id="co_phone" type="tel" value={customer.phone} onChange={(e) => update('phone', e.target.value)} autoComplete="tel" placeholder="+351 000 000 000" maxLength={30} />
                </div>
              </div>
            </fieldset>

            <Separator />

            <fieldset className="space-y-4">
              <legend className="text-base font-semibold mb-2">Shipping Address</legend>
              <div className="space-y-1.5">
                <Label htmlFor="co_line1">Address Line 1 <span aria-hidden="true" className="text-destructive">*</span></Label>
                <Input id="co_line1" required value={customer.line1} onChange={(e) => update('line1', e.target.value)} autoComplete="address-line1" placeholder="Rua Example, 123" maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co_line2">Address Line 2</Label>
                <Input id="co_line2" value={customer.line2} onChange={(e) => update('line2', e.target.value)} autoComplete="address-line2" placeholder="Apartment, floor, etc." maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="co_city">City <span aria-hidden="true" className="text-destructive">*</span></Label>
                  <Input id="co_city" required value={customer.city} onChange={(e) => update('city', e.target.value)} autoComplete="address-level2" placeholder="Lisboa" maxLength={100} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="co_postal">Postal Code <span aria-hidden="true" className="text-destructive">*</span></Label>
                  <Input id="co_postal" required value={customer.postal_code} onChange={(e) => update('postal_code', e.target.value)} autoComplete="postal-code" placeholder="1000-001" maxLength={20} />
                </div>
              </div>
            </fieldset>
          </div>

          {/* Order summary */}
          <Card className="h-fit sticky top-4">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-base">Order Summary</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-3 items-center">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-muted-foreground">
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {loading
                  ? STRIPE_DISABLED ? 'Placing order…' : 'Redirecting to payment…'
                  : STRIPE_DISABLED ? 'Place Test Order (dev)' : 'Pay with Stripe'}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/shop">← Continue Shopping</Link>
              </Button>

              {STRIPE_DISABLED ? (
                <p className="text-xs text-center text-amber-600 font-medium">
                  ⚠ Stripe is disabled — orders are saved directly for testing.
                </p>
              ) : (
                <p className="text-xs text-center text-muted-foreground">
                  Secure payment via Stripe. Your card details are never stored.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
