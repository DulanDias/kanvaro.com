'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  XCircle,
  Play,
  Loader2,
  User,
  Target,
  Zap,
  BarChart3,
  List,
  Kanban,
  Eye,
  Settings,
  Edit,
  Trash2
} from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDebounce } from '@/hooks/useDebounce'
import dynamic from 'next/dynamic'
import { Permission, PermissionGate } from '@/lib/permissions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'

// Dynamically import heavy modals
const CreateTaskModal = dynamic(() => import('./CreateTaskModal'), { ssr: false })
const KanbanBoard = dynamic(() => import('./KanbanBoard'), { ssr: false })

interface Task {
  _id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'bug' | 'feature' | 'improvement' | 'task' | 'subtask'
  displayId?: string
  project: {
    _id: string
    name: string
  }
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
  storyPoints?: number
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  labels: string[]
  createdAt: string
  updatedAt: string
}

interface TasksClientProps {
  initialTasks: Task[]
  initialPagination: any
  initialFilters?: {
    search?: string
    status?: string
    priority?: string
    type?: string
    project?: string
  }
}

export default function TasksClient({ 
  initialTasks, 
  initialPagination, 
  initialFilters = {} 
}: TasksClientProps) {
  const router = useRouter()
    const searchParams = useSearchParams()
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '')
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all')
  const [priorityFilter, setPriorityFilter] = useState(initialFilters.priority || 'all')
  const [typeFilter, setTypeFilter] = useState(initialFilters.type || 'all')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  useEffect(() => {
    const q = searchParams.get('search') || ''
    const s = searchParams.get('status') || 'all'
    const p = searchParams.get('priority') || 'all'
    setSearchQuery(q)
    setStatusFilter(s)
    setPriorityFilter(p)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Virtualization refs
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 8,
  })

  // Fetch tasks with current filters
  const fetchTasks = useCallback(async (reset = false) => {
    try {
      
      setLoading(true)
      const params = new URLSearchParams()
      
      if (debouncedSearch) params.set('search', debouncedSearch)
              if (searchQuery) params.set('search', searchQuery)

      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (pagination.nextCursor && !reset) params.set('after', pagination.nextCursor)
      params.set('limit', '20')

      const response = await fetch(`/api/tasks?${params?.toString()}`)
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication required. Redirecting to login...')
          setTimeout(() => router.push('/login'), 1200)
          return
        }
        const text = await response.text()
        setError(text || 'Failed to fetch tasks')
        return
      }
      const data = await response.json()

      if (data.success) {
        setError('')
        if (reset) {
          setTasks(data.data)
        } else {
          setTasks(prev => [...prev, ...data.data])
        }
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Failed to fetch tasks')
      }
    } catch (err) {
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, priorityFilter, typeFilter, pagination.nextCursor])

  // Reset and fetch when filters change
  useEffect(() => {
    if (debouncedSearch !== initialFilters.search || 
        statusFilter !== initialFilters.status || 
        priorityFilter !== initialFilters.priority || 
        typeFilter !== initialFilters.type) {
      fetchTasks(true)
    }
  }, [debouncedSearch, statusFilter, priorityFilter, typeFilter, fetchTasks])

  // Initial fetch on mount if no initial tasks were provided
  useEffect(() => {
    if (!initialTasks || initialTasks.length === 0) {
      fetchTasks(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'testing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Target className="h-4 w-4" />
      case 'in_progress': return <Play className="h-4 w-4" />
      case 'review': return <AlertTriangle className="h-4 w-4" />
      case 'testing': return <Zap className="h-4 w-4" />
      case 'done': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
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

  const handleTaskCreated = () => {
    fetchTasks(true)
    setShowCreateTaskModal(false)
  }

  const loadMore = () => {
    if (pagination.nextCursor && !loading) {
      fetchTasks(false)
    }
  }


  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setTasks(tasks.filter(p => p._id !== taskId))
      } else {
        setError(data.error || 'Failed to delete project')
      }
    } catch (err) {
      setError('Failed to delete project')
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">Manage and track your assigned tasks</p>
        </div>
        <Button onClick={() => setShowCreateTaskModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="subtask">Subtask</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 && !loading && (
            <div className="flex items-center justify-center h-40">
              <div className="text-center text-muted-foreground">
                No tasks found.
              </div>
            </div>
          )}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'kanban')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div 
                ref={parentRef}
                className="h-[600px] overflow-auto"
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
                        <Card className="hover:shadow-md transition-shadow m-2">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-medium text-foreground">{task.title}</h3>
                                    {task.displayId && (
                                      <Badge variant="outline">{task.displayId}</Badge>
                                    )}
                                    <Badge className={getStatusColor(task.status)}>
                                      {getStatusIcon(task.status)}
                                      <span className="ml-1">{task.status.replace('_', ' ')}</span>
                                    </Badge>
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    <Badge className={getTypeColor(task.type)}>
                                      {task.type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {task.description || 'No description'}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Target className="h-4 w-4" />
                                      <span>{task.project.name}</span>
                                    </div>
                                    {task.dueDate && (
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                    {task.storyPoints && (
                                      <div className="flex items-center space-x-1">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>{task.storyPoints} points</span>
                                      </div>
                                    )}
                                    {task.estimatedHours && (
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{task.estimatedHours}h estimated</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  {task.assignedTo && (
                                    <div className="text-sm text-muted-foreground">
                                      {task.assignedTo.firstName} {task.assignedTo.lastName}
                                    </div>
                                  )}
                                </div>
                                 <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/tasks/${task._id}`)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Task
                            </DropdownMenuItem>
                            <PermissionGate permission={Permission.TASK_UPDATE} projectId={task.project._id}>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/tasks/${task._id}?tab=settings`)
                              }}>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/tasks/${task._id}/edit`)
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Task
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission={Permission.TASK_DELETE} projectId={task.project._id}>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle delete with confirmation
                                  if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                                    handleDeleteTask(task._id)
                                  }
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Task
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
                {pagination.nextCursor && (
                  <div className="flex justify-center mt-4">
                    <Button 
                      onClick={loadMore} 
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="kanban" className="space-y-4">
              <KanbanBoard 
                projectId="all" 
                onCreateTask={() => setShowCreateTaskModal(true)} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showCreateTaskModal && (
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          projectId={initialFilters.project || ''}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
