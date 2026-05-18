import { createAdminClient } from '@/lib/supabase/server'
import BookingStatusSelect from '@/components/admin/BookingStatusSelect'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marcações — Admin',
  robots: { index: false },
}

export default async function AdminBookingsPage() {
  const supabase = createAdminClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('scheduled_at', { ascending: true })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marcações</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-medium">Agendamento</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Cliente</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Dispositivo</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Criado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!bookings || bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sem marcações ainda.</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {new Date(booking.scheduled_at).toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.scheduled_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{booking.device_info ?? '—'}</td>
                  <td className="px-4 py-3">
                    <BookingStatusSelect id={booking.id} current={booking.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString('pt-PT')}
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
