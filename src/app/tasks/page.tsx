import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageContent } from '@/components/ui/PageContent'
import { Loader2 } from 'lucide-react'
import { getTasksServer } from '@/lib/tasks-server'
import TasksClient from '@/components/tasks/TasksClient'

interface TasksPageProps {
  searchParams: {
    search?: string
    status?: string
    priority?: string
    type?: string
    project?: string
  }
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  // Fetch initial data on the server
  const initialResult = await getTasksServer({
    search: searchParams.search,
    status: searchParams.status,
    priority: searchParams.priority,
    type: searchParams.type,
    project: searchParams.project,
    limit: 20
  })

  return (
    <MainLayout>
      <PageContent>
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </div>
        }>
          <TasksClient 
            initialTasks={initialResult.data}
            initialPagination={initialResult.pagination}
            initialFilters={searchParams}
          />
        </Suspense>
      </PageContent>
    </MainLayout>
  )
}
