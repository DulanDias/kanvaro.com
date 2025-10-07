import { Notification, INotification } from '@/models/Notification'
import { User } from '@/models/User'
import { emailService } from './email/EmailService'
import connectDB from './db-config'

export interface NotificationData {
  type: 'task' | 'project' | 'team' | 'system' | 'budget' | 'deadline' | 'reminder' | 'invitation' | 'time_tracking'
  title: string
  message: string
  data?: {
    entityType?: 'task' | 'project' | 'epic' | 'sprint' | 'story' | 'user' | 'budget' | 'time_entry'
    entityId?: string
    action?: 'created' | 'updated' | 'deleted' | 'assigned' | 'completed' | 'overdue' | 'reminder'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    url?: string
    metadata?: Record<string, any>
  }
  sendEmail?: boolean
  sendPush?: boolean
}

export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * Create and send a notification to a single user
   */
  async createNotification(
    userId: string,
    organizationId: string,
    notificationData: NotificationData
  ): Promise<INotification | null> {
    try {
      await connectDB()

      // Get user preferences
      const user = await User.findById(userId).select('preferences')
      if (!user) {
        console.error('User not found:', userId)
        return null
      }

      const { email, inApp, push } = user.preferences.notifications

      // Create notification record
      const notification = new Notification({
        user: userId,
        organization: organizationId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        sentVia: {
          inApp: inApp,
          email: email && (notificationData.sendEmail ?? false),
          push: push && (notificationData.sendPush ?? false)
        }
      })

      await notification.save()

      // Send email if enabled
      if (email && (notificationData.sendEmail ?? false)) {
        await this.sendEmailNotification(userId, notification)
      }

      // Send push notification if enabled
      if (push && (notificationData.sendPush ?? false)) {
        await this.sendPushNotification(userId, notification)
      }

      return notification
    } catch (error) {
      console.error('Failed to create notification:', error)
      return null
    }
  }

  /**
   * Create and send notifications to multiple users
   */
  async createBulkNotifications(
    userIds: string[],
    organizationId: string,
    notificationData: NotificationData
  ): Promise<INotification[]> {
    const notifications: INotification[] = []

    for (const userId of userIds) {
      const notification = await this.createNotification(userId, organizationId, notificationData)
      if (notification) {
        notifications.push(notification)
      }
    }

    return notifications
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
      type?: string
    } = {}
  ): Promise<{ notifications: INotification[], total: number, unreadCount: number }> {
    try {
      await connectDB()

      const { limit = 20, offset = 0, unreadOnly = false, type } = options

      const query: any = { user: userId }
      if (unreadOnly) {
        query.isRead = false
      }
      if (type) {
        query.type = type
      }

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .lean(),
        Notification.countDocuments(query),
        Notification.countDocuments({ user: userId, isRead: false })
      ])

      return { notifications: notifications as any, total, unreadCount }
    } catch (error) {
      console.error('Failed to get user notifications:', error)
      return { notifications: [], total: 0, unreadCount: 0 }
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await connectDB()

      const result = await Notification.updateOne(
        { _id: notificationId, user: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await connectDB()

      const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      return false
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      await connectDB()

      const result = await Notification.deleteOne({ _id: notificationId, user: userId })
      return result.deletedCount > 0
    } catch (error) {
      console.error('Failed to delete notification:', error)
      return false
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(userId: string, notification: INotification): Promise<void> {
    try {
      const user = await User.findById(userId).select('email firstName lastName')
      if (!user) return

      const emailHtml = this.generateNotificationEmail(notification, user.firstName || 'User')
      
      await emailService.sendEmail({
        to: user.email,
        subject: notification.title,
        html: emailHtml
      })

      // Update notification to mark email as sent
      await Notification.updateOne(
        { _id: notification._id },
        { emailSent: true }
      )
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(userId: string, notification: INotification): Promise<void> {
    try {
      // TODO: Implement push notification service (Web Push API, FCM, etc.)
      // For now, we'll just log it
      console.log('Push notification would be sent:', {
        userId,
        title: notification.title,
        message: notification.message
      })

      // Update notification to mark push as sent
      await Notification.updateOne(
        { _id: notification._id },
        { pushSent: true }
      )
    } catch (error) {
      console.error('Failed to send push notification:', error)
    }
  }

  /**
   * Generate email HTML for notification
   */
  private generateNotificationEmail(notification: INotification, userName: string): string {
    const priorityColors = {
      low: '#10b981',
      medium: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444'
    }

    const priority = notification.data?.priority || 'medium'
    const color = priorityColors[priority]

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${notification.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: ${color};
            border-radius: 8px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .notification-content {
            background: #f8fafc;
            border-left: 4px solid ${color};
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .button {
            display: inline-block;
            background: ${color};
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${notification.type.charAt(0).toUpperCase()}</div>
            <h1>${notification.title}</h1>
        </div>

        <p>Hello ${userName},</p>
        
        <div class="notification-content">
            <p>${notification.message}</p>
        </div>

        ${notification.data?.url ? `
        <div style="text-align: center;">
            <a href="${notification.data.url}" class="button">View Details</a>
        </div>
        ` : ''}

        <div class="footer">
            <p>This notification was sent by your Kanvaro team</p>
            <p>You can manage your notification preferences in your account settings</p>
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * Create task-related notifications
   */
  async notifyTaskUpdate(
    taskId: string,
    action: 'created' | 'updated' | 'assigned' | 'completed' | 'overdue',
    assignedUserId: string,
    organizationId: string,
    taskTitle: string,
    projectName?: string
  ): Promise<void> {
    const messages = {
      created: `A new task "${taskTitle}" has been created${projectName ? ` in project "${projectName}"` : ''}`,
      updated: `Task "${taskTitle}" has been updated${projectName ? ` in project "${projectName}"` : ''}`,
      assigned: `You have been assigned to task "${taskTitle}"${projectName ? ` in project "${projectName}"` : ''}`,
      completed: `Task "${taskTitle}" has been completed${projectName ? ` in project "${projectName}"` : ''}`,
      overdue: `Task "${taskTitle}" is overdue${projectName ? ` in project "${projectName}"` : ''}`
    }

    await this.createNotification(assignedUserId, organizationId, {
      type: 'task',
      title: `Task ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: messages[action],
      data: {
        entityType: 'task',
        entityId: taskId,
        action,
        priority: action === 'overdue' ? 'high' : 'medium',
        url: `/tasks/${taskId}`
      },
      sendEmail: true,
      sendPush: true
    })
  }

  /**
   * Create project-related notifications
   */
  async notifyProjectUpdate(
    projectId: string,
    action: 'created' | 'updated' | 'deadline_approaching' | 'completed',
    userIds: string[],
    organizationId: string,
    projectName: string
  ): Promise<void> {
    const messages = {
      created: `New project "${projectName}" has been created`,
      updated: `Project "${projectName}" has been updated`,
      deadline_approaching: `Project "${projectName}" deadline is approaching`,
      completed: `Project "${projectName}" has been completed`
    }

    await this.createBulkNotifications(userIds, organizationId, {
      type: 'project',
      title: `Project ${action.replace('_', ' ').charAt(0).toUpperCase() + action.replace('_', ' ').slice(1)}`,
      message: messages[action],
      data: {
        entityType: 'project',
        entityId: projectId,
        action: action === 'deadline_approaching' ? 'reminder' : action,
        priority: action === 'deadline_approaching' ? 'high' : 'medium',
        url: `/projects/${projectId}`
      },
      sendEmail: true,
      sendPush: true
    })
  }

  /**
   * Create team-related notifications
   */
  async notifyTeamUpdate(
    action: 'member_joined' | 'member_left' | 'role_changed',
    userIds: string[],
    organizationId: string,
    memberName: string,
    details?: string
  ): Promise<void> {
    const messages = {
      member_joined: `${memberName} has joined the team`,
      member_left: `${memberName} has left the team`,
      role_changed: `${memberName}'s role has been changed${details ? `: ${details}` : ''}`
    }

    await this.createBulkNotifications(userIds, organizationId, {
      type: 'team',
      title: 'Team Update',
      message: messages[action],
      data: {
        entityType: 'user',
        action: action === 'member_joined' ? 'created' : action === 'member_left' ? 'deleted' : 'updated',
        priority: 'low'
      },
      sendEmail: false,
      sendPush: false
    })
  }

  /**
   * Create budget-related notifications
   */
  async notifyBudgetUpdate(
    projectId: string,
    action: 'budget_exceeded' | 'budget_warning' | 'budget_updated',
    userIds: string[],
    organizationId: string,
    projectName: string,
    budgetInfo?: string
  ): Promise<void> {
    const messages = {
      budget_exceeded: `Project "${projectName}" has exceeded its budget${budgetInfo ? `: ${budgetInfo}` : ''}`,
      budget_warning: `Project "${projectName}" is approaching its budget limit${budgetInfo ? `: ${budgetInfo}` : ''}`,
      budget_updated: `Budget for project "${projectName}" has been updated${budgetInfo ? `: ${budgetInfo}` : ''}`
    }

    await this.createBulkNotifications(userIds, organizationId, {
      type: 'budget',
      title: 'Budget Alert',
      message: messages[action],
      data: {
        entityType: 'budget',
        entityId: projectId,
        action: action === 'budget_exceeded' ? 'overdue' : action === 'budget_warning' ? 'reminder' : 'updated',
        priority: action === 'budget_exceeded' ? 'critical' : 'high',
        url: `/projects/${projectId}`
      },
      sendEmail: true,
      sendPush: true
    })
  }
}

export const notificationService = NotificationService.getInstance()
