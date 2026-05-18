'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'
import { getDefaultStoreId } from '@/lib/store'
import { slugify } from '@/lib/utils/format'

export type ProductFormData = {
  name: string
  description: string
  price: number
  stock: number
  category_id: string | null
  brand: string | null
  sku: string | null
  images: string[]
  is_active: boolean
}

export async function createProduct(data: ProductFormData) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()
  const storeId = await getDefaultStoreId()
  const baseSlug = slugify(data.name)

  async function insertWithSlug(slug: string) {
    return supabase.from('products').insert({ ...data, slug }).select('id').single()
  }

  let { data: product, error } = await insertWithSlug(baseSlug)
  if (error?.code === '23505') {
    // Unique slug conflict — retry once with a timestamp suffix
    ;({ data: product, error } = await insertWithSlug(`${baseSlug}-${Date.now().toString(36)}`))
  }
  if (error || !product) return { error: error?.message ?? 'Failed to create product' }

  // Sync initial stock into store_stock
  await supabase.from('store_stock').upsert({
    store_id: storeId,
    product_id: product.id,
    quantity: data.stock,
    min_quantity: 5,
  })

  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()

  const { error } = await supabase.from('products').update({ ...data }).eq('id', id)
  if (error) return { error: error.message }

  // Stock is intentionally NOT synced here — changes to store_stock must go through
  // StockAdjustDialog to preserve the stock_movements audit trail.

  revalidatePath('/admin/products')
  return { success: true }
}

/** Soft-delete: hides the product without breaking order history. */
export async function deleteProduct(id: string) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}
