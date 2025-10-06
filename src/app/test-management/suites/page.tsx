'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import TestSuiteTree from '@/components/test-management/TestSuiteTree'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function TestSuitesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Suites</h1>
            <p className="text-muted-foreground">
              Organize your test cases into hierarchical test suites
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Test Suite
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <TestSuiteTree projectId="" />
        </div>
      </div>
    </MainLayout>
  )
}
