'use client'

import Link from 'next/link'
import QuoteForm from '@/components/repairs/QuoteForm'
import { useTranslations } from '@/lib/i18n'

export default function QuoteContent() {
  const t = useTranslations()

  return (
    <div className="container mx-auto px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">{t.quote.breadcrumbHome}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/repairs" className="hover:text-foreground">{t.quote.breadcrumbRepairs}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{t.quote.breadcrumbQuote}</li>
        </ol>
      </nav>

      <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-2">{t.quote.title}</h1>
        <p className="text-muted-foreground mb-8">
          {t.quote.subtitle}{' '}
          {t.quote.bookingPrompt}{' '}
          <Link href="/repairs/booking" className="text-primary underline">{t.quote.bookingLink}</Link>{' '}
          {t.quote.bookingPromptEnd}
        </p>

        <QuoteForm />
      </div>
    </div>
  )
}
