import { createAdminClient } from '@/lib/supabase/server'
import RepairStatusSelect from '@/components/admin/RepairStatusSelect'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pedidos de Reparação — Admin',
  robots: { index: false },
}

export default async function AdminRepairsPage() {
  const supabase = createAdminClient()
  const { data: requests } = await supabase
    .from('repair_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos de Reparação</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-medium">Cliente</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Dispositivo</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Problema</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!requests || requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sem pedidos de reparação ainda.</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{req.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{req.customer_email}</p>
                    <p className="text-xs text-muted-foreground">{req.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{req.device_brand}</p>
                    <p className="text-xs text-muted-foreground">{req.device_model}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm line-clamp-2">{req.issue_description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <RepairStatusSelect id={req.id} current={req.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString('pt-PT')}
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
