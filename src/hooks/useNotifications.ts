import { useState, useEffect, useCallback } from 'react'
import { INotification } from '@/models/Notification'

interface UseNotificationsOptions {
  limit?: number
  offset?: number
  unreadOnly?: boolean
  type?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface NotificationsData {
  notifications: INotification[]
  total: number
  unreadCount: number
  loading: boolean
  error: string | null
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    limit = 20,
    offset = 0,
    unreadOnly = false,
    type,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [data, setData] = useState<NotificationsData>({
    notifications: [],
    total: 0,
    unreadCount: 0,
    loading: true,
    error: null
  })

  const fetchNotifications = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        unreadOnly: unreadOnly.toString()
      })

      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`/api/notifications?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const result = await response.json()
      
      if (result.success) {
        setData(prev => ({
          ...prev,
          notifications: result.data.notifications,
          total: result.data.total,
          unreadCount: result.data.unreadCount,
          loading: false
        }))
      } else {
        throw new Error(result.error || 'Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications'
      }))
    }
  }, [limit, offset, unreadOnly, type])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'markAsRead',
          notificationId
        })
      })

      if (response.ok) {
        // Update local state
        setData(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => 
            n._id.toString() === notificationId 
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'markAllRead'
        })
      })

      if (response.ok) {
        // Update local state
        setData(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, isRead: true, readAt: new Date() })),
          unreadCount: 0
        }))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          notificationId
        })
      })

      if (response.ok) {
        // Update local state
        setData(prev => {
          const notification = prev.notifications.find(n => n._id.toString() === notificationId)
          return {
            ...prev,
            notifications: prev.notifications.filter(n => n._id.toString() !== notificationId),
            total: prev.total - 1,
            unreadCount: notification && !notification.isRead ? prev.unreadCount - 1 : prev.unreadCount
          }
        })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchNotifications, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchNotifications])

  return {
    ...data,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  }
}

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=1&offset=0')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUnreadCount(result.data.unreadCount)
        }
      }
    } catch (error) {
      console.error('Error fetching notification count:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount()
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  return { unreadCount, loading, refresh: fetchCount }
}
