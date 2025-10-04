'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { TrendingUp, BarChart3, Activity, Target } from 'lucide-react'

interface VelocityData {
  sprint: string
  plannedVelocity: number
  actualVelocity: number
  capacity: number
  actualCapacity: number
  startDate: string
  endDate: string
  status: string
}

interface VelocityChartProps {
  data: VelocityData[]
  title?: string
  description?: string
}

export function VelocityChart({ data, title = "Velocity Tracking", description }: VelocityChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'composed'>('line')
  const [showCapacity, setShowCapacity] = useState(false)
  const [showTrend, setShowTrend] = useState(true)

  const formatSprintName = (sprintName: string) => {
    return sprintName.length > 10 ? sprintName.substring(0, 10) + '...' : sprintName
  }

  const formatHours = (value: number) => {
    return `${value}h`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('Capacity') ? formatHours(entry.value) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate trend line data
  const trendData = data.map((item, index) => ({
    ...item,
    trend: showTrend ? (data.slice(0, index + 1).reduce((sum, d) => sum + d.actualVelocity, 0) / (index + 1)) : null
  }))

  const renderChart = () => {
    const commonProps = {
      data: trendData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="sprint" 
              tickFormatter={formatSprintName}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="velocity"
              orientation="left"
              tick={{ fontSize: 12 }}
            />
            {showCapacity && (
              <YAxis 
                yAxisId="capacity"
                orientation="right"
                tickFormatter={formatHours}
                tick={{ fontSize: 12 }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="velocity"
              type="monotone" 
              dataKey="plannedVelocity" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Planned Velocity"
              dot={{ r: 4 }}
            />
            <Line 
              yAxisId="velocity"
              type="monotone" 
              dataKey="actualVelocity" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Actual Velocity"
              dot={{ r: 4 }}
            />
            {showTrend && (
              <Line 
                yAxisId="velocity"
                type="monotone" 
                dataKey="trend" 
                stroke="#ff7300" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Trend"
                dot={false}
              />
            )}
            {showCapacity && (
              <Line 
                yAxisId="capacity"
                type="monotone" 
                dataKey="capacity" 
                stroke="#ffc658" 
                strokeWidth={2}
                name="Capacity"
                dot={{ r: 4 }}
              />
            )}
          </LineChart>
        )
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="sprint" 
              tickFormatter={formatSprintName}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="plannedVelocity" fill="#8884d8" name="Planned Velocity" />
            <Bar dataKey="actualVelocity" fill="#82ca9d" name="Actual Velocity" />
            {showCapacity && (
              <Bar dataKey="capacity" fill="#ffc658" name="Capacity" />
            )}
          </BarChart>
        )
      
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="sprint" 
              tickFormatter={formatSprintName}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="velocity"
              orientation="left"
              tick={{ fontSize: 12 }}
            />
            {showCapacity && (
              <YAxis 
                yAxisId="capacity"
                orientation="right"
                tickFormatter={formatHours}
                tick={{ fontSize: 12 }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="velocity"
              dataKey="plannedVelocity" 
              fill="#8884d8" 
              name="Planned Velocity"
              opacity={0.7}
            />
            <Bar 
              yAxisId="velocity"
              dataKey="actualVelocity" 
              fill="#82ca9d" 
              name="Actual Velocity"
            />
            {showCapacity && (
              <Line 
                yAxisId="capacity"
                type="monotone" 
                dataKey="capacity" 
                stroke="#ffc658" 
                strokeWidth={3}
                name="Capacity"
                dot={{ r: 4 }}
              />
            )}
            {showTrend && (
              <Line 
                yAxisId="velocity"
                type="monotone" 
                dataKey="trend" 
                stroke="#ff7300" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Trend"
                dot={false}
              />
            )}
          </ComposedChart>
        )
      
      default:
        return null
    }
  }

  const averageVelocity = data.length > 0 
    ? data.reduce((sum, d) => sum + d.actualVelocity, 0) / data.length 
    : 0

  const velocityVariance = data.length > 0 
    ? data.reduce((sum, d) => sum + Math.abs(d.actualVelocity - d.plannedVelocity), 0) / data.length 
    : 0

  const capacityUtilization = data.length > 0 
    ? data.reduce((sum, d) => sum + (d.actualCapacity / d.capacity), 0) / data.length 
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[
                { key: 'line', icon: TrendingUp, label: 'Line' },
                { key: 'bar', icon: BarChart3, label: 'Bar' },
                { key: 'composed', icon: Activity, label: 'Composed' }
              ].map(({ key, icon: Icon, label }) => (
                <Button
                  key={key}
                  variant={chartType === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(key as any)}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCapacity"
                checked={showCapacity}
                onChange={(e) => setShowCapacity(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showCapacity" className="text-sm">
                Show Capacity
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showTrend"
                checked={showTrend}
                onChange={(e) => setShowTrend(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showTrend" className="text-sm">
                Show Trend Line
              </label>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {averageVelocity.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Velocity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {velocityVariance.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Variance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {(capacityUtilization * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Capacity Utilization</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {data.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Sprints</p>
              </div>
            </div>
          )}

          {/* Sprint Status Legend */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {data.map((sprint, index) => (
              <div key={index} className="flex items-center space-x-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  sprint.status === 'completed' ? 'bg-green-500' :
                  sprint.status === 'active' ? 'bg-blue-500' :
                  sprint.status === 'planning' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="text-muted-foreground">
                  {formatSprintName(sprint.sprint)}: {sprint.actualVelocity}/{sprint.plannedVelocity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
