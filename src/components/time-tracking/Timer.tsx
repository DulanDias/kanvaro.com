'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TimerProps {
  userId: string
  organizationId: string
  projectId?: string
  taskId?: string
  description?: string
  onTimerUpdate?: (timer: any) => void
}

interface ActiveTimer {
  _id: string
  project: { _id: string; name: string }
  task?: { _id: string; title: string }
  description: string
  startTime: string
  currentDuration: number
  isPaused: boolean
  category?: string
  tags: string[]
  isBillable: boolean
  hourlyRate?: number
  maxSessionHours: number
}

export function Timer({ userId, organizationId, projectId, taskId, description = '', onTimerUpdate }: TimerProps) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [displayTime, setDisplayTime] = useState('00:00:00')

  // Format time display
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes % 1) * 60)
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Update display time every second
  useEffect(() => {
    if (!activeTimer) return

    const interval = setInterval(() => {
      const now = new Date()
      const startTime = new Date(activeTimer.startTime)
      const baseDuration = (now.getTime() - startTime.getTime()) / (1000 * 60)
      const currentDuration = Math.max(0, baseDuration)
      
      setDisplayTime(formatTime(currentDuration))

      // Check for auto-stop
      if (currentDuration >= activeTimer.maxSessionHours * 60) {
        handleStopTimer()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTimer])

  // Load active timer on mount
  useEffect(() => {
    loadActiveTimer()
  }, [userId, organizationId])

  const loadActiveTimer = useCallback(async () => {
    try {
      const response = await fetch(`/api/time-tracking/timer?userId=${userId}&organizationId=${organizationId}`)
      const data = await response.json()
      
      if (response.ok) {
        setActiveTimer(data.activeTimer)
        // Description is now handled by parent component
      }
    } catch (error) {
      console.error('Error loading active timer:', error)
    }
  }, [userId, organizationId])

  const handleStartTimer = async () => {
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          organizationId,
          projectId,
          taskId,
          description
        })
      })

      const data = await response.json()

      if (response.ok) {
        setActiveTimer(data.activeTimer)
        onTimerUpdate?.(data.activeTimer)
      } else {
        setError(data.error || 'Failed to start timer')
      }
    } catch (error) {
      setError('Failed to start timer')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePauseTimer = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          organizationId,
          action: 'pause'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setActiveTimer(data.activeTimer)
        onTimerUpdate?.(data.activeTimer)
      } else {
        setError(data.error || 'Failed to pause timer')
      }
    } catch (error) {
      setError('Failed to pause timer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeTimer = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          organizationId,
          action: 'resume'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setActiveTimer(data.activeTimer)
        onTimerUpdate?.(data.activeTimer)
      } else {
        setError(data.error || 'Failed to resume timer')
      }
    } catch (error) {
      setError('Failed to resume timer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopTimer = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          organizationId,
          action: 'stop',
          description
        })
      })

      const data = await response.json()

      if (response.ok) {
        setActiveTimer(null)
        setDisplayTime('00:00:00')
        onTimerUpdate?.(null)
      } else {
        setError(data.error || 'Failed to stop timer')
      }
    } catch (error) {
      setError('Failed to stop timer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTimer = async () => {
    if (!activeTimer) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          organizationId,
          action: 'update',
          description
        })
      })

      const data = await response.json()

      if (response.ok) {
        setActiveTimer(data.activeTimer)
        onTimerUpdate?.(data.activeTimer)
      } else {
        setError(data.error || 'Failed to update timer')
      }
    } catch (error) {
      setError('Failed to update timer')
    } finally {
      setIsLoading(false)
    }
  }

  if (activeTimer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-primary">
              {displayTime}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Project</Label>
              <p className="text-sm text-muted-foreground">{activeTimer.project.name}</p>
            </div>
            {activeTimer.task && (
              <div>
                <Label className="text-sm font-medium">Task</Label>
                <p className="text-sm text-muted-foreground">{activeTimer.task.title}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground">{activeTimer.description}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {activeTimer.isPaused ? (
              <Button onClick={handleResumeTimer} disabled={isLoading} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button onClick={handlePauseTimer} disabled={isLoading} className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleStopTimer} disabled={isLoading} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleStartTimer} disabled={isLoading || !description.trim()} className="w-full">
        <Play className="h-4 w-4 mr-2" />
        Start Timer
      </Button>
    </div>
  )
}
