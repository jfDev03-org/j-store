'use client'

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'

type Props = {
  id: string
  current: string
  transitions: Record<string, string[]>
  styles: Record<string, string>
  labelFn?: (s: string) => string
  updateFn: (id: string, status: string) => Promise<{ error?: string }>
}

export default function StatusSelect({
  id,
  current,
  transitions,
  styles,
  labelFn,
  updateFn,
}: Props) {
  const [value, setValue] = useState(current)
  const [pending, startTransition] = useTransition()

  useEffect(() => setValue(current), [current])

  const allowedNext = transitions[value] ?? []
  const options = [value, ...allowedNext]

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    const prev = value
    setValue(next)
    startTransition(async () => {
      const result = await updateFn(id, next)
      if (result.error) {
        setValue(prev)
        toast.error(result.error)
      } else {
        toast.success('Status updated')
      }
    })
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={pending || allowedNext.length === 0}
      aria-busy={pending}
      style={{ opacity: pending ? 0.6 : 1 }}
      className={`rounded border px-2 py-0.5 text-xs font-medium capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${styles[value] ?? 'bg-gray-50 border-gray-300'}`}
    >
      {options.map((s) => (
        <option key={s} value={s} className="bg-white text-gray-900">
          {labelFn ? labelFn(s) : s}
        </option>
      ))}
    </select>
  )
}
