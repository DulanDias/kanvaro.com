import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Task } from '@/models/Task'
import { Story } from '@/models/Story'
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const priority = searchParams.get('priority') || ''
    const status = searchParams.get('status') || ''

    // Build search filter
    const searchFilter = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {}

    // Build additional filters
    const filters: any = {
      ...searchFilter,
      organization: organizationId
    }
    
    if (type) {
      filters.type = type
    }
    
    if (priority) {
      filters.priority = priority
    }
    
    if (status) {
      filters.status = status
    }

    // Get all backlog items (tasks, stories, epics)
    const [tasks, stories, epics] = await Promise.all([
      Task.find({ ...filters, project: { $exists: true } })
        .populate('project', 'name')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('story', 'title')
        .populate('sprint', 'name')
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      
      Story.find({ ...filters, project: { $exists: true } })
        .populate('project', 'name')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('epic', 'title')
        .populate('sprint', 'name')
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      
      Epic.find({ ...filters, project: { $exists: true } })
        .populate('project', 'name')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ])

    // Combine and format all items
    const allItems = [
      ...tasks.map(task => ({
        ...task.toObject(),
        type: 'task',
        status: task.status === 'todo' ? 'backlog' : 
                task.status === 'in_progress' ? 'in_progress' : 
                task.status === 'done' ? 'done' : 'backlog'
      })),
      ...stories.map(story => ({
        ...story.toObject(),
        type: 'story',
        status: story.status === 'todo' ? 'backlog' : 
                story.status === 'in_progress' ? 'in_progress' : 
                story.status === 'done' ? 'done' : 'backlog'
      })),
      ...epics.map(epic => ({
        ...epic.toObject(),
        type: 'epic',
        status: epic.status === 'todo' ? 'backlog' : 
                epic.status === 'in_progress' ? 'in_progress' : 
                epic.status === 'done' ? 'done' : 'backlog'
      }))
    ]

    // Sort by priority and creation date
    allItems.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      success: true,
      data: allItems,
      pagination: {
        page,
        limit,
        total: allItems.length,
        totalPages: Math.ceil(allItems.length / limit)
      }
    })

  } catch (error) {
    console.error('Get backlog error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
