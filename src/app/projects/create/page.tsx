'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/Progress'
import { useCurrencies } from '@/hooks/useCurrencies'
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
  Search,
  X,
  Plus,
  User,
  Mail,
  Shield,
  UserPlus
} from 'lucide-react'

interface ProjectFormData {
  // Basic Information
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  // Timeline
  startDate: string
  endDate: string
  
  // Budget
  budget: {
    total: number
    currency: string
    categories: {
      labor: number
      materials: number
      overhead: number
    }
  }
  
  // Team
  teamMembers: string[]
  clients: string[]
  
  // Settings
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
  
  // Tags and Custom Fields
  tags: string[]
  customFields: Record<string, any>
}

export default function CreateProjectPage() {
  const router = useRouter()
  const { currencies, loading: currenciesLoading, formatCurrencyDisplay, error: currenciesError } = useCurrencies(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [availableMembers, setAvailableMembers] = useState<any[]>([])
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: {
      total: 0,
      currency: 'USD',
      categories: {
        labor: 0,
        materials: 0,
        overhead: 0
      }
    },
    teamMembers: [],
    clients: [],
    settings: {
      allowTimeTracking: true,
      allowManualTimeSubmission: true,
      allowExpenseTracking: true,
      requireApproval: false,
      notifications: {
        taskUpdates: true,
        budgetAlerts: true,
        deadlineReminders: true
      }
    },
    tags: [],
    customFields: {}
  })

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Project name and description' },
    { id: 2, title: 'Timeline', description: 'Start and end dates' },
    { id: 3, title: 'Budget', description: 'Budget allocation and categories' },
    { id: 4, title: 'Team', description: 'Team members and clients' },
    { id: 5, title: 'Settings', description: 'Project settings and preferences' },
    { id: 6, title: 'Review', description: 'Review and create project' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (isDraft = false) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          isDraft
        })
      })

      const data = await response.json()

      if (data.success) {
        if (isDraft) {
          setSuccess('Project saved as draft!')
          setTimeout(() => {
            router.push('/projects')
          }, 2000)
        } else {
          setSuccess('Project created successfully!')
          setTimeout(() => {
            router.push(`/projects/${data.data._id}`)
          }, 2000)
        }
      } else {
        setError(data.error || 'Failed to create project')
      }
    } catch (err) {
      setError('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  // Fetch available team members
  const fetchAvailableMembers = async () => {
    try {
      const response = await fetch('/api/members')
      const data = await response.json()
      
      if (data.success) {
        setAvailableMembers(data.data.members)
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  // Add team member
  const addTeamMember = (member: any) => {
    if (!formData.teamMembers.find(m => m === member._id)) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, member._id]
      }))
    }
    setShowMemberSearch(false)
    setMemberSearchQuery('')
  }

  // Remove team member
  const removeTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m !== memberId)
    }))
  }

  // Add client
  const addClient = (member: any) => {
    setFormData(prev => ({
      ...prev,
      clients: [member._id] // For now, only support one client
    }))
    setShowClientSearch(false)
    setClientSearchQuery('')
  }

  // Remove client
  const removeClient = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c !== clientId)
    }))
  }

  // Filter members based on search
  const filteredMembers = availableMembers.filter(member => {
    const searchTerm = memberSearchQuery.toLowerCase()
    return (
      member.firstName.toLowerCase().includes(searchTerm) ||
      member.lastName.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm)
    )
  })

  const filteredClients = availableMembers.filter(member => {
    const searchTerm = clientSearchQuery.toLowerCase()
    return (
      member.firstName.toLowerCase().includes(searchTerm) ||
      member.lastName.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm)
    )
  }).filter(member => !formData.clients.find(c => c === member._id))

  // Load members when component mounts
  useEffect(() => {
    fetchAvailableMembers()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
              <p className="text-muted-foreground">Set up a new project with detailed configuration</p>
            </div>
          </div>
        </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">{currentStep} of {steps.length} steps</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-medium text-foreground">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={currentStep.toString()} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="1">Basic</TabsTrigger>
          <TabsTrigger value="2">Timeline</TabsTrigger>
          <TabsTrigger value="3">Budget</TabsTrigger>
          <TabsTrigger value="4">Team</TabsTrigger>
          <TabsTrigger value="5">Settings</TabsTrigger>
          <TabsTrigger value="6">Review</TabsTrigger>
        </TabsList>

        {/* Step 1: Basic Information */}
        <TabsContent value="1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Timeline */}
        <TabsContent value="2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Set the start and end dates for your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The project timeline helps with resource planning and deadline tracking.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Budget */}
        <TabsContent value="3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Configuration</CardTitle>
              <CardDescription>
                Set up your project budget and cost categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBudget">Total Budget</Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    value={formData.budget.total}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      budget: { ...prev.budget, total: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  {currenciesError && (
                    <div className="text-red-500 text-sm">Error loading currencies: {currenciesError}</div>
                  )}
                  <Select value={formData.budget.currency} onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    budget: { ...prev.budget, currency: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {currenciesLoading ? (
                        <SelectItem value="loading" disabled>Loading currencies...</SelectItem>
                      ) : currencies.length === 0 ? (
                        <SelectItem value="none" disabled>No currencies available</SelectItem>
                      ) : (
                        currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {formatCurrencyDisplay(currency)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Budget Categories</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="labor">Labor</Label>
                    <Input
                      id="labor"
                      type="number"
                      value={formData.budget.categories.labor}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        budget: { 
                          ...prev.budget, 
                          categories: { ...prev.budget.categories, labor: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="materials">Materials</Label>
                    <Input
                      id="materials"
                      type="number"
                      value={formData.budget.categories.materials}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        budget: { 
                          ...prev.budget, 
                          categories: { ...prev.budget.categories, materials: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overhead">Overhead</Label>
                    <Input
                      id="overhead"
                      type="number"
                      value={formData.budget.categories.overhead}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        budget: { 
                          ...prev.budget, 
                          categories: { ...prev.budget.categories, overhead: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Team */}
        <TabsContent value="4" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Assignment</CardTitle>
              <CardDescription>
                Assign team members and clients to your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Members Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Team Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMemberSearch(!showMemberSearch)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Members
                  </Button>
                </div>

                {/* Selected Team Members */}
                <div className="space-y-2">
                  {formData.teamMembers.length > 0 ? (
                    <div className="grid gap-2">
                      {formData.teamMembers.map((memberId) => {
                        const member = availableMembers.find(m => m._id === memberId)
                        if (!member) return null
                        return (
                          <div key={memberId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                {member.firstName[0]}{member.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTeamMember(memberId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No team members assigned yet</p>
                    </div>
                  )}
                </div>

                {/* Member Search */}
                {showMemberSearch && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search team members..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredMembers.length > 0 ? (
                        <div className="space-y-1 p-2">
                          {filteredMembers
                            .filter(member => !formData.teamMembers.find(m => m === member._id))
                            .map((member) => (
                            <div
                              key={member._id}
                              className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                              onClick={() => addTeamMember(member)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                  {member.firstName[0]}{member.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {member.firstName} {member.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {member.role}
                                </Badge>
                              </div>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <p className="text-sm">No members found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Client Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Client</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClientSearch(!showClientSearch)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </div>

                {/* Selected Client */}
                <div className="space-y-2">
                  {formData.clients.length > 0 ? (
                    <div className="grid gap-2">
                      {formData.clients.map((clientId) => {
                        const client = availableMembers.find(c => c._id === clientId)
                        if (!client) return null
                        return (
                          <div key={clientId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                {client.firstName[0]}{client.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {client.firstName} {client.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {client.role}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeClient(clientId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                      <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No client assigned yet</p>
                    </div>
                  )}
                </div>

                {/* Client Search */}
                {showClientSearch && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search for client..."
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredClients.length > 0 ? (
                        <div className="space-y-1 p-2">
                          {filteredClients.map((member) => (
                            <div
                              key={member._id}
                              className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                              onClick={() => addClient(member)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                  {member.firstName[0]}{member.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {member.firstName} {member.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {member.role}
                                </Badge>
                              </div>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <p className="text-sm">No members found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Team Members:</span>
                  <span className="font-medium">{formData.teamMembers.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{formData.clients.length > 0 ? 'Assigned' : 'Not assigned'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: Settings */}
        <TabsContent value="5" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Configure project-specific settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Time Tracking</Label>
                    <p className="text-sm text-muted-foreground">Enable time tracking for this project</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowTimeTracking}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, allowTimeTracking: e.target.checked }
                    }))}
                  />
                </div>

                {formData.settings.allowTimeTracking && (
                  <div className="ml-6 pl-4 border-l-2 border-muted">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Manual Time Submission</Label>
                        <p className="text-sm text-muted-foreground">Allow team members to submit time entries manually after completing tasks</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.allowManualTimeSubmission}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, allowManualTimeSubmission: e.target.checked }
                        }))}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Expense Tracking</Label>
                    <p className="text-sm text-muted-foreground">Enable expense tracking for this project</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowExpenseTracking}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, allowExpenseTracking: e.target.checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">Require approval for time entries and expenses</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.requireApproval}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, requireApproval: e.target.checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 6: Review */}
        <TabsContent value="6" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Project Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Project Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Review all project details before creating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="font-semibold text-foreground">Basic Information</h4>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Project Name</span>
                          <span className="text-sm text-foreground font-medium">{formData.name || 'Not set'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <Badge className={formData.status === 'planning' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                            {formData.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Priority</span>
                          <Badge className={formData.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                            {formData.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Description</span>
                          <p className="text-sm text-foreground mt-1">{formData.description || 'No description provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-foreground">Timeline</h4>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                          <span className="text-sm text-foreground">{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">End Date</span>
                          <span className="text-sm text-foreground">{formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {formData.startDate && formData.endDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Duration</span>
                            <span className="text-sm text-foreground">
                              {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <h4 className="font-semibold text-foreground">Budget</h4>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Total Budget</span>
                          <span className="text-sm text-foreground font-semibold">{formData.budget.currency} {formData.budget.total.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Labor</span>
                          <span className="text-sm text-foreground">{formData.budget.currency} {formData.budget.categories.labor.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Materials</span>
                          <span className="text-sm text-foreground">{formData.budget.currency} {formData.budget.categories.materials.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Overhead</span>
                          <span className="text-sm text-foreground">{formData.budget.currency} {formData.budget.categories.overhead.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Budget Distribution</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Labor</span>
                            <span>{formData.budget.total > 0 ? Math.round((formData.budget.categories.labor / formData.budget.total) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${formData.budget.total > 0 ? (formData.budget.categories.labor / formData.budget.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                 {/* Team Assignment */}
                 <div className="space-y-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                     <h4 className="font-semibold text-foreground">Team Assignment</h4>
                   </div>
                   <div className="grid gap-4 md:grid-cols-2">
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-muted-foreground">Team Members</span>
                         <span className="text-sm text-foreground font-medium">{formData.teamMembers.length}</span>
                       </div>
                       {formData.teamMembers.length > 0 && (
                         <div className="space-y-1">
                          {formData.teamMembers.slice(0, 3).map((memberId) => {
                            const member = availableMembers.find(m => m._id === memberId)
                            if (!member) return null
                            return (
                              <div key={memberId} className="flex items-center space-x-2 text-xs">
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
                                  {member.firstName[0]}{member.lastName[0]}
                                </div>
                                <span className="text-foreground">{member.firstName} {member.lastName}</span>
                                <Badge variant="outline" className="text-xs">{member.role}</Badge>
                              </div>
                            )
                          })}
                           {formData.teamMembers.length > 3 && (
                             <div className="text-xs text-muted-foreground">
                               +{formData.teamMembers.length - 3} more members
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-muted-foreground">Client</span>
                         <span className="text-sm text-foreground font-medium">
                           {formData.clients.length > 0 ? 'Assigned' : 'Not assigned'}
                         </span>
                       </div>
                       {formData.clients.length > 0 && (
                         <div className="space-y-1">
                          {formData.clients.map((clientId) => {
                            const client = availableMembers.find(c => c._id === clientId)
                            if (!client) return null
                            return (
                              <div key={clientId} className="flex items-center space-x-2 text-xs">
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
                                  {client.firstName[0]}{client.lastName[0]}
                                </div>
                                <span className="text-foreground">{client.firstName} {client.lastName}</span>
                                <Badge variant="outline" className="text-xs">{client.role}</Badge>
                              </div>
                            )
                          })}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>

                 {/* Settings */}
                 <div className="space-y-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                     <h4 className="font-semibold text-foreground">Settings</h4>
                   </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Time Tracking</span>
                          <Badge className={formData.settings.allowTimeTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {formData.settings.allowTimeTracking ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Expense Tracking</span>
                          <Badge className={formData.settings.allowExpenseTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {formData.settings.allowExpenseTracking ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Require Approval</span>
                          <Badge className={formData.settings.requireApproval ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                            {formData.settings.requireApproval ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Notifications</div>
                        <div className="space-y-1 text-xs text-foreground">
                          <div className="flex items-center justify-between">
                            <span>Task Updates</span>
                            <span>{formData.settings.notifications.taskUpdates ? '✓' : '✗'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Budget Alerts</span>
                            <span>{formData.settings.notifications.budgetAlerts ? '✓' : '✗'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Deadline Reminders</span>
                            <span>{formData.settings.notifications.deadlineReminders ? '✓' : '✗'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Create?</CardTitle>
                  <CardDescription>
                    Review your project details and choose your next step
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleSubmit(false)} 
                      disabled={loading || !formData.name}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Create Project
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleSubmit(true)} 
                      disabled={loading}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>All required fields completed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Project settings configured</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Budget allocation set</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length && (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
      </div>
    </MainLayout>
  )
}
