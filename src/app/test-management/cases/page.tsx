'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import TestCaseList from '@/components/test-management/TestCaseList'
import { TestCaseForm } from '@/components/test-management/TestCaseForm'
import { DeleteConfirmDialog } from '@/components/test-management/DeleteConfirmDialog'
import { ResponsiveDialog } from '@/components/ui/ResponsiveDialog'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface TestCase {
  _id: string
  title: string
  description: string
  priority: string
  category: string
  automationStatus: string
  estimatedExecutionTime: number
  testSuite: {
    _id: string
    name: string
  }
  createdBy: {
    _id: string
    firstName: string
    lastName: string
  }
  isActive: boolean
  createdAt: string
}

export default function TestCasesPage() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [testCaseDialogOpen, setTestCaseDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // In a real app, you'd fetch the user's projects and set the first one
    // For now, we'll use an empty string to show all test cases
    setSelectedProject('')
  }, [])

  const handleCreateTestCase = () => {
    setSelectedTestCase(null)
    setTestCaseDialogOpen(true)
  }

  const handleEditTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setTestCaseDialogOpen(true)
  }

  const handleDeleteTestCase = (testCaseId: string, testCaseName: string) => {
    setDeleteItem({ id: testCaseId, name: testCaseName })
    setDeleteDialogOpen(true)
  }

  const handleSaveTestCase = async (testCaseData: any) => {
    setSaving(true)
    try {
      const url = selectedTestCase?._id 
        ? `/api/test-cases/${selectedTestCase._id}`
        : '/api/test-cases'
      
      const method = selectedTestCase?._id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testCaseData,
          projectId: selectedProject
        })
      })

      if (response.ok) {
        setTestCaseDialogOpen(false)
        setSelectedTestCase(null)
        // Refresh the list or show success message
      } else {
        console.error('Failed to save test case')
      }
    } catch (error) {
      console.error('Error saving test case:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/test-cases/${deleteItem.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDeleteDialogOpen(false)
        setDeleteItem(null)
        // Refresh the list or show success message
      } else {
        console.error('Failed to delete test case')
      }
    } catch (error) {
      console.error('Error deleting test case:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Test Cases</h1>
            <p className="text-muted-foreground">
              Manage and organize your test cases across all projects
            </p>
          </div>
          <Button onClick={handleCreateTestCase} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Test Case
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <TestCaseList 
            projectId={selectedProject}
            onTestCaseCreate={handleCreateTestCase}
            onTestCaseEdit={handleEditTestCase}
            onTestCaseDelete={handleDeleteTestCase}
          />
        </div>

        {/* Dialogs */}
        <ResponsiveDialog
          open={testCaseDialogOpen}
          onOpenChange={setTestCaseDialogOpen}
          title={selectedTestCase ? 'Edit Test Case' : 'Create Test Case'}
        >
          <TestCaseForm
            testCase={selectedTestCase || undefined}
            projectId={selectedProject}
            onSave={handleSaveTestCase}
            onCancel={() => {
              setTestCaseDialogOpen(false)
              setSelectedTestCase(null)
            }}
            loading={saving}
          />
        </ResponsiveDialog>

        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setDeleteItem(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Test Case"
          itemName={deleteItem?.name || ''}
          itemType="Test Case"
          loading={deleting}
        />
      </div>
    </MainLayout>
  )
}
