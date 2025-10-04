import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Epic } from '@/models/Epic'
import { Project } from '@/models/Project'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.headers.get('x-user-id')
    const organizationId = request.headers.get('x-organization-id')

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build filters
    const filters: any = {}
    
    if (projectId) {
      filters.project = projectId
    }
    
    if (status) {
      filters.status = status
    }
    
    if (priority) {
      filters.priority = priority
    }

    const epics = await Epic.find(filters)
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: epics
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

    const userId = request.headers.get('x-user-id')
    const organizationId = request.headers.get('x-organization-id')

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      storyPoints,
      estimatedHours,
      startDate,
      dueDate,
      tags
    } = await request.json()

    // Validate required fields
    if (!title || !project) {
      return NextResponse.json(
        { error: 'Title and project are required' },
        { status: 400 }
      )
    }

    // Verify project exists and user has access
    const projectDoc = await Project.findOne({
      _id: project,
      organization: organizationId,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    })

    if (!projectDoc) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Create epic
    const epic = new Epic({
      title,
      description,
      project,
      createdBy: userId,
      assignedTo,
      priority: priority || 'medium',
      storyPoints,
      estimatedHours,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || []
    })

    await epic.save()

    // Populate the created epic
    const populatedEpic = await Epic.findById(epic._id)
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')

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
