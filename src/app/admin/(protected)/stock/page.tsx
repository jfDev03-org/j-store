import { createAdminClient } from '@/lib/supabase/server'
import InitStockDialog from '@/components/admin/InitStockDialog'
import RealtimeStockTable from '@/components/admin/RealtimeStockTable'
import Link from 'next/link'
import { AlertTriangle, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Stock — Admin', robots: { index: false } }

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>
}) {
  const { store: storeParam } = await searchParams
  const supabase = createAdminClient()

  const [{ data: stores }, { data: products }] = await Promise.all([
    supabase.from('stores').select('id, name').eq('is_active', true).order('name'),
    supabase.from('products').select('id, name, sku').eq('is_active', true).order('name'),
  ])

  const activeStoreId = storeParam ?? stores?.[0]?.id ?? ''

  const { data: rows } = await supabase
    .from('store_stock')
    .select('quantity, min_quantity, product:products!product_id(id, name, sku, is_active)')
    .eq('store_id', activeStoreId)
    .order('quantity', { ascending: true })

  const lowStockCount = rows?.filter((r) => r.quantity <= (r.min_quantity ?? 5)).length ?? 0

  // Build list of already-tracked pairs for InitStockDialog (array — Set is not serializable)
  const existingPairsList = (rows ?? []).map((r) => {
    const product = r.product as unknown as { id: string } | null
    return product ? `${activeStoreId}:${product.id}` : null
  }).filter(Boolean) as string[]

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stock</h1>
          {lowStockCount > 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-1 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
              {lowStockCount} produto{lowStockCount > 1 ? 's' : ''} abaixo do mínimo
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Store selector */}
          {stores && stores.length > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Loja:</span>
              <div className="flex gap-1">
                {stores.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/stock?store=${s.id}`}
                    className={[
                      'px-3 py-1.5 rounded-md border text-sm transition-colors',
                      activeStoreId === s.id
                        ? 'bg-foreground text-background border-foreground font-medium'
                        : 'border-border hover:bg-muted',
                    ].join(' ')}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <InitStockDialog
            stores={stores ?? []}
            products={products ?? []}
            existingPairsList={existingPairsList}
            defaultStoreId={activeStoreId}
          />

          <Button asChild size="sm" variant="outline">
            <Link href="/admin/stock/transfers">
              <ArrowRightLeft className="h-4 w-4 mr-1.5" />Transferências
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Produto</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">SKU</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Quantidade</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Mínimo</th>
                  <th scope="col" className="text-left px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3" />
                </tr>
            </thead>
            {/* RealtimeStockTable is a Client Component that subscribes to live
                stock changes via Supabase Realtime. Initial rows come from SSR. */}
            <RealtimeStockTable
              storeId={activeStoreId}
              initialRows={(rows ?? []).map((r) => ({
                product: r.product as unknown as { id: string; name: string; sku: string | null; is_active: boolean } | null,
                quantity: r.quantity,
                min_quantity: r.min_quantity,
              }))}
            />
          </table>
        </div>
      </div>
    </div>
  )
}
