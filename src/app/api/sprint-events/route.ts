import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db-config'
import { SprintEvent } from '@/models/SprintEvent'
import { Sprint } from '@/models/Sprint'
import { authenticateUser } from '@/lib/auth-utils'
import { hasPermission } from '@/lib/permissions/permission-utils'
import { Permission } from '@/lib/permissions/permission-definitions'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(req.url)
    const sprintId = searchParams.get('sprintId')
    const projectId = searchParams.get('projectId')
    const eventType = searchParams.get('eventType')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query: any = {}
    
    if (sprintId) {
      query.sprint = sprintId
    }
    
    if (projectId) {
      // Check if user has access to this project
      const hasAccess = await hasPermission(authResult.user.id, Permission.PROJECT_READ, projectId)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      query.project = projectId
    }

    if (eventType) {
      query.eventType = eventType
    }

    if (status) {
      query.status = status
    }

    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const sprintEvents = await SprintEvent.find(query)
      .populate('sprint', 'name status')
      .populate('project', 'name')
      .populate('facilitator', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')
      .sort({ scheduledDate: 1 })

    return NextResponse.json(sprintEvents)
  } catch (error) {
    console.error('Error fetching sprint events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await req.json()
    const { 
      sprintId, 
      projectId, 
      eventType, 
      title, 
      description, 
      scheduledDate, 
      duration, 
      attendees, 
      location, 
      meetingLink 
    } = body

    // Check if user has permission to manage sprints for this project
    const hasAccess = await hasPermission(authResult.user.id, Permission.SPRINT_MANAGE, projectId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify sprint exists and belongs to the project
    const sprint = await Sprint.findById(sprintId)
    if (!sprint || sprint.project.toString() !== projectId) {
      return NextResponse.json({ error: 'Sprint not found or does not belong to project' }, { status: 404 })
    }

    const sprintEvent = new SprintEvent({
      sprint: sprintId,
      project: projectId,
      eventType,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      duration,
      attendees,
      facilitator: authResult.user.id,
      location,
      meetingLink
    })

    await sprintEvent.save()

    const populatedEvent = await SprintEvent.findById(sprintEvent._id)
      .populate('sprint', 'name status')
      .populate('project', 'name')
      .populate('facilitator', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')

    return NextResponse.json(populatedEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating sprint event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
