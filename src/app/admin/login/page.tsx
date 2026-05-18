import { redirect } from 'next/navigation'
import { Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './LoginForm'

export default async function AdminLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.app_metadata?.role === 'admin') redirect('/admin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-2">
            <Wrench className="h-6 w-6 text-amber-500" aria-hidden="true" />
            J<span className="text-amber-500">Store</span>
          </div>
          <p className="text-gray-400 text-sm">Admin Panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
