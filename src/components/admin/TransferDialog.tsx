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
import { ArrowRightLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { transferStock } from '@/app/admin/(protected)/stock/transfers/actions'
import type { StoreRow, ProductRow } from '@/types/database'

type StoreStock = {
  store_id: string
  product_id: string
  quantity: number
}

type Props = {
  stores: Pick<StoreRow, 'id' | 'name'>[]
  products: Pick<ProductRow, 'id' | 'name' | 'sku'>[]
  storeStock: StoreStock[]
  defaultFromStoreId?: string
}

export default function TransferDialog({ stores, products, storeStock, defaultFromStoreId }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [fromStoreId, setFromStoreId] = useState(defaultFromStoreId ?? stores[0]?.id ?? '')
  const [toStoreId, setToStoreId] = useState('')
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!open) {
      setError(null)
      setProductId('')
      setQty(1)
      setToStoreId('')
    }
  }, [open])

  // Auto-select destination as the first store that isn't the source
  useEffect(() => {
    const other = stores.find((s) => s.id !== fromStoreId)
    setToStoreId(other?.id ?? '')
  }, [fromStoreId, stores])

  const sourceStock = storeStock.find(
    (s) => s.store_id === fromStoreId && s.product_id === productId
  )
  const availableQty = sourceStock?.quantity ?? 0
  const overstock = qty > availableQty && !!productId

  const selectCls =
    'w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await transferStock(fromStoreId, toStoreId, productId, qty)
      if (result && 'error' in result) {
        setError(result.error)
      } else {
        toast.success(`Transferência realizada com sucesso`)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <ArrowRightLeft className="h-4 w-4 mr-1.5" aria-hidden />
        Nova Transferência
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir Stock</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Move unidades de um produto de uma loja para outra.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* From / To stores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tf-from">Origem *</Label>
              <select
                id="tf-from"
                className={selectCls}
                value={fromStoreId}
                onChange={(e) => setFromStoreId(e.target.value)}
                required
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tf-to">Destino *</Label>
              <select
                id="tf-to"
                className={selectCls}
                value={toStoreId}
                onChange={(e) => setToStoreId(e.target.value)}
                required
              >
                <option value="" disabled>Seleciona</option>
                {stores
                  .filter((s) => s.id !== fromStoreId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-product">Produto *</Label>
            <select
              id="tf-product"
              className={selectCls}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="" disabled>Seleciona um produto</option>
              {products.map((p) => {
                const stock = storeStock.find(
                  (s) => s.store_id === fromStoreId && s.product_id === p.id
                )
                const qty = stock?.quantity ?? 0
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.sku ? ` (${p.sku})` : ''} — {qty} disponível{qty !== 1 ? 'is' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="tf-qty">
              Quantidade *
              {productId && (
                <span className="ml-1.5 font-normal text-muted-foreground text-xs">
                  (máx. {availableQty})
                </span>
              )}
            </Label>
            <Input
              id="tf-qty"
              type="number"
              min={1}
              max={availableQty || undefined}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 1)}
              required
            />
            {overstock && (
              <p className="text-xs text-destructive">
                Stock insuficiente — apenas {availableQty} unidade{availableQty !== 1 ? 's' : ''} disponível{availableQty !== 1 ? 'is' : ''} na origem.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={pending || !fromStoreId || !toStoreId || !productId || overstock}
            >
              {pending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />}
              {pending ? 'A transferir...' : 'Transferir'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
