'use client'

import { useState, useEffect } from 'react'

interface Organization {
  id: string
  name: string
  domain?: string
  logo?: string
  darkLogo?: string
  logoMode?: 'light' | 'dark' | 'both' | 'auto'
  timezone?: string
  currency?: string
  language?: string
  industry?: string
  size?: 'startup' | 'small' | 'medium' | 'enterprise'
  settings?: {
    allowSelfRegistration?: boolean
    requireEmailVerification?: boolean
    defaultUserRole?: string
  }
  emailConfig?: {
    provider: 'smtp' | 'azure' | 'sendgrid' | 'mailgun'
    smtp?: {
      host: string
      port: number
      secure: boolean
      username: string
      password: string
      fromEmail: string
      fromName: string
    }
    azure?: {
      clientId: string
      clientSecret: string
      tenantId: string
      fromEmail: string
      fromName: string
    }
  }
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch('/api/organization')
        if (response.ok) {
          const data = await response.json()
          setOrganization(data)
        } else {
          // Fallback to mock data if API fails
          const mockOrganization: Organization = {
            id: '1',
            name: 'Kanvaro',
            logo: undefined,
            darkLogo: undefined,
            logoMode: 'auto'
          }
          setOrganization(mockOrganization)
        }
      } catch (error) {
        console.error('Failed to fetch organization:', error)
        // Fallback to mock data on error
        const mockOrganization: Organization = {
          id: '1',
          name: 'Kanvaro',
          logo: undefined,
          darkLogo: undefined,
          logoMode: 'auto'
        }
        setOrganization(mockOrganization)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [])

  return {
    organization,
    loading
  }
}