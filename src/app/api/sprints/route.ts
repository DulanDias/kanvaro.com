import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Sprint } from '@/models/Sprint'
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

    // Build filters
    const filters: any = {}
    
    if (projectId) {
      filters.project = projectId
    }
    
    if (status) {
      filters.status = status
    }

    const sprints = await Sprint.find(filters)
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('stories', 'title storyPoints')
      .populate('tasks', 'title storyPoints')
      .sort({ startDate: -1 })

    return NextResponse.json({
      success: true,
      data: sprints
    })

  } catch (error) {
    console.error('Get sprints error:', error)
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
      name,
      description,
      project,
      startDate,
      endDate,
      goal,
      capacity,
      stories,
      tasks
    } = await request.json()

    // Validate required fields
    if (!name || !project || !startDate || !endDate || !capacity) {
      return NextResponse.json(
        { error: 'Name, project, start date, end date, and capacity are required' },
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

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    // Create sprint
    const sprint = new Sprint({
      name,
      description,
      project,
      createdBy: userId,
      startDate: start,
      endDate: end,
      goal,
      capacity,
      stories: stories || [],
      tasks: tasks || []
    })

    await sprint.save()

    // Populate the created sprint
    const populatedSprint = await Sprint.findById(sprint._id)
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('stories', 'title storyPoints')
      .populate('tasks', 'title storyPoints')

    return NextResponse.json({
      success: true,
      message: 'Sprint created successfully',
      data: populatedSprint
    })

  } catch (error) {
    console.error('Create sprint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
