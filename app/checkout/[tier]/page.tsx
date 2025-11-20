'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Loader2 } from 'lucide-react'
import { TIER_PRICING, TIER_FEATURES_DISPLAY, SubscriptionTier } from '@/lib/subscription/tiers'

interface CheckoutPageProps {
  params: Promise<{
    tier: string
  }>
}

export default async function CheckoutPage({
  params,
}: {
  params: { tier: string };
}) {
  const { tier: tierParam } = params
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const tier = tierParam as SubscriptionTier

  if (!['pro', 'premium'].includes(tier)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Plan</h1>
          <p className="text-muted-foreground mb-4">The selected plan is not available.</p>
          <Link href="/pricing">
            <Button>View Available Plans</Button>
          </Link>
        </div>
      </div>
    )
  }

  const pricing = TIER_PRICING[tier]
  const features = TIER_FEATURES_DISPLAY[tier]

  const handleCheckout = async (provider: 'stripe' | 'polar') => {
    setIsLoading(true)
    setSelectedProvider(provider)

    try {
      if (provider === 'polar') {
        // Call Polar.sh checkout API
        const response = await fetch('/api/checkout/polar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create checkout session')
        }

        const { url } = await response.json()
        window.location.href = url // Redirect to Polar.sh checkout
      } else {
        // TODO: Implement Stripe checkout
        alert('Stripe checkout not yet implemented. Please use Polar.sh for now.')
        setIsLoading(false)
        setSelectedProvider(null)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
      setSelectedProvider(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="outline">
              Checkout
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              Complete Your {tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription
            </h1>
            <p className="text-muted-foreground">
              Choose your preferred payment method below
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    tier === 'pro' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                </CardTitle>
                <CardDescription>
                  {tier === 'pro'
                    ? 'Best for serious learners'
                    : 'Maximum features for peak performance'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold">
                    ${pricing.price}
                    <span className="text-lg text-muted-foreground">/{pricing.period}</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>

              {/* Polar.sh Option */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider === 'polar' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => !isLoading && setSelectedProvider('polar')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Polar.sh</h4>
                        <p className="text-sm text-muted-foreground">
                          Modern payments infrastructure
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedProvider === 'polar'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedProvider === 'polar' && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe Option */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md opacity-50 ${
                  selectedProvider === 'stripe' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => !isLoading && setSelectedProvider('stripe')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Stripe</h4>
                        <p className="text-sm text-muted-foreground">
                          Coming soon
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedProvider === 'stripe'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedProvider === 'stripe' && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Button */}
              <Button
                onClick={() => selectedProvider && handleCheckout(selectedProvider as 'stripe' | 'polar')}
                disabled={!selectedProvider || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating checkout...
                  </>
                ) : (
                  `Subscribe with ${selectedProvider === 'polar' ? 'Polar.sh' : 'Stripe'}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By subscribing, you agree to our{' '}
                <Link href="/legal/terms" className="underline hover:no-underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/legal/privacy" className="underline hover:no-underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Pricing */}
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button variant="outline">
                ← Back to Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}