'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, FolderOpen, CheckSquare, Users, Clock, BarChart3, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { usePermissions } from '@/lib/permissions/permission-context'
import { Permission } from '@/lib/permissions/permission-definitions'

interface QuickAction {
  title: string
  description: string
  icon: any
  color: string
  href: string
  permissions: Permission[]
}

const quickActions: QuickAction[] = [
  {
    title: 'New Project',
    description: 'Create a new project',
    icon: FolderOpen,
    color: 'bg-blue-500 hover:bg-blue-600',
    href: '/projects/create',
    permissions: [Permission.PROJECT_CREATE]
  },
  {
    title: 'Add Task',
    description: 'Create a new task',
    icon: CheckSquare,
    color: 'bg-green-500 hover:bg-green-600',
    href: '/tasks/create',
    permissions: [Permission.TASK_CREATE]
  },
  {
    title: 'Invite Team',
    description: 'Invite team members',
    icon: Users,
    color: 'bg-purple-500 hover:bg-purple-600',
    href: '/team/members',
    permissions: [Permission.TEAM_INVITE]
  },
  {
    title: 'Start Timer',
    description: 'Start time tracking',
    icon: Clock,
    color: 'bg-orange-500 hover:bg-orange-600',
    href: '/time-tracking/timer',
    permissions: [Permission.TIME_TRACKING_CREATE]
  },
  {
    title: 'View Reports',
    description: 'View time tracking reports',
    icon: BarChart3,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    href: '/time-tracking/reports',
    permissions: [Permission.TIME_TRACKING_READ]
  }
]

export function QuickActions() {
  const { hasAnyPermission } = usePermissions()

  // Filter actions based on user permissions
  const availableActions = quickActions.filter(action => 
    hasAnyPermission(action.permissions)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {availableActions.map((action, index) => {
            const Icon = action.icon
            
            return (
              <Link
                key={index}
                href={action.href}
                prefetch={true}
              >
                <Button
                  variant="ghost"
                  className="h-auto p-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                >
                <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </div>
                </div>
                </Button>
              </Link>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Link href="/projects" prefetch={true}>
            <Button 
              variant="outline" 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              View All Projects
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
