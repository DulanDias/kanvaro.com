import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Task } from '@/models/Task'
import { Project } from '@/models/Project'
import { User } from '@/models/User'
import { authenticateUser } from '@/lib/auth-utils'
import { PermissionService } from '@/lib/permissions/permission-service'
import { Permission } from '@/lib/permissions/permission-definitions'
import { notificationService } from '@/lib/notification-service'
import { cache, invalidateCache } from '@/lib/redis'
import crypto from 'crypto'

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
    const after = searchParams.get('after')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const type = searchParams.get('type') || ''
    const project = searchParams.get('project') || ''

    // Use cursor pagination if 'after' is provided, otherwise fallback to skip/limit
    const useCursorPagination = !!after
    const PAGE_SIZE = Math.min(limit, 100)
    const sort = { createdAt: -1 as const }

    // Check if user can view all tasks (admin permission)
    const canViewAllTasks = await PermissionService.hasPermission(userId, Permission.TASK_READ)

    // Build filters
    const filters: any = { 
      organization: organizationId,
      archived: false
    }
    
    // If user can't view all tasks, filter by assigned tasks
    if (!canViewAllTasks) {
      filters.$or = [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    }
    
    // Optimized search: use text index for longer queries, regex for short ones
    if (search) {
      if (search.length >= 3) {
        filters.$text = { $search: search }
      } else {
        filters.$and = [
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]
          }
        ]
      }
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

    // Add cursor filter for cursor pagination
    if (useCursorPagination && after) {
      filters.createdAt = { $lt: new Date(after) }
    }

    // Create cache key
    const filterHash = crypto.createHash('md5').update(JSON.stringify(filters)).digest('hex')
    const cacheKey = `tasks:v2:org:${organizationId}:user:${userId}:f:${filterHash}:after:${after || 'null'}:l:${PAGE_SIZE}`

    // Use Redis cache with 30s TTL
    const result = await cache(cacheKey, 30, async () => {
      // Define fields to project (only what we need for list/kanban)
      const fields = 'title status priority type project position labels createdAt updatedAt assignedTo createdBy storyPoints dueDate estimatedHours actualHours'

      let query = Task.find(filters, fields)
        .populate('project', 'name')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .lean()

      if (useCursorPagination) {
        // Cursor pagination: fetch one extra to determine if there are more
        const items = await query.limit(PAGE_SIZE + 1)
        const hasMore = items.length > PAGE_SIZE
        const data = hasMore ? items.slice(0, PAGE_SIZE) : items
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null
        
        return {
          data,
          pagination: {
            nextCursor,
            pageSize: PAGE_SIZE,
            hasMore
          }
        }
      } else {
        // Legacy skip/limit pagination
        const skip = (page - 1) * PAGE_SIZE
        const items = await query.skip(skip).limit(PAGE_SIZE)
        const total = await Task.countDocuments(filters)
        
        return {
          data: items,
          pagination: {
            page,
            limit: PAGE_SIZE,
            total,
            totalPages: Math.ceil(total / PAGE_SIZE)
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
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

    // Get the next position for this project/status combination
    const taskStatus = status || 'todo'
    const maxPosition = await Task.findOne(
      { project, status: taskStatus },
      { position: 1 }
    ).sort({ position: -1 })
    const nextPosition = maxPosition ? maxPosition.position + 1 : 0

    // Create task
    const task = new Task({
      title,
      description,
      status: taskStatus,
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
      labels: labels || [],
      position: nextPosition
    })

    await task.save()

    // Invalidate tasks cache for this organization
    await invalidateCache(`tasks:*:org:${user.organization}:*`)

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
        const projectDoc = await Project.findById(project).select('name')
        const createdByUser = await User.findById(userId).select('firstName lastName')
        
        await notificationService.notifyTaskUpdate(
          task._id.toString(),
          'assigned',
          assignedTo,
          user.organization,
          title,
          projectDoc?.name
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