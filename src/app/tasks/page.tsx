"use client"

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageContent } from '@/components/ui/PageContent'
import TasksClient from '@/components/tasks/TasksClient'

export default function TasksPage() {
  const searchParams = useSearchParams()
console.log('searchParams',searchParams);

  const initialFilters = useMemo(() => ({
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    type: searchParams.get('type') || undefined,
    project: searchParams.get('project') || undefined,
  }), [searchParams])

  return (
    <MainLayout>
      <PageContent>
        <TasksClient
          initialTasks={[]}
          initialPagination={{ pageSize: 20, hasMore: false }}
          initialFilters={initialFilters}
        />
      </PageContent>
    </MainLayout>
  )
}
