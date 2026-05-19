'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import StockAdjustDialog from '@/components/admin/StockAdjustDialog'

type StockRow = {
  product: { id: string; name: string; sku: string | null; is_active: boolean } | null
  quantity: number
  min_quantity: number | null
}

interface RealtimeStockTableProps {
  initialRows: StockRow[]
  storeId: string
}

export default function RealtimeStockTable({ initialRows, storeId }: RealtimeStockTableProps) {
  const [rows, setRows] = useState<StockRow[]>(initialRows)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to all changes on store_stock for this store.
    // Supabase Realtime sends the full new row on INSERT/UPDATE.
    const channel = supabase
      .channel(`stock:${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_stock',
          filter: `store_id=eq.${storeId}`,
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updated = payload.new as { product_id: string; quantity: number; min_quantity: number | null }

            // The realtime payload doesn't include joined data, so we re-fetch
            // the product name from the initial rows (already loaded).
            setRows((prev) => {
              const idx = prev.findIndex(
                (r) => r.product?.id === updated.product_id
              )
              if (idx === -1) return prev
              const next = [...prev]
              next[idx] = {
                ...next[idx],
                quantity: updated.quantity,
                min_quantity: updated.min_quantity,
              }
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId])

  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
            <p className="text-sm">Sem stock registado nesta loja.</p>
            <p className="text-xs mt-1">Usa o botão &quot;Adicionar ao Stock&quot; para começar.</p>
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="divide-y">
      {rows.map((row) => {
        const product = row.product
        if (!product) return null
        const isLow = row.quantity <= (row.min_quantity ?? 5)
        const isOut = row.quantity === 0

        return (
          <tr
            key={product.id}
            className={`transition-colors ${isLow ? 'bg-amber-50 hover:bg-amber-100/60' : 'hover:bg-muted/20'}`}
          >
            <td className="px-4 py-3">
              <p className="font-medium">{product.name}</p>
              {!product.is_active && (
                <span className="text-xs text-muted-foreground">(inativo)</span>
              )}
            </td>
            <td className="px-4 py-3 text-muted-foreground">{product.sku ?? '—'}</td>
            <td className="px-4 py-3">
              <span className={`font-semibold ${isOut ? 'text-destructive' : isLow ? 'text-amber-600' : ''}`}>
                {row.quantity}
              </span>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{row.min_quantity ?? 5}</td>
            <td className="px-4 py-3">
              {isOut ? (
                <Badge variant="destructive">Sem stock</Badge>
              ) : isLow ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                  <AlertTriangle className="h-3 w-3 mr-1" />Stock baixo
                </Badge>
              ) : (
                <Badge variant="secondary">OK</Badge>
              )}
            </td>
            <td className="px-4 py-3 text-right">
              <StockAdjustDialog
                productId={product.id}
                productName={product.name}
                currentQty={row.quantity}
              />
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}
