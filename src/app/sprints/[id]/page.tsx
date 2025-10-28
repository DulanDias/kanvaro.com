'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  XCircle,
  Target,
  Zap,
  BarChart3,
  User,
  Loader2,
  Edit,
  Trash2,
  Plus,
  Star,
  Users,
  TrendingUp
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

export default function SprintDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sprintId = params.id as string
  
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        setAuthError('')
        await fetchSprint()
      } else if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST'
        })
        
        if (refreshResponse.ok) {
          setAuthError('')
          await fetchSprint()
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
  }, [router, sprintId])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchSprint = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sprints/${sprintId}`)
      const data = await response.json()
      console.log('data', data);
      if (data.success) {
        setSprint(data.data)
      } else {
        setError(data.error || 'Failed to fetch sprint')
      }
    } catch (err) {
      setError('Failed to fetch sprint')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!confirm('Are you sure you want to delete this sprint? This action cannot be undone.')) return
      setDeleting(true)
      const res = await fetch(`/api/sprints/${sprintId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        router.push('/sprints')
      } else {
        setError(data?.error || 'Failed to delete sprint')
      }
    } catch (e) {
      setError('Failed to delete sprint')
    } finally {
      setDeleting(false)
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

  const getDaysRemaining = () => {
    if (!sprint) return 0
    const now = new Date()
    const endDate = new Date(sprint?.endDate)
    const diffTime = endDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading sprint...</p>
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

  if (error || !sprint) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Sprint not found'}</p>
            <Button onClick={() => router.push('/sprints')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sprints
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/sprints')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-600" />
                <span>{sprint?.name}</span>
              </h1>
              <p className="text-muted-foreground">Sprint Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => router.push(`/sprints/${sprintId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {sprint?.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>

            {sprint?.goal && (
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{sprint?.goal}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Sprint completion status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{sprint?.progress?.completionPercentage || 0}%</span>
                  </div>
                  <Progress value={sprint?.progress?.completionPercentage || 0} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tasks</span>
                      <span className="font-medium">
                        {sprint?.progress?.tasksCompleted || 0} / {sprint?.progress?.totalTasks || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${sprint?.progress?.totalTasks ? 
                            ((sprint?.progress?.tasksCompleted / sprint?.progress?.totalTasks) * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Story Points</span>
                      <span className="font-medium">
                        {sprint?.progress?.storyPointsCompleted || 0} / {sprint?.progress?.totalStoryPoints || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ 
                          width: `${sprint?.progress?.totalStoryPoints ? 
                            ((sprint?.progress?.storyPointsCompleted / sprint?.progress?.totalStoryPoints) * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(sprint?.status)}>
                    {getStatusIcon(sprint?.status)}
                    <span className="ml-1">{sprint?.status}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project</span>
                  <span className="font-medium">{sprint?.project?.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {Math.ceil((new Date(sprint?.endDate).getTime() - new Date(sprint?.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {new Date(sprint?.startDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium">
                    {new Date(sprint?.endDate).toLocaleDateString()}
                  </span>
                </div>
                
                {getDaysRemaining() > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Days Remaining</span>
                    <span className="font-medium text-orange-600">{getDaysRemaining()}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{sprint?.capacity}h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Velocity</span>
                  <span className="font-medium">{sprint?.velocity}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>{sprint?.teamMembers?.length} members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sprint?.teamMembers?.map((member, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {sprint?.createdBy?.firstName} {sprint?.createdBy?.lastName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(sprint?.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
