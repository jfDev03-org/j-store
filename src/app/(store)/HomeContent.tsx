'use client'

import Link from 'next/link'
import type { ElementType } from 'react'
import { ArrowRight, Wrench, Shield, Truck, Lock, Smartphone, Zap, Package, Battery } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ProductCard from '@/components/shop/ProductCard'
import { useTranslations } from '@/lib/i18n'
import type { Product } from '@/types/database'

type Category = { id: string; name: string; slug: string }
type ProductRow = Product

const categoryIconMap: Record<string, ElementType> = {
  screens: Smartphone,
  batteries: Battery,
  chargers: Zap,
  cases: Package,
  components: Wrench,
  accessories: Smartphone,
}

interface HomeContentProps {
  categories: Category[]
  latestProducts: ProductRow[]
  categorySlugMap: Record<string, string>
}

export default function HomeContent({ categories, latestProducts, categorySlugMap }: HomeContentProps) {
  const t = useTranslations()

  const trustItems = [
    { icon: Truck, title: t.home.trustNextDayTitle, subtitle: t.home.trustNextDaySubtitle },
    { icon: Wrench, title: t.home.trustTechTitle, subtitle: t.home.trustTechSubtitle },
    { icon: Shield, title: t.home.trustWarrantyTitle, subtitle: t.home.trustWarrantySubtitle },
    { icon: Lock, title: t.home.trustSecureTitle, subtitle: t.home.trustSecureSubtitle },
  ]

  const services = [
    {
      icon: Smartphone,
      title: t.home.serviceScreenTitle,
      description: t.home.serviceScreenDesc,
      from: t.home.serviceScreenFrom,
      time: t.home.serviceScreenTime,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Zap,
      title: t.home.serviceBatteryTitle,
      description: t.home.serviceBatteryDesc,
      from: t.home.serviceBatteryFrom,
      time: t.home.serviceBatteryTime,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      icon: Wrench,
      title: t.home.serviceChargerTitle,
      description: t.home.serviceChargerDesc,
      from: t.home.serviceChargerFrom,
      time: t.home.serviceChargerTime,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Package,
      title: t.home.serviceWaterTitle,
      description: t.home.serviceWaterDesc,
      from: t.home.serviceWaterFrom,
      time: t.home.serviceWaterTime,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ]

  const displayCategories = categories.slice(0, 10)

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 py-24 lg:py-32 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-amber-500 text-white border-0 hover:bg-amber-600">
              {t.home.heroBadge}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t.home.heroTitle}<br />
              <span className="text-amber-400">{t.home.heroTitleHighlight}</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl">
              {t.home.heroDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                <Link href="/repairs/booking">
                  {t.home.heroBookRepair}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/shop">{t.home.heroBrowseShop}</Link>
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
      {categories.length > 0 && (
        <section className="py-10 bg-muted/30" aria-labelledby="categories-heading">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 id="categories-heading" className="text-xl font-bold">{t.home.shopByCategoryTitle}</h2>
              <Link href="/shop" className="text-sm text-primary hover:underline flex items-center gap-1">
                {t.home.allProductsLink} <ArrowRight className="h-3.5 w-3.5" />
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
      {latestProducts.length > 0 && (
        <section className="py-14" aria-labelledby="latest-heading">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="latest-heading" className="text-2xl font-bold">{t.home.latestArrivalsTitle}</h2>
                <p className="text-muted-foreground text-sm mt-1">{t.home.latestArrivalsSubtitle}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/shop">
                  {t.home.viewAll} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {latestProducts.map((product) => {
                const slug = product.category_id
                  ? (categorySlugMap[product.category_id] ?? 'uncategorised')
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
              {t.home.servicesTitle}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              {t.home.servicesSubtitle}
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
                {t.home.viewAllServices}
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
              {t.home.ctaTitle}
            </h2>
            <p className="text-primary-foreground/80">
              {t.home.ctaDescription}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                <Link href="/repairs/booking">{t.home.ctaBookRepair}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10">
                <Link href="/shop">{t.home.ctaShopAccessories}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
