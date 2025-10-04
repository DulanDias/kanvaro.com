import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Project } from '@/models/Project'
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

    // Get projects where user is creator or team member
    const projects = await Project.find({
      ...filters,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')
      .populate('client', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Project.countDocuments({
      ...filters,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    })

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get projects error:', error)
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
      status,
      priority,
      startDate,
      endDate,
      budget,
      teamMembers,
      clients,
      settings,
      tags
    } = await request.json()

    // Validate required fields
    if (!name || !startDate) {
      return NextResponse.json(
        { error: 'Name and start date are required' },
        { status: 400 }
      )
    }

    // Create project
    const project = new Project({
      name,
      description,
      status: status || 'planning',
      priority: priority || 'medium',
      organization: organizationId,
      createdBy: userId,
      teamMembers: teamMembers || [],
      client: clients?.[0], // For now, only support one client
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget ? {
        total: budget.total || 0,
        spent: 0,
        currency: budget.currency || 'USD',
        categories: {
          labor: budget.categories?.labor || 0,
          materials: budget.categories?.materials || 0,
          overhead: budget.categories?.overhead || 0
        }
      } : undefined,
      settings: {
        allowTimeTracking: settings?.allowTimeTracking ?? true,
        allowExpenseTracking: settings?.allowExpenseTracking ?? true,
        requireApproval: settings?.requireApproval ?? false,
        notifications: {
          taskUpdates: settings?.notifications?.taskUpdates ?? true,
          budgetAlerts: settings?.notifications?.budgetAlerts ?? true,
          deadlineReminders: settings?.notifications?.deadlineReminders ?? true
        }
      },
      tags: tags || []
    })

    await project.save()

    // Populate the created project
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')
      .populate('client', 'firstName lastName email')

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    })

  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
