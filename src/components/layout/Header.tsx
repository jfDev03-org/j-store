'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Wrench, Menu, Phone, Truck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart'
import CartDrawer from '@/components/layout/CartDrawer'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useTranslations } from '@/lib/i18n'

export default function Header() {
  const t = useTranslations()
  const pathname = usePathname()
  const { itemCount, openCart } = useCartStore()
  const count = itemCount()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const navLinks = [
    { href: '/shop', label: t.nav.shop },
    { href: '/repairs', label: t.nav.repairs },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ]

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-sm">
        {/* Announcement bar */}
        <div className="bg-primary text-primary-foreground text-xs py-1.5">
          <div className="container mx-auto px-4 flex items-center justify-center gap-5">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">{t.announcement.shippingMobile}</span>
              <span className="hidden sm:inline">{t.announcement.shippingDesktop}</span>
            </span>
            <span className="opacity-40 hidden sm:inline">|</span>
            <span className="hidden sm:inline">{t.announcement.freeShipping}</span>
            <span className="opacity-40 hidden lg:inline">|</span>
            <span className="hidden lg:inline">{t.announcement.warranty}</span>
          </div>
        </div>

        {/* Main nav */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary shrink-0">
              <Wrench className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <span>J<span className="text-amber-500">Store</span></span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname.startsWith(href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="tel:+351000000000"
                aria-label={t.nav.contact}
                className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+351 000 000 000</span>
              </a>

              <Button
                variant="ghost"
                size="icon"
                aria-label={mounted ? `${t.cart.title}, ${count} ${count !== 1 ? t.cart.itemsSuffix : t.cart.itemSuffix}` : t.cart.title}
                className="relative"
                onClick={openCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && count > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-amber-500 text-white border-0 pointer-events-none"
                    aria-live="polite"
                  >
                    {count > 99 ? '99+' : count}
                  </Badge>
                )}
              </Button>

              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/repairs/booking">{t.nav.bookRepair}</Link>
              </Button>

              <LanguageSwitcher />

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-72 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>

          <div className="flex items-center justify-between px-5 py-4 border-b">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary" onClick={closeMenu}>
              <Wrench className="h-4 w-4 text-amber-500" aria-hidden="true" />
              J<span className="text-amber-500">Store</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav aria-label="Mobile navigation" className="flex flex-col gap-0.5 px-3 py-3 flex-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={[
                  'px-4 py-3 text-sm font-medium rounded-md transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-4 pb-6 pt-2 space-y-3 border-t">
            <Separator className="mb-3" />
            <Button asChild className="w-full" onClick={closeMenu}>
              <Link href="/repairs/booking">{t.nav.bookRepair}</Link>
            </Button>
            <a
              href="tel:+351000000000"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4" />
              +351 000 000 000
            </a>
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CartDrawer />
    </>
  )
}
