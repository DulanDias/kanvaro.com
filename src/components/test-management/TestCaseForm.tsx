'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/Badge'
import { X, Plus } from 'lucide-react'

interface TestCaseFormProps {
  projectId: string
  testSuiteId?: string
  testCase?: any
  onSave: (testCase: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function TestCaseForm({
  projectId,
  testSuiteId,
  testCase,
  onSave,
  onCancel,
  loading = false
}: TestCaseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preconditions: '',
    steps: [{ step: '', expectedResult: '', testData: '' }],
    expectedResult: '',
    testData: '',
    priority: 'medium' as const,
    category: 'functional' as const,
    automationStatus: 'not_automated' as const,
    requirements: [] as string[],
    estimatedExecutionTime: 15,
    tags: [] as string[],
    testSuite: testSuiteId || ''
  })

  const [newRequirement, setNewRequirement] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (testCase) {
      setFormData({
        title: testCase.title || '',
        description: testCase.description || '',
        preconditions: testCase.preconditions || '',
        steps: testCase.steps?.length > 0 ? testCase.steps : [{ step: '', expectedResult: '', testData: '' }],
        expectedResult: testCase.expectedResult || '',
        testData: testCase.testData || '',
        priority: testCase.priority || 'medium',
        category: testCase.category || 'functional',
        automationStatus: testCase.automationStatus || 'not_automated',
        requirements: testCase.requirements || [],
        estimatedExecutionTime: testCase.estimatedExecutionTime || 15,
        tags: testCase.tags || [],
        testSuite: testCase.testSuite?._id || testSuiteId || ''
      })
    }
  }, [testCase, testSuiteId])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { step: '', expectedResult: '', testData: '' }]
    }))
  }

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, steps: newSteps }))
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {testCase ? 'Edit Test Case' : 'Create Test Case'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Test case title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testSuite">Test Suite *</Label>
              <Select
                value={(formData.testSuite || '__CURRENT_SUITE__')}
                onValueChange={(value) => handleInputChange('testSuite', value === '__CURRENT_SUITE__' ? '' : value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test suite" />
                </SelectTrigger>
                <SelectContent>
                  {/* This would be populated with actual test suites */}
                  {testSuiteId && (
                    <SelectItem value={testSuiteId}>
                      Current Suite
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Test case description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preconditions">Preconditions</Label>
            <Textarea
              id="preconditions"
              value={formData.preconditions}
              onChange={(e) => handleInputChange('preconditions', e.target.value)}
              placeholder="Preconditions for this test case"
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <Label>Test Steps</Label>
            {formData.steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Step {index + 1}</span>
                  {formData.steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Step Description</Label>
                  <Textarea
                    value={step.step}
                    onChange={(e) => handleStepChange(index, 'step', e.target.value)}
                    placeholder="Describe the step to perform"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Expected Result</Label>
                  <Textarea
                    value={step.expectedResult}
                    onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                    placeholder="What should happen"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Test Data</Label>
                  <Input
                    value={step.testData}
                    onChange={(e) => handleStepChange(index, 'testData', e.target.value)}
                    placeholder="Test data for this step"
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
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

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="usability">Usability</SelectItem>
                  <SelectItem value="compatibility">Compatibility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="automationStatus">Automation Status</Label>
              <Select
                value={formData.automationStatus}
                onValueChange={(value) => handleInputChange('automationStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_automated">Not Automated</SelectItem>
                  <SelectItem value="automated">Automated</SelectItem>
                  <SelectItem value="semi_automated">Semi Automated</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedExecutionTime">Estimated Execution Time (minutes)</Label>
              <Input
                id="estimatedExecutionTime"
                type="number"
                min="0"
                value={formData.estimatedExecutionTime}
                onChange={(e) => handleInputChange('estimatedExecutionTime', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testData">Test Data</Label>
              <Input
                id="testData"
                value={formData.testData}
                onChange={(e) => handleInputChange('testData', e.target.value)}
                placeholder="Test data for this test case"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add requirement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((req, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {req}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeRequirement(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : testCase ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
