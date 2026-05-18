import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been placed successfully.',
  robots: { index: false },
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" aria-hidden="true" />
      <h1 className="text-3xl font-bold mb-3">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you for your purchase. A confirmation email will be sent to you shortly with your order details.
      </p>
      <p className="text-muted-foreground mb-8">
        If you have any questions, feel free to <Link href="/contact" className="text-primary underline">contact us</Link>.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild size="lg">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
