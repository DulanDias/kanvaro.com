'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FolderOpen, CheckSquare, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react'

const mockStats = [
  {
    title: 'Active Projects',
    value: '12',
    change: '+2',
    changeType: 'positive' as const,
    icon: FolderOpen,
    description: 'Projects in progress'
  },
  {
    title: 'Completed Tasks',
    value: '1,247',
    change: '+89',
    changeType: 'positive' as const,
    icon: CheckSquare,
    description: 'Tasks completed this month'
  },
  {
    title: 'Team Members',
    value: '24',
    change: '+3',
    changeType: 'positive' as const,
    icon: Users,
    description: 'Active team members'
  },
  {
    title: 'Hours Tracked',
    value: '2,847',
    change: '+156',
    changeType: 'positive' as const,
    icon: Clock,
    description: 'Hours logged this month'
  }
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockStats.map((stat, index) => {
        const Icon = stat.icon
        const ChangeIcon = stat.changeType === 'positive' ? TrendingUp : TrendingDown
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <ChangeIcon className="h-3 w-3" />
                <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span>from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
