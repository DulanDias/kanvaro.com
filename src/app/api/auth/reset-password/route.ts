import { NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'
import { emailService } from '@/lib/email/EmailService'

export async function POST(request: Request) {
  try {
    const { resetToken, newPassword } = await request.json()

    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    console.log('Password reset request with token:', resetToken ? 'present' : 'missing')

    await connectDB()

    // Find user by reset token
    const user = await User.findOne({ 
      passwordResetToken: resetToken,
      passwordResetExpiry: { $gt: new Date() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password and clear reset fields
    user.password = hashedPassword
    user.passwordResetToken = undefined
    user.passwordResetExpiry = undefined
    user.passwordResetOtp = undefined
    await user.save()

    // Send confirmation email
    const emailSent = await emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset Successful',
      html: emailService.generatePasswordResetConfirmationEmail('Kanvaro')
    })

    if (!emailSent) {
      console.error('Failed to send password reset confirmation email to:', user.email)
      // Don't fail the request as password was reset successfully
    }

    console.log('Password reset successful for user:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Password reset failed:', error)
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    )
  }
}
