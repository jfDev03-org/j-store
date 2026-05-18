'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { adjustStock } from '@/app/admin/(protected)/stock/actions'

const REASONS = [
  { value: 'adjustment', label: 'Manual adjustment' },
  { value: 'damaged', label: 'Damaged / write-off' },
  { value: 'returned', label: 'Customer return' },
  { value: 'inventory_count', label: 'Inventory count correction' },
  { value: 'other', label: 'Other' },
]

type Props = {
  productId: string
  productName: string
  currentQty: number
}

export default function StockAdjustDialog({ productId, productName, currentQty }: Props) {
  const [open, setOpen] = useState(false)
  const [delta, setDelta] = useState<number>(0)
  const [reason, setReason] = useState('adjustment')
  const [pending, startTransition] = useTransition()

  const newQty = currentQty + delta

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await adjustStock(productId, delta, reason)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Stock adjusted successfully')
        setOpen(false)
        setDelta(0)
        setReason('adjustment')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Adjust stock" />}>
        <SlidersHorizontal className="h-4 w-4" />
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">{productName}</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-2xl font-bold">{currentQty}</p>
            </div>
            <div className="flex-1 text-center text-muted-foreground">→</div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">New</p>
              <p className={`text-2xl font-bold ${newQty < 0 ? 'text-destructive' : ''}`}>{newQty}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-delta">Change (use negative to subtract)</Label>
            <Input
              id="adj-delta"
              type="number"
              value={delta}
              onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
              placeholder="e.g. 10 or -3"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-reason">Reason</Label>
            <select
              id="adj-reason"
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {newQty < 0 && (
            <p className="text-xs text-destructive">New quantity cannot be negative.</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending || delta === 0 || newQty < 0}>
              {pending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
