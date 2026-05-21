import ContactContent from './ContactContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with JStore. Find our address, phone number, opening hours, or send us a message.',
}

export default function ContactPage() {
  return <ContactContent />
}
