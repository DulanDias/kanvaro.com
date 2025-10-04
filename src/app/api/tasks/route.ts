import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Task } from '@/models/Task'
import { Project } from '@/models/Project'
import { User } from '@/models/User'
import { authenticateUser } from '@/lib/auth-utils'
import { PermissionService } from '@/lib/permissions/permission-service'
import { Permission } from '@/lib/permissions/permission-definitions'
import { notificationService } from '@/lib/notification-service'

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
    const type = searchParams.get('type') || ''
    const project = searchParams.get('project') || ''

    // Check if user can view all tasks (admin permission)
    const canViewAllTasks = await PermissionService.hasPermission(userId, Permission.TASK_READ)

    // Build filters
    const filters: any = { 
      organization: organizationId
    }
    
    // If user can't view all tasks, filter by assigned tasks
    if (!canViewAllTasks) {
      filters.$or = [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    }
    
    if (search) {
      filters.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ]
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
    
    if (project) {
      filters.project = project
    }

    // Get tasks assigned to or created by the user
    const tasks = await Task.find(filters)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('story', 'title status')
      .populate('sprint', 'name status')
      .populate('parentTask', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Task.countDocuments(filters)

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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

    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const userId = user.id

    const {
      title,
      description,
      status,
      priority,
      type,
      project,
      story,
      parentTask,
      assignedTo,
      storyPoints,
      dueDate,
      estimatedHours,
      labels
    } = await request.json()

    // Check if user can create tasks
    const canCreateTask = await PermissionService.hasPermission(userId, Permission.TASK_CREATE, project)
    if (!canCreateTask) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create tasks' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!title || !project) {
      return NextResponse.json(
        { error: 'Title and project are required' },
        { status: 400 }
      )
    }

    // Create task
    const task = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      type: type || 'task',
      organization: user.organization,
      project,
      story: story || undefined,
      parentTask: parentTask || undefined,
      assignedTo: assignedTo || undefined,
      createdBy: userId,
      storyPoints: storyPoints || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours || undefined,
      labels: labels || []
    })

    await task.save()

    // Populate the created task
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('story', 'title status')
      .populate('sprint', 'name status')
      .populate('parentTask', 'title')

    // Send notification if task is assigned to someone
    if (assignedTo && assignedTo !== userId) {
      try {
        const project = await Project.findById(project).select('name')
        const createdByUser = await User.findById(userId).select('firstName lastName')
        
        await notificationService.notifyTaskUpdate(
          task._id.toString(),
          'assigned',
          assignedTo,
          user.organization,
          title,
          project?.name
        )
      } catch (notificationError) {
        console.error('Failed to send task assignment notification:', notificationError)
        // Don't fail the task creation if notification fails
      }
    }

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