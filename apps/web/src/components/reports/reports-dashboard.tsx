'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BurndownChart } from '../sprints/burndown-chart';
import { VelocityChart } from './velocity-chart';
import { ThroughputChart } from './throughput-chart';
import { CumulativeFlowChart } from './cumulative-flow-chart';
import { TrendingUp, Target, Clock, Users, BarChart3 } from 'lucide-react';

interface ReportsDashboardProps {
  projectId: string;
  dateRange: {
    from: string;
    to: string;
  };
}

export function ReportsDashboard({
  projectId,
  dateRange,
}: ReportsDashboardProps) {
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    averageVelocity: 0,
    teamSize: 0,
    totalTime: 0,
  });
  const [, setLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [projectId, dateRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      // TODO: Load metrics from API
      setMetrics({
        totalTasks: 45,
        completedTasks: 32,
        averageVelocity: 18.5,
        teamSize: 5,
        totalTime: 240.5,
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate =
    metrics.totalTasks > 0
      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{metrics.totalTasks}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {metrics.completedTasks}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {metrics.averageVelocity}
                </div>
                <div className="text-sm text-gray-600">Avg Velocity</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{metrics.totalTime}h</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Current Sprint Burndown</CardTitle>
          </CardHeader>
          <CardContent>
            <BurndownChart
              data={[
                { date: '2024-01-29', remaining: 50, completed: 0, ideal: 50 },
                { date: '2024-01-30', remaining: 45, completed: 5, ideal: 43 },
                { date: '2024-01-31', remaining: 40, completed: 10, ideal: 36 },
                { date: '2024-02-01', remaining: 35, completed: 15, ideal: 29 },
                { date: '2024-02-02', remaining: 30, completed: 20, ideal: 22 },
              ]}
            />
          </CardContent>
        </Card>

        {/* Velocity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <VelocityChart
              data={[
                { sprint: 'Sprint 1', velocity: 15 },
                { sprint: 'Sprint 2', velocity: 18 },
                { sprint: 'Sprint 3', velocity: 22 },
                { sprint: 'Sprint 4', velocity: 20 },
                { sprint: 'Sprint 5', velocity: 25 },
                { sprint: 'Sprint 6', velocity: 23 },
              ]}
            />
          </CardContent>
        </Card>

        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <ThroughputChart
              data={[
                { week: 'Week 1', completed: 8 },
                { week: 'Week 2', completed: 12 },
                { week: 'Week 3', completed: 10 },
                { week: 'Week 4', completed: 15 },
              ]}
            />
          </CardContent>
        </Card>

        {/* Cumulative Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <CumulativeFlowChart
              data={[
                {
                  date: '2024-01-29',
                  open: 20,
                  inProgress: 5,
                  review: 3,
                  done: 2,
                },
                {
                  date: '2024-01-30',
                  open: 18,
                  inProgress: 7,
                  review: 4,
                  done: 6,
                },
                {
                  date: '2024-01-31',
                  open: 15,
                  inProgress: 8,
                  review: 5,
                  done: 12,
                },
                {
                  date: '2024-02-01',
                  open: 12,
                  inProgress: 6,
                  review: 7,
                  done: 15,
                },
                {
                  date: '2024-02-02',
                  open: 10,
                  inProgress: 4,
                  review: 8,
                  done: 18,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'John Doe', tasks: 12, hours: 45.5, efficiency: 95 },
              { name: 'Jane Smith', tasks: 10, hours: 38.0, efficiency: 88 },
              { name: 'Mike Johnson', tasks: 11, hours: 42.5, efficiency: 92 },
              { name: 'Sarah Wilson', tasks: 9, hours: 35.0, efficiency: 85 },
            ].map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">
                      {member.tasks} tasks • {member.hours}h
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{member.efficiency}%</div>
                  <div className="text-sm text-gray-600">Efficiency</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
