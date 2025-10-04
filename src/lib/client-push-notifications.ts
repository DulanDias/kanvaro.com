'use client'

import { pushNotificationService } from './push-notification-service'

export class ClientPushNotificationService {
  private static instance: ClientPushNotificationService
  private registration: ServiceWorkerRegistration | null = null
  private vapidPublicKey: string | null = null

  private constructor() {}

  static getInstance(): ClientPushNotificationService {
    if (!ClientPushNotificationService.instance) {
      ClientPushNotificationService.instance = new ClientPushNotificationService()
    }
    return ClientPushNotificationService.instance
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported')
        return false
      }

      // Check if push messaging is supported
      if (!('PushManager' in window)) {
        console.log('Push messaging not supported')
        return false
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service worker registered')

      // Get VAPID public key
      await this.getVapidPublicKey()

      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported')
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    console.log('Notification permission:', permission)
    return permission
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<boolean> {
    try {
      if (!this.registration) {
        console.error('Service worker not registered')
        return false
      }

      if (!this.vapidPublicKey) {
        console.error('VAPID public key not available')
        return false
      }

      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('Already subscribed to push notifications')
        return true
      }

      // Create new subscription
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription })
      })

      if (response.ok) {
        console.log('Successfully subscribed to push notifications')
        return true
      } else {
        console.error('Failed to save subscription on server')
        return false
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return false
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false
      }

      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        console.log('Successfully unsubscribed from push notifications')
        return true
      }

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false
      }

      const subscription = await this.registration.pushManager.getSubscription()
      return !!subscription
    } catch (error) {
      console.error('Failed to check subscription status:', error)
      return false
    }
  }

  /**
   * Get VAPID public key from server
   */
  private async getVapidPublicKey(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe')
      if (response.ok) {
        const data = await response.json()
        this.vapidPublicKey = data.vapidPublicKey
      }
    } catch (error) {
      console.error('Failed to get VAPID public key:', error)
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Show local notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      new Notification(title, options)
    }
  }
}

export const clientPushNotificationService = ClientPushNotificationService.getInstance()
