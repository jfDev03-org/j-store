'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { toggleStoreActive } from '@/app/admin/(protected)/stores/actions'

type Props = { storeId: string; isActive: boolean }

export default function ToggleStoreButton({ storeId, isActive }: Props) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function handleConfirm() {
    setOpen(false)
    startTransition(async () => {
      const result = await toggleStoreActive(storeId, isActive)
      if (result && 'error' in result) {
        toast.error(result.error)
      } else {
        toast.success(isActive ? 'Loja desativada' : 'Loja ativada')
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => setOpen(true)}
        className={isActive ? 'text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60' : ''}
      >
        {pending ? '...' : isActive ? 'Desativar' : 'Ativar'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{isActive ? 'Desativar loja?' : 'Ativar loja?'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isActive
              ? 'A loja ficará indisponível para novos pedidos e checkout. Podes reativá-la a qualquer momento.'
              : 'A loja ficará disponível para novos pedidos e stock.'}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button variant="outline" size="sm" type="button" />}>
              Cancelar
            </DialogClose>
            <Button
              size="sm"
              variant={isActive ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {isActive ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
