import { NextRequest, NextResponse } from 'next/server'
import { Polar } from '@polar-sh/sdk'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// Polar.sh product IDs
const POLAR_PRODUCT_IDS = {
  pro: '506dc992-fde6-478a-8a21-4646d22ea449', // PRO-PACK product ID from Polar.sh
  premium: '506dc992-fde6-478a-8a21-4646d22ea449', // TODO: Replace with actual premium product ID
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tier } = await request.json()

    if (!tier || !['pro', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "premium"' },
        { status: 400 }
      )
    }

    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN!,
    })

    // Get the product ID for the selected tier
    const productId = POLAR_PRODUCT_IDS[tier as keyof typeof POLAR_PRODUCT_IDS]

    if (!productId) {
      return NextResponse.json(
        {
          error: 'Product ID not configured for this tier.'
        },
        { status: 500 }
      )
    }

    // Create checkout session
    const checkout = await polar.checkouts.create({
      products: [productId], // Array of product IDs (first one is selected by default)
      successUrl: `${process.env.BASE_URL}/checkout/success?provider=polar&checkout_id={CHECKOUT_ID}`,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
    })

    return NextResponse.json({
      url: checkout.url,
      id: checkout.id,
    })

  } catch (error) {
    console.error('Polar checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}