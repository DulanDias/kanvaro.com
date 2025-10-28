import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Sprint } from '@/models/Sprint'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
        console.log('GET sprints');

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

    // Fetch sprint by id only (visibility/auth policy relaxed for GET by id)
    const sprint = await Sprint.findById(sprintId)
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')

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

    // Update sprint by id only (visibility/auth policy relaxed for PUT by id)
    const sprint = await Sprint.findByIdAndUpdate(
      sprintId,
      updateData,
      { new: true }
    )
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')

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

    // Delete sprint by id only (visibility/auth policy relaxed for DELETE by id)
    const sprint = await Sprint.findByIdAndDelete(sprintId)

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
