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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Users, 
  TrendingUp, 
  Clock,
  Target,
  Award,
  Activity
} from 'lucide-react'

interface TeamOverviewReportProps {
  overview: {
    totalMembers: number
    activeMembers: number
    averageProductivity: number
    averageWorkload: number
    totalHoursLogged: number
    totalTasksCompleted: number
  }
  departmentBreakdown: {
    department: string
    members: number
    averageProductivity: number
    averageWorkload: number
  }[]
  topPerformers: {
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
  }[]
  filters: any
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function TeamOverviewReport({ overview, departmentBreakdown, topPerformers, filters }: TeamOverviewReportProps) {
  // Prepare data for charts
  const departmentData = departmentBreakdown.map(dept => ({
    name: dept.department,
    members: dept.members,
    productivity: dept.averageProductivity,
    workload: dept.averageWorkload
  }))

  const departmentPieData = departmentBreakdown.map((dept, index) => ({
    name: dept.department,
    value: dept.members,
    color: COLORS[index % COLORS.length]
  }))

  const productivityData = departmentBreakdown.map(dept => ({
    name: dept.department,
    productivity: dept.averageProductivity,
    workload: dept.averageWorkload
  }))

  return (
    <div className="space-y-6">
      {/* Team Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {overview.activeMembers} active members
            </p>
            <Progress 
              value={(overview.activeMembers / overview.totalMembers) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.averageProductivity.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Team productivity score
            </p>
            <Progress value={overview.averageProductivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalHoursLogged.toFixed(0)}h
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
              {overview.totalTasksCompleted}
            </div>
            <p className="text-xs text-muted-foreground">
              Total completed tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Team by Department</CardTitle>
            <CardDescription>Distribution of team members across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity by Department</CardTitle>
            <CardDescription>Average productivity and workload by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="productivity" fill="#00C49F" name="Productivity" />
                <Bar dataKey="workload" fill="#FFBB28" name="Workload" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Size vs Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Department Size vs Productivity</CardTitle>
            <CardDescription>Team size and productivity correlation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="members" fill="#8884d8" name="Members" />
                <Bar yAxisId="right" dataKey="productivity" fill="#82ca9d" name="Productivity %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
            <CardDescription>Average workload across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Workload']} />
                <Area 
                  type="monotone" 
                  dataKey="workload" 
                  stroke="#FF8042" 
                  fill="#FF8042" 
                  fillOpacity={0.3}
                  name="Workload %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription>Team members with highest productivity scores</CardDescription>
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
                      {performer.stats.completionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Completion</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Detailed performance metrics by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentBreakdown.map((dept, index) => (
              <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <h3 className="font-semibold">{dept.department}</h3>
                    <Badge variant="outline">{dept.members} members</Badge>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Productivity</span>
                        <span>{dept.averageProductivity.toFixed(1)}%</span>
                      </div>
                      <Progress value={dept.averageProductivity} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Workload</span>
                        <span>{dept.averageWorkload.toFixed(1)}%</span>
                      </div>
                      <Progress value={dept.averageWorkload} className="h-2" />
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
