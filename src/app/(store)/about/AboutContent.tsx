'use client'

import Link from 'next/link'
import { Shield, Clock, Star, Users } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

export default function AboutContent() {
  const t = useTranslations()

  const values = [
    { icon: Shield, title: t.about.value1Title, description: t.about.value1Desc },
    { icon: Clock, title: t.about.value2Title, description: t.about.value2Desc },
    { icon: Star, title: t.about.value3Title, description: t.about.value3Desc },
    { icon: Users, title: t.about.value4Title, description: t.about.value4Desc },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">{t.about.breadcrumbHome}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{t.about.breadcrumbAbout}</li>
        </ol>
      </nav>

      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">{t.about.title}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">{t.about.intro}</p>
        <p className="text-muted-foreground leading-relaxed mb-10">{t.about.body}</p>
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
        <h2 className="text-2xl font-bold mb-3">{t.about.ctaTitle}</h2>
        <p className="mb-6 text-primary-foreground/80">{t.about.ctaDesc}</p>
        <Link
          href="/repairs/booking"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          {t.about.ctaButton}
        </Link>
      </div>
    </div>
  )
}
