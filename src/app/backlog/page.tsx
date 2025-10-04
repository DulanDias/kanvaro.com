'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
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
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  XCircle,
  Play,
  Zap,
  BookOpen,
  CheckSquare,
  Target,
  Loader2
} from 'lucide-react'

interface Epic {
  _id: string
  title: string
  description: string
  status: 'backlog' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  storyPoints?: number
  estimatedHours?: number
  actualHours?: number
  startDate?: string
  dueDate?: string
  tags: string[]
  project: {
    name: string
  }
  createdBy: {
    firstName: string
    lastName: string
  }
  assignedTo?: {
    firstName: string
    lastName: string
  }
  createdAt: string
}

interface Story {
  _id: string
  title: string
  description: string
  acceptanceCriteria: string[]
  status: 'backlog' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  storyPoints?: number
  estimatedHours?: number
  actualHours?: number
  startDate?: string
  dueDate?: string
  tags: string[]
  project: {
    name: string
  }
  epic?: {
    title: string
  }
  createdBy: {
    firstName: string
    lastName: string
  }
  assignedTo?: {
    firstName: string
    lastName: string
  }
  sprint?: {
    name: string
  }
  createdAt: string
}

interface Task {
  _id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'bug' | 'feature' | 'improvement' | 'task' | 'subtask'
  storyPoints?: number
  estimatedHours?: number
  actualHours?: number
  startDate?: string
  dueDate?: string
  labels: string[]
  project: {
    name: string
  }
  story?: {
    title: string
  }
  parentTask?: {
    title: string
  }
  createdBy: {
    firstName: string
    lastName: string
  }
  assignedTo?: {
    firstName: string
    lastName: string
  }
  sprint?: {
    name: string
  }
  createdAt: string
}

export default function BacklogPage() {
  const router = useRouter()
  const [epics, setEpics] = useState<Epic[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [activeTab, setActiveTab] = useState('epics')

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        setAuthError('')
        await fetchData()
      } else if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST'
        })
        
        if (refreshResponse.ok) {
          setAuthError('')
          await fetchData()
        } else {
          setAuthError('Session expired')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthError('Authentication failed')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [epicsRes, storiesRes, tasksRes] = await Promise.all([
        fetch('/api/epics'),
        fetch('/api/stories'),
        fetch('/api/tasks')
      ])

      const [epicsData, storiesData, tasksData] = await Promise.all([
        epicsRes.json(),
        storiesRes.json(),
        tasksRes.json()
      ])

      if (epicsData.success) setEpics(epicsData.data)
      if (storiesData.success) setStories(storiesData.data)
      if (tasksData.success) setTasks(tasksData.data)

    } catch (err) {
      setError('Failed to fetch backlog data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'testing': return 'bg-purple-100 text-purple-800'
      case 'done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const filteredEpics = epics.filter(epic => {
    const matchesSearch = !searchQuery || 
      epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || epic.status === statusFilter
    const matchesPriority = !priorityFilter || epic.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredStories = stories.filter(story => {
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || story.status === statusFilter
    const matchesPriority = !priorityFilter || story.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || task.status === statusFilter
    const matchesPriority = !priorityFilter || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading backlog...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (authError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{authError}</p>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backlog</h1>
          <p className="text-gray-600">Manage your epics, stories, and tasks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Epic
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Story
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search backlog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="epics">
            <Target className="h-4 w-4 mr-2" />
            Epics ({filteredEpics.length})
          </TabsTrigger>
          <TabsTrigger value="stories">
            <BookOpen className="h-4 w-4 mr-2" />
            Stories ({filteredStories.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks ({filteredTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="epics" className="space-y-4">
          <div className="grid gap-4">
            {filteredEpics.map((epic) => (
              <Card key={epic._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{epic.title}</h3>
                        <Badge className={getStatusColor(epic.status)}>
                          {epic.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(epic.priority)}>
                          {epic.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {epic.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{epic.project.name}</span>
                        </div>
                        {epic.storyPoints && (
                          <div className="flex items-center space-x-1">
                            <Zap className="h-4 w-4" />
                            <span>{epic.storyPoints} pts</span>
                          </div>
                        )}
                        {epic.assignedTo && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{epic.assignedTo.firstName} {epic.assignedTo.lastName}</span>
                          </div>
                        )}
                        {epic.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due {new Date(epic.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stories" className="space-y-4">
          <div className="grid gap-4">
            {filteredStories.map((story) => (
              <Card key={story._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{story.title}</h3>
                        <Badge className={getStatusColor(story.status)}>
                          {story.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(story.priority)}>
                          {story.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {story.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{story.project.name}</span>
                        </div>
                        {story.epic && (
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{story.epic.title}</span>
                          </div>
                        )}
                        {story.storyPoints && (
                          <div className="flex items-center space-x-1">
                            <Zap className="h-4 w-4" />
                            <span>{story.storyPoints} pts</span>
                          </div>
                        )}
                        {story.assignedTo && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{story.assignedTo.firstName} {story.assignedTo.lastName}</span>
                          </div>
                        )}
                        {story.sprint && (
                          <div className="flex items-center space-x-1">
                            <Zap className="h-4 w-4" />
                            <span>{story.sprint.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getTypeColor(task.type)}>
                          {task.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {task.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CheckSquare className="h-4 w-4" />
                          <span>{task.project.name}</span>
                        </div>
                        {task.story && (
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{task.story.title}</span>
                          </div>
                        )}
                        {task.storyPoints && (
                          <div className="flex items-center space-x-1">
                            <Zap className="h-4 w-4" />
                            <span>{task.storyPoints} pts</span>
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                          </div>
                        )}
                        {task.sprint && (
                          <div className="flex items-center space-x-1">
                            <Zap className="h-4 w-4" />
                            <span>{task.sprint.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </MainLayout>
  )
}
