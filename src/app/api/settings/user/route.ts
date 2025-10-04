import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'

export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { message: 'User settings updated successfully (demo mode)' },
        { status: 200 }
      )
    }
    
    await connectDB()
    
    // Update the user's settings
    const user = await User.findOneAndUpdate(
      { email: userData.email }, // In a real app, this would be based on the authenticated user
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        timezone: userData.timezone,
        language: userData.language,
        currency: userData.currency,
        preferences: {
          theme: userData.theme,
          sidebarCollapsed: userData.sidebarCollapsed,
          notifications: userData.notifications
        }
      },
      { new: true }
    )
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'User settings updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        timezone: user.timezone,
        language: user.language,
        currency: user.currency,
        preferences: user.preferences
      }
    })
  } catch (error) {
    console.error('User settings update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}
