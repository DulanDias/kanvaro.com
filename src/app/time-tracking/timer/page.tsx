'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Timer } from '@/components/time-tracking/Timer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Clock, 
  Target,
  FolderOpen,
  Loader2,
  AlertTriangle
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  settings: {
    allowTimeTracking: boolean
  }
}

interface Task {
  _id: string
  title: string
  description?: string
  status: string
  priority: string
  assignedTo?: {
    _id: string
    firstName: string
    lastName: string
  }
  project: {
    _id: string
    name: string
  }
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  organization: string
  billingRate?: number
}

export default function TimerPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setAuthError('')
          await fetchProjects()
        } else if (response.status === 401) {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST'
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            setUser(refreshData.user)
            setAuthError('')
            await fetchProjects()
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
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data.filter((project: Project) => project.settings.allowTimeTracking))
      } else {
        setProjects([])
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setProjects([])
    }
  }

  const fetchTasks = async (projectId: string) => {
    if (!projectId || !user) {
      setTasks([])
      return
    }

    try {
      const response = await fetch(`/api/tasks?project=${projectId}&assignedTo=${user.id || user._id}`)
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setTasks(data.data)
      } else {
        setTasks([])
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setTasks([])
    }
  }

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
    setSelectedTask('')
    setTasks([])
    if (projectId) {
      fetchTasks(projectId)
    }
  }

  const handleTaskChange = (taskId: string) => {
    setSelectedTask(taskId === 'none' ? '' : taskId)
    const task = tasks.find(t => t._id === taskId)
    if (task) {
      setDescription(task.title)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading timer...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{authError}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/time-tracking')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span>Time Tracker</span>
            </h1>
            <p className="text-muted-foreground">Start tracking time for your tasks</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Single Timer Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Time Tracker</span>
            </CardTitle>
            <CardDescription>
              Select a project and task, then start tracking your time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project and Task Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="project">Project *</Label>
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(projects) && projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="h-4 w-4" />
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProject && (
                <div>
                  <Label htmlFor="task">Task (Optional)</Label>
                  <Select value={selectedTask} onValueChange={handleTaskChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific task</SelectItem>
                      {Array.isArray(tasks) && tasks.map((task) => (
                        <SelectItem key={task._id} value={task._id}>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {task.status} • {task.priority}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedProject && (
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  rows={2}
                  required
                />
              </div>
            )}

            {/* Timer Component */}
            {selectedProject && (
              <Timer
                userId={user.id || user._id}
                organizationId={user.organization}
                projectId={selectedProject}
                taskId={selectedTask || undefined}
                description={description}
                onTimerUpdate={(timer) => {
                  // Handle timer updates
                }}
              />
            )}

            {!selectedProject && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Project</h3>
                <p className="text-muted-foreground">
                  Choose a project above to start tracking time
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
