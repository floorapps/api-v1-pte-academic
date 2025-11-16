import { NextRequest, NextResponse } from 'next/server'
import { Polar } from '@polar-sh/sdk'
import { db } from '@/lib/db/drizzle'
import { userSubscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Webhook signature verification
async function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  try {
    // Polar.sh uses standard webhook signatures
    // In production, implement proper signature verification
    // For now, we'll trust the requests (add proper verification later)
    return true
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('polar-signature') || ''

    // TODO: Add webhook secret verification in production
    // const isValidSignature = await verifyWebhookSignature(
    //   body,
    //   signature,
    //   process.env.POLAR_WEBHOOK_SECRET!
    // )

    // if (!isValidSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const event = JSON.parse(body)

    console.log('Polar webhook received:', event.type, event.data)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data)
        break

      default:
        console.log('Unhandled webhook event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Polar webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(checkoutData: any) {
  const { customer_id, metadata, status } = checkoutData

  if (!customer_id || !metadata?.userId) {
    console.error('Missing customer_id or userId in checkout data')
    return
  }

  if (status !== 'completed') {
    console.log('Checkout not completed, ignoring')
    return
  }

  // Update user subscription based on metadata
  const tier = metadata.tier as 'pro' | 'premium'

  if (!tier) {
    console.error('No tier specified in checkout metadata')
    return
  }

  // Calculate subscription end date (1 month from now)
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  try {
    // Check if user already has a subscription
    const existingSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, metadata.userId))
      .limit(1)

    if (existingSubscription.length > 0) {
      // Update existing subscription
      await db
        .update(userSubscriptions)
        .set({
          planType: tier,
          status: 'active',
          startDate,
          endDate,
          autoRenew: true,
          updatedAt: new Date(),
        })
        .where(eq(userSubscriptions.userId, metadata.userId))
    } else {
      // Create new subscription
      await db.insert(userSubscriptions).values({
        userId: metadata.userId,
        planType: tier,
        status: 'active',
        startDate,
        endDate,
        autoRenew: true,
      })
    }

    console.log(`Updated subscription for user ${metadata.userId} to ${tier} plan`)

  } catch (error) {
    console.error('Failed to update user subscription:', error)
    throw error
  }
}

async function handleSubscriptionCreated(subscriptionData: any) {
  // Handle subscription creation from Polar.sh
  // This might be called when a subscription is created directly
  console.log('Subscription created:', subscriptionData)
}

async function handleSubscriptionUpdated(subscriptionData: any) {
  // Handle subscription updates (plan changes, etc.)
  console.log('Subscription updated:', subscriptionData)
}

async function handleSubscriptionDeleted(subscriptionData: any) {
  // Handle subscription cancellations
  console.log('Subscription deleted:', subscriptionData)

  // You might want to update the subscription status to 'cancelled'
  // and set an end date based on the cancellation policy
}