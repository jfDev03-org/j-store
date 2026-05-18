'use server'

import { createClient } from '@/lib/supabase/server'
import { guardAdmin } from '@/lib/admin-guard'

export async function updateEmail(_prev: unknown, formData: FormData) {
  const authError = await guardAdmin()
  if (authError) return authError

  const email = (formData.get('email') as string)?.trim()
  if (!email) return { error: 'Email é obrigatório' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email })
  if (error) return { error: error.message }

  return { success: true, message: 'Verifica o teu novo email para confirmar a alteração.' }
}

export async function updatePassword(_prev: unknown, formData: FormData) {
  const authError = await guardAdmin()
  if (authError) return authError

  const currentPassword = formData.get('current_password') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!currentPassword) return { error: 'A password atual é obrigatória' }
  if (!password || password.length < 8) return { error: 'A nova password deve ter pelo menos 8 caracteres' }
  if (password !== confirm) return { error: 'As passwords não coincidem' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Sessão inválida' }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { error: 'A password atual está incorreta' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  return { success: true, message: 'Password atualizada com sucesso.' }
}
