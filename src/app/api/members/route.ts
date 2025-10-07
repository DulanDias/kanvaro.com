import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { User } from '@/models/User'
import { UserInvitation } from '@/models/UserInvitation'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const userId = user.id
    const organizationId = user.organization

    // Check if user has permission to view members
    if (!['admin', 'project_manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    // Build filters
    const filters: any = { organization: organizationId }
    
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role) {
      filters.role = role
    }
    
    if (status === 'active') {
      filters.isActive = true
    } else if (status === 'inactive') {
      filters.isActive = false
    }

    // Get members with custom role information
    const members = await User.find(filters)
      .select('-password')
      .populate('customRole', 'name description')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await User.countDocuments(filters)

    // Get pending invitations
    const pendingInvitations = await UserInvitation.find({
      organization: organizationId,
      isAccepted: false,
      expiresAt: { $gt: new Date() }
    }).populate('invitedBy', 'firstName lastName email')

    return NextResponse.json({
      success: true,
      data: {
        members,
        pendingInvitations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const userId = user.id
    const organizationId = user.organization

    const { memberId, updates } = await request.json()

    // Check if user has permission to update members
    if (!['admin', 'project_manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Find member
    const member = await User.findOne({
      _id: memberId,
      organization: organizationId
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Update member
    Object.assign(member, updates)
    await member.save()

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data: {
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        role: member.role,
        isActive: member.isActive
      }
    })

  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const userId = user.id
    const organizationId = user.organization

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Check if user has permission to remove members
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Find member
    const member = await User.findOne({
      _id: memberId,
      organization: organizationId
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Prevent self-deletion
    if (memberId === userId) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 400 }
      )
    }

    // Deactivate member instead of deleting
    member.isActive = false
    await member.save()

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    })

  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
