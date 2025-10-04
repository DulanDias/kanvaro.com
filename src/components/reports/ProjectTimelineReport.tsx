'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Calendar, 
  Clock, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  status: string
  startDate: string
  endDate?: string
  description?: string
  budget?: {
    total: number
    spent: number
    remaining: number
  }
  team?: any[]
  stats: {
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
  }
}

interface ProjectTimelineReportProps {
  projects: Project[]
  filters: any
}

export function ProjectTimelineReport({ projects, filters }: ProjectTimelineReportProps) {
  // Prepare timeline data
  const timelineData = projects.map(project => {
    const startDate = new Date(project.startDate)
    const endDate = project.endDate ? new Date(project.endDate) : new Date()
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysElapsed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const progress = Math.min(100, (daysElapsed / duration) * 100)
    
    return {
      name: project.name,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      duration,
      daysElapsed,
      progress,
      completion: project.stats.tasks.completionRate,
      status: project.status,
      isOverdue: project.status !== 'completed' && daysElapsed > duration
    }
  })

  // Generate monthly project data
  const monthlyData = generateMonthlyProjectData(projects)

  // Calculate timeline metrics
  const overdueProjects = timelineData.filter(p => p.isOverdue)
  const onTrackProjects = timelineData.filter(p => !p.isOverdue && p.status === 'active')
  const completedProjects = timelineData.filter(p => p.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Timeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              In timeline view
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onTrackProjects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Projects on schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueProjects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Projects behind schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedProjects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Timeline Gantt-like View */}
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Project duration and progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [`${value} days`, 'Duration']} />
                <Bar dataKey="duration" fill="#8884d8" name="Planned Duration" />
                <Bar dataKey="daysElapsed" fill="#82ca9d" name="Days Elapsed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Project Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Project Activity</CardTitle>
            <CardDescription>Project starts and completions by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="started" 
                  stackId="1" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                  name="Projects Started"
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stackId="2" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                  name="Projects Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress vs Time */}
        <Card>
          <CardHeader>
            <CardTitle>Progress vs Time</CardTitle>
            <CardDescription>Task completion vs timeline progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Timeline Progress"
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Task Completion"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Trends</CardTitle>
            <CardDescription>Status distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" fill="#00C49F" name="Active" />
                <Bar dataKey="completed" fill="#0088FE" name="Completed" />
                <Bar dataKey="overdue" fill="#FF8042" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Timeline Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline Details</CardTitle>
          <CardDescription>Detailed timeline view for each project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineData.map((project) => (
              <div key={project.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{project.name}</h3>
                    <Badge variant={project.isOverdue ? 'destructive' : 'default'}>
                      {project.status}
                    </Badge>
                    {project.isOverdue && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Overdue</span>
                      </Badge>
                    )}
                  </div>
                  
                  {/* Timeline Progress */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Timeline Progress</span>
                        </span>
                        <span>{project.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {project.daysElapsed} of {project.duration} days elapsed
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>Task Completion</span>
                        </span>
                        <span>{project.completion.toFixed(1)}%</span>
                      </div>
                      <Progress value={project.completion} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 ml-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {project.startDate}
                    </div>
                    <div className="text-xs text-muted-foreground">Start Date</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {project.endDate}
                    </div>
                    <div className="text-xs text-muted-foreground">End Date</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {project.duration}
                    </div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateMonthlyProjectData(projects: Project[]) {
  const months = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    // Count projects by status for this month
    const monthProjects = projects.filter(project => {
      const startDate = new Date(project.startDate)
      return startDate.getMonth() === date.getMonth() && startDate.getFullYear() === date.getFullYear()
    })
    
    const completedProjects = projects.filter(project => {
      if (!project.endDate) return false
      const endDate = new Date(project.endDate)
      return endDate.getMonth() === date.getMonth() && endDate.getFullYear() === date.getFullYear()
    })
    
    months.push({
      month: monthName,
      started: monthProjects.length,
      completed: completedProjects.length,
      active: projects.filter(p => p.status === 'active').length,
      overdue: projects.filter(p => {
        const startDate = new Date(p.startDate)
        const endDate = p.endDate ? new Date(p.endDate) : new Date()
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysElapsed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        return p.status !== 'completed' && daysElapsed > duration
      }).length
    })
  }
  
  return months
}
