import Link from 'next/link'
import { Shield, Clock, Star, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about JStore — our story, team, and commitment to quality phone repairs and accessories.',
}

const values = [
  { icon: Shield, title: '90-Day Warranty', description: 'Every repair covered. Every time.' },
  { icon: Clock, title: 'Fast Turnarounds', description: 'Most repairs done the same day.' },
  { icon: Star, title: 'Quality Parts', description: 'OEM and premium aftermarket parts only.' },
  { icon: Users, title: 'Expert Technicians', description: 'Trained and certified professionals.' },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">About</li>
        </ol>
      </nav>

      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">About JStore</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          JStore is a professional mobile phone repair shop and accessories retailer based in Lisbon, Portugal.
          We started in 2018 with a simple mission: to offer fast, reliable, and affordable phone repairs that you can trust.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Whether your screen is cracked, your battery is dying, or your phone took a swim — our certified technicians
          will get it back in your hands as quickly as possible. We also stock a wide range of accessories and components
          for all major brands.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {values.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-muted/50 rounded-xl p-5 space-y-2">
            <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center max-w-2xl">
        <h2 className="text-2xl font-bold mb-3">Have a broken phone?</h2>
        <p className="mb-6 text-primary-foreground/80">
          Book a repair online or drop by our shop during opening hours. No appointment needed for walk-ins.
        </p>
        <Link
          href="/repairs/booking"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          Book a Repair
        </Link>
      </div>
    </div>
  )
}
