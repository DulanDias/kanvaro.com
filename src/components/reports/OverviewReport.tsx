'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  Calendar,
  AlertTriangle
} from 'lucide-react'

interface OverviewData {
  project: {
    name: string
    status: string
    startDate: string
    endDate?: string
  }
  tasks: {
    total: number
    completed: number
    completionRate: number
  }
  sprints: {
    total: number
    active: number
  }
  timeTracking: {
    totalHours: number
    entries: number
  }
  budget: {
    total: number
    spent: number
    remaining: number
    utilizationRate: number
  }
  recentBurnRates: Array<{
    date: string
    actualBurn: number
    plannedBurn: number
    velocity: number
  }>
}

interface OverviewReportProps {
  projectId: string
}

export function OverviewReport({ projectId }: OverviewReportProps) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverviewData()
  }, [projectId])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?projectId=${projectId}&type=overview`)
      if (response.ok) {
        const data = await response.json()
        setData(data)
      }
    } catch (error) {
      console.error('Error fetching overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No overview data available</p>
      </div>
    )
  }

  const getBudgetStatus = () => {
    if (data.budget.utilizationRate > 90) return { color: 'text-red-500', icon: AlertTriangle }
    if (data.budget.utilizationRate > 75) return { color: 'text-yellow-500', icon: TrendingUp }
    return { color: 'text-green-500', icon: TrendingDown }
  }

  const budgetStatus = getBudgetStatus()

  return (
    <div className="space-y-6">
      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Project Status
            <Badge variant={data.project.status === 'active' ? 'default' : 'secondary'}>
              {data.project.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(data.project.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">End Date</p>
              <p className="text-sm text-muted-foreground">
                {data.project.endDate ? new Date(data.project.endDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-muted-foreground">
                {data.project.endDate 
                  ? `${Math.ceil((new Date(data.project.endDate).getTime() - new Date(data.project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                  : 'Ongoing'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Budget Overview</span>
            <budgetStatus.icon className={`h-4 w-4 ${budgetStatus.color}`} />
          </CardTitle>
          <CardDescription>
            Current budget utilization and spending trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization</span>
              <span className={budgetStatus.color}>
                {data.budget.utilizationRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={data.budget.utilizationRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${data.budget.total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                ${data.budget.spent.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Spent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                ${data.budget.remaining.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Task Progress</span>
          </CardTitle>
          <CardDescription>
            Completion rate and task distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span>{data.tasks.completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={data.tasks.completionRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{data.tasks.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.tasks.total - data.tasks.completed}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time Tracking</span>
          </CardTitle>
          <CardDescription>
            Total time logged and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{data.timeTracking.totalHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Total Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.timeTracking.entries}</p>
              <p className="text-xs text-muted-foreground">Time Entries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprint Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Sprint Summary</span>
          </CardTitle>
          <CardDescription>
            Sprint activity and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{data.sprints.active}</p>
              <p className="text-xs text-muted-foreground">Active Sprints</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.sprints.total}</p>
              <p className="text-xs text-muted-foreground">Total Sprints</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Burn Rate Trends */}
      {data.recentBurnRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Burn Rate Trends</span>
            </CardTitle>
            <CardDescription>
              Latest burn rate data and velocity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentBurnRates.slice(0, 5).map((rate, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(rate.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Velocity: {rate.velocity} points
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${rate.actualBurn.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Actual Burn
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
