'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteProduct } from '@/app/admin/(protected)/products/actions'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Hide "${name}"? This will make the product inactive and remove it from the shop. You can restore it later from the database.`)) return
    startTransition(async () => {
      const result = await deleteProduct(id)
      if (result.error) toast.error(result.error)
      else toast.success('Product hidden')
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete product"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
