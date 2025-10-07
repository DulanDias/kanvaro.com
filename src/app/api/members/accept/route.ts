import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { User } from '@/models/User'
import { UserInvitation } from '@/models/UserInvitation'
import { notificationService } from '@/lib/notification-service'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { token, password, firstName, lastName } = await request.json()

    // Find valid invitation
    const invitation = await UserInvitation.findOne({
      token,
      isAccepted: false,
      expiresAt: { $gt: new Date() }
    }).populate('organization')

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: invitation.email,
      organization: invitation.organization._id
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = new User({
      firstName: firstName || invitation.firstName || '',
      lastName: lastName || invitation.lastName || '',
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      organization: invitation.organization._id,
      isActive: true,
      emailVerified: true
    })

    await user.save()

    // Mark invitation as accepted
    invitation.isAccepted = true
    invitation.acceptedAt = new Date()
    await invitation.save()

    // Send notification to organization members about new team member
    try {
      const organizationMembers = await User.find({ 
        organization: invitation.organization._id,
        _id: { $ne: user._id } // Exclude the new user
      }).select('_id')
      
      const memberIds = organizationMembers.map(member => member._id.toString())
      
      if (memberIds.length > 0) {
        await notificationService.notifyTeamUpdate(
          'member_joined',
          memberIds,
          invitation.organization._id.toString(),
          `${user.firstName} ${user.lastName}`,
          `joined as ${invitation.role.replace(/_/g, ' ')}`
        )
      }
    } catch (notificationError) {
      console.error('Failed to send team update notifications:', notificationError)
      // Don't fail the account creation if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    })

  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
