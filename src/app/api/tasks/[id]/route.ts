import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Task } from '@/models/Task'
import { Project } from '@/models/Project'
import { User } from '@/models/User'
import { authenticateUser } from '@/lib/auth-utils'
import { CompletionService } from '@/lib/completion-service'
import { notificationService } from '@/lib/notification-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const taskId = params.id

    // Find task where user is assigned or creator
    const task = await Task.findOne({
      _id: taskId,
      organization: organizationId,
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('story', 'title status')
      .populate('sprint', 'name status')
      .populate('parentTask', 'title')

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task
    })

  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const taskId = params.id

    const updateData = await request.json()

    // Add optimistic locking with version field
    const currentTask = await Task.findOne({
      _id: taskId,
      organization: organizationId,
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })

    if (!currentTask) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check for concurrent modifications
    if (updateData.expectedVersion && currentTask.updatedAt.getTime() !== new Date(updateData.expectedVersion).getTime()) {
      return NextResponse.json(
        { 
          error: 'Task was modified by another user. Please refresh and try again.',
          conflict: true,
          currentVersion: currentTask.updatedAt.toISOString()
        },
        { status: 409 }
      )
    }

    // Find and update task with concurrency protection
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        organization: organizationId,
        $or: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('story', 'title status')
      .populate('sprint', 'name status')
      .populate('parentTask', 'title')

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if task status changed to 'done' and trigger completion logic
    if (updateData.status === 'done' && currentTask.status !== 'done') {
      // Run completion check asynchronously to avoid blocking the response
      setImmediate(() => {
        CompletionService.handleTaskStatusChange(taskId).catch(error => {
          console.error('Error in completion service:', error)
        })
      })
    }

    // Send notifications for important changes
    try {
      // Notify if task was assigned to someone new
      if (updateData.assignedTo && updateData.assignedTo !== currentTask.assignedTo?.toString()) {
        const project = await Project.findById(task.project).select('name')
        const updatedByUser = await User.findById(userId).select('firstName lastName')
        
        await notificationService.notifyTaskUpdate(
          taskId,
          'assigned',
          updateData.assignedTo,
          organizationId,
          task.title,
          project?.name
        )
      }

      // Notify if task was completed
      if (updateData.status === 'done' && currentTask.status !== 'done') {
        const project = await Project.findById(task.project).select('name')
        const completedByUser = await User.findById(userId).select('firstName lastName')
        
        // Notify the task creator if different from the one who completed it
        if (task.createdBy.toString() !== userId) {
          await notificationService.notifyTaskUpdate(
            taskId,
            'completed',
            task.createdBy.toString(),
            organizationId,
            task.title,
            project?.name
          )
        }
      }

      // Notify if task was updated (but not by the assignee)
      if (updateData.assignedTo && updateData.assignedTo !== userId) {
        const project = await Project.findById(task.project).select('name')
        const updatedByUser = await User.findById(userId).select('firstName lastName')
        
        await notificationService.notifyTaskUpdate(
          taskId,
          'updated',
          updateData.assignedTo,
          organizationId,
          task.title,
          project?.name
        )
      }
    } catch (notificationError) {
      console.error('Failed to send task update notifications:', notificationError)
      // Don't fail the task update if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    })

  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const taskId = params.id

    // Find and delete task (only creator can delete)
    const task = await Task.findOneAndDelete({
      _id: taskId,
      organization: organizationId,
      createdBy: userId
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })

  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
