'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Target, 
  Calendar, 
  Clock, 
  BarChart3, 
  GripVertical, 
  MoreHorizontal 
} from 'lucide-react'

interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'bug' | 'feature' | 'improvement' | 'task' | 'subtask'
  position: number
  assignedTo?: {
    firstName: string
    lastName: string
    email: string
  }
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
  story?: {
    _id: string
    title: string
    status: string
  }
  sprint?: {
    _id: string
    name: string
    status: string
  }
  storyPoints?: number
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  labels: string[]
  createdAt: string
  updatedAt: string
}

interface Column {
  key: string
  title: string
  color: string
}

interface VirtualizedColumnProps {
  column: Column
  tasks: Task[]
  onCreateTask: (status: string) => void
  getPriorityColor: (priority: string) => string
  getTypeColor: (type: string) => string
  onTaskClick?: (task: Task) => void
}

export default function VirtualizedColumn({
  column,
  tasks,
  onCreateTask,
  getPriorityColor,
  getTypeColor,
  onTaskClick
}: VirtualizedColumnProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge className={column.color}>
            {column.title}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onCreateTask(column.key)}
        >
          +
        </Button>
      </div>
      
      <div 
        ref={parentRef}
        className="h-[500px] overflow-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const task = tasks[virtualRow.index]
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer m-1"
                  onClick={() => onTaskClick?.(task)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-foreground text-sm line-clamp-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getTypeColor(task.type)}>
                          {task.type}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1 mb-1">
                          <Target className="h-3 w-3" />
                          <span>Project</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center space-x-1 mb-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.storyPoints && (
                          <div className="flex items-center space-x-1 mb-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{task.storyPoints} points</span>
                          </div>
                        )}
                        {task.estimatedHours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedHours}h</span>
                          </div>
                        )}
                      </div>
                      
                      {task.assignedTo && (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium">
                            {task.assignedTo.firstName[0]}{task.assignedTo.lastName[0]}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.assignedTo.firstName} {task.assignedTo.lastName}
                          </span>
                        </div>
                      )}
                      
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.slice(0, 2).map((label, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                          {task.labels.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{task.labels.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
