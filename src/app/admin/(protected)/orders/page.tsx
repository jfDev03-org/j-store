import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/format'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'
import type { Metadata } from 'next'
import type { OrderItem } from '@/types/database'

export const metadata: Metadata = {
  title: 'Encomendas — Admin',
  robots: { index: false },
}

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Encomendas</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-medium">ID</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Cliente</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Artigos</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Total</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sem encomendas ainda.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-muted-foreground text-xs">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Array.isArray(order.items)
                      ? (order.items as OrderItem[]).map((i) => `${i.product_name} ×${i.quantity}`).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect id={order.id} current={order.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('pt-PT')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
