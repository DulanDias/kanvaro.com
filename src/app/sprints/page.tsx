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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'
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
  Eye,
  Settings,
  Edit,
  Trash2
} from 'lucide-react'

interface Sprint {
  _id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  project: {
    _id: string
    name: string
  }
  startDate: string
  endDate: string
  goal: string
  capacity: number
  velocity: number
  teamMembers: Array<{
    firstName: string
    lastName: string
    email: string
  }>
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
  progress: {
    completionPercentage: number
    tasksCompleted: number
    totalTasks: number
    storyPointsCompleted: number
    totalStoryPoints: number
  }
  createdAt: string
  updatedAt: string
}

export default function SprintsPage() {
  const router = useRouter()
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        setAuthError('')
        await fetchSprints()
      } else if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST'
        })
        
        if (refreshResponse.ok) {
          setAuthError('')
          await fetchSprints()
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

  const fetchSprints = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sprints')
      const data = await response.json()

      if (data.success) {
        setSprints(data.data)
      } else {
        setError(data.error || 'Failed to fetch sprints')
      }
    } catch (err) {
      setError('Failed to fetch sprints')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSprint = async (sprintId: string) => {
    try {
      const res = await fetch(`/api/sprints/${sprintId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        setSprints(prev => prev.filter(s => s._id !== sprintId))
      } else {
        setError(data.error || 'Failed to delete sprint')
      }
    } catch (e) {
      setError('Failed to delete sprint')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Calendar className="h-4 w-4" />
      case 'active': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const filteredSprints = sprints.filter(sprint => {
    const matchesSearch = !searchQuery || 
      sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.project.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading sprints...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Sprints</h1>
            <p className="text-muted-foreground">Manage your agile sprints and iterations</p>
          </div>
          <Button onClick={() => router.push('/sprints/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Sprint
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
                <CardTitle>All Sprints</CardTitle>
                <CardDescription>
                  {filteredSprints.length} sprint{filteredSprints.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search sprints..."
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
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  {filteredSprints.map((sprint) => (
                    <Card 
                      key={sprint._id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/sprints/${sprint._id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{sprint.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {sprint.description || 'No description'}
                            </CardDescription>
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
                                router.push(`/sprints/${sprint._id}`)
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Sprint
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/sprints/${sprint._id}?tab=settings`)
                              }}>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/sprints/${sprint._id}/edit`)
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Sprint
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm('Are you sure you want to delete this sprint? This action cannot be undone.')) {
                                    handleDeleteSprint(sprint._id)
                                  }
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Sprint
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(sprint?.status)}>
                            {getStatusIcon(sprint?.status)}
                            <span className="ml-1">{sprint?.status}</span>
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{sprint?.progress?.completionPercentage || 0}%</span>
                          </div>
                          <Progress value={sprint?.progress?.completionPercentage || 0} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {sprint?.progress?.tasksCompleted || 0} of {sprint?.progress?.totalTasks || 0} tasks completed
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Story Points</span>
                            <span className="font-medium">
                              {sprint?.progress?.storyPointsCompleted || 0} / {sprint?.progress?.totalStoryPoints || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Velocity</span>
                            <span className="font-medium">{sprint?.velocity || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{sprint?.teamMembers?.length} members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(sprint?.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">
                            {new Date(sprint?.startDate).toLocaleDateString()} - {new Date(sprint?.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">
                            {Math.ceil((new Date(sprint?.endDate).getTime() - new Date(sprint?.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <div className="space-y-4">
                  {filteredSprints.map((sprint) => (
                    <Card 
                      key={sprint?._id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/sprints/${sprint?._id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-foreground">{sprint?.name}</h3>
                                <Badge className={getStatusColor(sprint?.status)}>
                                  {getStatusIcon(sprint?.status)}
                                  <span className="ml-1">{sprint?.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {sprint?.description || 'No description'}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4" />
                                  <span>{sprint?.project?.name}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{sprint?.teamMembers?.length} members</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(sprint?.startDate).toLocaleDateString()} - {new Date(sprint?.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>Velocity: {sprint?.velocity || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">{sprint?.progress?.completionPercentage || 0}%</div>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${sprint?.progress?.completionPercentage || 0}%` }}
                                />
                              </div>
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
                                  router.push(`/sprints/${sprint._id}`)
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Sprint
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/sprints/${sprint._id}?tab=settings`)
                                }}>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/sprints/${sprint._id}/edit`)
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Sprint
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm('Are you sure you want to delete this sprint? This action cannot be undone.')) {
                                      handleDeleteSprint(sprint._id)
                                    }
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Sprint
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
