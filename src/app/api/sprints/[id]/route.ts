import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Sprint } from '@/models/Sprint'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const sprintId = params.id

    // Find sprint where user is team member or creator
    const sprint = await Sprint.findOne({
      _id: sprintId,
      organization: organizationId,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    })
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')

    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sprint
    })

  } catch (error) {
    console.error('Get sprint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const sprintId = params.id

    const updateData = await request.json()

    // Find and update sprint
    const sprint = await Sprint.findOneAndUpdate(
      {
        _id: sprintId,
        organization: organizationId,
        $or: [
          { createdBy: userId },
          { teamMembers: userId }
        ]
      },
      updateData,
      { new: true }
    )
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')

    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sprint updated successfully',
      data: sprint
    })

  } catch (error) {
    console.error('Update sprint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const sprintId = params.id

    // Find and delete sprint (only creator can delete)
    const sprint = await Sprint.findOneAndDelete({
      _id: sprintId,
      organization: organizationId,
      createdBy: userId
    })

    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sprint deleted successfully'
    })

  } catch (error) {
    console.error('Delete sprint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
