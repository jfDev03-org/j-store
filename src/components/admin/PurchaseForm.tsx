'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { createPurchase, type PurchaseLineItem } from '@/app/admin/(protected)/purchases/actions'
import type { ProductRow } from '@/types/database'

type Props = { products: Pick<ProductRow, 'id' | 'name' | 'sku'>[] }

const EMPTY_LINE = (): PurchaseLineItem & { _id: number } => ({ product_id: '', quantity_ordered: 1, unit_cost: 0, _id: Math.random() })

export default function PurchaseForm({ products }: Props) {
  const [open, setOpen] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<(PurchaseLineItem & { _id: number })[]>([EMPTY_LINE()])
  const [pending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  function setLine(index: number, field: keyof PurchaseLineItem, value: string | number) {
    setLines((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  function addLine() {
    setLines((prev) => [...prev, EMPTY_LINE()])
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  function reset() {
    setSupplier('')
    setNotes('')
    setLines([EMPTY_LINE()])
    setSubmitted(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)

    if (lines.some((l) => !l.product_id)) {
      toast.error('Seleciona um produto em cada linha ou remove as linhas vazias')
      return
    }

    const validLines = lines.filter((l) => l.product_id)
    const ids = validLines.map((l) => l.product_id)
    if (new Set(ids).size !== ids.length) {
      toast.error('Cada produto só pode aparecer uma vez por ordem')
      return
    }

    startTransition(async () => {
      const result = await createPurchase(supplier, notes, validLines)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Ordem de compra criada')
        setOpen(false)
        reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusCircle className="h-4 w-4 mr-1.5" />Nova Compra
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="po-supplier">Fornecedor *</Label>
              <Input
                id="po-supplier"
                required
                placeholder="Ex: Samsung Parts Lda"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="po-notes">Notas</Label>
              <Textarea
                id="po-notes"
                rows={1}
                placeholder="Notas opcionais"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_100px_110px_36px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Produto</span>
              <span>Qtd</span>
              <span>Custo Unit. (€)</span>
              <span />
            </div>

            {lines.map((line, i) => (
              <div key={line._id} className="grid grid-cols-[1fr_100px_110px_36px] gap-2 items-center">
                <select
                  className={`h-9 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    submitted && !line.product_id ? 'border-destructive' : 'border-input'
                  }`}
                  value={line.product_id}
                  onChange={(e) => setLine(i, 'product_id', e.target.value)}
                  required
                >
                  <option value="">— Seleciona produto —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.sku ? ` (${p.sku})` : ''}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={1}
                  required
                  value={line.quantity_ordered}
                  onChange={(e) => setLine(i, 'quantity_ordered', parseInt(e.target.value) || 1)}
                />
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  required
                  value={line.unit_cost}
                  onChange={(e) => setLine(i, 'unit_cost', parseFloat(e.target.value) || 0)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove line"
                  disabled={lines.length === 1}
                  onClick={() => removeLine(i)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <PlusCircle className="h-4 w-4 mr-1.5" />Adicionar linha
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Criar Ordem
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
