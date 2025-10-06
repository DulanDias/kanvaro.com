'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart, 
  Download, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Target,
  Users,
  FileText
} from 'lucide-react'

export default function TestReportsPage() {
  // Mock data - in real implementation, this would come from API
  const testSummary = {
    totalTestCases: 150,
    executed: 120,
    passed: 95,
    failed: 20,
    blocked: 5,
    passRate: 79.2,
    executionRate: 80.0
  }

  const projectStats = [
    {
      name: 'Project Alpha',
      totalCases: 75,
      executed: 60,
      passed: 45,
      failed: 12,
      blocked: 3,
      passRate: 75.0
    },
    {
      name: 'Project Beta',
      totalCases: 50,
      executed: 40,
      passed: 35,
      failed: 5,
      blocked: 0,
      passRate: 87.5
    },
    {
      name: 'Project Gamma',
      totalCases: 25,
      executed: 20,
      passed: 15,
      failed: 3,
      blocked: 2,
      passRate: 75.0
    }
  ]

  const recentExecutions = [
    {
      testCase: 'User Login Flow',
      project: 'Project Alpha',
      status: 'passed',
      executedBy: 'John Doe',
      executedAt: '2024-01-20T10:30:00Z'
    },
    {
      testCase: 'Payment Processing',
      project: 'Project Beta',
      status: 'failed',
      executedBy: 'Jane Smith',
      executedAt: '2024-01-20T11:15:00Z'
    },
    {
      testCase: 'Data Export',
      project: 'Project Gamma',
      status: 'blocked',
      executedBy: 'Mike Johnson',
      executedAt: '2024-01-20T14:00:00Z'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'blocked': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'blocked': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive test execution reports and analytics
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Test Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSummary.totalTestCases}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSummary.executionRate}%</div>
              <Progress value={testSummary.executionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSummary.passRate}%</div>
              <Progress value={testSummary.passRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSummary.failed}</div>
              <p className="text-xs text-muted-foreground">
                {testSummary.blocked} blocked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Project Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Project Test Statistics</CardTitle>
            <CardDescription>
              Test execution statistics by project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectStats.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{project.name}</h4>
                    <Badge variant="outline">{project.passRate}% Pass Rate</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Total: {project.totalCases}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Executed: {project.executed}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Passed: {project.passed}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Failed: {project.failed}</span>
                    </div>
                  </div>
                  <Progress value={(project.executed / project.totalCases) * 100} className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Executions</CardTitle>
            <CardDescription>
              Latest test execution results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExecutions.map((execution, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(execution.status)}
                    <div>
                      <p className="font-medium">{execution.testCase}</p>
                      <p className="text-sm text-muted-foreground">
                        {execution.project} • {execution.executedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(execution.executedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
