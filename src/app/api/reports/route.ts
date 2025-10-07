import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db-config'
import { Project } from '@/models/Project'
import { Sprint } from '@/models/Sprint'
import { Task } from '@/models/Task'
import { TimeEntry } from '@/models/TimeEntry'
import { BudgetEntry } from '@/models/BudgetEntry'
import { BurnRate } from '@/models/BurnRate'
import { SprintEvent } from '@/models/SprintEvent'
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
    const projectId = searchParams.get('projectId')
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Check if user has access to this project
    const hasAccess = await hasPermission(authResult.user.id, Permission.REPORTING_VIEW, projectId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    let reportData: any = {}

    switch (reportType) {
      case 'overview':
        reportData = await generateOverviewReport(projectId, startDate || undefined, endDate || undefined)
        break
      case 'budget':
        reportData = await generateBudgetReport(projectId, startDate || undefined, endDate || undefined)
        break
      case 'burn-rate':
        reportData = await generateBurnRateReport(projectId, startDate || undefined, endDate || undefined)
        break
      case 'velocity':
        reportData = await generateVelocityReport(projectId, startDate || undefined, endDate || undefined)
        break
      case 'sprint':
        reportData = await generateSprintReport(projectId, startDate || undefined, endDate || undefined)
        break
      case 'team-performance':
        reportData = await generateTeamPerformanceReport(projectId, startDate || undefined, endDate || undefined)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateOverviewReport(projectId: string, startDate?: string, endDate?: string) {
  const project = await Project.findById(projectId)
  
  // Get basic project stats
  const totalTasks = await Task.countDocuments({ project: projectId })
  const completedTasks = await Task.countDocuments({ project: projectId, status: 'completed' })
  const totalSprints = await Sprint.countDocuments({ project: projectId })
  const activeSprints = await Sprint.countDocuments({ project: projectId, status: 'active' })
  
  // Get time tracking stats
  const timeEntries = await TimeEntry.find({ project: projectId })
  const totalTimeLogged = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)
  
  // Get budget stats
  const budgetEntries = await BudgetEntry.find({ project: projectId, status: 'active' })
  const totalBudget = budgetEntries.reduce((sum, entry) => sum + entry.amount, 0)
  
  // Get recent activity
  const recentBurnRates = await BurnRate.find({ project: projectId })
    .sort({ date: -1 })
    .limit(7)
  
  return {
    project: {
      name: project?.name,
      status: project?.status,
      startDate: project?.startDate,
      endDate: project?.endDate
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    },
    sprints: {
      total: totalSprints,
      active: activeSprints
    },
    timeTracking: {
      totalHours: totalTimeLogged / 3600, // Convert seconds to hours
      entries: timeEntries.length
    },
    budget: {
      total: totalBudget,
      spent: project?.budget?.spent || 0,
      remaining: totalBudget - (project?.budget?.spent || 0),
      utilizationRate: totalBudget > 0 ? ((project?.budget?.spent || 0) / totalBudget) * 100 : 0
    },
    recentBurnRates: recentBurnRates
  }
}

async function generateBudgetReport(projectId: string, startDate?: string, endDate?: string) {
  const project = await Project.findById(projectId)
  
  // Get budget entries
  let budgetQuery: any = { project: projectId }
  if (startDate && endDate) {
    budgetQuery.addedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  const budgetEntries = await BudgetEntry.find(budgetQuery)
    .populate('addedBy', 'firstName lastName')
    .sort({ addedAt: -1 })
  
  // Calculate category breakdown
  const categoryBreakdown = budgetEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = 0
    }
    acc[entry.category] += entry.amount
    return acc
  }, {} as Record<string, number>)
  
  // Get recurring entries
  const recurringEntries = budgetEntries.filter(entry => entry.isRecurring)
  
  return {
    project: {
      name: project?.name,
      budget: project?.budget
    },
    budgetEntries,
    categoryBreakdown,
    recurringEntries,
    summary: {
      totalBudget: budgetEntries.reduce((sum, entry) => sum + entry.amount, 0),
      totalSpent: project?.budget?.spent || 0,
      remaining: (project?.budget?.total || 0) - (project?.budget?.spent || 0)
    }
  }
}

