'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { StoreRow } from '@/types/database'
import { createStore, updateStore } from '@/app/admin/(protected)/stores/actions'

type Props = { store?: StoreRow }

export default function StoreDialog({ store }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) setError(null)
  }, [open])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = store
        ? await updateStore(store.id, null, formData)
        : await createStore(null, formData)

      if (result && 'error' in result) {
        setError(result.error)
      } else {
        toast.success(store ? 'Loja atualizada' : 'Loja criada')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          store ? (
            <Button variant="outline" size="sm" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {store ? (
          <><Pencil className="h-3.5 w-3.5 mr-1.5" aria-hidden /> Editar</>
        ) : (
          <><Plus className="h-4 w-4 mr-1.5" aria-hidden /> Nova Loja</>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{store ? 'Editar Loja' : 'Nova Loja'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="store-name">Nome *</Label>
            <Input
              id="store-name"
              name="name"
              defaultValue={store?.name ?? ''}
              placeholder="Ex: Loja Lisboa"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store-location">Localização</Label>
            <Input
              id="store-location"
              name="location"
              defaultValue={store?.location ?? ''}
              placeholder="Ex: Rua X, 123, Lisboa"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />}
              {pending ? 'A guardar...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
