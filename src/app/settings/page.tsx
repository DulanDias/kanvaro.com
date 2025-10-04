'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrganizationSettings } from '@/components/settings/OrganizationSettings'
import { EmailSettings } from '@/components/settings/EmailSettings'
import { DatabaseSettings } from '@/components/settings/DatabaseSettings'
import { 
  Building2, 
  Mail, 
  Database,
  Settings as SettingsIcon,
  Loader2
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authError, setAuthError] = useState('')
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      console.log('Settings: Checking authentication...')
      const response = await fetch('/api/auth/me')
      console.log('Settings: Auth response status:', response.status)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('Settings: User data received:', userData)
        setUser(userData)
        setAuthError('')
      } else if (response.status === 401) {
        console.log('Settings: 401 response, trying refresh token')
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
          <p className="text-muted-foreground">Loading settings...</p>
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
      <div className="space-y-8">
        {/* Settings Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Application Settings</h1>
              <p className="text-muted-foreground">
                Configure your organization settings, email system, and database management.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="organization" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Configuration
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="organization" className="space-y-6">
              <OrganizationSettings />
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <EmailSettings />
            </TabsContent>

            <TabsContent value="database" className="space-y-6">
              <DatabaseSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
