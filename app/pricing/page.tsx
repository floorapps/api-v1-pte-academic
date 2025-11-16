import Link from 'next/link'
import { Check, Crown, Star, X, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  SubscriptionTier,
  TIER_FEATURES_DISPLAY,
  TIER_PRICING,
} from '@/lib/subscription/tiers'

export const metadata = {
  title: 'Pricing - PTE Practice Platform',
  description: 'Choose the perfect plan for your PTE preparation',
}

const tierIcons = {
  [SubscriptionTier.FREE]: Star,
  [SubscriptionTier.PRO]: Zap,
  [SubscriptionTier.PREMIUM]: Crown,
}

const tierColors = {
  [SubscriptionTier.FREE]: 'from-gray-500 to-gray-600',
  [SubscriptionTier.PRO]: 'from-blue-500 to-purple-600',
  [SubscriptionTier.PREMIUM]: 'from-purple-600 to-pink-600',
}

export default function PricingPage() {
  const tiers = [
    SubscriptionTier.FREE,
    SubscriptionTier.PRO,
    SubscriptionTier.PREMIUM,
  ]

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4" variant="outline">
          Pricing
        </Badge>
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">
          Choose Your Perfect Plan
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
          Start with our free plan or unlock unlimited access with Pro and
          Premium tiers
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {tiers.map((tier) => {
            const pricing = TIER_PRICING[tier]
            const features = TIER_FEATURES_DISPLAY[tier]
            const Icon = tierIcons[tier]
            const gradientColor = tierColors[tier]
            const isPopular = tier === SubscriptionTier.PRO

            return (
              <Card
                key={tier}
                className={`relative overflow-hidden transition-all hover:shadow-xl ${
                  isPopular ? 'border-primary scale-105 border-2' : ''
                }`}
              >
                {isPopular && (
                  <div className="bg-primary text-primary-foreground absolute top-0 right-0 rounded-bl-lg px-3 py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <CardHeader className="pb-8 text-center">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${gradientColor} mx-auto mb-4`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <CardTitle className="mb-2 text-2xl font-bold capitalize">
                    {tier}
                  </CardTitle>

                  <div className="my-4 text-4xl font-bold">
                    {pricing.price === 0 ? (
                      <span>Free</span>
                    ) : (
                      <>
                        <span className="text-5xl">${pricing.price}</span>
                        <span className="text-muted-foreground text-lg">
                          /{pricing.period}
                        </span>
                      </>
                    )}
                  </div>

                  <CardDescription>
                    {tier === SubscriptionTier.FREE &&
                      'Perfect for trying out the platform'}
                    {tier === SubscriptionTier.PRO &&
                      'Best for serious learners'}
                    {tier === SubscriptionTier.PREMIUM &&
                      'Maximum features for peak performance'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="mb-8 space-y-3">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full ${
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : ''
                    }`}
                    variant={
                      tier === SubscriptionTier.FREE ? 'outline' : 'default'
                    }
                    size="lg"
                  >
                    <Link
                      href={
                        tier === SubscriptionTier.FREE
                          ? '/sign-up'
                          : `/checkout/${tier}`
                      }
                    >
                      {tier === SubscriptionTier.FREE
                        ? 'Get Started'
                        : 'Upgrade Now'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Detailed Feature Comparison
          </h2>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-semibold">Feature</th>
                      <th className="p-4 text-center font-semibold">Free</th>
                      <th className="bg-blue-50 p-4 text-center font-semibold dark:bg-blue-950">
                        Pro
                      </th>
                      <th className="p-4 text-center font-semibold">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">Mock Tests</td>
                      <td className="p-4 text-center">1</td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        200
                      </td>
                      <td className="p-4 text-center">200</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Practice Questions</td>
                      <td className="p-4 text-center">Limited</td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        Unlimited
                      </td>
                      <td className="p-4 text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">AI Scoring (per day)</td>
                      <td className="p-4 text-center">10 credits</td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        Unlimited
                      </td>
                      <td className="p-4 text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Test History</td>
                      <td className="p-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Detailed Analytics</td>
                      <td className="p-4 text-center">
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      </td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Personalized Study Plan</td>
                      <td className="p-4 text-center">
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      </td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Priority AI Scoring</td>
                      <td className="p-4 text-center">
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      </td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Teacher Review</td>
                      <td className="p-4 text-center">
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      </td>
                      <td className="bg-blue-50 p-4 text-center dark:bg-blue-950">
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      </td>
                      <td className="p-4 text-center">
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I try before I buy?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! Start with our free plan which includes 1 full mock test
                  and limited practice questions. No credit card required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens when I run out of AI credits?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Free users get 10 AI scoring credits per day. You can still
                  practice, but you won't receive AI feedback until your credits
                  reset at midnight. Pro and Premium users get unlimited AI
                  scoring.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll
                  continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  How are the mock tests different from practice?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mock tests simulate the real PTE Academic exam with strict
                  timing, all sections, and authentic scoring. Practice mode
                  lets you focus on specific question types at your own pace.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
