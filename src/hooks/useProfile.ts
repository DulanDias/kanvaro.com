'use client'

import { useState, useCallback } from 'react'

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  avatar?: string
  timezone: string
  language: string
  currency: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    sidebarCollapsed: boolean
    dateFormat: string
    timeFormat: '12h' | '24h'
    notifications: {
      email: boolean
      inApp: boolean
      push: boolean
      taskReminders: boolean
      projectUpdates: boolean
      teamActivity: boolean
    }
  }
}

interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  timezone?: string
  language?: string
  currency?: string
  theme?: 'light' | 'dark' | 'system'
  sidebarCollapsed?: boolean
  dateFormat?: string
  timeFormat?: '12h' | '24h'
  notifications?: {
    email?: boolean
    inApp?: boolean
    push?: boolean
    taskReminders?: boolean
    projectUpdates?: boolean
    teamActivity?: boolean
  }
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function useProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          preferences: {
            theme: data.theme,
            sidebarCollapsed: data.sidebarCollapsed,
            dateFormat: data.dateFormat,
            timeFormat: data.timeFormat,
            notifications: data.notifications
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Profile updated successfully')
        setTimeout(() => setSuccess(''), 3000)
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to update profile')
        return { success: false, error: result.error || 'Failed to update profile' }
      }
    } catch (err) {
      const errorMessage = 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const changePassword = useCallback(async (data: PasswordChangeData) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('New passwords do not match')
      return { success: false, error: 'New passwords do not match' }
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Password changed successfully')
        setTimeout(() => setSuccess(''), 3000)
        return { success: true }
      } else {
        setError(result.error || 'Failed to change password')
        return { success: false, error: result.error || 'Failed to change password' }
      }
    } catch (err) {
      const errorMessage = 'Failed to change password'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Avatar updated successfully')
        setTimeout(() => setSuccess(''), 3000)
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Failed to upload avatar')
        return { success: false, error: result.error || 'Failed to upload avatar' }
      }
    } catch (err) {
      const errorMessage = 'Failed to upload avatar'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setError('')
    setSuccess('')
  }, [])

  return {
    loading,
    error,
    success,
    updateProfile,
    changePassword,
    uploadAvatar,
    clearMessages
  }
}
