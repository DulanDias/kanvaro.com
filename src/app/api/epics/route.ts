import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Epic } from '@/models/Epic'
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''

    // Build filters
    const filters: any = { organization: organizationId }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status) {
      filters.status = status
    }
    
    if (priority) {
      filters.priority = priority
    }

    // Get epics where user is assigned or creator
    const epics = await Epic.find({
      ...filters,
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    })
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Epic.countDocuments({
      ...filters,
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    })

    // Calculate progress for each epic (this would typically come from stories)
    const epicsWithProgress = epics.map(epic => ({
      ...epic.toObject(),
      progress: {
        completionPercentage: 0,
        storiesCompleted: 0,
        totalStories: 0,
        storyPointsCompleted: 0,
        totalStoryPoints: 0
      }
    }))

    return NextResponse.json({
      success: true,
      data: epicsWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get epics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const {
      name,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      estimatedHours,
      storyPoints,
      labels
    } = await request.json()

    // Validate required fields
    if (!name || !project) {
      return NextResponse.json(
        { error: 'Name and project are required' },
        { status: 400 }
      )
    }

    // Create epic
    const epic = new Epic({
      name,
      description,
      status: 'todo',
      priority: priority || 'medium',
      organization: organizationId,
      project,
      createdBy: userId,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours || undefined,
      storyPoints: storyPoints || undefined,
      labels: labels || []
    })

    await epic.save()

    // Populate the created epic
    const populatedEpic = await Epic.findById(epic._id)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')

    return NextResponse.json({
      success: true,
      message: 'Epic created successfully',
      data: populatedEpic
    })

  } catch (error) {
    console.error('Create epic error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}