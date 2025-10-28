'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  GripVertical, 
  MoreHorizontal, 
  Target, 
  Calendar, 
  BarChart3, 
  Clock 
} from 'lucide-react'
import { ITask } from '@/models/Task'

interface PopulatedTask extends Omit<ITask, 'assignedTo'> {
  assignedTo?: {
    firstName: string
    lastName: string
    email: string
  }
}

interface SortableTaskProps {
  task: PopulatedTask
  onClick: () => void
  getPriorityColor: (priority: string) => string
  getTypeColor: (type: string) => string
  isDragOverlay?: boolean
}

export default function SortableTask({ 
  task, 
  onClick, 
  getPriorityColor, 
  getTypeColor, 
  isDragOverlay = false 
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id as string })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`hover:shadow-md transition-shadow cursor-pointer m-1 ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOverlay ? 'rotate-3 shadow-lg' : ''}`}
      onClick={onClick}
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
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
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
        </div>
      </CardContent>
    </Card>
  )
}
