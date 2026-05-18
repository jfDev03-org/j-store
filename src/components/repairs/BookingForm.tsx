'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { submitBooking } from '@/app/(store)/repairs/booking/actions'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

// Generated inside the component via useMemo — do not hoist to module level
// (avoids server/client Date mismatch during SSR)
function generateSlots(): Date[] {
  const slots: Date[] = []
  const today = new Date()
  for (let d = 1; d <= 14; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)
    const day = date.getDay() // 0=Sun, 6=Sat
    if (day === 0) continue // Skip Sunday
    for (let h = 9; h <= 17; h++) {
      const slot = new Date(date)
      slot.setHours(h, 0, 0, 0)
      slots.push(slot)
    }
  }
  return slots
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDate(d: Date) {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function formatTime(d: Date) {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default function BookingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    device_info: '',
    notes: '',
  })

  const TIME_SLOTS = useMemo(() => generateSlots(), [])

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // Group slots by date for display, filtered by week page
  const slotsByDate = TIME_SLOTS.reduce<Record<string, Date[]>>((acc, slot) => {
    const key = slot.toISOString().slice(0, 10)
    if (!acc[key]) acc[key] = []
    acc[key].push(slot)
    return acc
  }, {})

  const dateKeys = Object.keys(slotsByDate).sort()
  const pageSize = 5 // days per page
  const pagedKeys = dateKeys.slice(weekOffset * pageSize, (weekOffset + 1) * pageSize)
  const totalPages = Math.ceil(dateKeys.length / pageSize)

  const firstPageDate = pagedKeys.length > 0 ? slotsByDate[pagedKeys[0]][0] : null
  const lastPageDate = pagedKeys.length > 0 ? slotsByDate[pagedKeys[pagedKeys.length - 1]][0] : null
  const pageRangeLabel =
    firstPageDate && lastPageDate
      ? firstPageDate.getMonth() === lastPageDate.getMonth()
        ? `${firstPageDate.getDate()}–${lastPageDate.getDate()} ${MONTHS[lastPageDate.getMonth()]}`
        : `${firstPageDate.getDate()} ${MONTHS[firstPageDate.getMonth()]} – ${lastPageDate.getDate()} ${MONTHS[lastPageDate.getMonth()]}`
      : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot) {
      toast.error('Please select a time slot.')
      return
    }
    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      toast.error('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const result = await submitBooking({
        scheduled_at: selectedSlot.toISOString(),
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        device_info: form.device_info || undefined,
        notes: form.notes || undefined,
      })

      if (!result.success) {
        toast.error('error' in result ? result.error : 'An error occurred. Please try again.')
        return
      }

      toast.success("Booking confirmed! We'll send you a confirmation email shortly.")
      router.push('/')
    } catch {
      toast.error('Failed to book. Please try again or call us.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Calendar */}
      <fieldset>
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Select Date &amp; Time
        </legend>

        <div className="flex items-center justify-between mb-3 text-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset((p) => p - 1)}
            aria-label="Previous days"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-muted-foreground text-xs sm:text-sm">
            {pageRangeLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={weekOffset >= totalPages - 1}
            onClick={() => setWeekOffset((p) => p + 1)}
            aria-label="Next days"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {pagedKeys.map((dateKey) => (
            <div key={dateKey}>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                {formatDate(slotsByDate[dateKey][0])}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5" role="group" aria-label={`Time slots for ${formatDate(slotsByDate[dateKey][0])}`}>
                {slotsByDate[dateKey].map((slot) => {
                  const isSelected = selectedSlot?.toISOString() === slot.toISOString()
                  return (
                    <button
                      key={slot.toISOString()}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      aria-pressed={isSelected}
                      aria-label={`${formatDate(slot)} at ${formatTime(slot)}`}
                      className={[
                        'px-2 py-1.5 text-xs rounded-md border transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-input hover:bg-muted',
                      ].join(' ')}
                    >
                      {formatTime(slot)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedSlot && (
          <Badge className="mt-3 bg-green-600 text-white border-0">
            Selected: {formatDate(selectedSlot)} at {formatTime(selectedSlot)}
          </Badge>
        )}
      </fieldset>

      {/* Contact */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Your Details
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="b_name">Full Name <span aria-hidden="true" className="text-destructive">*</span></Label>
          <Input
            id="b_name"
            required
            placeholder="João Silva"
            value={form.customer_name}
            onChange={(e) => update('customer_name', e.target.value)}
            autoComplete="name"
            maxLength={100}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="b_email">Email <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="b_email"
              type="email"
              required
              placeholder="your@email.com"
              value={form.customer_email}
              onChange={(e) => update('customer_email', e.target.value)}
              autoComplete="email"
              maxLength={254}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b_phone">Phone <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="b_phone"
              type="tel"
              required
              placeholder="+351 000 000 000"
              value={form.customer_phone}
              onChange={(e) => update('customer_phone', e.target.value)}
              autoComplete="tel"
              maxLength={30}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b_device">Device (optional)</Label>
          <Input
            id="b_device"
            placeholder="e.g. iPhone 15 Pro — cracked screen"
            value={form.device_info}
            onChange={(e) => update('device_info', e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b_notes">Additional notes (optional)</Label>
          <Textarea
            id="b_notes"
            rows={3}
            placeholder="Anything else we should know?"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            maxLength={1000}
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Booking…' : 'Confirm Booking'}
      </Button>
    </form>
  )
}
