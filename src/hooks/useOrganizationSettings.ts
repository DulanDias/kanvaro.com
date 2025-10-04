'use client'

import { useState, useEffect } from 'react'

interface ContactInfo {
  adminEmail: string
  adminName: string
  adminPhone?: string
  supportEmail?: string
  supportPhone?: string
  officeAddress?: string
  supportHours?: string
  emergencyContact?: string
}

interface OrganizationSettings {
  id: string | null
  name: string
  logo?: string
  darkLogo?: string
  logoMode?: 'light' | 'dark' | 'auto'
  contactInfo: ContactInfo | null
  isConfigured: boolean
}

export function useOrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/organization/settings')
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setError(null)
      } else {
        throw new Error('Failed to fetch organization settings')
      }
    } catch (err) {
      console.error('Error fetching organization settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Set minimal fallback settings without contact info
      setSettings({
        id: null,
        name: 'Kanvaro',
        logo: undefined,
        darkLogo: undefined,
        logoMode: 'auto',
        contactInfo: null,
        isConfigured: false
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  }
}
