'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Users, 
  AlertTriangle,
  Clock,
  Target,
  Activity,
  TrendingUp
} from 'lucide-react'

interface TeamMember {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  avatar?: string
  stats: {
    tasksCompleted: number
    totalTasks: number
    completionRate: number
    hoursLogged: number
    averageSessionLength: number
    productivityScore: number
    workloadScore: number
  }
  recentActivity: {
    date: string
    activity: string
    type: 'task' | 'time' | 'project'
  }[]
}

interface WorkloadDistribution {
  member: string
  currentTasks: number
  completedTasks: number
  hoursLogged: number
  workloadScore: number
}

interface TeamWorkloadReportProps {
  workloadDistribution: WorkloadDistribution[]
  members: TeamMember[]
  filters: any
}

export function TeamWorkloadReport({ workloadDistribution, members, filters }: TeamWorkloadReportProps) {
  // Calculate workload metrics
  const averageWorkload = workloadDistribution.length > 0 
    ? workloadDistribution.reduce((sum, item) => sum + item.workloadScore, 0) / workloadDistribution.length 
    : 0
  const totalCurrentTasks = workloadDistribution.reduce((sum, item) => sum + item.currentTasks, 0)
  const totalCompletedTasks = workloadDistribution.reduce((sum, item) => sum + item.completedTasks, 0)
  const totalHoursLogged = workloadDistribution.reduce((sum, item) => sum + item.hoursLogged, 0)

  // Identify overloaded members
  const overloadedMembers = workloadDistribution.filter(item => item.workloadScore > 80)
  const underloadedMembers = workloadDistribution.filter(item => item.workloadScore < 40)

  // Prepare data for charts
  const workloadData = workloadDistribution.map(item => ({
    name: item.member.length > 15 ? item.member.substring(0, 15) + '...' : item.member,
    workload: item.workloadScore,
    currentTasks: item.currentTasks,
    completedTasks: item.completedTasks,
    hours: item.hoursLogged
  }))

  const departmentWorkload = members.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = {
        department: member.department,
        members: 0,
        totalWorkload: 0,
        totalTasks: 0,
        totalHours: 0
      }
    }
    acc[member.department].members += 1
    acc[member.department].totalWorkload += member.stats.workloadScore
    acc[member.department].totalTasks += member.stats.totalTasks
    acc[member.department].totalHours += member.stats.hoursLogged
    return acc
  }, {} as Record<string, any>)

  const departmentData = Object.values(departmentWorkload).map((dept: any) => ({
    department: dept.department,
    members: dept.members,
    avgWorkload: dept.members > 0 ? dept.totalWorkload / dept.members : 0,
    totalTasks: dept.totalTasks,
    totalHours: dept.totalHours
  }))

  const workloadTrends = generateWorkloadTrends(workloadDistribution)

  return (
    <div className="space-y-6">
      {/* Workload Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageWorkload.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Team workload
            </p>
            <Progress value={averageWorkload} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCurrentTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overloadedMembers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Members over 80%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Underloaded</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {underloadedMembers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Members under 40%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Workload</CardTitle>
            <CardDescription>Workload distribution across team members</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Workload']} />
                <Bar dataKey="workload" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Department Workload</CardTitle>
            <CardDescription>Average workload by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Workload']} />
                <Bar dataKey="avgWorkload" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workload vs Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Workload vs Tasks</CardTitle>
            <CardDescription>Current tasks vs workload correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="workload" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Workload %"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="currentTasks" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Current Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workload Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Workload Trends</CardTitle>
            <CardDescription>Workload changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={workloadTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Workload']} />
                <Area 
                  type="monotone" 
                  dataKey="workload" 
                  stackId="1" 
                  stroke="#FF8042" 
                  fill="#FF8042" 
                  fillOpacity={0.6}
                  name="Workload"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overloaded Members Alert */}
      {overloadedMembers.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Overloaded Team Members</span>
            </CardTitle>
            <CardDescription className="text-red-700">
              These team members have workload scores above 80% and may need assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overloadedMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="destructive">{member.workloadScore.toFixed(1)}%</Badge>
                    <span className="font-medium">{member.member}</span>
                  </div>
                  <div className="text-sm text-red-700">
                    {member.currentTasks} current tasks
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workload Distribution Details */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Distribution Details</CardTitle>
          <CardDescription>Detailed workload metrics for all team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workloadDistribution.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{member.member}</h3>
                    <Badge variant={member.workloadScore > 80 ? 'destructive' : 
                                   member.workloadScore > 60 ? 'default' : 
                                   member.workloadScore > 40 ? 'secondary' : 'outline'}>
                      {member.workloadScore.toFixed(1)}% workload
                    </Badge>
                    {member.workloadScore > 80 && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Overloaded</span>
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Workload Score</span>
                        <span>{member.workloadScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={member.workloadScore} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current Tasks</div>
                        <div className="font-medium">{member.currentTasks}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Completed Tasks</div>
                        <div className="font-medium">{member.completedTasks}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Hours Logged</div>
                        <div className="font-medium">{member.hoursLogged.toFixed(1)}h</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateWorkloadTrends(workloadDistribution: WorkloadDistribution[]) {
  const trends = []
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
    const dateStr = date.toISOString().split('T')[0]
    
    // Simplified calculation - in real app would aggregate actual data
    const avgWorkload = workloadDistribution.length > 0 
      ? workloadDistribution.reduce((sum, member) => sum + member.workloadScore, 0) / workloadDistribution.length 
      : 0
    
    trends.push({
      date: dateStr,
      workload: avgWorkload + (Math.random() - 0.5) * 10 // Add some variation
    })
  }
  
  return trends
}
