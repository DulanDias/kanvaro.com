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

export default function CreateSprintPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectQuery, setProjectQuery] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project: '',
    startDate: '',
    endDate: '',
    goal: '',
    capacity: '',
    teamMembers: [] as string[]
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
        setUsers(data.data) // Initially show all users
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setUsers([])
    }
  }

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()

      if (data.success && data.data) {
        setSelectedProject(data.data)
        // Use team members directly from project data (already populated with user details)
        if (data.data.teamMembers && data.data.teamMembers.length > 0) {
          setUsers(data.data.teamMembers)
        } else {
          setUsers([])
        }
      } else {
        setSelectedProject(null)
        setUsers([])
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err)
      setSelectedProject(null)
      setUsers([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : 0,
          teamMembers: formData.teamMembers
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push('/sprints')
      } else {
        setError(data.error || 'Failed to create sprint')
      }
    } catch (err) {
      setError('Failed to create sprint')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // If project is changed, fetch project details and filter team members
      if (field === 'project' && typeof value === 'string') {
        if (value) {
          fetchProjectDetails(value)
        } else {
          setSelectedProject(null)
          setUsers([]) // Clear users when no project selected
        }
        // Clear team members selection when project changes
        newData.teamMembers = []
      }
      
      return newData
    })
  }

  const handleTeamMemberToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId]
    }))
  }

  // Check if all required fields are filled
  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.project !== '' && 
           formData.startDate !== '' && 
           formData.endDate !== ''
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/sprints')} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center space-x-2">
              <Target className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              <span className="truncate">Create New Sprint</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Create a new sprint for your project</p>
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
            <CardTitle>Sprint Details</CardTitle>
            <CardDescription>Fill in the details for your new sprint</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter sprint name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Project *</label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) => handleChange('project', value)}
                      onOpenChange={open => { if(open) setProjectQuery(""); }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent className="z-[10050] p-0">
                        <div className="p-2">
                          <Input
                            value={projectQuery}
                            onChange={e => setProjectQuery(e.target.value)}
                            placeholder="Type to search projects"
                            className="mb-2 w-full"
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
                    <label className="text-sm font-medium text-foreground">Start Date *</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      max={formData.endDate || undefined}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">End Date *</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      min={formData.startDate || undefined}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Capacity (hours)</label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleChange('capacity', e.target.value)}
                      placeholder="Enter sprint capacity"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Sprint Goal</label>
                    <Input
                      value={formData.goal}
                      onChange={(e) => handleChange('goal', e.target.value)}
                      placeholder="Enter sprint goal"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter sprint description"
                  rows={4}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Team Members</label>
                <div className="grid gap-2 mt-2 max-h-40 overflow-y-auto">
                  {!formData.project ? (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      Please select a project to see available team members
                    </p>
                  ) : Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <div key={user._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={user._id}
                          checked={formData.teamMembers.includes(user._id)}
                          onChange={() => handleTeamMemberToggle(user._id)}
                          className="rounded flex-shrink-0"
                        />
                        <label htmlFor={user._id} className="text-xs sm:text-sm break-words flex-1 min-w-0">
                          {user.firstName} {user.lastName} ({user.email})
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      No team members found for the selected project
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/sprints')} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !isFormValid()} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Sprint
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
