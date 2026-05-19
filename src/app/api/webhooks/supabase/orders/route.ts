import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import type { OrderRow } from '@/types/database'

const STORE_NAME = 'JStore'
const SUPPORT_EMAIL = 'hello@jstore.pt'

// Supabase Database Webhook for order status changes.
// Configure in Supabase Dashboard → Database → Webhooks:
//   - Table: orders, Events: UPDATE
//   - URL: https://your-domain.com/api/webhooks/supabase/orders
//   - HTTP Headers: Authorization: Bearer <SUPABASE_WEBHOOK_SECRET>
export async function POST(req: NextRequest) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET

  if (secret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let payload: { type: string; record: OrderRow; old_record: OrderRow }

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, record, old_record } = payload

  if (type !== 'UPDATE' || !record || !old_record) {
    return NextResponse.json({ ok: true, skipped: 'not an update' })
  }

  if (record.status === old_record.status) {
    return NextResponse.json({ ok: true, skipped: 'status unchanged' })
  }

  // 'paid' is already handled in the Stripe webhook — skip to avoid duplicates.
  const notifiableStatuses: OrderRow['status'][] = ['shipped', 'delivered', 'cancelled']
  if (!notifiableStatuses.includes(record.status)) {
    return NextResponse.json({ ok: true, skipped: `status '${record.status}' not notifiable` })
  }

  // Re-fetch for guaranteed fresh data
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', record.id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  try {
    await sendOrderStatusEmail(order)
    return NextResponse.json({ ok: true, status: order.status })
  } catch (err) {
    console.error('Order status webhook email failed:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}

const STATUS_SUBJECT: Partial<Record<OrderRow['status'], string>> = {
  shipped: 'Your order is on its way!',
  delivered: 'Your order has been delivered',
  cancelled: 'Your order has been cancelled',
}

const STATUS_MESSAGE: Partial<Record<OrderRow['status'], string>> = {
  shipped: 'Great news! Your order has been dispatched and is on its way to you.',
  delivered: 'Your order has been delivered. We hope you enjoy your purchase!',
  cancelled: 'Your order has been cancelled. If you have questions, please contact us.',
}

async function sendOrderStatusEmail(order: OrderRow) {
  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1)
  const subject = STATUS_SUBJECT[order.status] ?? `Order update: ${statusLabel}`
  const message = STATUS_MESSAGE[order.status] ?? `Your order status is now: ${statusLabel}.`
  const orderId = order.id.slice(0, 8).toUpperCase()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#1e3a5f;padding:28px 32px">
      <h1 style="color:#fff;margin:0;font-size:22px">${STORE_NAME}</h1>
      <p style="color:#93c5fd;margin:4px 0 0;font-size:14px">Order Update</p>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 16px;color:#374151">Hi <strong>${order.customer_name}</strong>,</p>
      <p style="margin:0 0 24px;color:#374151">${message}</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Order reference</p>
        <p style="margin:0;font-weight:600;color:#111827">#${orderId}</p>
      </div>
      <p style="margin:0;color:#6b7280;font-size:13px">
        Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563eb">${SUPPORT_EMAIL}</a>.
      </p>
    </div>
  </div>
</body>
</html>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: [order.customer_email],
    subject: `${STORE_NAME}: ${subject} — #${orderId}`,
    html,
    replyTo: SUPPORT_EMAIL,
  })
}
