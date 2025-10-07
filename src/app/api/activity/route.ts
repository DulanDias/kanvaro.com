import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Task } from '@/models/Task'
import { Project } from '@/models/Project'
import { TimeEntry } from '@/models/TimeEntry'
import { User } from '@/models/User'
import { withAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      await connectDB()

      const { searchParams } = new URL(request.url)
      const organizationId = user.organization
      const userId = user.id

      if (!organizationId) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
      }

      // Get comprehensive team activity
      const [taskActivities, projectActivities, timeActivities] = await Promise.all([
        // Get all task activities for the organization
        Task.find({
          organization: organizationId
        })
          .populate('assignedTo', 'firstName lastName email avatar')
          .populate('createdBy', 'firstName lastName email avatar')
          .populate('project', 'name')
          .sort({ updatedAt: -1 })
          .limit(50),

        // Get all project activities for the organization
        Project.find({
          organization: organizationId
        })
          .populate('createdBy', 'firstName lastName email avatar')
          .populate('teamMembers', 'firstName lastName email avatar')
          .sort({ updatedAt: -1 })
          .limit(30),

        // Get all time tracking activities for the organization
        TimeEntry.find({
          organization: organizationId
        })
          .populate('user', 'firstName lastName email avatar')
          .populate('project', 'name')
          .populate('task', 'title')
          .sort({ startTime: -1 })
          .limit(30)
      ])

      // Format activities
      const activities: any[] = []

      // Add task activities
      taskActivities.forEach(task => {
        const user = task.assignedTo || task.createdBy
        if (user) {
          activities.push({
            id: `task-${task._id}`,
            type: 'task',
            action: task.status === 'done' ? 'completed' : 'updated',
            target: task.title,
            project: task.project?.name || 'Unknown Project',
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: user.avatar
            },
            timestamp: task.updatedAt,
            status: task.status
          })
        }
      })

      // Add project activities
      projectActivities.forEach(project => {
        const user = project.createdBy
        if (user) {
          activities.push({
            id: `project-${project._id}`,
            type: 'project',
            action: 'updated',
            target: project.name,
            project: project.name,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: user.avatar
            },
            timestamp: project.updatedAt,
            status: project.status
          })
        }
      })

      // Add time tracking activities
      timeActivities.forEach(entry => {
        const user = entry.user
        if (user) {
          activities.push({
            id: `time-${entry._id}`,
            type: 'time',
            action: 'logged',
            target: entry.task?.title || 'Time Entry',
            project: entry.project?.name || 'Unknown Project',
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: user.avatar
            },
            timestamp: entry.startTime,
            duration: entry.duration
          })
        }
      })

      // Sort by timestamp and return
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100) // Limit to 100 most recent activities

      return NextResponse.json({
        success: true,
        activities: sortedActivities
      })

    } catch (error) {
      console.error('Activity API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
