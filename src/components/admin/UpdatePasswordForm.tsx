'use client'

import { useTransition, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword } from '@/app/admin/(protected)/settings/profile/actions'

export default function UpdatePasswordForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updatePassword(null, formData)
      if ('error' in result) {
        setError(result.error)
      } else {
        toast.success(result.message ?? 'Password atualizada com sucesso.')
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="current-password">Password atual</Label>
        <Input
          id="current-password"
          name="current_password"
          type="password"
          placeholder="Introduz a tua password atual"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-password">Nova password</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirmar password</Label>
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          minLength={8}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />}
        {pending ? 'A atualizar...' : 'Atualizar password'}
      </Button>
    </form>
  )
}
