'use client'

import StatusSelect from './StatusSelect'
import { updateRepairStatus } from '@/app/admin/(protected)/repairs/actions'
import type { RepairRequestRow } from '@/types/database'

const VALID_TRANSITIONS: Record<RepairRequestRow['status'], RepairRequestRow['status'][]> = {
  pending:     ['quoted', 'cancelled'],
  quoted:      ['approved', 'cancelled'],
  approved:    ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
}

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-yellow-50 border-yellow-300 text-yellow-800',
  quoted:      'bg-blue-50 border-blue-300 text-blue-800',
  approved:    'bg-indigo-50 border-indigo-300 text-indigo-800',
  in_progress: 'bg-orange-50 border-orange-300 text-orange-800',
  completed:   'bg-green-50 border-green-300 text-green-800',
  cancelled:   'bg-red-50 border-red-300 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'In Progress',
}

function labelFor(s: string): string {
  return STATUS_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1)
}

export default function RepairStatusSelect({
  id,
  current,
}: {
  id: string
  current: RepairRequestRow['status']
}) {
  return (
    <StatusSelect
      id={id}
      current={current}
      transitions={VALID_TRANSITIONS}
      styles={STATUS_STYLES}
      labelFn={labelFor}
      updateFn={updateRepairStatus}
    />
  )
}
