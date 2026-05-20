'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { submitQuote } from '@/app/(store)/repairs/quote/actions'
import { Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'

const DEVICE_BRANDS = ['Apple iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus', 'Oppo', 'Motorola', 'Nokia', 'Other']

export default function QuoteForm() {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    device_brand: '',
    device_model: '',
    issue_description: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
  })

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.device_brand || !form.device_model || !form.issue_description || !form.customer_name || !form.customer_email || !form.customer_phone) {
      toast.error(t.quote.errorFillFields)
      return
    }

    setLoading(true)
    try {
      const result = await submitQuote(form)
      if (!result.success) {
        toast.error('error' in result ? result.error : t.quote.errorFailed)
        return
      }
      setSubmitted(true)
    } catch {
      toast.error(t.quote.errorFailed)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-4">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto" aria-hidden="true" />
        <h2 className="text-xl font-bold">{t.quote.successTitle}</h2>
        <p className="text-muted-foreground">
          {t.quote.successMsg}{' '}
          <span className="font-medium text-foreground">{form.customer_email}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild>
            <Link href="/repairs/booking">{t.quote.successBookButton}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">{t.quote.successHomeButton}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t.quote.deviceInfoLegend}
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="device_brand">{t.quote.brandLabel} <span aria-hidden="true" className="text-destructive">*</span></Label>
            <select
              id="device_brand"
              required
              value={form.device_brand}
              onChange={(e) => update('device_brand', e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-required="true"
            >
              <option value="">{t.quote.brandPlaceholder}</option>
              {DEVICE_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="device_model">{t.quote.modelLabel} <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="device_model"
              placeholder="e.g. iPhone 15, Galaxy S23"
              required
              value={form.device_model}
              onChange={(e) => update('device_model', e.target.value)}
              aria-required="true"
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="issue_description">{t.quote.issueLabel} <span aria-hidden="true" className="text-destructive">*</span></Label>
          <Textarea
            id="issue_description"
            placeholder={t.quote.issuePlaceholder}
            required
            rows={4}
            value={form.issue_description}
            onChange={(e) => update('issue_description', e.target.value)}
            aria-required="true"
            maxLength={2000}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t.quote.contactLegend}
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="customer_name">{t.quote.fullName} <span aria-hidden="true" className="text-destructive">*</span></Label>
          <Input
            id="customer_name"
            placeholder="João Silva"
            required
            value={form.customer_name}
            onChange={(e) => update('customer_name', e.target.value)}
            autoComplete="name"
            aria-required="true"
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer_email">{t.quote.email} <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="customer_email"
              type="email"
              placeholder="your@email.com"
              required
              value={form.customer_email}
              onChange={(e) => update('customer_email', e.target.value)}
              autoComplete="email"
              aria-required="true"
              maxLength={254}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer_phone">{t.quote.phone} <span aria-hidden="true" className="text-destructive">*</span></Label>
            <Input
              id="customer_phone"
              type="tel"
              placeholder="+351 000 000 000"
              required
              value={form.customer_phone}
              onChange={(e) => update('customer_phone', e.target.value)}
              autoComplete="tel"
              aria-required="true"
              maxLength={30}
            />
          </div>
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? t.quote.submitting : t.quote.submitButton}
      </Button>
    </form>
  )
}
