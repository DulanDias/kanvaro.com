import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Task } from '@/models/Task'
import { Project } from '@/models/Project'
import { Story } from '@/models/Story'

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
    const storyId = searchParams.get('storyId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const type = searchParams.get('type')
    const assignedTo = searchParams.get('assignedTo')
    const sprintId = searchParams.get('sprintId')

    // Build filters
    const filters: any = {}
    
    if (projectId) {
      filters.project = projectId
    }
    
    if (storyId) {
      filters.story = storyId
    }
    
    if (status) {
      filters.status = status
    }
    
    if (priority) {
      filters.priority = priority
    }
    
    if (type) {
      filters.type = type
    }
    
    if (assignedTo) {
      filters.assignedTo = assignedTo
    }
    
    if (sprintId) {
      filters.sprint = sprintId
    }

    const tasks = await Task.find(filters)
      .populate('project', 'name')
      .populate('story', 'title')
      .populate('parentTask', 'title')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('sprint', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: tasks
    })

  } catch (error) {
    console.error('Get tasks error:', error)
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
      story,
      parentTask,
      assignedTo,
      status,
      priority,
      type,
      storyPoints,
      estimatedHours,
      sprint,
      startDate,
      dueDate,
      labels,
      dependencies
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

    // Verify story exists if provided
    if (story) {
      const storyDoc = await Story.findOne({
        _id: story,
        project: project
      })

      if (!storyDoc) {
        return NextResponse.json(
          { error: 'Story not found' },
          { status: 404 }
        )
      }
    }

    // Verify parent task exists if provided
    if (parentTask) {
      const parentTaskDoc = await Task.findOne({
        _id: parentTask,
        project: project
      })

      if (!parentTaskDoc) {
        return NextResponse.json(
          { error: 'Parent task not found' },
          { status: 404 }
        )
      }
    }

    // Create task
    const task = new Task({
      title,
      description,
      project,
      story,
      parentTask,
      createdBy: userId,
      assignedTo,
      status: status || 'todo',
      priority: priority || 'medium',
      type: type || 'task',
      storyPoints,
      estimatedHours,
      sprint,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      labels: labels || [],
      dependencies: dependencies || []
    })

    await task.save()

    // Populate the created task
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('story', 'title')
      .populate('parentTask', 'title')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('sprint', 'name')

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    })

  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
