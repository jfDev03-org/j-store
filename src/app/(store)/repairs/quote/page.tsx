import QuoteContent from './QuoteContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get a Repair Quote',
  description: "Request a free repair quote. Tell us about your device and issue and we'll get back to you within 24 hours.",
}

export default function QuotePage() {
  return <QuoteContent />
}
