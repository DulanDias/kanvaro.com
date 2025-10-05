'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotifications } from '@/hooks/useNotifications'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Bell, Mail, Smartphone, TestTube, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function NotificationTest() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refresh } = useNotifications({
    limit: 10,
    autoRefresh: true
  })
  
  const { isSupported, isSubscribed, permission, toggleSubscription, showTestNotification } = usePushNotifications()
  
  const [testMessage, setTestMessage] = useState('')
  const [testType, setTestType] = useState('task')
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const sendTestNotification = async () => {
    if (!testMessage.trim()) {
      setTestResult({ type: 'error', message: 'Please enter a test message' })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: testType,
          title: 'Test Notification',
          message: testMessage,
          sendEmail: true,
          sendPush: true
        })
      })

      if (response.ok) {
        setTestResult({ type: 'success', message: 'Test notification sent successfully!' })
        refresh() // Refresh notifications
      } else {
        const error = await response.json()
        setTestResult({ type: 'error', message: error.error || 'Failed to send test notification' })
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Failed to send test notification' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Notification Test Center
          </CardTitle>
          <CardDescription>
            Test the notification system end-to-end
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Notification Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-type">Notification Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="test-message">Test Message</Label>
              <textarea
                id="test-message"
                placeholder="Enter your test message here..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button 
              onClick={sendTestNotification} 
              disabled={isLoading || !testMessage.trim()}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </Button>

            {testResult && (
              <Alert className={testResult.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {testResult.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Browser Support</Label>
              <div className="flex items-center gap-2">
                {isSupported ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">{isSupported ? 'Supported' : 'Not Supported'}</span>
              </div>
            </div>

            <div>
              <Label>Permission</Label>
              <div className="flex items-center gap-2">
                {permission === 'granted' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm capitalize">{permission}</span>
              </div>
            </div>

            <div>
              <Label>Subscription</Label>
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</span>
              </div>
            </div>

            <div>
              <Label>Unread Count</Label>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">{unreadCount}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleSubscription}
              disabled={!isSupported}
            >
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Button>
            
            {isSubscribed && (
              <Button
                variant="outline"
                onClick={showTestNotification}
              >
                Test Push
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications ({notifications.length})
          </CardTitle>
          <CardDescription>
            Latest notifications from the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={(notification._id as any).toString()}
                  className={`flex items-start justify-between p-3 rounded-lg border ${
                    !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {notification.type.toUpperCase()}
                      </span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 bg-primary rounded-full"></span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => markAsRead((notification._id as any).toString())}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => deleteNotification((notification._id as any).toString())}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
