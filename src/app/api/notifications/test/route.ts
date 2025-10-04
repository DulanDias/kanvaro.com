import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-utils'
import { notificationService } from '@/lib/notification-service'
import connectDB from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await connectDB()

    const { type, title, message, sendEmail, sendPush } = await request.json()

    // Create test notification
    const notification = await notificationService.createNotification(
      authResult.user.id,
      authResult.user.organization,
      {
        type: type || 'system',
        title: title || 'Test Notification',
        message: message || 'This is a test notification',
        data: {
          entityType: 'system',
          action: 'created',
          priority: 'low'
        },
        sendEmail: sendEmail || false,
        sendPush: sendPush || false
      }
    )

    if (!notification) {
      return NextResponse.json(
        { error: 'Failed to create test notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test notification created successfully',
      data: notification
    })
  } catch (error) {
    console.error('Failed to create test notification:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    )
  }
}
