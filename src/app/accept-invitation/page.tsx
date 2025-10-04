'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'

interface InvitationData {
  email: string
  role: string
  organization: string
  invitedBy: string
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (token) {
      validateInvitation()
    } else {
      setError('Invalid invitation link')
      setLoading(false)
    }
  }, [token])

  const validateInvitation = async () => {
    try {
      const response = await fetch(`/api/members/validate-invitation?token=${token}`)
      const data = await response.json()

      if (data.success) {
        setInvitationData(data.data)
        setFormData(prev => ({
          ...prev,
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || ''
        }))
      } else {
        setError(data.error || 'Invalid invitation')
      }
    } catch (err) {
      setError('Failed to validate invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/members/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Failed to accept invitation')
      }
    } catch (err) {
      setError('Failed to accept invitation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2 text-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Validating invitation...</span>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to the team!</h2>
              <p className="text-muted-foreground mb-4">
                Your account has been created successfully. You can now sign in to your account.
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Invitation</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Accept Invitation</h1>
          <p className="text-muted-foreground">
            You've been invited to join <span className="font-semibold text-foreground">{invitationData?.organization}</span> as a <span className="font-semibold text-primary">{invitationData?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </p>
        </div>
        
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={8}
                className="h-11"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={8}
                className="h-11"
                placeholder="Confirm your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-foreground">Loading...</span>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
