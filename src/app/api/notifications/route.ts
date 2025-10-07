import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-utils'
import { notificationService } from '@/lib/notification-service'
import connectDB from '@/lib/db-config'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type') || undefined

    const result = await notificationService.getUserNotifications(authResult.user.id, {
      limit,
      offset,
      unreadOnly,
      type
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await request.json()
    const { action, notificationId } = body

    await connectDB()

    if (action === 'markAllRead') {
      const success = await notificationService.markAllAsRead(authResult.user.id)
      return NextResponse.json({ success })
    }

    if (action === 'markAsRead' && notificationId) {
      const success = await notificationService.markAsRead(notificationId, authResult.user.id)
      return NextResponse.json({ success })
    }

    if (action === 'delete' && notificationId) {
      const success = await notificationService.deleteNotification(notificationId, authResult.user.id)
      return NextResponse.json({ success })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
