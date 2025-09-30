'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Calendar, Target } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
  state: 'PLANNED' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
}

interface SprintListProps {
  onSelectSprint: (sprintId: string) => void;
  onViewChange: (view: 'list' | 'planning' | 'active') => void;
}

export function SprintList({ onSelectSprint, onViewChange }: SprintListProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSprints();
  }, []);

  const loadSprints = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockSprints: Sprint[] = [
        {
          id: '1',
          name: 'Sprint 1 - Foundation',
          startDate: '2024-01-01',
          endDate: '2024-01-14',
          goal: 'Build core features and authentication',
          state: 'CLOSED',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Sprint 2 - Kanban Board',
          startDate: '2024-01-15',
          endDate: '2024-01-28',
          goal: 'Implement drag-and-drop Kanban board',
          state: 'CLOSED',
          createdAt: '2024-01-15T00:00:00Z',
        },
        {
          id: '3',
          name: 'Sprint 3 - Sprints & Reports',
          startDate: '2024-01-29',
          endDate: '2024-02-11',
          goal: 'Add sprint management and reporting features',
          state: 'ACTIVE',
          createdAt: '2024-01-29T00:00:00Z',
        },
      ];
      setSprints(mockSprints);
    } catch (error) {
      console.error('Failed to load sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      // TODO: Call API to start sprint
      console.log('Starting sprint:', sprintId);
      await loadSprints();
    } catch (error) {
      console.error('Failed to start sprint:', error);
    }
  };

  const handleCloseSprint = async (sprintId: string) => {
    try {
      // TODO: Call API to close sprint
      console.log('Closing sprint:', sprintId);
      await loadSprints();
    } catch (error) {
      console.error('Failed to close sprint:', error);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'PLANNED':
        return <Calendar className="w-4 h-4" />;
      case 'ACTIVE':
        return <Play className="w-4 h-4" />;
      case 'CLOSED':
        return <Square className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sprints...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sprints.map((sprint) => (
        <Card key={sprint.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">{sprint.name}</CardTitle>
                <Badge className={getStateColor(sprint.state)}>
                  <div className="flex items-center gap-1">
                    {getStateIcon(sprint.state)}
                    {sprint.state}
                  </div>
                </Badge>
              </div>
              <div className="flex gap-2">
                {sprint.state === 'PLANNED' && (
                  <Button
                    size="sm"
                    onClick={() => handleStartSprint(sprint.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Sprint
                  </Button>
                )}
                {sprint.state === 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCloseSprint(sprint.id)}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Close Sprint
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelectSprint(sprint.id);
                    onViewChange(
                      sprint.state === 'ACTIVE' ? 'active' : 'planning'
                    );
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">
                    {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                    {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Goal</p>
                  <p className="font-medium">{sprint.goal || 'No goal set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full" />
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="font-medium">0/0 tasks completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
