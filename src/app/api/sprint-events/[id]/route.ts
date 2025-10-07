import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db-config'
import { SprintEvent } from '@/models/SprintEvent'
import { Sprint } from '@/models/Sprint'
import { authenticateUser } from '@/lib/auth-utils'
import { hasPermission } from '@/lib/permissions/permission-utils'
import { Permission } from '@/lib/permissions/permission-definitions'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const sprintEvent = await SprintEvent.findById(params.id)
      .populate('sprint', 'name status')
      .populate('project', 'name')
      .populate('facilitator', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')

    if (!sprintEvent) {
      return NextResponse.json({ error: 'Sprint event not found' }, { status: 404 })
    }

    // Check if user has access to this project
    const hasAccess = await hasPermission(authResult.user.id, Permission.PROJECT_READ, sprintEvent.project._id.toString())
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(sprintEvent)
  } catch (error) {
    console.error('Error fetching sprint event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      scheduledDate, 
      actualDate, 
      duration, 
      attendees, 
      status, 
      outcomes, 
      location, 
      meetingLink 
    } = body

    const sprintEvent = await SprintEvent.findById(params.id)
    if (!sprintEvent) {
      return NextResponse.json({ error: 'Sprint event not found' }, { status: 404 })
    }

    // Check if user has permission to manage sprints for this project
    const hasAccess = await hasPermission(authResult.user.id, Permission.SPRINT_MANAGE, sprintEvent.project.toString())
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update sprint event
    if (title !== undefined) sprintEvent.title = title
    if (description !== undefined) sprintEvent.description = description
    if (scheduledDate !== undefined) sprintEvent.scheduledDate = new Date(scheduledDate)
    if (actualDate !== undefined) sprintEvent.actualDate = actualDate ? new Date(actualDate) : undefined
    if (duration !== undefined) sprintEvent.duration = duration
    if (attendees !== undefined) sprintEvent.attendees = attendees
    if (status !== undefined) sprintEvent.status = status
    if (outcomes !== undefined) sprintEvent.outcomes = outcomes
    if (location !== undefined) sprintEvent.location = location
    if (meetingLink !== undefined) sprintEvent.meetingLink = meetingLink

    await sprintEvent.save()

    const updatedEvent = await SprintEvent.findById(params.id)
      .populate('sprint', 'name status')
      .populate('project', 'name')
      .populate('facilitator', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating sprint event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const sprintEvent = await SprintEvent.findById(params.id)
    if (!sprintEvent) {
      return NextResponse.json({ error: 'Sprint event not found' }, { status: 404 })
    }

    // Check if user has permission to manage sprints for this project
    const hasAccess = await hasPermission(authResult.user.id, Permission.SPRINT_MANAGE, sprintEvent.project.toString())
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await SprintEvent.findByIdAndDelete(params.id)

    return NextResponse.json({ message: 'Sprint event deleted successfully' })
  } catch (error) {
    console.error('Error deleting sprint event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
