import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { message: 'Password updated successfully (demo mode)' },
        { status: 200 }
      )
    }
    
    await connectDB()
    
    // Find the user (in a real app, this would be based on the authenticated user)
    const user = await User.findOne({ email: 'admin@kanvaro.com' })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }
    
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    
    // Update the user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedNewPassword
    })
    
    return NextResponse.json({
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Password update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
