import { useState, useEffect, useCallback } from 'react'
import { clientPushNotificationService } from '@/lib/client-push-notifications'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize push notifications
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supported = await clientPushNotificationService.initialize()
      setIsSupported(supported)

      if (supported) {
        const subscribed = await clientPushNotificationService.isSubscribed()
        setIsSubscribed(subscribed)
      }

      // Check permission
      if ('Notification' in window) {
        setPermission(Notification.permission)
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      setError('Failed to initialize push notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const newPermission = await clientPushNotificationService.requestPermission()
      setPermission(newPermission)

      if (newPermission === 'granted') {
        await subscribe()
      }

      return newPermission
    } catch (error) {
      console.error('Failed to request permission:', error)
      setError('Failed to request permission')
      return 'denied'
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const success = await clientPushNotificationService.subscribe()
      setIsSubscribed(success)

      if (!success) {
        setError('Failed to subscribe to push notifications')
      }

      return success
    } catch (error) {
      console.error('Failed to subscribe:', error)
      setError('Failed to subscribe to push notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const success = await clientPushNotificationService.unsubscribe()
      setIsSubscribed(!success)

      if (!success) {
        setError('Failed to unsubscribe from push notifications')
      }

      return success
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      setError('Failed to unsubscribe from push notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Toggle subscription
  const toggleSubscription = useCallback(async () => {
    if (isSubscribed) {
      return await unsubscribe()
    } else {
      if (permission === 'default') {
        const newPermission = await requestPermission()
        return newPermission === 'granted'
      } else if (permission === 'granted') {
        return await subscribe()
      } else {
        setError('Notification permission denied')
        return false
      }
    }
  }, [isSubscribed, permission, requestPermission, subscribe, unsubscribe])

  // Show test notification
  const showTestNotification = useCallback(async () => {
    try {
      await clientPushNotificationService.showNotification('Test Notification', {
        body: 'This is a test notification from Kanvaro',
        icon: '/icons/notification.png',
        badge: '/icons/badge.png'
      })
    } catch (error) {
      console.error('Failed to show test notification:', error)
      setError('Failed to show test notification')
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    initialize,
    requestPermission,
    subscribe,
    unsubscribe,
    toggleSubscription,
    showTestNotification
  }
}
