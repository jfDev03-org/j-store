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
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { initializeStock } from '@/app/admin/(protected)/stock/actions'
import type { StoreRow, ProductRow } from '@/types/database'

type Props = {
  stores: Pick<StoreRow, 'id' | 'name'>[]
  products: Pick<ProductRow, 'id' | 'name' | 'sku'>[]
  /** "storeId:productId" pairs already in store_stock — plain array for serialization */
  existingPairsList: string[]
  defaultStoreId?: string
}

export default function InitStockDialog({ stores, products, existingPairsList, defaultStoreId }: Props) {
  const existingPairs = new Set(existingPairsList)
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [storeId, setStoreId] = useState(defaultStoreId ?? stores[0]?.id ?? '')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [minQuantity, setMinQuantity] = useState(5)

  useEffect(() => {
    if (!open) {
      setError(null)
      setProductId('')
      setQuantity(0)
      setMinQuantity(5)
    }
  }, [open])

  const alreadyExists = !!productId && existingPairs.has(`${storeId}:${productId}`)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await initializeStock(storeId, productId, quantity, minQuantity)
      if (result && 'error' in result) {
        setError(result.error)
      } else {
        toast.success('Stock inicializado com sucesso')
        setOpen(false)
      }
    })
  }

  const selectCls = 'w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="h-4 w-4 mr-1.5" aria-hidden />
        Adicionar ao Stock
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inicializar Stock</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Adiciona um produto ao stock de uma loja pela primeira vez.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Store selector */}
          <div className="space-y-1.5">
            <Label htmlFor="init-store">Loja *</Label>
            <select
              id="init-store"
              className={selectCls}
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
            >
              <option value="" disabled>Seleciona uma loja</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Product selector */}
          <div className="space-y-1.5">
            <Label htmlFor="init-product">Produto *</Label>
            <select
              id="init-product"
              className={selectCls}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="" disabled>Seleciona um produto</option>
              {products.map((p) => {
                const tracked = existingPairs.has(`${storeId}:${p.id}`)
                return (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.sku ? ` (${p.sku})` : ''}{tracked ? ' — já tem stock' : ''}
                  </option>
                )
              })}
            </select>
            {alreadyExists && (
              <p className="text-xs text-amber-600">
                Este produto já tem stock nesta loja. Usa o botão de ajuste para alterar a quantidade.
              </p>
            )}
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="init-qty">Quantidade inicial</Label>
              <Input
                id="init-qty"
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="init-min">
                Mínimo
                <span className="text-muted-foreground font-normal ml-1">(alerta)</span>
              </Label>
              <Input
                id="init-min"
                type="number"
                min={0}
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={pending || !storeId || !productId || alreadyExists}
            >
              {pending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />}
              {pending ? 'A guardar...' : 'Inicializar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
