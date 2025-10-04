'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { RecentTasks } from '@/components/dashboard/RecentTasks'
import { TeamActivity } from '@/components/dashboard/TeamActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // If auth fails, check if setup is needed
        const setupResponse = await fetch('/api/setup/status')
        const setupData = await setupResponse.json()
        
        if (!setupData.isSetupComplete) {
          router.push('/setup')
        } else {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // If auth fails, check if setup is needed
      try {
        const setupResponse = await fetch('/api/setup/status')
        const setupData = await setupResponse.json()
        
        if (!setupData.isSetupComplete) {
          router.push('/setup')
        } else {
          router.push('/login')
        }
      } catch (setupError) {
        router.push('/setup')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <DashboardHeader user={user} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StatsCards />
            <RecentProjects />
            <RecentTasks />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            <TeamActivity />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
