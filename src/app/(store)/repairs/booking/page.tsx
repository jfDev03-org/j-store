import Link from 'next/link'
import BookingForm from '@/components/repairs/BookingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Repair Appointment',
  description: 'Book your phone repair appointment online. Choose a convenient time slot and we\'ll take care of the rest.',
}

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/repairs" className="hover:text-foreground">Repairs</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Book Appointment</li>
        </ol>
      </nav>

      <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
        <p className="text-muted-foreground mb-8">
          Pick a date and time that suits you. Walk-ins also welcome during opening hours.
          Need a price estimate first? <Link href="/repairs/quote" className="text-primary underline">Get a free quote.</Link>
        </p>

        <BookingForm />
      </div>
    </div>
  )
}
