'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Clock, CheckCircle, Plus, MessageSquare } from 'lucide-react'

const mockActivities = [
  {
    id: 1,
    user: {
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg',
      initials: 'SW'
    },
    action: 'completed',
    target: 'Update user interface components',
    project: 'Website Redesign',
    timestamp: '2 minutes ago',
    type: 'task'
  },
  {
    id: 2,
    user: {
      name: 'Mike Johnson',
      avatar: '/avatars/mike.jpg',
      initials: 'MJ'
    },
    action: 'created',
    target: 'Database schema design',
    project: 'Database Migration',
    timestamp: '15 minutes ago',
    type: 'task'
  },
  {
    id: 3,
    user: {
      name: 'Emily Chen',
      avatar: '/avatars/emily.jpg',
      initials: 'EC'
    },
    action: 'commented',
    target: 'API Integration project',
    project: 'API Integration',
    timestamp: '1 hour ago',
    type: 'comment'
  },
  {
    id: 4,
    user: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
      initials: 'JD'
    },
    action: 'started',
    target: 'Mobile App Development',
    project: 'Mobile App Development',
    timestamp: '2 hours ago',
    type: 'project'
  },
  {
    id: 5,
    user: {
      name: 'Alex Rodriguez',
      avatar: '/avatars/alex.jpg',
      initials: 'AR'
    },
    action: 'updated',
    target: 'Payment integration status',
    project: 'API Integration',
    timestamp: '3 hours ago',
    type: 'task'
  }
]

const getActionIcon = (action: string, type: string) => {
  if (action === 'completed') return CheckCircle
  if (action === 'created' || action === 'started') return Plus
  if (action === 'commented') return MessageSquare
  if (action === 'updated') return Clock
  return Clock
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'completed':
      return 'text-green-600'
    case 'created':
    case 'started':
      return 'text-blue-600'
    case 'commented':
      return 'text-purple-600'
    case 'updated':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

export function TeamActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const ActionIcon = getActionIcon(activity.action, activity.type)
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.user.name}
                    </span>
                    <span className={`text-sm ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.target}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.project}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
                
                <div className={`p-1 rounded-full ${getActionColor(activity.action)}/10`}>
                  <ActionIcon className={`h-3 w-3 ${getActionColor(activity.action)}`} />
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
