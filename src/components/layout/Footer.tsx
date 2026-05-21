'use client'

import Link from 'next/link'
import { Wrench, Mail, Phone, MapPin, MessageCircle, Camera } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from '@/lib/i18n'

export default function Footer() {
  const t = useTranslations()

  const shopLinks = [
    { href: '/shop', label: t.footer.allProducts },
    { href: '/shop/accessories', label: t.footer.accessories },
    { href: '/shop/components', label: t.footer.components },
  ]

  const repairLinks = [
    { href: '/repairs', label: t.footer.servicesAndPrices },
    { href: '/repairs/quote', label: t.footer.getQuote },
    { href: '/repairs/booking', label: t.footer.bookAppointment },
  ]

  const companyLinks = [
    { href: '/about', label: t.footer.aboutUs },
    { href: '/contact', label: t.footer.contact },
  ]

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
              <Wrench className="h-5 w-5 text-amber-500" aria-hidden="true" />
              J<span className="text-amber-500">Store</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t.footer.tagline}
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/351000000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="p-2 rounded-md bg-white/5 hover:bg-emerald-600/20 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-md bg-white/5 hover:bg-pink-600/20 hover:text-pink-400 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">{t.footer.shopHeading}</h3>
            <ul className="space-y-2">
              {shopLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">{t.footer.repairsHeading}</h3>
            <ul className="space-y-2">
              {repairLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold text-white mt-6 mb-4 uppercase tracking-wide">{t.footer.companyHeading}</h3>
            <ul className="space-y-2">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">{t.footer.contactHeading}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                <span>Rua Example, 123<br />1000-001 Lisboa, Portugal</span>
              </li>
              <li>
                <a href="tel:+351000000000" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                  +351 000 000 000
                </a>
              </li>
              <li>
                <a href="mailto:hello@j-store.pt" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                  hello@j-store.pt
                </a>
              </li>
            </ul>
            <div className="mt-5 p-3 rounded-lg bg-white/5 text-sm space-y-1">
              <p className="font-medium text-gray-300">{t.footer.openingHours}</p>
              <p>{t.footer.monFri}: <span className="text-white">9:45 – 20:00</span></p>
              <p>{t.footer.sat}: <span className="text-white">9:45 – 20:00</span></p>
              <p>{t.footer.sun}: <span className="text-gray-500">10:00 – 19:45</span></p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} JStore. {t.footer.copyright}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">{t.footer.privacyPolicy}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t.footer.termsOfService}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
