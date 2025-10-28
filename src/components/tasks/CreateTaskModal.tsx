'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  X, 
  Plus, 
  Calendar, 
  User, 
  Target, 
  Clock,
  AlertTriangle,
  Loader2,
  Trash2
} from 'lucide-react'
import { Check } from 'lucide-react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onTaskCreated: () => void
  defaultStatus?: string
  availableStatuses?: Array<{ key: string; title: string }>
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface Subtask {
  title: string
  description?: string
  status: string
  isCompleted: boolean
}

export default function CreateTaskModal({ isOpen, onClose, projectId, onTaskCreated, defaultStatus, availableStatuses }: CreateTaskModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [projects, setProjects] = useState<Array<{ _id: string; name: string }>>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus || 'todo',
    priority: 'medium',
    type: 'task',
    assignedTo: '',
    storyPoints: '',
    dueDate: '',
    estimatedHours: '',
    labels: ''
  })

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/members')
      const data = await response.json()
      
      if (data.success && data.data && Array.isArray(data.data.members)) {
        setUsers(data.data.members)
      } else {
        console.error('Invalid users data:', data)
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data)
        // If no projectId provided, preselect first project if available
        if (!projectId && data.data.length > 0) {
          setSelectedProjectId(data.data[0]._id)
        }
      } else {
        setProjects([])
      }
    } catch (e) {
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      if (!projectId) {
        fetchProjects()
      }
    }
  }, [isOpen])

  const addSubtask = () => {
    setSubtasks([...subtasks, {
      title: '',
      description: '',
      status: 'todo',
      isCompleted: false
    }])
  }

  const updateSubtask = (index: number, field: keyof Subtask, value: any) => {
    const updated = [...subtasks]
    updated[index] = { ...updated[index], [field]: value }
    setSubtasks(updated)
  }

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          project: projectId || selectedProjectId,
          assignedTo: formData.assignedTo === 'unassigned' ? undefined : formData.assignedTo || undefined,
          storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
          dueDate: formData.dueDate || undefined,
          labels: formData.labels ? formData.labels.split(',').map(label => label.trim()) : [],
          subtasks: subtasks
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onTaskCreated()
        const newId = data?.data?._id
        onClose()
        setTimeout(() => {
          if (newId) {
            router.push(`/tasks/${newId}`)
          }
        }, 300)
        // Reset form
        setFormData({
          title: '',
          description: '',
          status: defaultStatus || 'todo',
          priority: 'medium',
          type: 'task',
          assignedTo: '',
          storyPoints: '',
          dueDate: '',
          estimatedHours: '',
          labels: ''
        })
        setSubtasks([])
        if (!projectId) setSelectedProjectId('')
      } else {
        onClose()
      }
    } catch (error) {
      onClose()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 2500)
      return () => clearTimeout(t)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000)
      return () => clearTimeout(t)
    }
  }, [error])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    }}>
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto bg-background" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Add a new task to this project</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!projectId && (
              <div>
                <label className="text-sm font-medium text-foreground">Project *</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingProjects ? 'Loading projects...' : 'Select project'} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProjects ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading projects...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      projects.length > 0 ? (
                        projects.map((p) => (
                          <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Task Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter task title"
                  className="mt-1"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter task description"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses ? (
                      availableStatuses.map((status) => (
                        <SelectItem key={status.key} value={status.key}>
                          {status.title}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
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

              <div>
                <label className="text-sm font-medium text-foreground">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="mt-1">
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
                <label className="text-sm font-medium text-foreground">Assigned To</label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingUsers ? "Loading members..." : "Select assignee"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {loadingUsers ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading members...</span>
                        </div>
                      </SelectItem>
                    ) : (
                      Array.isArray(users) && users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled>
                          No team members found
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Story Points</label>
                <Input
                  type="number"
                  value={formData.storyPoints}
                  onChange={(e) => setFormData({...formData, storyPoints: e.target.value})}
                  placeholder="e.g., 5"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Estimated Hours</label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                  placeholder="e.g., 8"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Labels</label>
                <Input
                  value={formData.labels}
                  onChange={(e) => setFormData({...formData, labels: e.target.value})}
                  placeholder="e.g., frontend, urgent, design"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple labels with commas</p>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Subtasks</h3>
                <Button type="button" variant="outline" size="sm" onClick={addSubtask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </Button>
              </div>

              {subtasks.map((subtask, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Subtask {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubtask(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">Title *</label>
                      <Input
                        value={subtask.title}
                        onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                        placeholder="Subtask title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground">Status</label>
                      <Select
                        value={subtask.status}
                        onValueChange={(value) => updateSubtask(index, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <Textarea
                      value={subtask.description || ''}
                      onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                      placeholder="Subtask description"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {subtasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p>No subtasks added yet</p>
                  <p className="text-sm">Click "Add Subtask" to create subtasks for this task</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.title}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {(success || error) && (
        <div className="fixed bottom-6 right-6 z-[10000]">
          <div
            className={`flex items-center space-x-2 rounded-md px-4 py-3 shadow-lg ${success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
            role="status"
            aria-live="polite"
          >
            {success ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span className="text-sm font-medium">{success || error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
