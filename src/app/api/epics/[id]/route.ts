import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Epic } from '@/models/Epic'
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
    const epicId = params.id

    // Fetch epic by id only (visibility/auth policy relaxed for GET by id)
    const epic = await Epic.findById(epicId)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')

    if (!epic) {
      return NextResponse.json(
        { error: 'Epic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: epic
    })

  } catch (error) {
    console.error('Get epic error:', error)
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
    const epicId = params.id

    const updateData = await request.json()

    // Update epic by id only (visibility/auth policy relaxed for PUT by id)
    const epic = await Epic.findByIdAndUpdate(
      epicId,
      updateData,
      { new: true }
    )
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')

    if (!epic) {
      return NextResponse.json(
        { error: 'Epic not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Epic updated successfully',
      data: epic
    })

  } catch (error) {
    console.error('Update epic error:', error)
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
    const epicId = params.id

    // Delete epic by id only (visibility/auth policy relaxed for DELETE by id)
    const epic = await Epic.findByIdAndDelete(epicId)

    if (!epic) {
      return NextResponse.json(
        { error: 'Epic not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Epic deleted successfully'
    })

  } catch (error) {
    console.error('Delete epic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
