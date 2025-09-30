'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Clock, Calendar } from 'lucide-react';

interface TimeLog {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  note?: string;
  billable: boolean;
}

export function TimeLogs() {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [, setEditingLog] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newLog, setNewLog] = useState({
    taskId: '',
    startedAt: '',
    endedAt: '',
    note: '',
    billable: true,
  });

  useEffect(() => {
    loadTimeLogs();
  }, []);

  const loadTimeLogs = async () => {
    try {
      setLoading(true);
      // TODO: Load time logs from API
      const mockLogs: TimeLog[] = [
        {
          id: '1',
          taskId: '1',
          taskTitle: 'Implement sprint management',
          startedAt: '2024-01-29T09:00:00Z',
          endedAt: '2024-01-29T11:30:00Z',
          duration: 9000, // 2.5 hours in seconds
          note: 'Working on sprint creation and planning features',
          billable: true,
        },
        {
          id: '2',
          taskId: '2',
          taskTitle: 'Add time tracking features',
          startedAt: '2024-01-28T14:00:00Z',
          endedAt: '2024-01-28T15:45:00Z',
          duration: 6300, // 1.75 hours in seconds
          note: 'Implemented timer functionality',
          billable: true,
        },
        {
          id: '3',
          taskId: '3',
          taskTitle: 'Create reports dashboard',
          startedAt: '2024-01-28T10:00:00Z',
          endedAt: '2024-01-28T13:15:00Z',
          duration: 11700, // 3.25 hours in seconds
          note: 'Built charts and analytics',
          billable: true,
        },
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Failed to load time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    try {
      setLoading(true);
      // TODO: Create time log via API
      console.log('Adding time log:', newLog);
      setShowAddForm(false);
      setNewLog({
        taskId: '',
        startedAt: '',
        endedAt: '',
        note: '',
        billable: true,
      });
      await loadTimeLogs();
    } catch (error) {
      console.error('Failed to add time log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      setLoading(true);
      // TODO: Delete time log via API
      console.log('Deleting time log:', logId);
      await loadTimeLogs();
    } catch (error) {
      console.error('Failed to delete time log:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Time Logs</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Manual Entry
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Time Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task">Task</Label>
                <select
                  id="task"
                  value={newLog.taskId}
                  onChange={(e) =>
                    setNewLog({ ...newLog, taskId: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a task...</option>
                  <option value="1">Implement sprint management</option>
                  <option value="2">Add time tracking features</option>
                  <option value="3">Create reports dashboard</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={newLog.billable}
                  onChange={(e) =>
                    setNewLog({ ...newLog, billable: e.target.checked })
                  }
                />
                <Label htmlFor="billable">Billable</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startedAt">Start Time</Label>
                <Input
                  id="startedAt"
                  type="datetime-local"
                  value={newLog.startedAt}
                  onChange={(e) =>
                    setNewLog({ ...newLog, startedAt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="endedAt">End Time</Label>
                <Input
                  id="endedAt"
                  type="datetime-local"
                  value={newLog.endedAt}
                  onChange={(e) =>
                    setNewLog({ ...newLog, endedAt: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={newLog.note}
                onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                placeholder="What did you work on?"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddLog} disabled={loading}>
                {loading ? 'Adding...' : 'Add Time Log'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Logs List */}
      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{log.taskTitle}</h3>
                    {log.billable && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Billable
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {log.duration
                        ? formatDuration(log.duration)
                        : 'Running...'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(log.startedAt)}
                    </div>
                  </div>
                  {log.note && (
                    <p className="text-sm text-gray-600 mt-2">{log.note}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingLog(log.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {logs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No time logs found</p>
            <p className="text-sm text-gray-500">
              Start tracking your time to see logs here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
