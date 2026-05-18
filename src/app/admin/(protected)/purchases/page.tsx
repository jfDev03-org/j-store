import { createAdminClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/format'
import PurchaseForm from '@/components/admin/PurchaseForm'
import ReceivePurchaseButton from '@/components/admin/ReceivePurchaseButton'
import CancelPurchaseButton from '@/components/admin/CancelPurchaseButton'
import type { Metadata } from 'next'
import type { PurchaseItemRow, ProductRow } from '@/types/database'

export const metadata: Metadata = { title: 'Compras — Admin', robots: { index: false } }

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  received: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default async function AdminPurchasesPage() {
  const supabase = createAdminClient()

  const [{ data: purchases }, { data: products }] = await Promise.all([
    supabase
      .from('purchases')
      .select('*, purchase_items(id, product_id, quantity_ordered, quantity_received, unit_cost)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('products')
      .select('id, name, sku')
      .eq('is_active', true)
      .order('name'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Compras</h1>
        <PurchaseForm products={products ?? []} />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th scope="col" className="text-left px-4 py-3 font-medium">Fornecedor</th>
                <th scope="col" className="text-left px-4 py-3 font-medium">Artigos</th>
                <th scope="col" className="text-left px-4 py-3 font-medium">Custo Total</th>
                <th scope="col" className="text-left px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="text-left px-4 py-3 font-medium">Data</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {!purchases || purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Sem compras ainda. Clica em &quot;Nova Compra&quot; para criar uma.
                  </td>
                </tr>
              ) : (() => {
                // Build map once, outside the per-row render
                const productMap = new Map((products ?? []).map((p: Pick<ProductRow, 'id' | 'name' | 'sku'>) => [p.id, p]))
                return purchases.map((po) => {
                  const items = (po.purchase_items ?? []) as PurchaseItemRow[]
                  const totalCost = items.reduce((s, i) => s + i.unit_cost * i.quantity_ordered, 0)

                  return (
                    <tr key={po.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{po.supplier}</p>
                        {po.notes && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{po.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="space-y-0.5">
                          {items.map((item) => {
                            const p = productMap.get(item.product_id)
                            return (
                              <p key={item.id} className="text-xs">
                                {p?.name ?? item.product_id} ×{item.quantity_ordered}
                              </p>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatPrice(totalCost)}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_BADGE[po.status] ?? ''}>
                          {po.status === 'pending' ? 'Pendente' : po.status === 'received' ? 'Recebida' : 'Cancelada'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(po.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-4 py-3">
                        {po.status === 'pending' && (
                          <div className="flex items-center gap-1 justify-end">
                            <ReceivePurchaseButton purchaseId={po.id} />
                            <CancelPurchaseButton purchaseId={po.id} />
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
