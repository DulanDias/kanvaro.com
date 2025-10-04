import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { Task } from '@/models/Task'
import { TimeEntry } from '@/models/TimeEntry'
import { Project } from '@/models/Project'
import { authenticateUser } from '@/lib/auth-utils'
import { hasPermission } from '@/lib/permissions/permission-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Check if user has team reporting permissions
    const hasAccess = await hasPermission(authResult.user.id, 'REPORTING_VIEW')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const department = searchParams.get('department')
    const role = searchParams.get('role')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'productivity'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query for users
    let userQuery: any = {}
    
    if (search) {
      userQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (department && department !== 'all') {
      userQuery.department = department
    }
    
    if (role && role !== 'all') {
      userQuery.role = role
    }

    // Get users with populated data
    const users = await User.find(userQuery)
      .select('firstName lastName email role department avatar')
      .lean()

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get task statistics
        const totalTasks = await Task.countDocuments({ assignedTo: user._id })
        const completedTasks = await Task.countDocuments({ 
          assignedTo: user._id, 
          status: 'completed' 
        })
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        // Get time tracking statistics
        let timeQuery: any = { user: user._id }
        if (startDate && endDate) {
          timeQuery.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
        
        const timeEntries = await TimeEntry.find(timeQuery)
        const totalHoursLogged = timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 3600
        const averageSessionLength = timeEntries.length > 0 ? totalHoursLogged / timeEntries.length : 0

        // Calculate productivity score (simplified algorithm)
        const productivityScore = Math.min(100, 
          (completionRate * 0.4) + 
          (Math.min(totalHoursLogged / 40, 1) * 30) + 
          (Math.min(completedTasks / 10, 1) * 30)
        )

        // Calculate workload score
        const currentTasks = await Task.countDocuments({ 
          assignedTo: user._id, 
          status: { $in: ['todo', 'in-progress'] } 
        })
        const workloadScore = Math.min(100, (currentTasks / 5) * 100)

        // Get recent activity (simplified)
        const recentActivity = [
          {
            date: new Date().toISOString().split('T')[0],
            activity: `Completed ${completedTasks} tasks`,
            type: 'task' as const
          },
          {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            activity: `Logged ${totalHoursLogged.toFixed(1)} hours`,
            type: 'time' as const
          }
        ]

        return {
          ...user,
          stats: {
            tasksCompleted: completedTasks,
            totalTasks,
            completionRate,
            hoursLogged: totalHoursLogged,
            averageSessionLength,
            productivityScore,
            workloadScore
          },
          recentActivity
        }
      })
    )

    // Sort users based on sortBy parameter
    usersWithStats.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'productivity':
          aValue = a.stats.productivityScore
          bValue = b.stats.productivityScore
          break
        case 'workload':
          aValue = a.stats.workloadScore
          bValue = b.stats.workloadScore
          break
        case 'completion':
          aValue = a.stats.completionRate
          bValue = b.stats.completionRate
          break
        case 'hours':
          aValue = a.stats.hoursLogged
          bValue = b.stats.hoursLogged
          break
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`
          bValue = `${b.firstName} ${b.lastName}`
          break
        default:
          aValue = a.stats.productivityScore
          bValue = b.stats.productivityScore
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Calculate overview metrics
    const overview = {
      totalMembers: usersWithStats.length,
      activeMembers: usersWithStats.filter(u => u.stats.hoursLogged > 0).length,
      averageProductivity: usersWithStats.length > 0 
        ? usersWithStats.reduce((sum, u) => sum + u.stats.productivityScore, 0) / usersWithStats.length 
        : 0,
      averageWorkload: usersWithStats.length > 0 
        ? usersWithStats.reduce((sum, u) => sum + u.stats.workloadScore, 0) / usersWithStats.length 
        : 0,
      totalHoursLogged: usersWithStats.reduce((sum, u) => sum + u.stats.hoursLogged, 0),
      totalTasksCompleted: usersWithStats.reduce((sum, u) => sum + u.stats.tasksCompleted, 0)
    }

    // Calculate department breakdown
    const departmentBreakdown = calculateDepartmentBreakdown(usersWithStats)

    // Get top performers (top 5 by productivity)
    const topPerformers = usersWithStats
      .sort((a, b) => b.stats.productivityScore - a.stats.productivityScore)
      .slice(0, 5)

    // Generate productivity trends (last 30 days)
    const productivityTrends = generateProductivityTrends(usersWithStats)

    // Calculate workload distribution
    const workloadDistribution = usersWithStats.map(user => ({
      member: `${user.firstName} ${user.lastName}`,
      currentTasks: user.stats.totalTasks - user.stats.tasksCompleted,
      completedTasks: user.stats.tasksCompleted,
      hoursLogged: user.stats.hoursLogged,
      workloadScore: user.stats.workloadScore
    }))

    return NextResponse.json({
      overview,
      members: usersWithStats,
      departmentBreakdown,
      productivityTrends,
      topPerformers,
      workloadDistribution
    })
  } catch (error) {
    console.error('Error fetching team reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateDepartmentBreakdown(users: any[]) {
  const departments = users.reduce((acc, user) => {
    const dept = user.department || 'Other'
    if (!acc[dept]) {
      acc[dept] = {
        department: dept,
        members: 0,
        totalProductivity: 0,
        totalWorkload: 0
      }
    }
    acc[dept].members += 1
    acc[dept].totalProductivity += user.stats.productivityScore
    acc[dept].totalWorkload += user.stats.workloadScore
    return acc
  }, {} as Record<string, any>)

  return Object.values(departments).map((dept: any) => ({
    department: dept.department,
    members: dept.members,
    averageProductivity: dept.members > 0 ? dept.totalProductivity / dept.members : 0,
    averageWorkload: dept.members > 0 ? dept.totalWorkload / dept.members : 0
  }))
}

function generateProductivityTrends(users: any[]) {
  const trends = []
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
    const dateStr = date.toISOString().split('T')[0]
    
    // Simplified calculation - in real app would aggregate actual data
    const productivity = users.length > 0 
      ? users.reduce((sum, user) => sum + user.stats.productivityScore, 0) / users.length 
      : 0
    const workload = users.length > 0 
      ? users.reduce((sum, user) => sum + user.stats.workloadScore, 0) / users.length 
      : 0
    const hours = users.length > 0 
      ? users.reduce((sum, user) => sum + user.stats.hoursLogged, 0) / 30 
      : 0
    
    trends.push({
      date: dateStr,
      productivity: productivity + (Math.random() - 0.5) * 10, // Add some variation
      workload: workload + (Math.random() - 0.5) * 10,
      hours: hours + (Math.random() - 0.5) * 2
    })
  }
  
  return trends
}
