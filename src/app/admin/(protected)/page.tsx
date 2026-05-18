import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Wrench, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false },
}

function fmt(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: 'Pago',      cls: 'bg-green-100 text-green-700' },
  shipped:   { label: 'Enviado',   cls: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregue',  cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelado', cls: 'bg-red-100 text-red-700' },
}

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const now = new Date()
  const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyAgo   = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: paidOrders },
    { count: pendingOrders },
    { count: pendingRepairs },
    { count: pendingBookings },
    { data: recentOrders },
    { data: firstStore },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total, created_at')
      .in('status', ['paid', 'shipped', 'delivered'])
      .gte('created_at', thirtyAgo),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('repair_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('orders')
      .select('id, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('stores').select('id').eq('is_active', true).order('created_at').limit(1),
  ])

  const defaultStoreId = firstStore?.[0]?.id
  const { data: allStock } = defaultStoreId
    ? await supabase
        .from('store_stock')
        .select('quantity, min_quantity, product:products(id, name)')
        .eq('store_id', defaultStoreId)
    : { data: null }

  const todayRevenue = paidOrders?.filter(o => o.created_at >= todayStart).reduce((s, o) => s + o.total, 0) ?? 0
  const weekRevenue  = paidOrders?.filter(o => o.created_at >= weekStart).reduce((s, o) => s + o.total, 0) ?? 0
  const monthRevenue = paidOrders?.reduce((s, o) => s + o.total, 0) ?? 0

  const lowStock = (allStock ?? []).filter(r => r.quantity <= (r.min_quantity ?? 5))

  // Last 7 days revenue for bar chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const dayKey = d.toISOString().slice(0, 10)
    const rev = paidOrders?.filter(o => o.created_at.slice(0, 10) === dayKey).reduce((s, o) => s + o.total, 0) ?? 0
    return { label: d.toLocaleDateString('pt-PT', { weekday: 'short' }), rev }
  })
  const maxRev = Math.max(...last7.map(d => d.rev), 1)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Receita (30 dias)</p>
            <p className="text-2xl font-bold">{fmt(monthRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Hoje: {fmt(todayRevenue)} · Semana: {fmt(weekRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-50 shrink-0">
              <ShoppingBag className="h-6 w-6 text-yellow-600" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingOrders ?? 0}</p>
              <p className="text-sm text-muted-foreground">Encomendas pendentes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 shrink-0">
              <Wrench className="h-6 w-6 text-purple-600" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold">{(pendingRepairs ?? 0) + (pendingBookings ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Reparações pendentes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${lowStock.length > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <AlertTriangle className={`h-6 w-6 ${lowStock.length > 0 ? 'text-amber-600' : 'text-gray-400'}`} aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStock.length}</p>
              <p className="text-sm text-muted-foreground">Stock baixo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue bar chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Receita — últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-36">
              {last7.map(({ label, rev }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs text-muted-foreground font-medium">{rev > 0 ? fmt(rev) : ''}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t-sm min-h-[3px] transition-all"
                    style={{ height: `${Math.max((rev / maxRev) * 120, rev > 0 ? 3 : 0)}px` }}
                    title={fmt(rev)}
                  />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low stock alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Alertas de stock</CardTitle>
            {lowStock.length > 0 && (
              <Link href="/admin/stock" className="text-xs text-blue-600 hover:underline">Ver stock</Link>
            )}
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tudo em ordem 👍</p>
            ) : (
              <ul className="space-y-2">
                {lowStock.slice(0, 7).map((item) => {
                  const product = item.product as { id: string; name: string } | null
                  if (!product) return null
                  return (
                    <li key={product.id} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1 mr-2">{product.name}</span>
                      <span className={`font-semibold shrink-0 ${item.quantity === 0 ? 'text-destructive' : 'text-amber-600'}`}>
                        {item.quantity} un
                      </span>
                    </li>
                  )
                })}
                {lowStock.length > 7 && (
                  <li className="text-xs text-muted-foreground">+{lowStock.length - 7} mais...</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Últimas encomendas</CardTitle>
          <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-y">
                <tr>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Cliente</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Data</th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">Total</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!recentOrders || recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Sem encomendas ainda.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const s = STATUS_MAP[order.status] ?? { label: order.status, cls: 'bg-gray-100 text-gray-600' }
                    return (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{order.customer_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{fmt(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
