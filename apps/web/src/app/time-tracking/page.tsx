'use client';

import { useState } from 'react';
import { TimeTracker } from '@/components/time-tracking/time-tracker';
import { TimeLogs } from '@/components/time-tracking/time-logs';
import { TimeReports } from '@/components/time-tracking/time-reports';
import { Button } from '@/components/ui/button';
import { Clock, List, BarChart3 } from 'lucide-react';

export default function TimeTrackingPage() {
  const [view, setView] = useState<'tracker' | 'logs' | 'reports'>('tracker');

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <div className="flex gap-2">
            <Button
              variant={view === 'tracker' ? 'default' : 'outline'}
              onClick={() => setView('tracker')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Timer
            </Button>
            <Button
              variant={view === 'logs' ? 'default' : 'outline'}
              onClick={() => setView('logs')}
            >
              <List className="w-4 h-4 mr-2" />
              Time Logs
            </Button>
            <Button
              variant={view === 'reports' ? 'default' : 'outline'}
              onClick={() => setView('reports')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>

        <div className="h-full">
          {view === 'tracker' && <TimeTracker />}
          {view === 'logs' && <TimeLogs />}
          {view === 'reports' && <TimeReports />}
        </div>
      </div>
    </div>
  );
}
