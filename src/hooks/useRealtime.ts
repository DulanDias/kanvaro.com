'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

interface RealtimeEvent {
  type: string
  entityId: string
  organizationId: string
  projectId?: string
  data: any
  timestamp: string
  userId: string
}

interface UseRealtimeOptions {
  organizationId: string
  projectId?: string
  onEvent?: (event: RealtimeEvent) => void
  onTaskUpdate?: (event: RealtimeEvent) => void
  onTaskCreated?: (event: RealtimeEvent) => void
  onCommentCreated?: (event: RealtimeEvent) => void
  onTimerUpdate?: (event: RealtimeEvent) => void
  onBudgetAlert?: (event: RealtimeEvent) => void
  onProjectUpdate?: (event: RealtimeEvent) => void
  onSprintUpdate?: (event: RealtimeEvent) => void
  onEpicUpdate?: (event: RealtimeEvent) => void
  onStoryUpdate?: (event: RealtimeEvent) => void
}

export function useRealtime({
  organizationId,
  projectId,
  onEvent,
  onTaskUpdate,
  onTaskCreated,
  onCommentCreated,
  onTimerUpdate,
  onBudgetAlert,
  onProjectUpdate,
  onSprintUpdate,
  onEpicUpdate,
  onStoryUpdate
}: UseRealtimeOptions) {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!session?.user || !organizationId) return

    // In a real implementation, you would use WebSocket or Server-Sent Events
    // For now, we'll simulate the connection
    setIsConnected(true)

    // Simulate receiving events (in real implementation, this would come from WebSocket)
    const simulateEvents = () => {
      // This is just for demonstration - in real implementation,
      // events would come from the WebSocket connection
      console.log('Realtime connection established for org:', organizationId)
    }

    simulateEvents()

    return () => {
      setIsConnected(false)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [session?.user, organizationId, projectId])

  const handleEvent = (event: RealtimeEvent) => {
    setLastEvent(event)
    
    if (onEvent) {
      onEvent(event)
    }

    // Route to specific handlers
    switch (event.type) {
      case 'task.updated':
        if (onTaskUpdate) onTaskUpdate(event)
        break
      case 'task.created':
        if (onTaskCreated) onTaskCreated(event)
        break
      case 'comment.created':
        if (onCommentCreated) onCommentCreated(event)
        break
      case 'timer.updated':
        if (onTimerUpdate) onTimerUpdate(event)
        break
      case 'budget.alert':
        if (onBudgetAlert) onBudgetAlert(event)
        break
      case 'project.updated':
        if (onProjectUpdate) onProjectUpdate(event)
        break
      case 'sprint.updated':
        if (onSprintUpdate) onSprintUpdate(event)
        break
      case 'epic.updated':
        if (onEpicUpdate) onEpicUpdate(event)
        break
      case 'story.updated':
        if (onStoryUpdate) onStoryUpdate(event)
        break
    }
  }

  return {
    isConnected,
    lastEvent,
    handleEvent
  }
}
