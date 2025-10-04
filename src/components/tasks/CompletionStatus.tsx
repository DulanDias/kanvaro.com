'use client'

import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { CheckCircle, BookOpen, Zap, Target } from 'lucide-react'

interface CompletionStatusProps {
  type: 'story' | 'sprint' | 'epic'
  id: string
  title: string
  completed: number
  total: number
  status?: string
}

export default function CompletionStatus({ 
  type, 
  id, 
  title, 
  completed, 
  total, 
  status 
}: CompletionStatusProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const isCompleted = status === 'completed' || (completed === total && total > 0)

  const getIcon = () => {
    switch (type) {
      case 'story':
        return <BookOpen className="h-4 w-4" />
      case 'sprint':
        return <Zap className="h-4 w-4" />
      case 'epic':
        return <Target className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTypeColor = () => {
    if (isCompleted) return 'bg-green-100 text-green-800 border-green-200'
    
    switch (type) {
      case 'story':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sprint':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'epic':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="text-sm font-medium text-foreground truncate">
            {title}
          </span>
          {isCompleted && (
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs ${getTypeColor()}`}
        >
          {completed}/{total}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <Progress 
          value={percentage} 
          className="h-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage}% complete</span>
          <span>{total - completed} remaining</span>
        </div>
      </div>
    </div>
  )
}
