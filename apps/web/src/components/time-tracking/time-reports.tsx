'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, Calendar, Clock, TrendingUp } from 'lucide-react';

type DailyDatum = { date: string; hours: number; billable: number };
type ProjectDatum = { name: string; hours: number; color: string };
type TeamMember = { name: string; hours: number; tasks: number };
type ReportsState = {
  daily: DailyDatum[];
  weekly: DailyDatum[];
  projectBreakdown: ProjectDatum[];
  teamStats: TeamMember[];
};

export function TimeReports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [reports, setReports] = useState<ReportsState>({
    daily: [],
    weekly: [],
    projectBreakdown: [],
    teamStats: [],
  });
  const [, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      // TODO: Load reports from API
      const mockDailyData: DailyDatum[] = [
        { date: '2024-01-29', hours: 8.5, billable: 7.5 },
        { date: '2024-01-30', hours: 6.0, billable: 5.5 },
        { date: '2024-01-31', hours: 7.5, billable: 7.0 },
        { date: '2024-02-01', hours: 8.0, billable: 7.5 },
        { date: '2024-02-02', hours: 5.5, billable: 5.0 },
      ];

      const mockProjectData: ProjectDatum[] = [
        { name: 'Sprint Management', hours: 24.5, color: '#3b82f6' },
        { name: 'Time Tracking', hours: 18.0, color: '#10b981' },
        { name: 'Reports', hours: 12.5, color: '#f59e0b' },
        { name: 'Bug Fixes', hours: 8.0, color: '#ef4444' },
      ];

      const mockTeamData: TeamMember[] = [
        { name: 'John Doe', hours: 45.5, tasks: 12 },
        { name: 'Jane Smith', hours: 38.0, tasks: 10 },
        { name: 'Mike Johnson', hours: 42.5, tasks: 11 },
        { name: 'Sarah Wilson', hours: 35.0, tasks: 9 },
      ];

      setReports({
        daily: mockDailyData,
        weekly: mockDailyData,
        projectBreakdown: mockProjectData,
        teamStats: mockTeamData,
      });
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting reports...');
  };

  const totalHours = reports.daily.reduce((sum, day) => sum + day.hours, 0);
  const totalBillableHours = reports.daily.reduce(
    (sum, day) => sum + day.billable,
    0
  );
  const averageHoursPerDay = totalHours / reports.daily.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Time Reports</h2>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </div>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {totalHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
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
                  {totalBillableHours.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Billable Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {averageHoursPerDay.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Avg per Day</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-500 rounded-full" />
              <div>
                <div className="text-2xl font-bold">
                  {totalHours > 0
                    ? Math.round((totalBillableHours / totalHours) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Billable Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3b82f6" name="Total Hours" />
                  <Bar
                    dataKey="billable"
                    fill="#10b981"
                    name="Billable Hours"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Project Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reports.projectBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {reports.projectBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.teamStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="hours"
                  fill="#3b82f6"
                  name="Hours"
                />
                <Bar
                  yAxisId="right"
                  dataKey="tasks"
                  fill="#10b981"
                  name="Tasks"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
