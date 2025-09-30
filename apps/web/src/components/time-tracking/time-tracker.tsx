'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, Clock, Plus, BarChart3 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  projectId: string;
}

interface ActiveTimer {
  id: string;
  taskId: string;
  startedAt: string;
  note?: string;
}

export function TimeTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [note, setNote] = useState('');
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
    loadActiveTimer();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.startedAt).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const loadTasks = async () => {
    try {
      // TODO: Load tasks from API
      const mockTasks: Task[] = [
        { id: '1', title: 'Implement sprint management', projectId: '1' },
        { id: '2', title: 'Add time tracking features', projectId: '1' },
        { id: '3', title: 'Create reports dashboard', projectId: '1' },
        { id: '4', title: 'Fix authentication bug', projectId: '1' },
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const loadActiveTimer = async () => {
    try {
      // TODO: Load active timer from API
      setActiveTimer(null);
    } catch (error) {
      console.error('Failed to load active timer:', error);
    }
  };

  const handleStartTimer = async () => {
    if (!selectedTask) return;

    try {
      setLoading(true);
      // TODO: Start timer via API
      const newTimer: ActiveTimer = {
        id: 'temp-id',
        taskId: selectedTask,
        startedAt: new Date().toISOString(),
        note,
      };
      setActiveTimer(newTimer);
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to start timer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    try {
      setLoading(true);
      // TODO: Stop timer via API
      setActiveTimer(null);
      setElapsedTime(0);
      setNote('');
    } catch (error) {
      console.error('Failed to stop timer:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedTaskData = tasks.find((task) => task.id === selectedTask);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timer Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeTimer ? (
            <div className="text-center space-y-4">
              <div className="text-4xl font-mono font-bold text-blue-600">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-lg text-gray-600">
                {selectedTaskData?.title}
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleStopTimer}
                  disabled={loading}
                  variant="destructive"
                  size="lg"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Timer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="task">Select Task</Label>
                <select
                  id="task"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a task...</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What are you working on?"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleStartTimer}
                disabled={!selectedTask || loading}
                size="lg"
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Time Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                task: 'Implement sprint management',
                duration: '2h 30m',
                date: 'Today',
              },
              {
                task: 'Add time tracking features',
                duration: '1h 45m',
                date: 'Yesterday',
              },
              {
                task: 'Create reports dashboard',
                duration: '3h 15m',
                date: 'Yesterday',
              },
            ].map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{log.task}</div>
                  <div className="text-sm text-gray-600">{log.date}</div>
                </div>
                <div className="text-sm font-mono text-blue-600">
                  {log.duration}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              Add Manual Entry
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Clock className="w-6 h-6 mb-2" />
              View Today's Logs
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="w-6 h-6 mb-2" />
              Time Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
