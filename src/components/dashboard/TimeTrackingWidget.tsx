'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Play, Pause, Square, TrendingUp, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Timer } from '@/components/time-tracking/Timer'

interface TimeTrackingWidgetProps {
  userId: string
  organizationId: string
  timeStats?: {
    today: { duration: number; cost: number }
    week: { duration: number; cost: number }
    month: { duration: number; cost: number }
    totalDuration: number
    totalCost: number
  }
}

interface ActiveTimer {
  _id: string
  project: { _id: string; name: string }
  task?: { _id: string; title: string }
  description: string
  startTime: string
  currentDuration: number
  isPaused: boolean
  isBillable: boolean
  hourlyRate?: number
}

interface TimeStats {
  todayDuration: number
  weekDuration: number
  monthDuration: number
  todayCost: number
  weekCost: number
  monthCost: number
}

export function TimeTrackingWidget({ userId, organizationId, timeStats: propTimeStats }: TimeTrackingWidgetProps) {
  const router = useRouter()
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadActiveTimer = useCallback(async () => {
    try {
      const response = await fetch(`/api/time-tracking/timer?userId=${userId}&organizationId=${organizationId}`)
      const data = await response.json()
      
      if (response.ok) {
        setActiveTimer(data.activeTimer)
      }
    } catch (error) {
      console.error('Error loading active timer:', error)
    }
  }, [userId, organizationId])

  const loadTimeStats = useCallback(async () => {
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const [todayResponse, weekResponse, monthResponse] = await Promise.all([
        fetch(`/api/time-tracking/entries?userId=${userId}&organizationId=${organizationId}&startDate=${startOfDay.toISOString()}&endDate=${today.toISOString()}`),
        fetch(`/api/time-tracking/entries?userId=${userId}&organizationId=${organizationId}&startDate=${startOfWeek.toISOString()}&endDate=${today.toISOString()}`),
        fetch(`/api/time-tracking/entries?userId=${userId}&organizationId=${organizationId}&startDate=${startOfMonth.toISOString()}&endDate=${today.toISOString()}`)
      ])

      const [todayData, weekData, monthData] = await Promise.all([
        todayResponse.json(),
        weekResponse.json(),
        monthResponse.json()
      ])

      if (todayResponse.ok && weekResponse.ok && monthResponse.ok) {
        setTimeStats({
          todayDuration: todayData.totals.totalDuration,
          weekDuration: weekData.totals.totalDuration,
          monthDuration: monthData.totals.totalDuration,
          todayCost: todayData.totals.totalCost,
          weekCost: weekData.totals.totalCost,
          monthCost: monthData.totals.totalCost
        })
      }
    } catch (error) {
      console.error('Error loading time stats:', error)
    }
  }, [userId, organizationId])

  useEffect(() => {
    loadActiveTimer()
    if (propTimeStats) {
      setTimeStats({
        todayDuration: propTimeStats.today.duration,
        weekDuration: propTimeStats.week.duration,
        monthDuration: propTimeStats.month.duration,
        todayCost: propTimeStats.today.cost,
        weekCost: propTimeStats.week.cost,
        monthCost: propTimeStats.month.cost
      })
    } else {
      loadTimeStats()
    }
  }, [loadActiveTimer, loadTimeStats, propTimeStats])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleTimerUpdate = (timer: ActiveTimer | null) => {
    setActiveTimer(timer)
    if (!timer) {
      // Timer was stopped, refresh stats
      loadTimeStats()
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
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-primary">
              {formatDuration(activeTimer.currentDuration)}
            </div>
            {activeTimer.hourlyRate && (
              <div className="text-sm text-muted-foreground mt-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                {formatCurrency((activeTimer.hourlyRate * activeTimer.currentDuration) / 60)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Project:</span> {activeTimer.project.name}
            </div>
            {activeTimer.task && (
              <div className="text-sm">
                <span className="font-medium">Task:</span> {activeTimer.task.title}
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Description:</span> {activeTimer.description}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activeTimer.isPaused ? 'secondary' : 'default'}>
                {activeTimer.isPaused ? 'Paused' : 'Running'}
              </Badge>
              {activeTimer.isBillable && (
                <Badge variant="outline">Billable</Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/time-tracking')}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Manage Timer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {timeStats && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {formatDuration(timeStats.todayDuration)}
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(timeStats.weekDuration)}
              </div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(timeStats.monthDuration)}
              </div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
          </div>
        )}

        {timeStats && (timeStats.todayCost > 0 || timeStats.weekCost > 0 || timeStats.monthCost > 0) && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(timeStats.todayCost)}
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(timeStats.weekCost)}
              </div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(timeStats.monthCost)}
              </div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => router.push('/time-tracking')}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Timer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/time-tracking?tab=logs')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
