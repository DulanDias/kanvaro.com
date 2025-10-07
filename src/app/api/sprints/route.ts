import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Sprint } from '@/models/Sprint'
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

    // Get sprints where user is team member or creator
    const sprints = await Sprint.find({
      ...filters,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    })
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Sprint.countDocuments({
      ...filters,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    })

    // Calculate progress for each sprint (this would typically come from tasks)
    const sprintsWithProgress = sprints.map(sprint => ({
      ...sprint.toObject(),
      progress: {
        completionPercentage: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        storyPointsCompleted: 0,
        totalStoryPoints: 0
      }
    }))

    return NextResponse.json({
      success: true,
      data: sprintsWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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
      startDate,
      endDate,
      goal,
      capacity,
      teamMembers
    } = await request.json()

    // Validate required fields
    if (!name || !project || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, project, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Create sprint
    const sprint = new Sprint({
      name,
      description,
      status: 'planning',
      organization: organizationId,
      project,
      createdBy: userId,
      teamMembers: teamMembers || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      goal: goal || '',
      capacity: capacity || 0,
      velocity: 0
    })

    await sprint.save()

    // Populate the created sprint
    const populatedSprint = await Sprint.findById(sprint._id)
      .populate('project', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')

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