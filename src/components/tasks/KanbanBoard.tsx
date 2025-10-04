'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Target, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Clock,
  Loader2,
  Plus,
  BookOpen,
  Zap
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
import CompletionStatus from './CompletionStatus'

interface Task {
  _id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'bug' | 'feature' | 'improvement' | 'task' | 'subtask'
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

interface KanbanBoardProps {
  projectId: string
  onCreateTask: () => void
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'testing', title: 'Testing', color: 'bg-purple-100 text-purple-800' },
  { id: 'done', title: 'Done', color: 'bg-green-100 text-green-800' }
]

export default function KanbanBoard({ projectId, onCreateTask }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks?project=${projectId}`)
      const data = await response.json()

      if (data.success) {
        setTasks(data.data)
      } else {
        setError(data.error || 'Failed to fetch tasks')
      }
    } catch (err) {
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800'
      case 'feature': return 'bg-green-100 text-green-800'
      case 'improvement': return 'bg-blue-100 text-blue-800'
      case 'task': return 'bg-gray-100 text-gray-800'
      case 'subtask': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const response = await fetch(`/api/tasks/${draggedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        setTasks(tasks.map(task => 
          task._id === draggedTask._id ? { ...task, status: newStatus as any } : task
        ))
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }

    setDraggedTask(null)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setTasks(tasks.filter(task => task._id !== taskId))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading kanban board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Kanban Board</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks between columns to update their status. Stories, sprints, and epics will auto-complete when all their tasks are done.
          </p>
        </div>
        <Button onClick={onCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color.split(' ')[0]}`} />
                <h4 className="font-medium text-foreground">{column.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
            </div>
            
            <div
              className="min-h-[400px] space-y-3 p-4 border-2 border-dashed border-gray-200 rounded-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {getTasksByStatus(column.id).map((task) => (
                <Card 
                  key={task._id} 
                  className="cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-sm text-foreground line-clamp-2">
                          {task.title}
                        </h5>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <span className="sr-only">Open menu</span>
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-destructive focus:text-destructive"
                            >
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center space-x-1">
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <Badge className={`text-xs ${getTypeColor(task.type)}`}>
                          {task.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          {task.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignedTo.firstName}</span>
                            </div>
                          )}
                          {task.storyPoints && (
                            <div className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{task.storyPoints}</span>
                            </div>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Story and Sprint Status Indicators */}
                      {(task.story || task.sprint) && (
                        <div className="flex items-center space-x-2 text-xs">
                          {task.story && (
                            <div className="flex items-center space-x-1">
                              <BookOpen className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{task.story.title}</span>
                              {task.story.status === 'completed' && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          )}
                          {task.sprint && (
                            <div className="flex items-center space-x-1">
                              <Zap className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{task.sprint.name}</span>
                              {task.sprint.status === 'completed' && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {task.labels.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {task.labels.slice(0, 2).map((label, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                          {task.labels.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.labels.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getTasksByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No tasks in this column</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
