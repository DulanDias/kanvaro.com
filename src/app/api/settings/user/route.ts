import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { User } from '@/models/User'

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.headers.get('x-user-id')
    const organizationId = request.headers.get('x-organization-id')

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const updates = await request.json()

    // Find user
    const user = await User.findOne({
      _id: userId,
      organization: organizationId
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user fields
    if (updates.firstName) user.firstName = updates.firstName
    if (updates.lastName) user.lastName = updates.lastName
    if (updates.timezone) user.timezone = updates.timezone
    if (updates.language) user.language = updates.language
    if (updates.currency) user.currency = updates.currency

    // Update preferences
    if (updates.theme) user.preferences.theme = updates.theme
    if (updates.sidebarCollapsed !== undefined) user.preferences.sidebarCollapsed = updates.sidebarCollapsed
    if (updates.dateFormat) user.preferences.dateFormat = updates.dateFormat
    if (updates.timeFormat) user.preferences.timeFormat = updates.timeFormat
    if (updates.notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...updates.notifications
      }
    }

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        timezone: user.timezone,
        language: user.language,
        preferences: user.preferences
      }
    })

  } catch (error) {
    console.error('Update user settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}