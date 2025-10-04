'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { RecentTasks } from '@/components/dashboard/RecentTasks'
import { TeamActivity } from '@/components/dashboard/TeamActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { TimeTrackingWidget } from '@/components/dashboard/TimeTrackingWidget'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageContent } from '@/components/ui/PageContent'

interface DashboardData {
  stats: {
    activeProjects: number
    completedTasks: number
    teamMembers: number
    hoursTracked: number
    projectsCount: number
    tasksCount: number
    timeEntriesCount: number
  }
  changes: {
    activeProjects: number
    completedTasks: number
    teamMembers: number
    hoursTracked: number
  }
  recentProjects: any[]
  recentTasks: any[]
  teamActivity: any[]
  timeStats: {
    today: { duration: number; cost: number }
    week: { duration: number; cost: number }
    month: { duration: number; cost: number }
    totalDuration: number
    totalCost: number
  }
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [authError, setAuthError] = useState('')
  const [dataError, setDataError] = useState('')
  const router = useRouter()

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.data)
        setDataError('')
      } else {
        setDataError('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setDataError('Failed to load dashboard data')
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      console.log('Dashboard: Checking authentication...')
      const response = await fetch('/api/auth/me')
      console.log('Dashboard: Auth response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('Dashboard: User data received:', userData)
        setUser(userData)
        setAuthError('')
        // Load dashboard data after successful auth
        await loadDashboardData()
      } else if (response.status === 401) {
        console.log('Dashboard: 401 response, trying refresh token')
        // Try to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST'
        })
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setUser(refreshData.user)
          setAuthError('')
          // Load dashboard data after successful refresh
          await loadDashboardData()
        } else {
          // Both access and refresh tokens are invalid
          setAuthError('Session expired')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } else {
        // Other error, redirect to login
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthError('Authentication failed')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }, [router, loadDashboardData])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await loadDashboardData()
    } finally {
      setIsRefreshing(false)
    }
  }, [loadDashboardData])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Set up periodic auth check to handle token expiration
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuth()
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{authError}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <PageContent>
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <DashboardHeader user={user} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {dataError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{dataError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StatsCards 
              stats={dashboardData?.stats} 
              changes={dashboardData?.changes}
              isLoading={!dashboardData}
            />
            <RecentProjects 
              projects={dashboardData?.recentProjects}
              isLoading={!dashboardData}
            />
            <RecentTasks 
              tasks={dashboardData?.recentTasks}
              isLoading={!dashboardData}
            />
            <TeamActivity 
              activities={dashboardData?.teamActivity}
              isLoading={!dashboardData}
            />
          </div>
          
          <div className="space-y-6">
            {user.id && user.organization && (
              <TimeTrackingWidget 
                userId={user.id} 
                organizationId={user.organization}
                timeStats={dashboardData?.timeStats}
              />
            )}
            <QuickActions />
          </div>
        </div>
        </div>
      </PageContent>
    </MainLayout>
  )
}
