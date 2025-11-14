import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Tier = {
  name: string
  price: string
  period?: string
  highlight?: boolean
  features: string[]
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: [
      '1 full mock test',
      'Limited daily AI scoring',
      'Core practice questions',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    highlight: true,
    features: [
      'Unlimited AI scoring',
      'All question types',
      'Detailed analytics',
    ],
  },
  {
    name: 'Premium',
    price: '$39',
    period: '/mo',
    features: [
      'Priority scoring',
      'Personalized study plan',
      'Advanced insights',
    ],
  },
]

export default function PricingPreview() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple pricing for every learner
        </h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
          Start free. Upgrade anytime. Visit the full pricing page for details.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card
            key={tier.name}
            className={`h-full transition-shadow ${tier.highlight ? 'border-primary/60 shadow-md' : ''}`}
            aria-label={`${tier.name} pricing tier`}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
              <div className="mt-2 text-4xl font-bold">
                <span>{tier.price}</span>
                {tier.period ? (
                  <span className="text-muted-foreground ml-1 text-base font-normal">{tier.period}</span>
                ) : null}
              </div>
              <CardDescription>
                {tier.name === 'Free' && 'Try the platform'}
                {tier.name === 'Pro' && 'Most popular choice'}
                {tier.name === 'Premium' && 'Maximum features'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm">• {f}</li>
                ))}
              </ul>
              <Button asChild size="lg" className={tier.highlight ? 'bg-primary text-primary-foreground' : ''} aria-label="Go to pricing">
                <Link href="/pricing">View full pricing</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
