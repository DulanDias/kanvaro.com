'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GanttChart } from '@/components/reports/GanttChart'
import { GanttData, GanttTask } from '@/lib/gantt'
import { Calendar, Filter, Download } from 'lucide-react'

export default function GanttReportPage() {
  const [ganttData, setGanttData] = useState<GanttData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    project: '',
    sprint: '',
    assignee: '',
    startDate: '',
    endDate: ''
  })
  const [projects, setProjects] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [assignees, setAssignees] = useState<any[]>([])

  useEffect(() => {
    loadGanttData()
    loadFilterOptions()
  }, [filters])

  const loadGanttData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.project) params.append('projectId', filters.project)
      if (filters.sprint) params.append('sprintId', filters.sprint)
      if (filters.assignee) params.append('assigneeId', filters.assignee)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/reports/gantt?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGanttData(data)
      }
    } catch (error) {
      console.error('Failed to load Gantt data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      // Load projects
      const projectsResponse = await fetch('/api/projects')
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)
      }

      // Load sprints if project is selected
      if (filters.project) {
        const sprintsResponse = await fetch(`/api/sprints?project=${filters.project}`)
        if (sprintsResponse.ok) {
          const sprintsData = await sprintsResponse.json()
          setSprints(sprintsData)
        }
      }

      // Load assignees
      const assigneesResponse = await fetch('/api/members')
      if (assigneesResponse.ok) {
        const assigneesData = await assigneesResponse.json()
        setAssignees(assigneesData)
      }
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  const handleTaskClick = (task: GanttTask) => {
    // Navigate to task detail page
    window.open(`/tasks/${task.id}`, '_blank')
  }

  const handleExport = () => {
    // Export Gantt data as CSV or image
    console.log('Export Gantt chart')
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Gantt chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gantt Chart</h1>
          <p className="text-muted-foreground">
            Visualize project timelines and dependencies
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={filters.project}
                onValueChange={(value) => handleFilterChange('project', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint">Sprint</Label>
              <Select
                value={filters.sprint}
                onValueChange={(value) => handleFilterChange('sprint', value)}
                disabled={!filters.project}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sprints" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sprints</SelectItem>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint._id} value={sprint._id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={filters.assignee}
                onValueChange={(value) => handleFilterChange('assignee', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All assignees</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee._id} value={assignee._id}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      {ganttData && ganttData.tasks.length > 0 ? (
        <GanttChart
          tasks={ganttData.tasks}
          startDate={ganttData.startDate}
          endDate={ganttData.endDate}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or create some tasks to see the Gantt chart.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
