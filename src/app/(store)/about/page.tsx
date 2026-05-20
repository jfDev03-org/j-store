import AboutContent from './AboutContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about JStore — our story, team, and commitment to quality phone repairs and accessories.',
}

export default function AboutPage() {
  return <AboutContent />
}
