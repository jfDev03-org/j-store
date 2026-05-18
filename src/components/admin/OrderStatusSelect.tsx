'use client'

import StatusSelect from './StatusSelect'
import { updateOrderStatus } from '@/app/admin/(protected)/orders/actions'
import type { OrderRow } from '@/types/database'

const VALID_TRANSITIONS: Record<OrderRow['status'], OrderRow['status'][]> = {
  pending:   ['paid', 'cancelled'],
  paid:      ['shipped', 'cancelled'],
  shipped:   ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-50 border-yellow-300 text-yellow-800',
  paid:      'bg-blue-50 border-blue-300 text-blue-800',
  shipped:   'bg-purple-50 border-purple-300 text-purple-800',
  delivered: 'bg-green-50 border-green-300 text-green-800',
  cancelled: 'bg-red-50 border-red-300 text-red-800',
}

export default function OrderStatusSelect({
  id,
  current,
}: {
  id: string
  current: OrderRow['status']
}) {
  return (
    <StatusSelect
      id={id}
      current={current}
      transitions={VALID_TRANSITIONS}
      styles={STATUS_STYLES}
      updateFn={updateOrderStatus}
    />
  )
}
