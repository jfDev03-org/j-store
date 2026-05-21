'use client'

import Link from 'next/link'
import BookingForm from '@/components/repairs/BookingForm'
import { useTranslations } from '@/lib/i18n'

export default function BookingContent() {
  const t = useTranslations()

  return (
    <div className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">{t.booking.breadcrumbHome}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/repairs" className="hover:text-foreground">{t.booking.breadcrumbRepairs}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{t.booking.breadcrumbBooking}</li>
        </ol>
      </nav>

      <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-2">{t.booking.title}</h1>
        <p className="text-muted-foreground mb-8">
          {t.booking.subtitle}{' '}
          {t.booking.quotePrompt}{' '}
          <Link href="/repairs/quote" className="text-primary underline">{t.booking.quoteLink}</Link>
        </p>

        <BookingForm />
      </div>
    </div>
  )
}
