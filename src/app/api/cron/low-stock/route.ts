import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendLowStockAlert } from '@/lib/email'

// This route is called daily by Vercel Cron (configured in vercel.json).
// Vercel automatically sends the CRON_SECRET in the Authorization header.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch all stock rows and filter client-side (PostgREST doesn't support
  // column-to-column comparisons with the JS client filter API).
  const { data: allStock, error } = await supabase
    .from('store_stock')
    .select(`
      quantity,
      min_quantity,
      product:products!product_id(name, sku),
      store:stores!store_id(name)
    `)

  if (error) {
    console.error('Low stock cron: query failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const lowStock = (allStock ?? []).filter(
    (row) => row.quantity <= (row.min_quantity ?? 5)
  )

  if (lowStock.length === 0) {
    return NextResponse.json({ ok: true, message: 'No low-stock items.' })
  }

  const items = lowStock.map((row) => {
    const product = row.product as unknown as { name: string; sku: string | null } | null
    const store = row.store as unknown as { name: string } | null
    return {
      productName: product?.name ?? 'Unknown product',
      sku: product?.sku ?? null,
      storeName: store?.name ?? 'Unknown store',
      quantity: row.quantity,
      minQuantity: row.min_quantity ?? 5,
    }
  })

  try {
    await sendLowStockAlert(items)
    return NextResponse.json({ ok: true, itemsAlerted: items.length })
  } catch (err) {
    console.error('Low stock cron: email failed', err)
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
  }
}
