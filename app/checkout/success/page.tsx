'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'pending' | 'active' | 'error'>('pending')

  const provider = searchParams.get('provider')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // In a real implementation, you might want to verify the payment status
    // For now, we'll just simulate a successful subscription activation
    const checkSubscriptionStatus = async () => {
      try {
        // Simulate API call to check subscription status
        await new Promise(resolve => setTimeout(resolve, 2000))
        setSubscriptionStatus('active')
      } catch (error) {
        console.error('Failed to check subscription status:', error)
        setSubscriptionStatus('error')
      } finally {
        setIsLoading(false)
      }
    }

    if (provider === 'polar' && sessionId) {
      checkSubscriptionStatus()
    } else {
      setIsLoading(false)
    }
  }, [provider, sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Processing Your Subscription</h2>
            <p className="text-muted-foreground">
              Please wait while we activate your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (subscriptionStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Payment Processing</h2>
            <p className="text-muted-foreground mb-6">
              There was an issue processing your subscription. Please contact support if this persists.
            </p>
            <div className="space-y-2">
              <Link href="/contact">
                <Button className="w-full">
                  Contact Support
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full">
                  Back to Pricing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <Badge className="mb-4" variant="outline">
                Payment Successful
              </Badge>
              <CardTitle className="text-2xl mb-2">
                Welcome to PTE Practice Platform!
              </CardTitle>
              <CardDescription>
                Your subscription has been activated successfully. You now have access to all premium features.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* What's Next */}
              <div>
                <h3 className="font-semibold mb-3">What's Next?</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Access unlimited mock tests and practice questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Get detailed analytics and study recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>Enjoy priority AI scoring and feedback</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/pte/dashboard" className="flex-1">
                  <Button className="w-full">
                    Start Practicing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pte/mock-tests" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Take a Mock Test
                  </Button>
                </Link>
              </div>

              {/* Support Info */}
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Need help getting started? Check out our{' '}
                  <Link href="/blog" className="underline hover:no-underline">
                    tutorial guides
                  </Link>{' '}
                  or{' '}
                  <Link href="/contact" className="underline hover:no-underline">
                    contact support
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}