async function generateBurnRateReport(projectId: string, startDate?: string, endDate?: string) {
  let burnRateQuery: any = { project: projectId }
  if (startDate && endDate) {
    burnRateQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  const burnRates = await BurnRate.find(burnRateQuery)
    .populate('sprint', 'name')
    .sort({ date: 1 })
  
  // Calculate trends
  const trends = {
    averageBurnRate: burnRates.length > 0 ? burnRates.reduce((sum, rate) => sum + rate.actualBurn, 0) / burnRates.length : 0,
    averageVelocity: burnRates.length > 0 ? burnRates.reduce((sum, rate) => sum + rate.velocity, 0) / burnRates.length : 0,
    averageUtilization: burnRates.length > 0 ? burnRates.reduce((sum, rate) => sum + rate.utilization, 0) / burnRates.length : 0
  }
  
  // Calculate forecast
  const latestBurnRate = burnRates[burnRates.length - 1]
  const forecast = latestBurnRate ? {
    remainingBudget: latestBurnRate.budgetRemaining,
    forecastedCompletion: latestBurnRate.forecastedCompletion,
    daysToComplete: latestBurnRate.forecastedCompletion ? 
      Math.ceil((latestBurnRate.forecastedCompletion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
  } : null
  
  return {
    burnRates,
    trends,
    forecast
  }
}

async function generateVelocityReport(projectId: string, startDate?: string, endDate?: string) {
  const sprints = await Sprint.find({ project: projectId })
    .sort({ startDate: 1 })
  
  const velocityData = sprints.map(sprint => ({
    sprint: sprint.name,
    plannedVelocity: sprint.plannedVelocity || 0,
    actualVelocity: sprint.actualVelocity || 0,
    capacity: sprint.capacity,
    actualCapacity: sprint.actualCapacity || 0,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    status: sprint.status
  }))
  
  // Calculate velocity trends
  const completedSprints = sprints.filter(s => s.status === 'completed')
  const averageVelocity = completedSprints.length > 0 ? 
    completedSprints.reduce((sum, sprint) => sum + (sprint.actualVelocity || 0), 0) / completedSprints.length : 0
  
  return {
    velocityData,
    averageVelocity,
    totalSprints: sprints.length,
    completedSprints: completedSprints.length
  }
}

async function generateSprintReport(projectId: string, startDate?: string, endDate?: string) {
  let sprintQuery: any = { project: projectId }
  if (startDate && endDate) {
    sprintQuery.startDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  const sprints = await Sprint.find(sprintQuery)
    .populate('stories')
    .populate('tasks')
    .sort({ startDate: 1 })
  
  // Get sprint events
  const sprintEvents = await SprintEvent.find({ 
    project: projectId,
    sprint: { $in: sprints.map(s => s._id) }
  })
    .populate('facilitator', 'firstName lastName')
    .populate('attendees', 'firstName lastName')
    .sort({ scheduledDate: 1 })
  
  return {
    sprints,
    sprintEvents,
    summary: {
      totalSprints: sprints.length,
      activeSprints: sprints.filter(s => s.status === 'active').length,
      completedSprints: sprints.filter(s => s.status === 'completed').length,
      totalEvents: sprintEvents.length
    }
  }
}

async function generateTeamPerformanceReport(projectId: string, startDate?: string, endDate?: string) {
  // Get time entries for the project
  let timeQuery: any = { project: projectId }
  if (startDate && endDate) {
    timeQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }
  
  const timeEntries = await TimeEntry.find(timeQuery)
    .populate('user', 'firstName lastName')
  
  // Calculate performance metrics by user
  const userPerformance = timeEntries.reduce((acc, entry) => {
    const userId = entry.user._id.toString()
    if (!acc[userId]) {
      acc[userId] = {
        user: entry.user,
        totalHours: 0,
        totalEntries: 0,
        averageSessionLength: 0
      }
    }
    acc[userId].totalHours += entry.duration / 3600
    acc[userId].totalEntries += 1
    return acc
  }, {} as Record<string, any>)
  
  // Calculate average session length
  Object.values(userPerformance).forEach((perf: any) => {
    perf.averageSessionLength = perf.totalEntries > 0 ? perf.totalHours / perf.totalEntries : 0
  })
  
  return {
    userPerformance: Object.values(userPerformance),
    summary: {
      totalHours: timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 3600,
      totalEntries: timeEntries.length,
      uniqueUsers: Object.keys(userPerformance).length
    }
  }
}
