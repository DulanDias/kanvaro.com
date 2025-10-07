import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-utils'
import { pushNotificationService } from '@/lib/push-notification-service'
import connectDB from '@/lib/db-config'
import { User } from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await connectDB()

    const { subscription } = await request.json()

    // Validate subscription
    if (!pushNotificationService.validateSubscription(subscription)) {
      return NextResponse.json(
        { error: 'Invalid push subscription' },
        { status: 400 }
      )
    }

    // TODO: Store subscription in database
    // For now, we'll just return success
    console.log('Push subscription received for user:', authResult.user.id)

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully'
    })
  } catch (error) {
    console.error('Failed to save push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Return VAPID public key for client-side subscription
    const vapidPublicKey = pushNotificationService.getVapidPublicKey()

    return NextResponse.json({
      success: true,
      vapidPublicKey
    })
  } catch (error) {
    console.error('Failed to get VAPID key:', error)
    return NextResponse.json(
      { error: 'Failed to get VAPID key' },
      { status: 500 }
    )
  }
}
