import { Resend } from 'resend'
import type { OrderRow } from '@/types/database'
import type { RepairRequestRow } from '@/types/database'

const STORE_NAME = 'JStore'
const SUPPORT_EMAIL = 'hello@j-store.pt'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function getFrom() {
  return process.env.RESEND_FROM_EMAIL!
}

// ─── Order confirmation ───────────────────────────────────────────────────────

export async function sendOrderConfirmation(order: OrderRow) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.product_name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">€${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('')

  const { line1, line2, city, postal_code, country } = order.shipping_address
  const addressLines = [line1, line2, `${city} ${postal_code}`, country]
    .filter(Boolean)
    .join(', ')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#1e3a5f;padding:28px 32px">
      <h1 style="color:#fff;margin:0;font-size:22px">${STORE_NAME}</h1>
      <p style="color:#93c5fd;margin:4px 0 0;font-size:14px">Order Confirmation</p>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 16px;color:#374151">Hi <strong>${order.customer_name}</strong>,</p>
      <p style="margin:0 0 24px;color:#374151">
        Thank you for your order! We&apos;ve received your payment and will prepare your items for dispatch.
      </p>

      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Order reference</p>
        <p style="margin:0;font-weight:600;color:#111827;font-size:15px">#${order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">Item</th>
            <th style="text-align:center;padding:8px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">Qty</th>
            <th style="text-align:right;padding:8px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e5e7eb">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0 4px;text-align:right;color:#6b7280;font-size:13px">Subtotal</td>
            <td style="padding:12px 0 4px;text-align:right;color:#374151">€${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 0;text-align:right;color:#6b7280;font-size:13px">Shipping</td>
            <td style="padding:4px 0;text-align:right;color:#374151">${order.shipping === 0 ? 'Free' : `€${order.shipping.toFixed(2)}`}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 0 0;text-align:right;font-weight:700;border-top:2px solid #e5e7eb">Total</td>
            <td style="padding:8px 0 0;text-align:right;font-weight:700;border-top:2px solid #e5e7eb">€${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Shipping to</p>
        <p style="margin:0;color:#374151;font-size:14px">${addressLines}</p>
      </div>

      <p style="margin:0;color:#6b7280;font-size:13px">
        Questions? Reply to this email or contact us at
        <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563eb">${SUPPORT_EMAIL}</a>.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">&copy; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

  return getResend().emails.send({
    from: getFrom(),
    to: [order.customer_email],
    subject: `Your ${STORE_NAME} order #${order.id.slice(0, 8).toUpperCase()} is confirmed`,
    html,
    replyTo: SUPPORT_EMAIL,
  })
}

// ─── Repair status update ─────────────────────────────────────────────────────

const REPAIR_STATUS_LABELS: Record<RepairRequestRow['status'], string> = {
  pending: 'Received',
  quoted: 'Quoted',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const REPAIR_STATUS_MESSAGES: Record<RepairRequestRow['status'], string> = {
  pending: 'We&apos;ve received your repair request and will be in touch shortly.',
  quoted: 'We&apos;ve assessed your device and sent you a quote. Please reply to approve or decline.',
  approved: 'Great news! Your repair has been approved and will be scheduled soon.',
  in_progress: 'Your device is currently being repaired by our technicians.',
  completed: 'Your device has been repaired and is ready for collection.',
  cancelled: 'Your repair request has been cancelled. If this was unexpected, please contact us.',
}

export async function sendRepairStatusUpdate(
  repair: RepairRequestRow,
  newStatus: RepairRequestRow['status']
) {
  const label = REPAIR_STATUS_LABELS[newStatus] ?? newStatus
  const message = REPAIR_STATUS_MESSAGES[newStatus] ?? ''

  const statusColor: Record<RepairRequestRow['status'], string> = {
    pending: '#6b7280',
    quoted: '#2563eb',
    approved: '#059669',
    in_progress: '#d97706',
    completed: '#16a34a',
    cancelled: '#dc2626',
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#1e3a5f;padding:28px 32px">
      <h1 style="color:#fff;margin:0;font-size:22px">${STORE_NAME}</h1>
      <p style="color:#93c5fd;margin:4px 0 0;font-size:14px">Repair Update</p>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 16px;color:#374151">Hi <strong>${repair.customer_name}</strong>,</p>
      <p style="margin:0 0 24px;color:#374151">${message}</p>

      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Status</p>
        <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${statusColor[newStatus]}20;color:${statusColor[newStatus]};font-weight:600;font-size:14px">${label}</span>
      </div>

      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Device</p>
        <p style="margin:0;color:#374151;font-size:14px">${repair.device_brand} ${repair.device_model}</p>
      </div>

      ${repair.quoted_price !== null ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#16a34a;text-transform:uppercase;letter-spacing:.05em">Quoted price</p>
        <p style="margin:0;font-weight:700;color:#15803d;font-size:18px">€${repair.quoted_price.toFixed(2)}</p>
      </div>` : ''}

      <p style="margin:0;color:#6b7280;font-size:13px">
        Questions? Contact us at
        <a href="mailto:${SUPPORT_EMAIL}" style="color:#2563eb">${SUPPORT_EMAIL}</a>.
      </p>
    </div>
  </div>
</body>
</html>`

  return getResend().emails.send({
    from: getFrom(),
    to: [repair.customer_email],
    subject: `Repair update: ${repair.device_brand} ${repair.device_model} — ${label}`,
    html,
    replyTo: SUPPORT_EMAIL,
  })
}

// ─── Low stock alert ──────────────────────────────────────────────────────────

type LowStockItem = {
  storeName: string
  productName: string
  sku: string | null
  quantity: number
  minQuantity: number
}

export async function sendLowStockAlert(items: LowStockItem[]) {
  const rowsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${item.productName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280">${item.sku ?? '—'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">${item.storeName}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:600;color:${item.quantity === 0 ? '#dc2626' : '#d97706'}">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;color:#6b7280">${item.minQuantity}</td>
      </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#92400e;padding:24px 32px">
      <h1 style="color:#fff;margin:0;font-size:20px">⚠️ Low Stock Alert — ${STORE_NAME}</h1>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 20px;color:#374151">
        <strong>${items.length} product${items.length === 1 ? '' : 's'}</strong> ${items.length === 1 ? 'is' : 'are'} at or below minimum stock level.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#fef3c7">
            <th style="text-align:left;padding:10px 12px;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em">Product</th>
            <th style="text-align:left;padding:10px 12px;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em">SKU</th>
            <th style="text-align:left;padding:10px 12px;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em">Store</th>
            <th style="text-align:center;padding:10px 12px;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em">Stock</th>
            <th style="text-align:center;padding:10px 12px;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em">Min</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="margin-top:24px">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://jstore.pt'}/admin/stock"
           style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          View Stock Panel
        </a>
      </div>
    </div>
  </div>
</body>
</html>`

  return getResend().emails.send({
    from: getFrom(),
    to: [SUPPORT_EMAIL],
    subject: `⚠️ Low stock alert: ${items.length} product${items.length === 1 ? '' : 's'} need restocking`,
    html,
  })
}
