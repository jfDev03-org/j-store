import Link from 'next/link'
import QuoteForm from '@/components/repairs/QuoteForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get a Repair Quote',
  description: 'Request a free repair quote. Tell us about your device and issue and we\'ll get back to you within 24 hours.',
}

export default function QuotePage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/repairs" className="hover:text-foreground">Repairs</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Get a Quote</li>
        </ol>
      </nav>

      <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-2">Get a Free Quote</h1>
        <p className="text-muted-foreground mb-8">
          Fill in the form below and we&apos;ll assess your device and send you a quote within 24 hours.
          Alternatively, <Link href="/repairs/booking" className="text-primary underline">book an appointment</Link> and bring it in directly.
        </p>

        <QuoteForm />
      </div>
    </div>
  )
}
