'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Message sent! We\'ll get back to you soon.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try emailing us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="ct_name">Name <span aria-hidden="true" className="text-destructive">*</span></Label>
        <Input id="ct_name" required value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" placeholder="João Silva" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ct_email">Email <span aria-hidden="true" className="text-destructive">*</span></Label>
        <Input id="ct_email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" placeholder="your@email.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ct_subject">Subject</Label>
        <Input id="ct_subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="How can we help?" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ct_message">Message <span aria-hidden="true" className="text-destructive">*</span></Label>
        <Textarea id="ct_message" required rows={5} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Tell us what you need…" />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
