import { createAdminClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, Package } from 'lucide-react'
import StoreDialog from '@/components/admin/StoreDialog'
import ToggleStoreButton from '@/components/admin/ToggleStoreButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lojas — Admin', robots: { index: false } }

export default async function AdminStoresPage() {
  const supabase = createAdminClient()

  const [{ data: stores }, { data: stockRows }] = await Promise.all([
    supabase.from('stores').select('id, name, location, is_active, created_at').order('created_at', { ascending: true }),
    supabase.from('store_stock').select('store_id'),
  ])

  const stockByStore = (stockRows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.store_id] = (acc[row.store_id] ?? 0) + 1
    return acc
  }, {})

  const activeCount = stores?.filter(s => s.is_active).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lojas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} ativa{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <StoreDialog />
      </div>

      {(!stores || stores.length === 0) ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Nenhuma loja criada ainda.</p>
          <p className="text-xs mt-1">Cria a primeira loja para começar a gerir stock.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl border p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{store.name}</h2>
                  {store.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {store.location}
                    </p>
                  )}
                </div>
                <Badge variant={store.is_active ? 'default' : 'secondary'}>
                  {store.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <Link href="/admin/stock" className="hover:underline">
                  {stockByStore[store.id] ?? 0} produto{(stockByStore[store.id] ?? 0) !== 1 ? 's' : ''} em stock
                </Link>
              </div>

              <div className="flex gap-2 pt-1 border-t">
                <StoreDialog store={store} />
                <ToggleStoreButton storeId={store.id} isActive={store.is_active} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
