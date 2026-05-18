'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wrench,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Calendar,
  Menu,
  Warehouse,
  Truck,
  Store,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

type NavSection = { section: string }
type NavLink = { href: string; label: string; icon: React.ElementType; exact?: boolean }
type NavItem = NavSection | NavLink

const adminNav: NavItem[] = [
  { section: 'Visão Geral' },
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },

  { section: 'Loja' },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/orders', label: 'Encomendas', icon: ShoppingBag },
  { href: '/admin/stock', label: 'Stock', icon: Warehouse },
  { href: '/admin/purchases', label: 'Compras', icon: Truck },

  { section: 'Reparações' },
  { href: '/admin/repairs', label: 'Pedidos', icon: Wrench },
  { href: '/admin/bookings', label: 'Marcações', icon: Calendar },

  { section: 'Configurações' },
  { href: '/admin/stores', label: 'Lojas', icon: Store },
  { href: '/admin/settings/profile', label: 'Perfil', icon: User },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <>
      {adminNav.map((item, i) => {
        if ('section' in item) {
          return (
            <div key={item.section} className={`px-3 pb-1 ${i === 0 ? 'pt-1' : 'pt-4'}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {item.section}
              </p>
            </div>
          )
        }
        const { href, label, icon: Icon, exact } = item
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={[
              'flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors',
              active
                ? 'bg-white/20 text-white font-medium'
                : 'text-gray-300 hover:bg-white/10 hover:text-white',
            ].join(' ')}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </>
  )
}

export default function AdminSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950 text-white flex items-center justify-between px-4 h-14 border-b border-white/10">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-white">
          <Wrench className="h-4 w-4 text-amber-500" aria-hidden="true" />
          J<span className="text-amber-500">Store</span>
          <span className="text-xs text-gray-500 font-normal ml-1">Admin</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu de administração"
          className="text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile slide-in drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-64 bg-gray-950 text-gray-300 p-0 flex flex-col border-r border-white/10"
        >
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div className="flex items-center px-5 py-4 border-b border-white/10">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-bold text-lg text-white"
              onClick={() => setOpen(false)}
            >
              <Wrench className="h-4 w-4 text-amber-500" aria-hidden="true" />
              J<span className="text-amber-500">Store</span>
            </Link>
          </div>
          <nav aria-label="Admin navigation" className="flex-1 p-3 overflow-y-auto">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
          <div className="p-3 border-t border-white/10">
            <p className="text-xs text-gray-500 px-3 py-2 truncate">{email}</p>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-gray-950 text-gray-300 flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <Wrench className="h-5 w-5 text-amber-500" aria-hidden="true" />
            J<span className="text-amber-500">Store</span>
            <span className="text-xs text-gray-500 font-normal ml-1">Admin</span>
          </Link>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 p-3 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-gray-500 px-3 py-2 truncate">{email}</p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
