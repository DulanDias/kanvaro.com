'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingDown, Target, Clock, Users } from 'lucide-react';
import { BurndownChart } from '@/components/sprints/burndown-chart';

interface ActiveSprintProps {
  sprintId?: string | null;
  onBack: () => void;
}

type BurndownPoint = {
  date: string;
  remaining: number;
  completed: number;
  ideal: number;
};

export function ActiveSprint({ sprintId, onBack }: ActiveSprintProps) {
  const [sprint] = useState({
    id: sprintId,
    name: 'Sprint 3 - Sprints & Reports',
    startDate: '2024-01-29',
    endDate: '2024-02-11',
    goal: 'Add sprint management and reporting features',
    state: 'ACTIVE',
  });
  const [burndownData, setBurndownData] = useState<BurndownPoint[]>([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    loadSprintData();
  }, [sprintId]);

  const loadSprintData = async () => {
    try {
      setLoading(true);
      // TODO: Load sprint and burndown data from API
      const mockBurndownData = [
        { date: '2024-01-29', remaining: 50, completed: 0, ideal: 50 },
        { date: '2024-01-30', remaining: 45, completed: 5, ideal: 43 },
        { date: '2024-01-31', remaining: 40, completed: 10, ideal: 36 },
        { date: '2024-02-01', remaining: 35, completed: 15, ideal: 29 },
        { date: '2024-02-02', remaining: 30, completed: 20, ideal: 22 },
        { date: '2024-02-05', remaining: 25, completed: 25, ideal: 15 },
        { date: '2024-02-06', remaining: 20, completed: 30, ideal: 8 },
        { date: '2024-02-07', remaining: 15, completed: 35, ideal: 1 },
        { date: '2024-02-08', remaining: 10, completed: 40, ideal: 0 },
        { date: '2024-02-09', remaining: 5, completed: 45, ideal: 0 },
        { date: '2024-02-10', remaining: 0, completed: 50, ideal: 0 },
      ];
      setBurndownData(mockBurndownData);
    } catch (error) {
      console.error('Failed to load sprint data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    const endDate = new Date(sprint.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressPercentage = () => {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const today = new Date();
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sprints
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{sprint.name}</h2>
          <p className="text-gray-600">{sprint.goal}</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            ACTIVE
          </div>
        </Badge>
      </div>

      {/* Sprint Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Sprint Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {Math.round(getProgressPercentage())}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
              <span>{new Date(sprint.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{getDaysRemaining()}</div>
                <div className="text-sm text-gray-600">Days Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">35</div>
                <div className="text-sm text-gray-600">Story Points Done</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-gray-600">Remaining Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Burndown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Burndown Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BurndownChart data={burndownData} />
        </CardContent>
      </Card>

      {/* Sprint Actions */}
      <div className="flex gap-4">
        <Button variant="outline">View Sprint Board</Button>
        <Button variant="outline">Sprint Retrospective</Button>
        <Button variant="destructive">Close Sprint</Button>
      </div>
    </div>
  );
}
