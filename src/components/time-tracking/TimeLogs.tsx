'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Edit, Trash2, Check, X, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/Checkbox'

interface TimeLogsProps {
  userId: string
  organizationId: string
  projectId?: string
  taskId?: string
  onTimeEntryUpdate?: () => void
}

interface TimeEntry {
  _id: string
  description: string
  startTime: string
  endTime?: string
  duration: number
  isBillable: boolean
  hourlyRate?: number
  status: string
  category?: string
  tags: string[]
  notes?: string
  isApproved: boolean
  approvedBy?: { firstName: string; lastName: string }
  project: { _id: string; name: string }
  task?: { _id: string; title: string }
}

export function TimeLogs({ userId, organizationId, projectId, taskId, onTimeEntryUpdate }: TimeLogsProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resolvedUserId, setResolvedUserId] = useState<string>(userId || '')
  const [resolvedOrgId, setResolvedOrgId] = useState<string>(organizationId || '')
  const [authResolving, setAuthResolving] = useState<boolean>(!userId || !organizationId)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    isBillable: '',
    isApproved: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Resolve auth if props are missing
  useEffect(() => {
    const resolveAuth = async () => {
      if (resolvedUserId && resolvedOrgId) {
        setAuthResolving(false)
        return
      }
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const me = await res.json()
          setResolvedUserId(me.id)
          setResolvedOrgId(me.organization)
          setError('')
        } else {
          setError('Unable to resolve user. Please log in again.')
        }
      } catch (e) {
        setError('Failed to resolve user information')
      } finally {
        setAuthResolving(false)
      }
    }
    if (!resolvedUserId || !resolvedOrgId) {
      resolveAuth()
    }
  }, [resolvedUserId, resolvedOrgId])

  // Load time entries
  const loadTimeEntries = useCallback(async () => {
    if (!resolvedUserId || !resolvedOrgId) return
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        userId: resolvedUserId,
        organizationId: resolvedOrgId,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (projectId) params.append('projectId', projectId)
      if (taskId) params.append('taskId', taskId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.isBillable && filters.isBillable !== 'all') params.append('isBillable', filters.isBillable)
      if (filters.isApproved && filters.isApproved !== 'all') params.append('isApproved', filters.isApproved)

      const response = await fetch(`/api/time-tracking/entries?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTimeEntries(data.timeEntries)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Failed to load time entries')
      }
    } catch (error) {
      setError('Failed to load time entries')
    } finally {
      setIsLoading(false)
    }
  }, [resolvedUserId, resolvedOrgId, projectId, taskId, pagination.page, pagination.limit, filters])

  useEffect(() => {
    if (!authResolving) {
      loadTimeEntries()
    }
  }, [authResolving, loadTimeEntries])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateParts = (dateString: string) => {
    const d = new Date(dateString)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const date = `${yyyy}-${mm}-${dd}`
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return { date, time }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return

    try {
      const response = await fetch(`/api/time-tracking/entries/${entryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadTimeEntries()
        onTimeEntryUpdate?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete time entry')
      }
    } catch (error) {
      setError('Failed to delete time entry')
    }
  }

  const handleApproveEntries = async (action: 'approve' | 'reject') => {
    if (selectedEntries.length === 0) return

    try {
      const response = await fetch('/api/time-tracking/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeEntryIds: selectedEntries,
          approvedBy: resolvedUserId,
          action
        })
      })

      if (response.ok) {
        setSelectedEntries([])
        loadTimeEntries()
        onTimeEntryUpdate?.()
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${action} time entries`)
      }
    } catch (error) {
      setError(`Failed to ${action} time entries`)
    }
  }

  const handleSelectEntry = (entryId: string, selected: boolean) => {
    if (selected) {
      setSelectedEntries([...selectedEntries, entryId])
    } else {
      setSelectedEntries(selectedEntries.filter(id => id !== entryId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEntries(timeEntries.map(entry => entry._id))
    } else {
      setSelectedEntries([])
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* <Clock className="h-5 w-5" />
          Time Logs */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authResolving && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading your time entries...</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="isBillable">Billable</Label>
            <Select value={filters.isBillable} onValueChange={(value) => handleFilterChange('isBillable', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Billable</SelectItem>
                <SelectItem value="false">Non-billable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="isApproved">Approved</Label>
            <Select value={filters.isApproved} onValueChange={(value) => handleFilterChange('isApproved', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Approved</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedEntries.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedEntries.length} entries selected
            </span>
            <Button
              size="sm"
              onClick={() => handleApproveEntries('approve')}
              className="h-8"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleApproveEntries('reject')}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {/* Time Entries Table */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading time entries...</p>
            </div>
          ) : timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No time entries found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted rounded-lg text-sm font-medium">
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedEntries.length === timeEntries.length && timeEntries.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Project (Task)</div>
                <div className="col-span-1">Start Time</div>
                <div className="col-span-1">End Time</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Billable</div>
              </div>

              {/* Table Rows */}
              {timeEntries.map((entry) => (
                <div key={entry._id} className="grid grid-cols-12 gap-4 p-3 border rounded-lg">
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={selectedEntries.includes(entry._id)}
                      onCheckedChange={(checked) => handleSelectEntry(entry._id, checked as boolean)}
                    />
                  </div>
                  <div className="col-span-4 truncate">
                    <div className="font-medium truncate" title={entry.description}>{entry.description}</div>
                  </div>
                  <div className="col-span-2 text-sm truncate">
                    <span title={entry.project.name}>{entry.project.name}</span>
                    {entry.task && (
                      <span className="text-muted-foreground"> ({entry.task.title})</span>
                    )}
                  </div>
                  <div className="col-span-1 text-sm leading-tight">
                    {(() => { const p = formatDateParts(entry.startTime); return (<>
                      <div>{p.date}</div>
                      <div className="text-muted-foreground">{p.time}</div>
                    </>) })()}
                  </div>
                  <div className="col-span-1 text-sm leading-tight">
                    {entry.endTime ? (() => { const p = formatDateParts(entry.endTime as string); return (<>
                      <div>{p.date}</div>
                      <div className="text-muted-foreground">{p.time}</div>
                    </>) })() : '-'}
                  </div>
                  <div className="col-span-1 text-sm">
                    {formatDuration(entry.duration)}
                  </div>
                  <div className="col-span-1">
                    <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </div>
                  <div className="col-span-1">
                    <Badge variant={entry.isBillable ? 'default' : 'outline'}>
                      {entry.isBillable ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
              Previous
            </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
              Next
            </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
