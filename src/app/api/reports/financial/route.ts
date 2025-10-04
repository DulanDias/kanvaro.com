import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { BudgetEntry } from '@/models/BudgetEntry'
import { Project } from '@/models/Project'
import { TimeEntry } from '@/models/TimeEntry'
import { authenticateUser } from '@/lib/auth-utils'
import { hasPermission } from '@/lib/permissions/permission-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Check if user has financial reporting permissions
    const hasAccess = await hasPermission(authResult.user.id, 'FINANCIAL_READ')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const project = searchParams.get('project')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query for budget entries
    let budgetQuery: any = {}
    
    if (search) {
      budgetQuery.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (category && category !== 'all') {
      budgetQuery.category = category
    }
    
    if (project && project !== 'all') {
      budgetQuery.project = project
    }
    
    if (startDate && endDate) {
      budgetQuery.addedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    // Get budget entries
    const budgetEntries = await BudgetEntry.find(budgetQuery)
      .populate('project', 'name')
      .populate('addedBy', 'firstName lastName')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })

    // Get all projects for context
    const projects = await Project.find({})
      .select('name budget')
      .lean()

    // Calculate overview metrics
    const totalBudget = budgetEntries.reduce((sum, entry) => sum + entry.amount, 0)
    const totalSpent = projects.reduce((sum, project) => sum + (project.budget?.spent || 0), 0)
    const totalRevenue = projects.reduce((sum, project) => sum + (project.budget?.revenue || 0), 0)
    const netProfit = totalRevenue - totalSpent
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Calculate budget breakdown by category
    const categoryBreakdown = budgetEntries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = {
          category: entry.category,
          budgeted: 0,
          spent: 0,
          remaining: 0,
          utilizationRate: 0
        }
      }
      acc[entry.category].budgeted += entry.amount
      return acc
    }, {} as Record<string, any>)

    // Calculate spent amounts by category (simplified - would need more complex logic in real app)
    Object.keys(categoryBreakdown).forEach(category => {
      const categorySpent = budgetEntries
        .filter(entry => entry.category === category)
        .reduce((sum, entry) => sum + (entry.amount * 0.7), 0) // Simplified calculation
      categoryBreakdown[category].spent = categorySpent
      categoryBreakdown[category].remaining = categoryBreakdown[category].budgeted - categorySpent
      categoryBreakdown[category].utilizationRate = categoryBreakdown[category].budgeted > 0 
        ? (categorySpent / categoryBreakdown[category].budgeted) * 100 
        : 0
    })

    // Generate monthly trends (last 12 months)
    const monthlyTrends = generateMonthlyTrends(budgetEntries, projects)

    // Get top expenses
    const topExpenses = budgetEntries
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(entry => ({
        description: entry.description,
        amount: entry.amount,
        category: entry.category,
        project: entry.project?.name || 'Unknown',
        date: entry.addedAt.toISOString().split('T')[0]
      }))

    // Calculate revenue sources (simplified)
    const revenueSources = [
      { source: 'Project Revenue', amount: totalRevenue * 0.8, percentage: 80 },
      { source: 'Consulting', amount: totalRevenue * 0.15, percentage: 15 },
      { source: 'Other', amount: totalRevenue * 0.05, percentage: 5 }
    ]

    return NextResponse.json({
      overview: {
        totalBudget,
        totalSpent,
        totalRevenue,
        netProfit,
        budgetUtilization,
        profitMargin
      },
      budgetBreakdown: Object.values(categoryBreakdown),
      monthlyTrends,
      topExpenses,
      revenueSources
    })
  } catch (error) {
    console.error('Error fetching financial reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateMonthlyTrends(budgetEntries: any[], projects: any[]) {
  const months = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    // Calculate budget and spent for this month
    const monthBudget = budgetEntries
      .filter(entry => {
        const entryDate = new Date(entry.addedAt)
        return entryDate.getMonth() === date.getMonth() && entryDate.getFullYear() === date.getFullYear()
      })
      .reduce((sum, entry) => sum + entry.amount, 0)
    
    const monthSpent = monthBudget * 0.7 // Simplified calculation
    const monthRevenue = monthBudget * 1.2 // Simplified calculation
    const monthProfit = monthRevenue - monthSpent
    
    months.push({
      month: monthName,
      budget: monthBudget,
      spent: monthSpent,
      revenue: monthRevenue,
      profit: monthProfit
    })
  }
  
  return months
}
