import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Repair Services',
  description: 'Professional phone repair services — screen, battery, charging port, water damage and more.',
}

export default async function RepairsPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('repair_services')
    .select('*')
    .eq('is_active', true)
    .order('price_from')

  return (
    <div className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Repairs</li>
        </ol>
      </nav>

      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl font-bold mb-3">Repair Services</h1>
        <p className="text-muted-foreground leading-relaxed">
          We repair all major brands including iPhone, Samsung, Xiaomi, Huawei, and more.
          Prices shown are starting prices — final price depends on model and condition.
          All repairs come with a <strong>90-day warranty</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <Button asChild size="lg">
          <Link href="/repairs/booking">
            Book an Appointment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/repairs/quote">Get a Free Quote</Link>
        </Button>
      </div>

      {!services || services.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Service list coming soon. Please contact us for pricing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-base leading-snug">{service.name}</h2>
                  <Badge variant="secondary" className="shrink-0 flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {service.estimated_days === 0
                      ? 'Same day'
                      : `${service.estimated_days} day${service.estimated_days > 1 ? 's' : ''}`}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>

                {service.device_models.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.device_models.slice(0, 4).map((model) => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                    {service.device_models.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{service.device_models.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t">
                  <p className="text-sm">
                    <span className="text-muted-foreground">From </span>
                    <span className="font-bold text-primary text-base">{formatPrice(service.price_from)}</span>
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/repairs/booking">Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
