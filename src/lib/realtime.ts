import { publishEvent } from './redis'

export interface RealtimeEvent {
  type: string
  entityId: string
  organizationId: string
  projectId?: string
  data: any
  timestamp: Date
  userId: string
}

export async function broadcastTaskUpdate(
  organizationId: string,
  projectId: string,
  taskId: string,
  data: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'task.updated',
    entityId: taskId,
    organizationId,
    projectId,
    data,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}

export async function broadcastTaskCreated(
  organizationId: string,
  projectId: string,
  taskId: string,
  data: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'task.created',
    entityId: taskId,
    organizationId,
    projectId,
    data,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}

export async function broadcastCommentCreated(
  organizationId: string,
  projectId: string,
  entityId: string,
  entityType: string,
  comment: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'comment.created',
    entityId,
    organizationId,
    projectId,
    data: { comment, entityType },
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}

export async function broadcastTimerUpdate(
  organizationId: string,
  projectId: string,
  taskId: string,
  timerData: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'timer.updated',
    entityId: taskId,
    organizationId,
    projectId,
    data: timerData,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
  await publishEvent(`user:${userId}`, event)
}

export async function broadcastBudgetAlert(
  organizationId: string,
  projectId: string,
  budgetData: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'budget.alert',
    entityId: projectId,
    organizationId,
    projectId,
    data: budgetData,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}

export async function broadcastProjectUpdate(
  organizationId: string,
  projectId: string,
  data: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'project.updated',
    entityId: projectId,
    organizationId,
    projectId,
    data,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}

export async function broadcastSprintUpdate(
  organizationId: string,
  projectId: string,
  sprintId: string,
  data: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'sprint.updated',
    entityId: sprintId,
    organizationId,
    projectId,
    data,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}

export async function broadcastEpicUpdate(
  organizationId: string,
  projectId: string,
  epicId: string,
  data: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'epic.updated',
    entityId: epicId,
    organizationId,
    projectId,
    data,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}

export async function broadcastStoryUpdate(
  organizationId: string,
  projectId: string,
  storyId: string,
  data: any,
  userId: string
) {
  const event: RealtimeEvent = {
    type: 'story.updated',
    entityId: storyId,
    organizationId,
    projectId,
    data,
    timestamp: new Date(),
    userId
  }

  await publishEvent(`org:${organizationId}`, event)
  await publishEvent(`project:${projectId}`, event)
}
