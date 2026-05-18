import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Info } from 'lucide-react'
import TransferDialog from '@/components/admin/TransferDialog'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Transferências de Stock — Admin', robots: { index: false } }

export default async function AdminStockTransfersPage() {
  const supabase = createAdminClient()

  const [{ data: stores }, { data: products }] = await Promise.all([
    supabase.from('stores').select('id, name').eq('is_active', true).order('name'),
    supabase.from('products').select('id, name, sku').eq('is_active', true).order('name'),
  ])

  const multiStore = (stores?.length ?? 0) > 1

  // All store_stock rows (for client-side available qty display)
  const { data: allStoreStock } = await supabase
    .from('store_stock')
    .select('store_id, product_id, quantity')

  // Recent transfer movements across all stores, with store name
  const { data: movements } = await supabase
    .from('stock_movements')
    .select('id, delta, reason, created_at, store_id, product:products(name, sku), store:stores(name)')
    .in('reason', ['transfer_in', 'transfer_out'])
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/admin/stock"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Transferências de Stock</h1>
        </div>

        {multiStore && (
          <TransferDialog
            stores={stores ?? []}
            products={products ?? []}
            storeStock={allStoreStock ?? []}
            defaultFromStoreId={stores?.[0]?.id}
          />
        )}
      </div>

      {!multiStore && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-6">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Apenas uma loja ativa</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Para transferir stock é necessário ter pelo menos duas lojas ativas.{' '}
              <Link href="/admin/stores" className="underline hover:text-blue-900">Gerir lojas →</Link>
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <p className="text-sm font-medium">Histórico de transferências</p>
          {movements && movements.length > 0 && (
            <span className="text-xs text-muted-foreground">{movements.length} movimentos</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th scope="col" className="text-left px-4 py-3 font-medium">Produto</th>
                <th scope="col" className="text-left px-4 py-3 font-medium">Loja</th>
                <th scope="col" className="text-left px-4 py-3 font-medium">Tipo</th>
                <th scope="col" className="text-right px-4 py-3 font-medium">Qtd</th>
                <th scope="col" className="text-left px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!movements || movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <p className="text-sm">Nenhuma transferência registada.</p>
                    {multiStore && (
                      <p className="text-xs mt-1">Usa o botão &quot;Nova Transferência&quot; para começar.</p>
                    )}
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const product = m.product as { name: string; sku: string | null } | null
                  const store = m.store as { name: string } | null
                  const isIn = m.reason === 'transfer_in'
                  return (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{product?.name ?? '—'}</p>
                        {product?.sku && (
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {store?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            isIn
                              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                              : 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100'
                          }
                        >
                          {isIn ? 'Entrada' : 'Saída'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold tabular-nums ${isIn ? 'text-green-600' : 'text-orange-600'}`}>
                          {isIn ? '+' : ''}{m.delta}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString('pt-PT', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
