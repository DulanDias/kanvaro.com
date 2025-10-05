import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Project } from '@/models/Project'
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
    const project = await Project.findById(params.id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project.attachments)
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
    const project = await Project.findById(params.id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    project.attachments.push(attachment)
    await project.save()

    return NextResponse.json(project.attachments)
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
    const project = await Project.findById(params.id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const index = parseInt(attachmentIndex)
    if (index < 0 || index >= project.attachments.length) {
      return NextResponse.json({ error: 'Invalid attachment index' }, { status: 400 })
    }

    project.attachments.splice(index, 1)
    await project.save()

    return NextResponse.json(project.attachments)
  } catch (error) {
    console.error('Delete attachment error:', error)
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 })
  }
}
