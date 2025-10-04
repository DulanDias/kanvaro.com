'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, FolderOpen, CheckSquare, Users, Clock, FileText } from 'lucide-react'

const quickActions = [
  {
    title: 'New Project',
    description: 'Create a new project',
    icon: FolderOpen,
    color: 'bg-blue-500 hover:bg-blue-600',
    href: '/projects/new'
  },
  {
    title: 'Add Task',
    description: 'Create a new task',
    icon: CheckSquare,
    color: 'bg-green-500 hover:bg-green-600',
    href: '/tasks/new'
  },
  {
    title: 'Invite Team',
    description: 'Invite team members',
    icon: Users,
    color: 'bg-purple-500 hover:bg-purple-600',
    href: '/team/invite'
  },
  {
    title: 'Start Timer',
    description: 'Start time tracking',
    icon: Clock,
    color: 'bg-orange-500 hover:bg-orange-600',
    href: '/time-tracking/timer'
  },
  {
    title: 'Generate Report',
    description: 'Create project report',
    icon: FileText,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    href: '/reports/new'
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  // In a real app, this would navigate to the action
                  console.log(`Navigate to ${action.href}`)
                }}
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
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            More Actions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
