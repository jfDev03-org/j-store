'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import { cancelPurchase } from '@/app/admin/(protected)/purchases/actions'

export default function CancelPurchaseButton({ purchaseId }: { purchaseId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Cancel this purchase order?')) return
    startTransition(async () => {
      const result = await cancelPurchase(purchaseId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Purchase order cancelled')
      }
    })
  }

  return (
    <Button size="icon-sm" variant="ghost" onClick={handleClick} disabled={pending} aria-label="Cancel purchase">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-destructive" />}
    </Button>
  )
}
