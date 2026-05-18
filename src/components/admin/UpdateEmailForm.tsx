'use client'

import { useTransition, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateEmail } from '@/app/admin/(protected)/settings/profile/actions'

export default function UpdateEmailForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateEmail(null, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        toast.success(result?.message ?? 'Email atualizado. Verifica o teu email.')
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="new-email">Novo email</Label>
        <Input
          id="new-email"
          name="email"
          type="email"
          placeholder="novo@email.com"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />}
        {pending ? 'A atualizar...' : 'Atualizar email'}
      </Button>
    </form>
  )
}
