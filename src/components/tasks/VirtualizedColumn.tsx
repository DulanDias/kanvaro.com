'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Target, Plus } from 'lucide-react'
import SortableTask from './SortableTask'
import { ITask } from '@/models/Task'

interface PopulatedTask extends Omit<ITask, 'assignedTo'> {
  assignedTo?: {
    firstName: string
    lastName: string
    email: string
  }
}

interface Column {
  key: string
  title: string
  color: string
}

interface VirtualizedColumnProps {
  column: Column
  tasks: PopulatedTask[]
  onCreateTask: (status?: string) => void
  getPriorityColor: (priority: string) => string
  getTypeColor: (type: string) => string
  onTaskClick?: (task: PopulatedTask) => void
  onEditTask?: (task: PopulatedTask) => void
  onDeleteTask?: (taskId: string) => void
}

export default function VirtualizedColumn({
  column,
  tasks,
  onCreateTask,
  getPriorityColor,
  getTypeColor,
  onTaskClick,
  onEditTask,
  onDeleteTask
}: VirtualizedColumnProps) {
  console.log('Creating task with status:', column.key)
  const parentRef = useRef<HTMLDivElement>(null)
  
  // Add droppable functionality for empty columns
  const { setNodeRef, isOver } = useDroppable({
    id: column.key,
  })
  
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
          variant="outline" 
          size="sm"
          onClick={() => onCreateTask(column.key)}
        >
          +
        </Button>
      </div>
      
        <SortableContext
          items={tasks.map(task => task._id as string)}
          strategy={verticalListSortingStrategy}
        >
        <div 
          ref={setNodeRef}
          className={`h-[500px] overflow-auto border-2 border-dashed rounded-lg transition-colors ${
            isOver 
              ? 'border-primary bg-primary/5' 
              : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          {tasks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Drop tasks here</p>
              </div>
            </div>
          ) : (
            <div
              ref={parentRef}
              className="h-full"
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
                      <SortableTask 
                        task={task}
                        onClick={() => onTaskClick?.(task)}
                        getPriorityColor={getPriorityColor}
                        getTypeColor={getTypeColor}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}