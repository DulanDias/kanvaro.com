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
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authError, setAuthError] = useState('')
  const router = useRouter()

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
  }, [router])

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
