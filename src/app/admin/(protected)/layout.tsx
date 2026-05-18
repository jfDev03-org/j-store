import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AdminSidebar email={user.email ?? ''} />
      {/* pt-14 on mobile to clear fixed top bar; removed on md+ */}
      <main className="flex-1 bg-gray-50 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
