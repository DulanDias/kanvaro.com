'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveDialog } from '@/components/ui/ResponsiveDialog'
import { TestPlanForm } from '@/components/test-management/TestPlanForm'
import { TestExecutionForm } from '@/components/test-management/TestExecutionForm'
import { TestSuiteForm } from '@/components/test-management/TestSuiteForm'
import { TestCaseForm } from '@/components/test-management/TestCaseForm'
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Folder,
  FileText,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react'
import TestSuiteTree from '@/components/test-management/TestSuiteTree'
import TestCaseList from '@/components/test-management/TestCaseList'

interface TestSummary {
  totalTestCases: number
  totalTestSuites: number
  totalTestPlans: number
  totalExecutions: number
  passRate: number
  statusCounts: Record<string, number>
}

interface Project {
  _id: string
  name: string
  description: string
  status: string
  testSummary?: TestSummary
}

export default function TestManagementPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [testPlanDialogOpen, setTestPlanDialogOpen] = useState(false)
  const [testExecutionDialogOpen, setTestExecutionDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suiteDialogOpen, setSuiteDialogOpen] = useState(false)
  const [suiteSaving, setSuiteSaving] = useState(false)
  const [editingSuite, setEditingSuite] = useState<any | null>(null)
  const [parentSuiteIdForCreate, setParentSuiteIdForCreate] = useState<string | undefined>(undefined)
  const [suitesRefreshCounter, setSuitesRefreshCounter] = useState(0)
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null)
  const [selectedSuiteDetails, setSelectedSuiteDetails] = useState<any | null>(null)
  const [suiteDetailsLoading, setSuiteDetailsLoading] = useState(false)
  const [testCaseDialogOpen, setTestCaseDialogOpen] = useState(false)
  const [testCaseSaving, setTestCaseSaving] = useState(false)
  const [editingTestCase, setEditingTestCase] = useState<any | null>(null)
  const [createCaseSuiteId, setCreateCaseSuiteId] = useState<string | undefined>(undefined)
  const [testCasesRefreshCounter, setTestCasesRefreshCounter] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (data.success) {
        setProjects(data.data)
        if (data.data.length > 0) {
          setSelectedProject(data.data[0]._id)
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSuite = async (suiteId: string) => {
    try {
      const res = await fetch(`/api/test-suites/${suiteId}`, { method: 'DELETE' })
      if (res.ok) {
        setSuitesRefreshCounter(c => c + 1)
        // Clear details panel if the deleted suite was selected
        if (selectedSuiteId === suiteId) {
          setSelectedSuiteId(null)
          setSelectedSuiteDetails(null)
        }
      } else {
        const data = await res.json().catch(() => ({}))
        console.error('Failed to delete test suite', data)
      }
    } catch (err) {
      console.error('Error deleting test suite:', err)
    }
  }

  const fetchSuiteDetails = async (suiteId: string) => {
    try {
      setSuiteDetailsLoading(true)
      const res = await fetch(`/api/test-suites/${suiteId}`)
      const data = await res.json()
      if (res.ok && data?.success) {
        setSelectedSuiteDetails(data.data)
      } else {
        setSelectedSuiteDetails(null)
      }
    } catch (e) {
      setSelectedSuiteDetails(null)
    } finally {
      setSuiteDetailsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'blocked': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'skipped': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'skipped': return <Clock className="h-4 w-4 text-gray-600" />
      default: return <Play className="h-4 w-4 text-blue-600" />
    }
  }

  const handleCreateTestPlan = () => {
    setTestPlanDialogOpen(true)
  }

  const handleSaveTestPlan = async (testPlanData: any) => {
    setSaving(true)
    try {
      const response = await fetch('/api/test-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testPlanData,
          projectId: selectedProject
        })
      })

      if (response.ok) {
        setTestPlanDialogOpen(false)
        // Refresh data or show success message
      } else {
        console.error('Failed to create test plan')
      }
    } catch (error) {
      console.error('Error creating test plan:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleStartTestExecution = () => {
    setTestExecutionDialogOpen(true)
  }

  const handleSaveTestExecution = async (executionData: any) => {
    setSaving(true)
    try {
      const response = await fetch('/api/test-executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executionData)
      })

      if (response.ok) {
        setTestExecutionDialogOpen(false)
        // Refresh data or show success message
      } else {
        console.error('Failed to create test execution')
      }
    } catch (error) {
      console.error('Error creating test execution:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Test Management</h1>
              <p className="text-muted-foreground">Manage test suites, cases, and executions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <h1 className="text-3xl font-bold">Test Management</h1>
            <p className="text-muted-foreground">Manage test suites, cases, and executions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => router.push('/test-management/reports')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button onClick={handleCreateTestPlan}>
              <TestTube className="h-4 w-4 mr-2" />
              New Test Plan
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-4">
                You need to be assigned to a project to access test management features.
              </p>
              <Button onClick={() => router.push('/projects/create')}>
                <TestTube className="h-4 w-4 mr-2" />
                Create Test Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="suites">Test Suites</TabsTrigger>
              <TabsTrigger value="cases">Test Cases</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Test Suites</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">0</div>
                    <p className="text-xs text-muted-foreground">Total suites</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Test Cases</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">0</div>
                    <p className="text-xs text-muted-foreground">Total cases</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Executions</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">0</div>
                    <p className="text-xs text-muted-foreground">Total runs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Pass Rate</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">0%</div>
                    <p className="text-xs text-muted-foreground">Success rate</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Executions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Play className="h-8 w-8 mx-auto mb-2" />
                      <p>No recent executions</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Execution Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Passed</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          0
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">Failed</span>
                        </div>
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          0
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Blocked</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          0
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">Skipped</span>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          0
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="suites" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <TestSuiteTree
                    key={`${selectedProject}-${suitesRefreshCounter}`}
                    projectId={selectedProject}
                    selectedSuiteId={selectedSuiteId || undefined}
                    onSuiteSelect={(suite) => {
                      setSelectedSuiteId(suite._id)
                      fetchSuiteDetails(suite._id)
                    }}
                    onSuiteCreate={(parentSuiteId) => {
                      setEditingSuite(null)
                      setParentSuiteIdForCreate(parentSuiteId)
                      setSuiteDialogOpen(true)
                    }}
                    onSuiteEdit={(suite) => {
                      setEditingSuite(suite)
                      setParentSuiteIdForCreate(undefined)
                      setSuiteDialogOpen(true)
                    }}
                    onSuiteDelete={(suiteId) => handleDeleteSuite(suiteId)}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Suite Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!selectedSuiteId || suiteDetailsLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Folder className="h-8 w-8 mx-auto mb-2" />
                          <p>{suiteDetailsLoading ? 'Loading suite details…' : 'Select a test suite to view details'}</p>
                        </div>
                      ) : selectedSuiteDetails ? (
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h2 className="text-xl font-semibold">{selectedSuiteDetails.name}</h2>
                              <p className="text-sm text-muted-foreground">
                                {selectedSuiteDetails.description || 'No description'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => {
                                setEditingSuite({
                                  _id: selectedSuiteDetails._id,
                                  name: selectedSuiteDetails.name,
                                  description: selectedSuiteDetails.description,
                                  parentSuite: selectedSuiteDetails.parentSuite?._id,
                                  project: selectedProject,
                                })
                                setParentSuiteIdForCreate(undefined)
                                setSuiteDialogOpen(true)
                              }}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteSuite(selectedSuiteDetails._id)}>Delete</Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Project</div>
                              <div className="text-sm">{selectedSuiteDetails.project?.name || '—'}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Parent Suite</div>
                              <div className="text-sm">{selectedSuiteDetails.parentSuite?.name || 'Root'}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Created By</div>
                              <div className="text-sm">{selectedSuiteDetails.createdBy ? `${selectedSuiteDetails.createdBy.firstName || ''} ${selectedSuiteDetails.createdBy.lastName || ''}`.trim() || selectedSuiteDetails.createdBy.email : '—'}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Folder className="h-8 w-8 mx-auto mb-2" />
                          <p>Unable to load suite details</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cases" className="space-y-6">
              <TestCaseList
                projectId={selectedProject}
                key={`${selectedProject}-${testCasesRefreshCounter}-${selectedSuiteId ?? 'all'}`}
                onTestCaseSelect={(testCase) => console.log('Selected test case:', testCase)}
                onTestCaseCreate={(testSuiteId) => {
                  setEditingTestCase(null)
                  setCreateCaseSuiteId(testSuiteId)
                  setTestCaseDialogOpen(true)
                }}
                onTestCaseEdit={(testCase) => console.log('Edit test case:', testCase)}
                onTestCaseDelete={(testCaseId) => console.log('Delete test case:', testCaseId)}
                onTestCaseExecute={(testCase) => console.log('Execute test case:', testCase)}
              />
            </TabsContent>

            <TabsContent value="executions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="h-8 w-8 mx-auto mb-2" />
                    <p>No test executions found</p>
                    <Button className="mt-4" onClick={handleStartTestExecution}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Test Execution
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Dialogs */}
        <ResponsiveDialog
          open={testPlanDialogOpen}
          onOpenChange={setTestPlanDialogOpen}
          title="Create Test Plan"
        >
          <TestPlanForm
            projectId={selectedProject}
            onSave={handleSaveTestPlan}
            onCancel={() => setTestPlanDialogOpen(false)}
            loading={saving}
          />
        </ResponsiveDialog>

        <ResponsiveDialog
          open={testExecutionDialogOpen}
          onOpenChange={setTestExecutionDialogOpen}
          title="Execute Test Case"
        >
          <TestExecutionForm
            projectId={selectedProject}
            onSave={handleSaveTestExecution}
            onCancel={() => setTestExecutionDialogOpen(false)}
            loading={saving}
          />
        </ResponsiveDialog>

        <ResponsiveDialog
          open={suiteDialogOpen}
          onOpenChange={setSuiteDialogOpen}
          title={editingSuite ? 'Edit Test Suite' : 'Create Test Suite'}
        >
          <TestSuiteForm
            testSuite={editingSuite || (parentSuiteIdForCreate ? { name: '', description: '', parentSuite: parentSuiteIdForCreate, project: selectedProject } as any : undefined)}
            projectId={selectedProject}
            onSave={async (suiteData) => {
              setSuiteSaving(true)
              try {
                const isEdit = !!editingSuite?._id
                const res = await fetch('/api/test-suites', {
                  method: isEdit ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...(isEdit ? { suiteId: editingSuite._id } : {}),
                    name: suiteData.name,
                    description: suiteData.description,
                    projectId: selectedProject,
                    parentSuiteId: suiteData.parentSuite || parentSuiteIdForCreate,
                  })
                })
                if (res.ok) {
                  setSuiteDialogOpen(false)
                  setEditingSuite(null)
                  setParentSuiteIdForCreate(undefined)
                  setSuitesRefreshCounter(c => c + 1)
                } else {
                  const data = await res.json().catch(() => ({}))
                  console.error('Failed to save test suite', data)
                }
              } catch (e) {
                console.error('Error saving test suite:', e)
              } finally {
                setSuiteSaving(false)
              }
            }}
            onCancel={() => {
              setSuiteDialogOpen(false)
              setEditingSuite(null)
              setParentSuiteIdForCreate(undefined)
            }}
            loading={suiteSaving}
          />
        </ResponsiveDialog>

        <ResponsiveDialog
          open={testCaseDialogOpen}
          onOpenChange={setTestCaseDialogOpen}
          title={editingTestCase ? 'Edit Test Case' : 'Create Test Case'}
        >
          <TestCaseForm
            testCase={editingTestCase || (createCaseSuiteId ? { testSuiteId: createCaseSuiteId } as any : undefined)}
            projectId={selectedProject}
            onSave={async (testCaseData: any) => {
              setTestCaseSaving(true)
              try {
                const isEdit = !!editingTestCase?._id
                const res = await fetch('/api/test-cases', {
                  method: isEdit ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...(isEdit ? { testCaseId: editingTestCase._id } : {}),
                    ...testCaseData,
                    projectId: selectedProject,
                  })
                })
                if (res.ok) {
                  setTestCaseDialogOpen(false)
                  setEditingTestCase(null)
                  setCreateCaseSuiteId(undefined)
                  setTestCasesRefreshCounter(c => c + 1)
                } else {
                  const data = await res.json().catch(() => ({}))
                  console.error('Failed to save test case', data)
                }
              } catch (e) {
                console.error('Error saving test case:', e)
              } finally {
                setTestCaseSaving(false)
              }
            }}
            onCancel={() => {
              setTestCaseDialogOpen(false)
              setEditingTestCase(null)
              setCreateCaseSuiteId(undefined)
            }}
            loading={testCaseSaving}
          />
        </ResponsiveDialog>
      </div>
    </MainLayout>
  )
}
