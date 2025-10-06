'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, Calendar, Users, CheckSquare } from 'lucide-react'

export default function TestPlansPage() {
  // Mock data - in real implementation, this would come from API
  const testPlans = [
    {
      id: '1',
      name: 'Sprint 1 Test Plan',
      description: 'Test plan for Sprint 1 features',
      project: 'Project Alpha',
      version: 'v1.0.0',
      status: 'active',
      testCases: 25,
      executed: 15,
      passed: 12,
      failed: 3,
      createdBy: 'John Doe',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Regression Test Plan',
      description: 'Comprehensive regression testing',
      project: 'Project Beta',
      version: 'v2.1.0',
      status: 'draft',
      testCases: 50,
      executed: 0,
      passed: 0,
      failed: 0,
      createdBy: 'Jane Smith',
      createdAt: '2024-01-20'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Plans</h1>
            <p className="text-muted-foreground">
              Create and manage test plans for your projects
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Test Plan
          </Button>
        </div>

        <div className="grid gap-6">
          {testPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Test Cases:</span>
                    <span className="font-medium">{plan.testCases}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Executed:</span>
                    <span className="font-medium">{plan.executed}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Passed:</span>
                    <span className="font-medium">{plan.passed}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-red-500" />
                    <span className="text-sm text-muted-foreground">Failed:</span>
                    <span className="font-medium">{plan.failed}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{plan.project} • {plan.version}</span>
                  </div>
                  <span>Created by {plan.createdBy} on {plan.createdAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
