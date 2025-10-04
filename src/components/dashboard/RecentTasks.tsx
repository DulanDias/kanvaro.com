'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Calendar, User, ArrowRight } from 'lucide-react'

const mockTasks = [
  {
    id: 1,
    title: 'Update user interface components',
    project: 'Website Redesign',
    assignedTo: 'John Doe',
    dueDate: '2024-01-25',
    priority: 'high',
    status: 'in_progress',
    completed: false
  },
  {
    id: 2,
    title: 'Review API documentation',
    project: 'Mobile App Development',
    assignedTo: 'Sarah Wilson',
    dueDate: '2024-01-28',
    priority: 'medium',
    status: 'todo',
    completed: false
  },
  {
    id: 3,
    title: 'Setup database schema',
    project: 'Database Migration',
    assignedTo: 'Mike Johnson',
    dueDate: '2024-01-30',
    priority: 'high',
    status: 'todo',
    completed: false
  },
  {
    id: 4,
    title: 'Test payment integration',
    project: 'API Integration',
    assignedTo: 'You',
    dueDate: '2024-01-22',
    priority: 'low',
    status: 'done',
    completed: true
  },
  {
    id: 5,
    title: 'Create user documentation',
    project: 'Website Redesign',
    assignedTo: 'Emily Chen',
    dueDate: '2024-02-01',
    priority: 'medium',
    status: 'review',
    completed: false
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'review':
      return 'bg-yellow-100 text-yellow-800'
    case 'done':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function RecentTasks() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Checkbox 
                checked={task.completed}
                className="flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h4>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{task.project}</span>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {task.assignedTo}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                View
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
