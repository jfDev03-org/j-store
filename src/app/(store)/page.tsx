import Link from 'next/link'
import type { ElementType } from 'react'
import { ArrowRight, Wrench, Shield, Truck, Lock, Smartphone, Zap, Package, Battery } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'

const trustItems = [
  { icon: Truck, title: 'Next-Day Delivery', subtitle: 'Order before 19:00' },
  { icon: Wrench, title: 'Expert Technicians', subtitle: 'Certified & experienced' },
  { icon: Shield, title: '90-Day Warranty', subtitle: 'Parts & labour covered' },
  { icon: Lock, title: 'Secure Checkout', subtitle: 'SSL encrypted payments' },
]

const categoryIconMap: Record<string, ElementType> = {
  screens: Smartphone,
  batteries: Battery,
  chargers: Zap,
  cases: Package,
  components: Wrench,
  accessories: Smartphone,
}

const services = [
  {
    icon: Smartphone,
    title: 'Screen Replacement',
    description: 'Cracked or broken screen? We replace all major brands with original or quality parts.',
    from: '€49',
    time: 'Same day',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Zap,
    title: 'Battery Replacement',
    description: 'Restore battery life on any phone model. Quick and affordable.',
    from: '€29',
    time: '1–2 hours',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    icon: Wrench,
    title: 'Charging Port Repair',
    description: 'Not charging properly? We fix charging ports and connectors.',
    from: '€39',
    time: 'Same day',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Package,
    title: 'Water Damage',
    description: 'Dropped your phone in water? Our technicians will assess and repair.',
    from: 'From €59',
    time: '24–48h',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
]

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
  const categorySlugMap = new Map((categories ?? []).map((c) => [c.id, c.slug]))
  const displayCategories = (categories ?? []).slice(0, 10)

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 py-24 lg:py-32 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-amber-500 text-white border-0 hover:bg-amber-600">
              ✓ 90-Day Warranty on all repairs
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Phone Fixed,<br />
              <span className="text-amber-400">Fast & Right</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl">
              Professional mobile phone repair service and shop for accessories &amp; components.
              Walk in or book online — most repairs done the same day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                <Link href="/repairs/booking">
                  Book a Repair
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/shop">Browse Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b bg-white" aria-label="Why shop with us">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
            {trustItems.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-3 py-5 px-4 lg:px-6">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category quick links */}
      {categories && categories.length > 0 && (
        <section className="py-10 bg-muted/30" aria-labelledby="categories-heading">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 id="categories-heading" className="text-xl font-bold">Shop by Category</h2>
              <Link href="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
                All products <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {displayCategories.map((cat) => {
                const Icon = (categoryIconMap[cat.slug] ?? Package) as ElementType
                return (
                  <Link
                    key={cat.id}
                    href={`/shop/${cat.slug}`}
                    className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-full border border-border hover:border-primary hover:bg-primary hover:text-white transition-all text-sm font-medium shadow-sm group"
                  >
                    <Icon className="h-4 w-4 text-amber-500 group-hover:text-white transition-colors" aria-hidden="true" />
                    {cat.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Latest Arrivals */}
      {latestProducts && latestProducts.length > 0 && (
        <section className="py-14" aria-labelledby="latest-heading">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="latest-heading" className="text-2xl font-bold">Latest Arrivals</h2>
                <p className="text-muted-foreground text-sm mt-1">Freshly added to our shop</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/shop">
                  View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {latestProducts.map((product) => {
                const slug = product.category_id
                  ? (categorySlugMap.get(product.category_id) ?? 'uncategorised')
                  : 'uncategorised'
                return <ProductCard key={product.id} product={product} categorySlug={slug} />
              })}
            </div>
          </div>
        </section>
      )}


      {/* Services */}
      <section className="py-14 bg-muted/30" aria-labelledby="services-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 id="services-heading" className="text-2xl font-bold mb-2">
              Popular Repair Services
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              We repair all major brands — iPhone, Samsung, Xiaomi, Huawei, and more.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map(({ icon: Icon, title, description, from, time, iconBg, iconColor }) => (
              <Card key={title} className="hover:shadow-md transition-shadow group border-0 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-105 transition-transform`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                  <div className="flex items-center justify-between text-sm pt-1 border-t">
                    <span className="font-bold text-amber-600">{from}</span>
                    <Badge variant="secondary" className="text-xs">{time}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/repairs">
                View All Services &amp; Prices
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto space-y-5">
            <h2 id="cta-heading" className="text-3xl font-bold">
              Need a Repair or Accessory?
            </h2>
            <p className="text-primary-foreground/80">
              Book a repair online or browse our shop for accessories, screen protectors, cases, chargers and more.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                <Link href="/repairs/booking">Book Repair Online</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10">
                <Link href="/shop">Shop Accessories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
