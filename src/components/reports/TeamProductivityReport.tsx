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
  TrendingUp, 
  Target,
  Clock,
  Activity,
  Zap
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

interface TeamProductivityReportProps {
  members: TeamMember[]
  productivityTrends: {
    date: string
    productivity: number
    workload: number
    hours: number
  }[]
  filters: any
}

export function TeamProductivityReport({ members, productivityTrends, filters }: TeamProductivityReportProps) {
  // Calculate productivity metrics
  const averageProductivity = members.length > 0 
    ? members.reduce((sum, member) => sum + member.stats.productivityScore, 0) / members.length 
    : 0
  const totalHoursLogged = members.reduce((sum, member) => sum + member.stats.hoursLogged, 0)
  const totalTasksCompleted = members.reduce((sum, member) => sum + member.stats.tasksCompleted, 0)
  const averageSessionLength = members.length > 0 
    ? members.reduce((sum, member) => sum + member.stats.averageSessionLength, 0) / members.length 
    : 0

  // Prepare data for charts
  const productivityData = members.map(member => ({
    name: `${member.firstName} ${member.lastName}`.length > 15 
      ? `${member.firstName} ${member.lastName}`.substring(0, 15) + '...' 
      : `${member.firstName} ${member.lastName}`,
    productivity: member.stats.productivityScore,
    tasks: member.stats.tasksCompleted,
    hours: member.stats.hoursLogged,
    completion: member.stats.completionRate,
    sessionLength: member.stats.averageSessionLength
  }))

  const departmentProductivity = members.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = {
        department: member.department,
        members: 0,
        totalProductivity: 0,
        totalHours: 0,
        totalTasks: 0
      }
    }
    acc[member.department].members += 1
    acc[member.department].totalProductivity += member.stats.productivityScore
    acc[member.department].totalHours += member.stats.hoursLogged
    acc[member.department].totalTasks += member.stats.tasksCompleted
    return acc
  }, {} as Record<string, any>)

  const departmentData = Object.values(departmentProductivity).map((dept: any) => ({
    department: dept.department,
    members: dept.members,
    avgProductivity: dept.members > 0 ? dept.totalProductivity / dept.members : 0,
    totalHours: dept.totalHours,
    totalTasks: dept.totalTasks,
    productivityPerHour: dept.totalHours > 0 ? dept.totalTasks / dept.totalHours : 0
  }))

  const productivityTrendsData = productivityTrends.map(trend => ({
    date: trend.date,
    productivity: trend.productivity,
    workload: trend.workload,
    hours: trend.hours,
    efficiency: trend.hours > 0 ? trend.productivity / trend.hours : 0
  }))

  const topPerformers = members
    .sort((a, b) => b.stats.productivityScore - a.stats.productivityScore)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Productivity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageProductivity.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Team productivity score
            </p>
            <Progress value={averageProductivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHoursLogged.toFixed(0)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Logged across team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasksCompleted}
            </div>
            <p className="text-xs text-muted-foreground">
              Total completed tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageSessionLength.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average session length
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Productivity</CardTitle>
            <CardDescription>Productivity scores by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Productivity']} />
                <Bar dataKey="productivity" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Department Productivity</CardTitle>
            <CardDescription>Average productivity by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Productivity']} />
                <Bar dataKey="avgProductivity" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productivity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trends</CardTitle>
            <CardDescription>Team productivity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={productivityTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Area 
                  type="monotone" 
                  dataKey="productivity" 
                  stackId="1" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                  name="Productivity"
                />
                <Area 
                  type="monotone" 
                  dataKey="workload" 
                  stackId="2" 
                  stroke="#FFBB28" 
                  fill="#FFBB28" 
                  fillOpacity={0.6}
                  name="Workload"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hours vs Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Hours vs Productivity</CardTitle>
            <CardDescription>Hours logged vs productivity correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="productivity" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Productivity %"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Hours Logged"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription>Most productive team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={performer.avatar} />
                      <AvatarFallback>
                        {performer.firstName.charAt(0)}{performer.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {performer.firstName} {performer.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {performer.role} • {performer.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {performer.stats.productivityScore.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Productivity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {performer.stats.tasksCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground">Tasks Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {performer.stats.hoursLogged.toFixed(1)}h
                    </div>
                    <div className="text-xs text-muted-foreground">Hours Logged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {performer.stats.averageSessionLength.toFixed(1)}h
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Session</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Analysis</CardTitle>
          <CardDescription>Detailed productivity metrics for all team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {member.role} • {member.department}
                      </p>
                    </div>
                    <Badge variant={member.stats.productivityScore > 80 ? 'default' : 
                                   member.stats.productivityScore > 60 ? 'secondary' : 'outline'}>
                      {member.stats.productivityScore.toFixed(1)}% productivity
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Productivity Score</span>
                        <span>{member.stats.productivityScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={member.stats.productivityScore} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Tasks Completed</div>
                        <div className="font-medium">{member.stats.tasksCompleted}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Hours Logged</div>
                        <div className="font-medium">{member.stats.hoursLogged.toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Completion Rate</div>
                        <div className="font-medium">{member.stats.completionRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Session</div>
                        <div className="font-medium">{member.stats.averageSessionLength.toFixed(1)}h</div>
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
