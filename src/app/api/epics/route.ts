import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
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
    const projectFilter = searchParams.get('project') || ''

    // Build filters (Epic schema has no 'organization' field)
    const filters: any = { archived: false }
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status) filters.status = status
    if (priority) filters.priority = priority
    if (projectFilter) filters.project = projectFilter

    const PAGE_SIZE = Math.min(limit, 100)

    // Get epics created by the user (similar to sprints). You can re-add assignedTo if desired.
    const epicQuery = {
      ...filters,
      createdBy: userId,
    }

    const epics = await Epic.find(epicQuery)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean()

    const total = await Epic.countDocuments(epicQuery)

    // Calculate progress for each epic (this would typically come from stories)
    const epicsWithProgress = epics.map(epic => ({
      ...epic,
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
        limit: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE)
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
      title,
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
    const finalTitle = title || name
    if (!finalTitle || !project) {
      return NextResponse.json(
        { error: 'Title and project are required' },
        { status: 400 }
      )
    }

    // Create epic
    const epic = new Epic({
      title: finalTitle,
      description,
      status: 'backlog',
      priority: priority || 'medium',
      project,
      createdBy: userId,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours || undefined,
      storyPoints: storyPoints || undefined,
      tags: labels || []
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