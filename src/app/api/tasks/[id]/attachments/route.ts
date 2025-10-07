import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db-config'
import { Task } from '@/models/Task'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await connectDB()
    const task = await Task.findById(params.id)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task.attachments)
  } catch (error) {
    console.error('Get attachments error:', error)
    return NextResponse.json({ error: 'Failed to get attachments' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { attachment } = await req.json()
    
    await connectDB()
    const task = await Task.findById(params.id)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    task.attachments.push(attachment)
    await task.save()

    return NextResponse.json(task.attachments)
  } catch (error) {
    console.error('Add attachment error:', error)
    return NextResponse.json({ error: 'Failed to add attachment' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(req.url)
    const attachmentIndex = searchParams.get('index')
    
    if (attachmentIndex === null) {
      return NextResponse.json({ error: 'Attachment index required' }, { status: 400 })
    }

    await connectDB()
    const task = await Task.findById(params.id)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const index = parseInt(attachmentIndex)
    if (index < 0 || index >= task.attachments.length) {
      return NextResponse.json({ error: 'Invalid attachment index' }, { status: 400 })
    }

    task.attachments.splice(index, 1)
    await task.save()

    return NextResponse.json(task.attachments)
  } catch (error) {
    console.error('Delete attachment error:', error)
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 })
  }
}
