'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Search, 
  Filter, 
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
  Users,
  TrendingUp,
  Calendar as CalendarIcon,
  Star,
  Layers
} from 'lucide-react'

interface Epic {
  _id: string
  name: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
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
  labels: string[]
  progress: {
    completionPercentage: number
    storiesCompleted: number
    totalStories: number
    storyPointsCompleted: number
    totalStoryPoints: number
  }
  createdAt: string
  updatedAt: string
}

export default function EpicsPage() {
  const router = useRouter()
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        setAuthError('')
        await fetchEpics()
      } else if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST'
        })
        
        if (refreshResponse.ok) {
          setAuthError('')
          await fetchEpics()
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

  const fetchEpics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/epics')
      const data = await response.json()

      if (data.success) {
        setEpics(data.data)
      } else {
        setError(data.error || 'Failed to fetch epics')
      }
    } catch (err) {
      setError('Failed to fetch epics')
    } finally {
      setLoading(false)
    }
  }

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

  const filteredEpics = epics.filter(epic => {
    const matchesSearch = !searchQuery || 
      epic?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic?.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || epic?.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || epic?.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading epics...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Epics</h1>
            <p className="text-muted-foreground">Manage your product epics and large features</p>
          </div>
          <Button onClick={() => router.push('/epics/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Epic
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Epics</CardTitle>
                <CardDescription>
                  {filteredEpics.length} epic{filteredEpics.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search epics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
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
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEpics.map((epic) => (
                    <Card 
                      key={epic?._id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/epics/${epic?._id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Layers className="h-5 w-5 text-purple-600" />
                              <span>{epic?.name}</span>
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {epic?.description || 'No description'}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation()
                            // Handle menu actions
                          }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(epic?.status)}>
                            {getStatusIcon(epic?.status)}
                            <span className="ml-1">{epic?.status?.replace('_', ' ')}</span>
                          </Badge>
                          <Badge className={getPriorityColor(epic?.priority)}>
                            {epic?.priority}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{epic?.progress?.completionPercentage || 0}%</span>
                          </div>
                          <Progress value={epic?.progress?.completionPercentage || 0} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {epic?.progress?.storiesCompleted || 0} of {epic?.progress?.totalStories || 0} stories completed
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Story Points</span>
                            <span className="font-medium">
                              {epic?.progress?.storyPointsCompleted || 0} / {epic?.progress?.totalStoryPoints || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{epic?.project?.name}</span>
                          </div>
                          {epic?.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due {new Date(epic?.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {epic?.labels?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {epic?.labels?.slice(0, 3).map((label, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                            {epic?.labels?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{epic?.labels?.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <div className="space-y-4">
                  {filteredEpics.map((epic) => (
                    <Card 
                      key={epic?._id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/epics/${epic?._id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Layers className="h-5 w-5 text-purple-600" />
                                <h3 className="font-medium text-foreground">{epic?.name}</h3>
                                <Badge className={getStatusColor(epic?.status)}>
                                  {getStatusIcon(epic?.status)}
                                  <span className="ml-1">{epic?.status?.replace('_', ' ')}</span>
                                </Badge>
                                <Badge className={getPriorityColor(epic?.priority)}>
                                  {epic?.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {epic?.description || 'No description'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4" />
                                  <span>{epic?.project?.name}</span>
                                </div>
                                {epic?.dueDate && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Due {new Date(epic?.dueDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {epic?.storyPoints && (
                                  <div className="flex items-center space-x-1">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>{epic?.storyPoints} points</span>
                                  </div>
                                )}
                                {epic?.estimatedHours && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{epic?.estimatedHours}h estimated</span>
                                  </div>
                                )}
                                {epic?.labels?.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4" />
                                    <span>{epic?.labels?.slice(0, 2).join(', ')}</span>
                                    {epic?.labels?.length > 2 && <span>+{epic?.labels?.length - 2} more</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">{epic?.progress?.completionPercentage || 0}%</div>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${epic?.progress?.completionPercentage || 0}%` }}
                                />
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation()
                              // Handle menu actions
                            }}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
