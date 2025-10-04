'use client'

import { useState } from 'react'
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
  Loader2
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
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Project created successfully!')
        setTimeout(() => {
          router.push('/projects')
        }, 2000)
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
                  <Select value={formData.budget.currency} onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    budget: { ...prev.budget, currency: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="border rounded-lg p-4 min-h-[100px]">
                  <p className="text-sm text-muted-foreground">Team member selection will be implemented here</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Clients</Label>
                <div className="border rounded-lg p-4 min-h-[100px]">
                  <p className="text-sm text-muted-foreground">Client selection will be implemented here</p>
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
        <TabsContent value="6" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Project</CardTitle>
              <CardDescription>
                Review all project details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 text-foreground">Basic Information</h4>
                  <div className="space-y-1 text-sm text-foreground">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Status:</strong> {formData.status}</p>
                    <p><strong>Priority:</strong> {formData.priority}</p>
                    <p><strong>Description:</strong> {formData.description || 'No description'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-foreground">Timeline</h4>
                  <div className="space-y-1 text-sm text-foreground">
                    <p><strong>Start Date:</strong> {formData.startDate || 'Not set'}</p>
                    <p><strong>End Date:</strong> {formData.endDate || 'Not set'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-foreground">Budget</h4>
                  <div className="space-y-1 text-sm text-foreground">
                    <p><strong>Total:</strong> {formData.budget.currency} {formData.budget.total}</p>
                    <p><strong>Labor:</strong> {formData.budget.currency} {formData.budget.categories.labor}</p>
                    <p><strong>Materials:</strong> {formData.budget.currency} {formData.budget.categories.materials}</p>
                    <p><strong>Overhead:</strong> {formData.budget.currency} {formData.budget.categories.overhead}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-foreground">Settings</h4>
                  <div className="space-y-1 text-sm text-foreground">
                    <p><strong>Time Tracking:</strong> {formData.settings.allowTimeTracking ? 'Enabled' : 'Disabled'}</p>
                    <p><strong>Expense Tracking:</strong> {formData.settings.allowExpenseTracking ? 'Enabled' : 'Disabled'}</p>
                    <p><strong>Require Approval:</strong> {formData.settings.requireApproval ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

        <div className="flex items-center space-x-2">
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      </div>
    </MainLayout>
  )
}
