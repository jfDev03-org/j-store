import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UpdateEmailForm from '@/components/admin/UpdateEmailForm'
import UpdatePasswordForm from '@/components/admin/UpdatePasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Perfil — Admin', robots: { index: false } }

export default async function AdminProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endereço de email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Email atual: <strong className="text-foreground">{user.email}</strong>
          </p>
          <UpdateEmailForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar password</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
