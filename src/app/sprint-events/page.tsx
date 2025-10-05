'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Search,
  Filter,
  Target,
  CheckCircle,
  Play,
  Square
} from 'lucide-react'
import { AddSprintEventModal } from '@/components/sprint-events/AddSprintEventModal'
import { EditSprintEventModal } from '@/components/sprint-events/EditSprintEventModal'

interface SprintEvent {
  _id: string
  eventType: string
  title: string
  description?: string
  scheduledDate: string
  actualDate?: string
  duration: number
  status: string
  facilitator: {
    firstName: string
    lastName: string
    email: string
  }
  attendees: Array<{
    firstName: string
    lastName: string
    email: string
  }>
  outcomes?: {
    decisions: string[]
    actionItems: Array<{
      description: string
      assignedTo: string
      dueDate: string
      status: string
    }>
    notes: string
    velocity?: number
    capacity?: number
  }
  location?: string
  meetingLink?: string
  sprint: {
    _id: string
    name: string
    status: string
  }
  project: {
    _id: string
    name: string
  }
}

export default function SprintEventsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const projectId = params.id as string
  const [events, setEvents] = useState<SprintEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<SprintEvent | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSprintEvents()
    }
  }, [projectId, isAuthenticated])

  const fetchSprintEvents = async () => {
    try {
      setLoading(true)
      const url = projectId ? `/api/sprint-events?projectId=${projectId}` : '/api/sprint-events'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching sprint events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventAdded = () => {
    fetchSprintEvents()
    setShowAddModal(false)
  }

  const handleEventUpdated = () => {
    fetchSprintEvents()
    setEditingEvent(null)
  }

  const handleEventDeleted = async (eventId: string) => {
    try {
      const response = await fetch(`/api/sprint-events/${eventId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchSprintEvents()
      }
    } catch (error) {
      console.error('Error deleting sprint event:', error)
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'planning':
        return <Target className="h-4 w-4" />
      case 'review':
        return <CheckCircle className="h-4 w-4" />
      case 'retrospective':
        return <Users className="h-4 w-4" />
      case 'daily_standup':
        return <Clock className="h-4 w-4" />
      case 'demo':
        return <Play className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'scheduled': 'secondary',
      'in_progress': 'default',
      'completed': 'outline',
      'cancelled': 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getEventTypeBadge = (eventType: string) => {
    const colors = {
      'planning': 'bg-blue-500',
      'review': 'bg-green-500',
      'retrospective': 'bg-purple-500',
      'daily_standup': 'bg-yellow-500',
      'demo': 'bg-orange-500',
      'other': 'bg-gray-500'
    }
    
    return (
      <Badge variant="outline" className={`${colors[eventType as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {eventType.replace('_', ' ')}
      </Badge>
    )
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || event.eventType === filterType
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            Please log in to access sprint events.
          </p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }


  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sprint Events</h1>
          <p className="text-muted-foreground">
            {projectId ? 'Manage agile events and ceremonies' : 'View all sprint events across your projects'}
          </p>
        </div>
        {projectId && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="planning">Planning</option>
                <option value="review">Review</option>
                <option value="retrospective">Retrospective</option>
                <option value="daily_standup">Daily Standup</option>
                <option value="demo">Demo</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sprint events found</p>
              {projectId && (
                <Button onClick={() => setShowAddModal(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event._id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventTypeIcon(event.eventType)}
                      <div>
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.sprint.name} • {event.project.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getEventTypeBadge(event.eventType)}
                      {getStatusBadge(event.status)}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Scheduled</p>
                        <p className="text-sm font-medium">
                          {new Date(event.scheduledDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {event.actualDate && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Actual</p>
                          <p className="text-sm font-medium">
                            {new Date(event.actualDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium">{event.duration} min</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Attendees</p>
                        <p className="text-sm font-medium">{event.attendees.length} people</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Facilitator: {event.facilitator.firstName} {event.facilitator.lastName}</p>
                      {event.location && <p>Location: {event.location}</p>}
                      {event.meetingLink && <p>Meeting Link: {event.meetingLink}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingEvent(event)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEventDeleted(event._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {event.outcomes && (
                    <div className="border-t pt-4 space-y-3">
                      <h4 className="text-sm font-medium">Event Outcomes</h4>
                      
                      {event.outcomes.decisions && event.outcomes.decisions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Decisions Made:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {event.outcomes.decisions.map((decision, index) => (
                              <li key={index}>{decision}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {event.outcomes.actionItems && event.outcomes.actionItems.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Action Items:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {event.outcomes.actionItems.map((item, index) => (
                              <li key={index}>
                                {item.description} (Due: {new Date(item.dueDate).toLocaleDateString()})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {event.outcomes.notes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                          <p className="text-xs text-muted-foreground">{event.outcomes.notes}</p>
                        </div>
                      )}

                      {(event.outcomes.velocity || event.outcomes.capacity) && (
                        <div className="grid grid-cols-2 gap-4">
                          {event.outcomes.velocity && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Velocity:</p>
                              <p className="text-sm font-medium">{event.outcomes.velocity} points</p>
                            </div>
                          )}
                          {event.outcomes.capacity && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Capacity:</p>
                              <p className="text-sm font-medium">{event.outcomes.capacity} hours</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddSprintEventModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleEventAdded}
        />
      )}

      {editingEvent && (
        <EditSprintEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={handleEventUpdated}
        />
      )}
      </div>
    </MainLayout>
  )
}
