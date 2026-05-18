'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, PackageCheck } from 'lucide-react'
import { receivePurchase } from '@/app/admin/(protected)/purchases/actions'

export default function ReceivePurchaseButton({ purchaseId }: { purchaseId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Mark this purchase as received and add stock?')) return
    startTransition(async () => {
      const result = await receivePurchase(purchaseId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Purchase received — stock updated')
      }
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : (
        <PackageCheck className="h-4 w-4 mr-1.5" />
      )}
      Receive
    </Button>
  )
}
