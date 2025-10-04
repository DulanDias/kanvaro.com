// Service Worker for Push Notifications
const CACHE_NAME = 'kanvaro-notifications-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...')
  event.waitUntil(self.clients.claim())
})

// Push event
self.addEventListener('push', (event) => {
  console.log('Push message received:', event)

  let notificationData = {
    title: 'Kanvaro',
    body: 'You have a new notification',
    icon: '/icons/notification.png',
    badge: '/icons/badge.png',
    data: {
      url: '/'
    }
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || 'Kanvaro',
        body: data.body || 'You have a new notification',
        icon: data.icon || '/icons/notification.png',
        badge: data.badge || '/icons/badge.png',
        data: data.data || { url: '/' }
      }
    } catch (error) {
      console.error('Failed to parse push data:', error)
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    requireInteraction: true,
    silent: false
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  if (event.action === 'view') {
    // Open the app to the notification URL
    const url = event.notification.data?.url || '/'
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Check if there's already a window open
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // Open new window
        return self.clients.openWindow(url)
      })
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    console.log('Notification dismissed')
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.openWindow('/')
    )
  }
})

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    console.log('Background sync for notifications')
    // Handle offline notification sync here
  }
})
