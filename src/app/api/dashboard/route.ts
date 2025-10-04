import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Project } from '@/models/Project'
import { Task } from '@/models/Task'
import { TimeEntry } from '@/models/TimeEntry'
import { User } from '@/models/User'
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

    // Get date ranges
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get projects where user is creator or team member
    const projectsQuery = {
      organization: organizationId,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    }

    // Get tasks assigned to or created by the user
    const tasksQuery = {
      organization: organizationId,
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    }

    // Get time entries for the user
    const timeEntriesQuery = {
      user: userId,
      organization: organizationId
    }

    // Parallel data fetching
    const [
      projects,
      tasks,
      timeEntries,
      teamMembers,
      activeProjects,
      completedTasks,
      timeStats,
      recentProjects,
      recentTasks,
      teamActivity
    ] = await Promise.all([
      // Get all projects for stats
      Project.find(projectsQuery)
        .populate('createdBy', 'firstName lastName email')
        .populate('teamMembers', 'firstName lastName email')
        .populate('client', 'firstName lastName email'),

      // Get all tasks for stats
      Task.find(tasksQuery)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('project', 'name'),

      // Get time entries for stats
      TimeEntry.find(timeEntriesQuery)
        .populate('project', 'name')
        .populate('task', 'title'),

      // Get team members count
      User.countDocuments({ organization: organizationId }),

      // Get active projects count
      Project.countDocuments({
        ...projectsQuery,
        status: 'active'
      }),

      // Get completed tasks this month
      Task.countDocuments({
        ...tasksQuery,
        status: 'done',
        completedAt: { $gte: startOfMonth }
      }),

      // Get time tracking stats
      getTimeStats(userId, organizationId, startOfDay, startOfWeek, startOfMonth, now),

      // Get recent projects (last 4)
      Project.find(projectsQuery)
        .populate('createdBy', 'firstName lastName email')
        .populate('teamMembers', 'firstName lastName email')
        .populate('client', 'firstName lastName email')
        .sort({ updatedAt: -1 })
        .limit(4),

      // Get recent tasks (last 5)
      Task.find(tasksQuery)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('project', 'name')
        .sort({ updatedAt: -1 })
        .limit(5),

      // Get team activity (last 10 activities)
      getTeamActivity(organizationId, userId)
    ])

    // Calculate project progress
    const projectsWithProgress = await Promise.all(
      recentProjects.map(async (project) => {
        const projectTasks = await Task.find({ project: project._id })
        const totalTasks = projectTasks.length
        const completedTasks = projectTasks.filter(task => task.status === 'done').length
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return {
          ...project.toObject(),
          progress,
          tasksCompleted: completedTasks,
          totalTasks
        }
      })
    )

    // Calculate statistics
    const stats = {
      activeProjects,
      completedTasks,
      teamMembers,
      hoursTracked: timeStats.totalDuration,
      projectsCount: projects.length,
      tasksCount: tasks.length,
      timeEntriesCount: timeEntries.length
    }

    // Calculate changes from last month
    const lastMonthStats = await getLastMonthStats(userId, organizationId, startOfLastMonth, endOfLastMonth)
    const changes = {
      activeProjects: activeProjects - lastMonthStats.activeProjects,
      completedTasks: completedTasks - lastMonthStats.completedTasks,
      teamMembers: teamMembers - lastMonthStats.teamMembers,
      hoursTracked: timeStats.totalDuration - lastMonthStats.hoursTracked
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        changes,
        recentProjects: projectsWithProgress,
        recentTasks,
        teamActivity,
        timeStats
      }
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getTimeStats(userId: string, organizationId: string, startOfDay: Date, startOfWeek: Date, startOfMonth: Date, endDate: Date) {
  const [todayStats, weekStats, monthStats] = await Promise.all([
    TimeEntry.aggregate([
      {
        $match: {
          user: userId,
          organization: organizationId,
          startTime: { $gte: startOfDay, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]),
    TimeEntry.aggregate([
      {
        $match: {
          user: userId,
          organization: organizationId,
          startTime: { $gte: startOfWeek, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]),
    TimeEntry.aggregate([
      {
        $match: {
          user: userId,
          organization: organizationId,
          startTime: { $gte: startOfMonth, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          totalCost: { $sum: '$cost' }
        }
      }
    ])
  ])

  return {
    today: {
      duration: todayStats[0]?.totalDuration || 0,
      cost: todayStats[0]?.totalCost || 0
    },
    week: {
      duration: weekStats[0]?.totalDuration || 0,
      cost: weekStats[0]?.totalCost || 0
    },
    month: {
      duration: monthStats[0]?.totalDuration || 0,
      cost: monthStats[0]?.totalCost || 0
    },
    totalDuration: monthStats[0]?.totalDuration || 0,
    totalCost: monthStats[0]?.totalCost || 0
  }
}

async function getLastMonthStats(userId: string, organizationId: string, startOfLastMonth: Date, endOfLastMonth: Date) {
  const [activeProjects, completedTasks, teamMembers, hoursTracked] = await Promise.all([
    Project.countDocuments({
      organization: organizationId,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ],
      status: 'active'
    }),
    Task.countDocuments({
      organization: organizationId,
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ],
      status: 'done',
      completedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    }),
    User.countDocuments({ organization: organizationId }),
    TimeEntry.aggregate([
      {
        $match: {
          user: userId,
          organization: organizationId,
          startTime: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' }
        }
      }
    ])
  ])

  return {
    activeProjects,
    completedTasks,
    teamMembers,
    hoursTracked: hoursTracked[0]?.totalDuration || 0
  }
}

async function getTeamActivity(organizationId: string, userId: string) {
  // Get recent activities from tasks, projects, and time entries
  const [taskActivities, projectActivities, timeActivities] = await Promise.all([
    Task.find({
      organization: organizationId,
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(5),

    Project.find({
      organization: organizationId,
      $or: [
        { createdBy: userId },
        { teamMembers: userId }
      ]
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .limit(3),

    TimeEntry.find({
      organization: organizationId,
      user: userId
    })
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ startTime: -1 })
      .limit(3)
  ])

  // Format activities
  const activities = []

  // Add task activities
  taskActivities.forEach(task => {
    activities.push({
      id: `task-${task._id}`,
      type: 'task',
      action: task.status === 'done' ? 'completed' : 'updated',
      target: task.title,
      project: task.project?.name || 'Unknown Project',
      user: task.assignedTo || task.createdBy,
      timestamp: task.updatedAt,
      status: task.status
    })
  })

  // Add project activities
  projectActivities.forEach(project => {
    activities.push({
      id: `project-${project._id}`,
      type: 'project',
      action: 'updated',
      target: project.name,
      project: project.name,
      user: project.createdBy,
      timestamp: project.updatedAt,
      status: project.status
    })
  })

  // Add time tracking activities
  timeActivities.forEach(entry => {
    activities.push({
      id: `time-${entry._id}`,
      type: 'time',
      action: 'logged',
      target: `${entry.duration} minutes`,
      project: entry.project?.name || 'Unknown Project',
      user: { _id: userId },
      timestamp: entry.startTime,
      duration: entry.duration
    })
  })

  // Sort by timestamp and return top 10
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
}
