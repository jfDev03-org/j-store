'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'

export async function createStore(_prev: unknown, formData: FormData) {
  const authError = await guardAdmin()
  if (authError) return authError

  const name = (formData.get('name') as string)?.trim()
  const location = (formData.get('location') as string)?.trim() || null

  if (!name) return { error: 'Nome é obrigatório' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('stores').insert({ name, location, is_active: true })
  if (error) return { error: error.message }

  revalidatePath('/admin/stores')
  return { success: true }
}

export async function updateStore(id: string, _prev: unknown, formData: FormData) {
  const authError = await guardAdmin()
  if (authError) return authError

  const name = (formData.get('name') as string)?.trim()
  const location = (formData.get('location') as string)?.trim() || null

  if (!name) return { error: 'Nome é obrigatório' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('stores').update({ name, location }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/stores')
  return { success: true }
}

export async function toggleStoreActive(id: string, currentActive: boolean) {
  const authError = await guardAdmin()
  if (authError) return authError

  const supabase = createAdminClient()

  if (currentActive) {
    const { count } = await supabase
      .from('stores')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
    if ((count ?? 0) <= 1) return { error: 'Não podes desativar a última loja ativa' }
  }

  const { error } = await supabase.from('stores').update({ is_active: !currentActive }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/stores')
  return { success: true }
}
