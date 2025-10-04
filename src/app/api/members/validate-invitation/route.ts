import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { UserInvitation } from '@/models/UserInvitation'
import { Organization } from '@/models/Organization'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find valid invitation
    const invitation = await UserInvitation.findOne({
      token,
      isAccepted: false,
      expiresAt: { $gt: new Date() }
    }).populate('organization invitedBy', 'name firstName lastName')

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        organization: invitation.organization.name,
        invitedBy: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Validate invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
