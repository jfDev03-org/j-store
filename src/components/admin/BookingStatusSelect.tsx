'use client'

import StatusSelect from './StatusSelect'
import { updateBookingStatus } from '@/app/admin/(protected)/bookings/actions'
import type { BookingRow } from '@/types/database'

const VALID_TRANSITIONS: Record<BookingRow['status'], BookingRow['status'][]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-50 border-yellow-300 text-yellow-800',
  confirmed: 'bg-green-50 border-green-300 text-green-800',
  cancelled: 'bg-red-50 border-red-300 text-red-800',
  completed: 'bg-gray-50 border-gray-300 text-gray-700',
}

export default function BookingStatusSelect({
  id,
  current,
}: {
  id: string
  current: BookingRow['status']
}) {
  return (
    <StatusSelect
      id={id}
      current={current}
      transitions={VALID_TRANSITIONS}
      styles={STATUS_STYLES}
      updateFn={updateBookingStatus}
    />
  )
}
