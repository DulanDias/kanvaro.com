'use client';

import { useState } from 'react';
import { ReportsDashboard } from '@/components/reports/reports-dashboard';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [projectId] = useState('1');

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Calendar className="w-4 h-4 mt-2" />
              <div>
                <label className="text-sm text-gray-600">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="ml-2 p-1 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Calendar className="w-4 h-4 mt-2" />
              <div>
                <label className="text-sm text-gray-600">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="ml-2 p-1 border rounded"
                />
              </div>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <ReportsDashboard projectId={projectId} dateRange={dateRange} />
      </div>
    </div>
  );
}
