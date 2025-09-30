'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Target, Calendar, Users } from 'lucide-react';

interface SprintPlanningProps {
  sprintId?: string | null;
  onBack: () => void;
}

export function SprintPlanning({ sprintId, onBack }: SprintPlanningProps) {
  const [sprint, setSprint] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goal: '',
  });
  // const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sprintId) {
      loadSprint();
    }
  }, [sprintId]);

  const loadSprint = async () => {
    try {
      setLoading(true);
      // TODO: Load sprint data from API
      console.log('Loading sprint:', sprintId);
    } catch (error) {
      console.error('Failed to load sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: Save sprint via API
      console.log('Saving sprint:', sprint);
    } catch (error) {
      console.error('Failed to save sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sprints
        </Button>
        <h2 className="text-2xl font-bold">Sprint Planning</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Sprint Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Sprint Name</Label>
                <Input
                  id="name"
                  value={sprint.name}
                  onChange={(e) =>
                    setSprint({ ...sprint, name: e.target.value })
                  }
                  placeholder="e.g., Sprint 1 - Foundation"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={sprint.startDate}
                  onChange={(e) =>
                    setSprint({ ...sprint, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={sprint.endDate}
                  onChange={(e) =>
                    setSprint({ ...sprint, endDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="goal">Sprint Goal</Label>
                <Textarea
                  id="goal"
                  value={sprint.goal}
                  onChange={(e) =>
                    setSprint({ ...sprint, goal: e.target.value })
                  }
                  placeholder="What do we want to achieve in this sprint?"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Sprint'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Task Planning */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Sprint Backlog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks added to this sprint yet</p>
                  <p className="text-sm">
                    Add tasks from your backlog to plan this sprint
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Button variant="outline" className="w-full">
                    Add Tasks from Backlog
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sprint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Story Points</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">14</div>
              <div className="text-sm text-gray-600">Days Duration</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
