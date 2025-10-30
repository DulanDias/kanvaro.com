'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  Target
} from 'lucide-react'

interface Project {
  _id: string
  name: string
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface Story {
  _id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project: {
    _id: string
    name: string
  }
  epic?: {
    _id: string
    name: string
  }
  sprint?: {
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
  acceptanceCriteria: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function CreateTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const today = new Date().toISOString().split('T')[0]
  const [projectQuery, setProjectQuery] = useState("");
  const [assignedToIds, setAssignedToIds] = useState<string[]>([]);
  const [assigneeQuery, setAssigneeQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    displayId: '',
    project: '',
    story: '',
    parentTask: '',
    assignedTo: '',
    priority: 'medium',
    type: 'task',
    status: 'todo',
    dueDate: '',
    estimatedHours: '',
    storyPoints: '',
    labels: ''
  })

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        setAuthError('')
        await Promise.all([fetchProjects(), fetchUsers()])
      } else if (response.status === 401) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST'
        })
        
        if (refreshResponse.ok) {
          setAuthError('')
          await Promise.all([fetchProjects(), fetchUsers()])
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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data)
      } else {
        setProjects([])
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setProjects([])
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/members')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data)
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([])
    }
  }

  const fetchStories = async (projectId: string) => {
    if (!projectId) {
      setStories([])
      return
    }

    try {
      const response = await fetch(`/api/stories?projectId=${projectId}`)
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setStories(data.data)
      } else {
        setStories([])
      }
    } catch (err) {
      console.error('Failed to fetch stories:', err)
      setStories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Prevent past due dates
      if (formData.dueDate && formData.dueDate < today) {
        setError('Due date cannot be in the past')
        return
      }
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          assignedTo: assignedToIds.length === 1 ? assignedToIds[0] : undefined,
          assignees: assignedToIds.length > 1 ? assignedToIds : undefined,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
          storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : undefined,
          labels: formData.labels ? formData.labels.split(',').map(label => label.trim()) : [],
          story: formData.story === 'none' ? undefined : formData.story || undefined,
          parentTask: formData.parentTask || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push('/tasks')
      } else {
        setError(data.error || 'Failed to create task')
      }
    } catch (err) {
      setError('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Fetch stories when project changes
    if (field === 'project') {
      fetchStories(value)
    }
  }

  // Required field validation
  const isFormValid = () => {
    return (
      !!formData.title.trim() &&
      !!formData.project &&
      !!formData.status &&
      !!formData.type &&
      !!formData.priority &&
      !!formData.dueDate
    );
  };

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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-600" />
              <span>Create New Task</span>
            </h1>
            <p className="text-muted-foreground">Create a new task for your project</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>Fill in the details for your new task</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  {/* <div>
                    <label className="text-sm font-medium text-foreground">Task ID</label>
                    <Input
                      value={formData.displayId}
                      onChange={(e) => handleChange('displayId', e.target.value)}
                      placeholder="e.g. 3.2"
                    />
                  </div> */}

                  <div>
                    <label className="text-sm font-medium text-foreground">Project *</label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) => handleChange('project', value)}
                      onOpenChange={open => { if(open) setProjectQuery(""); }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent className="z-[10050] p-0">
                        <div className="p-2">
                          <Input
                            value={projectQuery}
                            onChange={e => setProjectQuery(e.target.value)}
                            placeholder="Type to search projects"
                            className="mb-2"
                          />
                          <div className="max-h-56 overflow-y-auto">
                            {projects.filter(p => !projectQuery.trim() || p.name.toLowerCase().includes(projectQuery.toLowerCase())).map((project) => (
                              <SelectItem key={project._id} value={project._id}>
                                {project.name}
                              </SelectItem>
                            ))}
                            {projects.filter(p => !projectQuery.trim() || p.name.toLowerCase().includes(projectQuery.toLowerCase())).length === 0 && (
                              <div className="px-2 py-1 text-sm text-muted-foreground">No matching projects</div>
                            )}
                          </div>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="subtask">Subtask</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Priority</label>
                    <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                      <SelectTrigger>
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

                  <div>
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Assigned To</label>
                    <div className="mt-1 border rounded-md p-2">
                      <Input
                        value={assigneeQuery}
                        onChange={e => setAssigneeQuery(e.target.value)}
                        placeholder={loading ? 'Loading members...' : 'Type to search team members'}
                        className="mb-2"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {loading ? (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading members...</span>
                          </div>
                        ) : assigneeQuery.trim() === '' ? null : (
                          (() => {
                            const q = assigneeQuery.toLowerCase();
                            const filtered = users.filter(u =>
                              `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
                              u.email.toLowerCase().includes(q)
                            );
                            if (filtered.length === 0) {
                              return (
                                <div className="text-sm text-muted-foreground p-2">No matching members</div>
                              )
                            }
                            return filtered.map(user => (
                              <button
                                type="button"
                                key={user._id}
                                className="w-full text-left p-1 rounded hover:bg-accent"
                                onClick={() => setAssignedToIds(prev => prev.includes(user._id) ? prev : [...prev, user._id])}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{user.firstName} {user.lastName} <span className="text-muted-foreground">({user.email})</span></span>
                                  {assignedToIds.includes(user._id) && (
                                    <span className="text-xs text-muted-foreground">Added</span>
                                  )}
                                </div>
                              </button>
                            ));
                          })()
                        )}
                      </div>
                      {assignedToIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {assignedToIds.map(id => {
                            const u = users.find(x => x._id === id);
                            if (!u) return null;
                            return (
                              <span key={id} className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded">
                                <span className="mr-2">{u.firstName} {u.lastName} <span className="text-muted-foreground">({u.email})</span></span>
                                <button
                                  type="button"
                                  aria-label="Remove assignee"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={() => setAssignedToIds(prev => prev.filter(x => x !== id))}
                                >
                                  <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 5L11 11M11 5L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">User Story</label>
                    <Select value={formData.story} onValueChange={(value) => handleChange('story', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a story" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Story</SelectItem>
                        {Array.isArray(stories) && stories.map((story) => (
                          <SelectItem key={story._id} value={story._id}>
                            {story.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Due Date *</label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                  min={today}
                      onChange={(e) => handleChange('dueDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Estimated Hours</label>
                    <Input
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => handleChange('estimatedHours', e.target.value)}
                      placeholder="Enter estimated hours"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Story Points</label>
                    <Input
                      type="number"
                      value={formData.storyPoints}
                      onChange={(e) => handleChange('storyPoints', e.target.value)}
                      placeholder="Enter story points"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Labels</label>
                <Input
                  value={formData.labels}
                  onChange={(e) => handleChange('labels', e.target.value)}
                  placeholder="Enter labels separated by commas"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !isFormValid()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
