'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
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
import { Loader2, PlusCircle, Pencil, ImagePlus, X } from 'lucide-react'
import { createProduct, updateProduct, type ProductFormData } from '@/app/admin/(protected)/products/actions'
import type { ProductRow, CategoryRow } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

type Props = {
  product?: ProductRow
  categories: CategoryRow[]
}

const EMPTY: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category_id: null,
  brand: null,
  sku: null,
  images: [],
  is_active: true,
}

export default function ProductForm({ product, categories }: Props) {
  const isEdit = !!product
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProductFormData>(
    isEdit
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category_id: product.category_id,
          brand: product.brand,
          sku: product.sku,
          images: product.images,
          is_active: product.is_active,
        }
      : EMPTY
  )

  function set(field: keyof ProductFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('A imagem deve ter menos de 5 MB.')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file, { upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      set('images', [publicUrl])
      toast.success('Imagem carregada')
    } catch {
      toast.error('Erro ao carregar imagem. Verifica se o bucket Storage está configurado.')
    } finally {
      setUploading(false)
      // Reset the input so the same file can be re-selected after removal
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage() {
    set('images', [])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product.id, form)
        : await createProduct(form)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEdit ? 'Produto atualizado' : 'Produto criado')
        setOpen(false)
        if (!isEdit) setForm(EMPTY)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label="Edit product" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <><PlusCircle className="h-4 w-4 mr-1.5" />Adicionar Produto</>}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pf-name">Nome *</Label>
              <Input
                id="pf-name"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pf-desc">Descrição *</Label>
              <Textarea
                id="pf-desc"
                required
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            {/* Price + Stock */}
            <div className="space-y-1.5">
              <Label htmlFor="pf-price">Preço (€) *</Label>
              <Input
                id="pf-price"
                type="number"
                min={0}
                step={0.01}
                required
                value={form.price}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
              />
            </div>

            {isEdit ? (
              <div className="space-y-1.5">
                <Label>Stock atual</Label>
                <div className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm font-medium tabular-nums">
                  {form.stock} unidades
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  Ajusta na página de <span className="font-medium">Stock</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="pf-stock">Stock inicial</Label>
                <Input
                  id="pf-stock"
                  type="number"
                  min={0}
                  required
                  value={form.stock}
                  onChange={(e) => set('stock', parseInt(e.target.value) || 0)}
                />
              </div>
            )}

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="pf-cat">Categoria</Label>
              <select
                id="pf-cat"
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.category_id ?? ''}
                onChange={(e) => set('category_id', e.target.value || null)}
              >
                <option value="">— Nenhuma —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <Label htmlFor="pf-brand">Marca</Label>
              <Input
                id="pf-brand"
                value={form.brand ?? ''}
                onChange={(e) => set('brand', e.target.value || null)}
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <Label htmlFor="pf-sku">SKU</Label>
              <Input
                id="pf-sku"
                value={form.sku ?? ''}
                onChange={(e) => set('sku', e.target.value || null)}
              />
            </div>

            {/* Images */}
            <div className="col-span-2 space-y-1.5">
              <Label>Imagem do Produto</Label>

              {form.images[0] ? (
                <div className="flex items-start gap-3">
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-border shrink-0 group">
                    <Image
                      src={form.images[0]}
                      alt="Imagem do produto"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      aria-label="Remover imagem"
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-xs text-muted-foreground">Passa o rato sobre a imagem para remover.</p>
                    <label
                      htmlFor="pf-img-upload"
                      className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-primary hover:underline"
                    >
                      <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                      Substituir imagem
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="pf-img-upload"
                  className={[
                    'flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                    uploading
                      ? 'border-primary/40 bg-primary/5 cursor-wait'
                      : 'border-border hover:border-primary/60 hover:bg-muted/40',
                  ].join(' ')}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-primary mb-1" />
                      <span className="text-xs text-muted-foreground">A carregar…</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Clica para carregar (JPEG, PNG, WebP — máx 5 MB)</span>
                    </>
                  )}
                </label>
              )}

              <input
                ref={fileInputRef}
                id="pf-img-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={handleImageUpload}
              />
            </div>

            {/* Active */}
            <div className="col-span-2 flex items-center gap-2">
              <input
                id="pf-active"
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
              />
              <Label htmlFor="pf-active" className="cursor-pointer">Ativo (visível na loja)</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={pending || uploading}>
              {(pending || uploading) && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {isEdit ? 'Guardar alterações' : 'Criar produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
