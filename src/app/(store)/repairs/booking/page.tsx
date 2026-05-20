import BookingContent from './BookingContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Repair Appointment',
  description: "Book your phone repair appointment online. Choose a convenient time slot and we'll take care of the rest.",
}

export default function BookingPage() {
  return <BookingContent />
}
