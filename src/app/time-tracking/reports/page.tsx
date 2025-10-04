'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { TimeReports } from '@/components/time-tracking/TimeReports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, BarChart3, Download, Filter } from 'lucide-react'
import { Loader2 } from 'lucide-react'

export default function TimeReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setAuthError('')
        } else if (response.status === 401) {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST'
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            setUser(refreshData.user)
            setAuthError('')
          } else {
            setAuthError('Session expired')
            setTimeout(() => {
              router.push('/login')
            }, 2000)
          }
        } else {
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
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/time-tracking')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <span>Time Reports</span>
            </h1>
            <p className="text-muted-foreground">Analyze your time tracking data and generate insights</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Reports
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <TimeReports
          userId={user._id}
          organizationId={user.organization}
        />
      </div>
    </MainLayout>
  )
}
