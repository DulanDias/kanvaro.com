'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Loader2 } from 'lucide-react'

export default function DocsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to internal documentation
    router.push('/docs/internal')
  }, [router])

  return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Redirecting to documentation...</p>
        </div>
      </div>
    </MainLayout>
  )
}