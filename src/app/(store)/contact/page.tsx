import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import ContactForm from '@/components/layout/ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with JStore. Find our address, phone number, opening hours, or send us a message.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Contact</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-10">We&apos;re here to help. Reach out by phone, email, or the form below.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info */}
        <div className="space-y-8">
          <dl className="space-y-4">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="font-medium text-sm">Address</dt>
                <dd className="text-muted-foreground text-sm mt-0.5">Rua Example, 123<br />1000-001 Lisboa, Portugal</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="font-medium text-sm">Phone</dt>
                <dd className="mt-0.5">
                  <a href="tel:+351000000000" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    +351 000 000 000
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="font-medium text-sm">Email</dt>
                <dd className="mt-0.5">
                  <a href="mailto:hello@j-store.pt" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    hello@j-store.pt
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="font-medium text-sm">Opening Hours</dt>
                <dd className="text-sm text-muted-foreground mt-0.5 space-y-0.5">
                  <p>Monday – Friday: 9:00 – 18:00</p>
                  <p>Saturday: 10:00 – 16:00</p>
                  <p>Sunday: Closed</p>
                </dd>
              </div>
            </div>
          </dl>

          {/* Map embed placeholder */}
          <div className="rounded-xl overflow-hidden border aspect-video bg-muted flex items-center justify-center text-muted-foreground text-sm">
            <p>Google Maps embed — replace with your location</p>
          </div>
        </div>

        {/* Contact form */}
        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
