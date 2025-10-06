'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import TestCaseList from '@/components/test-management/TestCaseList'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function TestCasesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Cases</h1>
            <p className="text-muted-foreground">
              Manage and organize your test cases across all projects
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Test Case
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <TestCaseList projectId="" />
        </div>
      </div>
    </MainLayout>
  )
}
