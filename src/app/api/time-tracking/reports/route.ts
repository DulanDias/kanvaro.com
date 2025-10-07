import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { TimeEntry } from '@/models/TimeEntry'
import { Project } from '@/models/Project'
import { User } from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const reportType = searchParams.get('reportType') || 'summary'

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date()

    // Build base query
    const baseQuery: any = {
      organization: organizationId,
      startTime: { $gte: start, $lte: end },
      status: 'completed'
    }

    if (projectId) baseQuery.project = projectId
    if (userId) baseQuery.user = userId

    switch (reportType) {
      case 'summary':
        return await getSummaryReport(baseQuery)
      case 'byUser':
        return await getUserReport(baseQuery)
      case 'byProject':
        return await getProjectReport(baseQuery)
      case 'byTask':
        return await getTaskReport(baseQuery)
      case 'billable':
        return await getBillableReport(baseQuery)
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating time tracking report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getSummaryReport(query: any) {
  const summary = await TimeEntry.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCost: { $sum: { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] } },
        billableDuration: { $sum: { $cond: ['$isBillable', '$duration', 0] } },
        billableCost: { $sum: { $cond: ['$isBillable', { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] }, 0] } },
        approvedEntries: { $sum: { $cond: ['$isApproved', 1, 0] } },
        pendingEntries: { $sum: { $cond: ['$isApproved', 0, 1] } }
      }
    }
  ])

  const dailyBreakdown = await TimeEntry.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
        duration: { $sum: '$duration' },
        cost: { $sum: { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] } }
      }
    },
    { $sort: { _id: 1 } }
  ])

  return NextResponse.json({
    summary: summary[0] || {
      totalEntries: 0,
      totalDuration: 0,
      totalCost: 0,
      billableDuration: 0,
      billableCost: 0,
      approvedEntries: 0,
      pendingEntries: 0
    },
    dailyBreakdown
  })
}

async function getUserReport(query: any) {
  const userReport = await TimeEntry.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$user',
        totalDuration: { $sum: '$duration' },
        totalCost: { $sum: { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] } },
        billableDuration: { $sum: { $cond: ['$isBillable', '$duration', 0] } },
        billableCost: { $sum: { $cond: ['$isBillable', { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] }, 0] } },
        entryCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        userEmail: '$user.email',
        totalDuration: 1,
        totalCost: 1,
        billableDuration: 1,
        billableCost: 1,
        entryCount: 1
      }
    },
    { $sort: { totalDuration: -1 } }
  ])

  return NextResponse.json({ userReport })
}

async function getProjectReport(query: any) {
  const projectReport = await TimeEntry.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$project',
        totalDuration: { $sum: '$duration' },
        totalCost: { $sum: { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] } },
        billableDuration: { $sum: { $cond: ['$isBillable', '$duration', 0] } },
        billableCost: { $sum: { $cond: ['$isBillable', { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] }, 0] } },
        entryCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$project' },
    {
      $project: {
        projectId: '$_id',
        projectName: '$project.name',
        totalDuration: 1,
        totalCost: 1,
        billableDuration: 1,
        billableCost: 1,
        entryCount: 1
      }
    },
    { $sort: { totalDuration: -1 } }
  ])

  return NextResponse.json({ projectReport })
}

async function getTaskReport(query: any) {
  const taskReport = await TimeEntry.aggregate([
    { $match: { ...query, task: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$task',
        totalDuration: { $sum: '$duration' },
        totalCost: { $sum: { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] } },
        billableDuration: { $sum: { $cond: ['$isBillable', '$duration', 0] } },
        billableCost: { $sum: { $cond: ['$isBillable', { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] }, 0] } },
        entryCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: '_id',
        as: 'task'
      }
    },
    { $unwind: '$task' },
    {
      $project: {
        taskId: '$_id',
        taskTitle: '$task.title',
        totalDuration: 1,
        totalCost: 1,
        billableDuration: 1,
        billableCost: 1,
        entryCount: 1
      }
    },
    { $sort: { totalDuration: -1 } }
  ])

  return NextResponse.json({ taskReport })
}

async function getBillableReport(query: any) {
  const billableQuery = { ...query, isBillable: true }
  
  const billableReport = await TimeEntry.aggregate([
    { $match: billableQuery },
    {
      $group: {
        _id: {
          user: '$user',
          project: '$project'
        },
        totalDuration: { $sum: '$duration' },
        totalCost: { $sum: { $multiply: ['$duration', { $divide: ['$hourlyRate', 60] }] } },
        entryCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: '_id.project',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$user' },
    { $unwind: '$project' },
    {
      $project: {
        userId: '$_id.user',
        userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        userEmail: '$user.email',
        projectId: '$_id.project',
        projectName: '$project.name',
        totalDuration: 1,
        totalCost: 1,
        entryCount: 1
      }
    },
    { $sort: { totalCost: -1 } }
  ])

  return NextResponse.json({ billableReport })
}
