'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  XCircle,
  Play,
  Loader2,
  Settings,
  Plus,
  BarChart3,
  Kanban,
  List,
  User,
  Calendar as CalendarIcon,
  Target,
  Zap
} from 'lucide-react'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'
import TaskList from '@/components/tasks/TaskList'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import CalendarView from '@/components/tasks/CalendarView'
import BacklogView from '@/components/tasks/BacklogView'
import ReportsView from '@/components/tasks/ReportsView'

interface Project {
  _id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isDraft: boolean
  startDate: string
  endDate?: string
  budget?: {
    total: number
    spent: number
    currency: string
    categories: {
      labor: number
      materials: number
      overhead: number
    }
  }
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
  teamMembers: Array<{
    firstName: string
    lastName: string
    email: string
  }>
  client?: {
    firstName: string
    lastName: string
    email: string
  }
  progress: {
    completionPercentage: number
    tasksCompleted: number
    totalTasks: number
  }
  settings: {
    allowTimeTracking: boolean
    allowManualTimeSubmission: boolean
    allowExpenseTracking: boolean
    requireApproval: boolean
    notifications: {
      taskUpdates: boolean
      budgetAlerts: boolean
      deadlineReminders: boolean
    }
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const activeTab = searchParams.get('tab') || 'overview'
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()

      if (data.success) {
        setProject(data.data)
      } else {
        setError(data.error || 'Failed to fetch project')
      }
    } catch (err) {
      setError('Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Calendar className="h-4 w-4" />
      case 'active': return <Play className="h-4 w-4" />
      case 'on_hold': return <Pause className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.push('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Project not found</p>
            <Button onClick={() => router.push('/projects')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                {project.isDraft && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Draft
                  </Badge>
                )}
                <Badge className={getStatusColor(project.status)}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1">{project.status.replace('_', ' ')}</span>
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{project.description || 'No description'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={() => setShowCreateTaskModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold text-foreground">{project.progress?.completionPercentage || 0}%</p>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={project.progress?.completionPercentage || 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {project.progress?.tasksCompleted || 0} of {project.progress?.totalTasks || 0} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold text-foreground">{project.teamMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold text-foreground">
                    {project.startDate && project.endDate 
                      ? Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))
                      : 'N/A'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    {project.budget ? `${project.budget.currency} ${project.budget.total.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => {
          const newSearchParams = new URLSearchParams(searchParams.toString())
          newSearchParams.set('tab', value)
          router.push(`/projects/${projectId}?${newSearchParams.toString()}`)
        }} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                          <span className="text-sm text-foreground">
                            {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">End Date</span>
                          <span className="text-sm text-foreground">
                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Created By</span>
                          <span className="text-sm text-foreground">
                            {project.createdBy.firstName} {project.createdBy.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Team Size</span>
                          <span className="text-sm text-foreground">{project.teamMembers.length} members</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Client</span>
                          <span className="text-sm text-foreground">
                            {project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Not assigned'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Created</span>
                          <span className="text-sm text-foreground">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Breakdown */}
                {project.budget && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Total Budget</span>
                          <span className="text-sm font-semibold text-foreground">
                            {project.budget.currency} {project.budget.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Spent</span>
                          <span className="text-sm text-foreground">
                            {project.budget.currency} {project.budget.spent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Remaining</span>
                          <span className="text-sm text-foreground">
                            {project.budget.currency} {(project.budget.total - project.budget.spent).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Categories</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Labor</span>
                            <span>{project.budget.currency} {project.budget.categories.labor.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Materials</span>
                            <span>{project.budget.currency} {project.budget.categories.materials.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Overhead</span>
                            <span>{project.budget.currency} {project.budget.categories.overhead.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Team Members */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowCreateTaskModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Team
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <TaskList 
              projectId={projectId} 
              onCreateTask={() => setShowCreateTaskModal(true)}
            />
          </TabsContent>

          <TabsContent value="kanban" className="space-y-4">
            <KanbanBoard 
              projectId={projectId} 
              onCreateTask={() => setShowCreateTaskModal(true)}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView 
              projectId={projectId} 
              onCreateTask={() => setShowCreateTaskModal(true)}
            />
          </TabsContent>

          <TabsContent value="backlog" className="space-y-4">
            <BacklogView 
              projectId={projectId} 
              onCreateTask={() => setShowCreateTaskModal(true)}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsView projectId={projectId} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Configure project settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name" className="text-sm font-medium text-foreground">Project Name</Label>
                      <Input 
                        id="project-name"
                        value={project?.name || ''} 
                        onChange={(e) => {
                          if (project) {
                            setProject({...project, name: e.target.value})
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
                      <Textarea 
                        id="description"
                        value={project?.description || ''} 
                        onChange={(e) => {
                          if (project) {
                            setProject({...project, description: e.target.value})
                          }
                        }}
                        className="mt-1 resize-none"
                        rows={3}
                        placeholder="Enter project description..."
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="start-date" className="text-sm font-medium text-foreground">Start Date</Label>
                        <Input 
                          id="start-date"
                          type="date"
                          value={project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ''} 
                          onChange={(e) => {
                            if (project) {
                              setProject({...project, startDate: e.target.value})
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-sm font-medium text-foreground">End Date</Label>
                        <Input 
                          id="end-date"
                          type="date"
                          value={project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''} 
                          onChange={(e) => {
                            if (project) {
                              setProject({...project, endDate: e.target.value})
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Status</label>
                      <Select 
                        value={project?.status || 'planning'} 
                        onValueChange={(value) => {
                          if (project) {
                            setProject({...project, status: value as any})
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground">Priority</label>
                      <Select 
                        value={project?.priority || 'medium'} 
                        onValueChange={(value) => {
                          if (project) {
                            setProject({...project, priority: value as any})
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Time Tracking Settings</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={project?.settings?.allowTimeTracking ?? true}
                            onChange={(e) => {
                              if (project) {
                                setProject({
                                  ...project, 
                                  settings: {
                                    ...project.settings,
                                    allowTimeTracking: e.target.checked
                                  }
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <label className="text-sm text-foreground">Allow time tracking</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={project?.settings?.allowManualTimeSubmission ?? true}
                            onChange={(e) => {
                              if (project) {
                                setProject({
                                  ...project, 
                                  settings: {
                                    ...project.settings,
                                    allowManualTimeSubmission: e.target.checked
                                  }
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <label className="text-sm text-foreground">Allow manual time submission</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={project?.settings?.allowExpenseTracking ?? true}
                            onChange={(e) => {
                              if (project) {
                                setProject({
                                  ...project, 
                                  settings: {
                                    ...project.settings,
                                    allowExpenseTracking: e.target.checked
                                  }
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <label className="text-sm text-foreground">Allow expense tracking</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Member Hourly Rates */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-foreground">Team Member Hourly Rates</h4>
                    <p className="text-sm text-muted-foreground">Configure hourly rates for team members on this project</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Hourly rates will be automatically applied when team members track time on this project.
                    </div>
                    
                    <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <User className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Team member hourly rates will be configured here</p>
                        <p className="text-xs mt-1">This feature will be available when team management is implemented</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    // Reset to original project data
                    fetchProject()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={async () => {
                    try {
                      const response = await fetch(`/api/projects/${projectId}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(project)
                      })
                      const data = await response.json()
                      
                      if (data.success) {
                        // Show success message
                        alert('Project settings updated successfully!')
                      } else {
                        alert('Failed to update project settings')
                      }
                    } catch (error) {
                      alert('Failed to update project settings')
                    }
                  }}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        projectId={projectId}
        onTaskCreated={() => {
          // Refresh project data to update task counts
          fetchProject()
        }}
      />
    </MainLayout>
  )
}
