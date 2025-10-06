'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Play, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, SkipForward } from 'lucide-react'

export default function TestExecutionsPage() {
  // Mock data - in real implementation, this would come from API
  const executions = [
    {
      id: '1',
      testCase: 'Login with valid credentials',
      testPlan: 'Sprint 1 Test Plan',
      project: 'Project Alpha',
      tester: 'John Doe',
      status: 'passed',
      executionDate: '2024-01-20T10:30:00Z',
      duration: 120,
      version: 'v1.0.0'
    },
    {
      id: '2',
      testCase: 'User registration flow',
      testPlan: 'Sprint 1 Test Plan',
      project: 'Project Alpha',
      tester: 'Jane Smith',
      status: 'failed',
      executionDate: '2024-01-20T11:15:00Z',
      duration: 180,
      version: 'v1.0.0'
    },
    {
      id: '3',
      testCase: 'Password reset functionality',
      testPlan: 'Sprint 1 Test Plan',
      project: 'Project Alpha',
      tester: 'John Doe',
      status: 'blocked',
      executionDate: '2024-01-20T14:00:00Z',
      duration: 0,
      version: 'v1.0.0'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'blocked': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'skipped': return <SkipForward className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'blocked': return 'bg-yellow-100 text-yellow-800'
      case 'skipped': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Executions</h1>
            <p className="text-muted-foreground">
              Track and manage test execution results
            </p>
          </div>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Execute Test
          </Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Executions</CardTitle>
              <CardDescription>
                Latest test execution results across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Case</TableHead>
                    <TableHead>Test Plan</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tester</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Executed</TableHead>
                    <TableHead>Version</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell className="font-medium">
                        {execution.testCase}
                      </TableCell>
                      <TableCell>{execution.testPlan}</TableCell>
                      <TableCell>{execution.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(execution.status)}
                          <Badge className={getStatusColor(execution.status)}>
                            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{execution.tester}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(execution.duration)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(execution.executionDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{execution.version}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
