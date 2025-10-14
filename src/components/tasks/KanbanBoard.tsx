'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Zap,
  GripVertical,
  MoreHorizontal,
  BarChart3,
  Settings,
  ChevronDown
} from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import dynamic from 'next/dynamic'
import VirtualizedColumn from './VirtualizedColumn'

// Dynamically import heavy modals
const CreateTaskModal = dynamic(() => import('./CreateTaskModal'), { ssr: false })
const ColumnSettingsModal = dynamic(() => import('./ColumnSettingsModal'), { ssr: false })

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

interface Project {
  _id: string
  name: string
  settings?: {
    kanbanStatuses?: Array<{
      key: string
      title: string
      color?: string
      order: number
    }>
  }
}

interface KanbanBoardProps {
  projectId: string
  onCreateTask: () => void
}

const defaultColumns = [
  { key: 'todo', title: 'To Do', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  { key: 'in_progress', title: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { key: 'review', title: 'Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { key: 'testing', title: 'Testing', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { key: 'done', title: 'Done', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
]

export default function KanbanBoard({ projectId, onCreateTask }: KanbanBoardProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState(projectId)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [createTaskStatus, setCreateTaskStatus] = useState<string | undefined>(undefined)
  const [showColumnSettings, setShowColumnSettings] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (data.success) {
        setProjects(data.data)
      } else {
        setError(data.error || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Failed to fetch projects')
    }
  }

  const fetchProject = async (id: string) => {
    try {
      // Handle "all" case by not fetching a specific project
      if (id === 'all') {
        setProject(null) // No specific project for "all" view
        return
      }
      
      const response = await fetch(`/api/projects/${id}`)
      const data = await response.json()

      if (data.success) {
        setProject(data.data)
      } else {
        setError(data.error || 'Failed to fetch project')
      }
    } catch (err) {
      setError('Failed to fetch project')
    }
  }

  const fetchTasks = async (id: string) => {
    try {
      setLoading(true)
      // Handle "all" case by not passing project parameter
      const url = id === 'all' ? '/api/tasks' : `/api/tasks?project=${id}`
      const response = await fetch(url)
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

  const handleProjectChange = (newProjectId: string) => {
    setSelectedProjectId(newProjectId)
    fetchProject(newProjectId)
    fetchTasks(newProjectId)
  }

  useEffect(() => {
    fetchProjects()
    fetchProject(selectedProjectId)
    fetchTasks(selectedProjectId)
  }, [])

  const getColumns = () => {
    // For "all" projects view, use default columns
    if (selectedProjectId === 'all' || !project) {
      return defaultColumns
    }
    
    if (project?.settings?.kanbanStatuses && project.settings.kanbanStatuses.length > 0) {
      return project.settings.kanbanStatuses
        .sort((a, b) => a.order - b.order)
        .map(status => ({
          key: status.key,
          title: status.title,
          color: status.color || defaultColumns.find(col => col.key === status.key)?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }))
    }
    return defaultColumns
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'feature': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'improvement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'task': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'subtask': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.position - b.position)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t._id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    // Find the task being dragged
    const activeTask = tasks.find(task => task._id === activeId)
    if (!activeTask) return

    // Determine the new status based on the drop target
    let newStatus = activeTask.status
    const columns = getColumns()
    
    if (typeof overId === 'string' && columns.some(col => col.key === overId)) {
      newStatus = overId
    } else {
      // If dropped on another task, get the status of that task
      const overTask = tasks.find(task => task._id === overId)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    // Handle same-column reordering
    if (newStatus === activeTask.status) {
      const columnTasks = getTasksByStatus(newStatus)
      const oldIndex = columnTasks.findIndex(task => task._id === activeId)
      const newIndex = columnTasks.findIndex(task => task._id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex)
        const orderedTaskIds = reorderedTasks.map(task => task._id)
        
        try {
          const response = await fetch('/api/tasks/reorder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectId,
              status: newStatus,
              orderedTaskIds
            })
          })

          const data = await response.json()
          if (data.success) {
            // Update local state
            setTasks(prevTasks => {
              const updatedTasks = [...prevTasks]
              reorderedTasks.forEach((task, index) => {
                const taskIndex = updatedTasks.findIndex(t => t._id === task._id)
                if (taskIndex !== -1) {
                  updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], position: index }
                }
              })
              return updatedTasks
            })
          }
        } catch (error) {
          console.error('Failed to reorder tasks:', error)
        }
      }
    } else {
      // Handle cross-column moves
      try {
        const response = await fetch(`/api/tasks/${activeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        })

        const data = await response.json()
        
        if (data.success) {
          setTasks(tasks.map(task => 
            task._id === activeId ? { ...task, status: newStatus } : task
          ))
        }
      } catch (error) {
        console.error('Failed to update task status:', error)
      }
    }
  }

  const handleCreateTask = (status?: string) => {
    setCreateTaskStatus(status)
    setShowCreateTaskModal(true)
  }

  const handleTaskCreated = () => {
    fetchTasks(selectedProjectId)
    onCreateTask()
  }

  const handleColumnsUpdated = () => {
    fetchProject(selectedProjectId)
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
        <div className="flex items-center space-x-2">
          <Select value={selectedProjectId} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowColumnSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Columns
          </Button>
          <Button onClick={() => handleCreateTask()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {getColumns().map((column) => {
            const columnTasks = getTasksByStatus(column.key)
            
            return (
              <VirtualizedColumn
                key={column.key}
                column={column}
                tasks={columnTasks}
                onCreateTask={handleCreateTask}
                getPriorityColor={getPriorityColor}
                getTypeColor={getTypeColor}
              />
            )
          })}
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <SortableTask 
              task={activeTask}
              isDragOverlay
              getPriorityColor={getPriorityColor}
              getTypeColor={getTypeColor}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => {
          setShowCreateTaskModal(false)
          setCreateTaskStatus(undefined)
        }}
        projectId={projectId}
        onTaskCreated={handleTaskCreated}
        defaultStatus={createTaskStatus}
        availableStatuses={getColumns().map(col => ({ key: col.key, title: col.title }))}
      />

      <ColumnSettingsModal
        isOpen={showColumnSettings}
        onClose={() => setShowColumnSettings(false)}
        projectId={projectId}
        currentColumns={getColumns().map(col => ({
          key: col.key,
          title: col.title,
          color: col.color,
          order: getColumns().indexOf(col)
        }))}
        onColumnsUpdated={handleColumnsUpdated}
      />
    </div>
  )
}

interface SortableTaskProps {
  task: Task
  getPriorityColor: (priority: string) => string
  getTypeColor: (type: string) => string
  isDragOverlay?: boolean
}

function SortableTask({ task, getPriorityColor, getTypeColor, isDragOverlay = false }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOverlay ? 'rotate-3 shadow-lg' : ''}`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
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
              >
                <GripVertical className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
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
  )
}