'use client';

import { useState } from 'react';
import { SprintList } from '@/components/sprints/sprint-list';
import { SprintPlanning } from '@/components/sprints/sprint-planning';
import { ActiveSprint } from '@/components/sprints/active-sprint';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SprintsPage() {
  const [view, setView] = useState<'list' | 'planning' | 'active'>('list');
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Sprint Management
          </h1>
          <div className="flex gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
            >
              All Sprints
            </Button>
            <Button
              variant={view === 'planning' ? 'default' : 'outline'}
              onClick={() => setView('planning')}
            >
              Sprint Planning
            </Button>
            <Button
              variant={view === 'active' ? 'default' : 'outline'}
              onClick={() => setView('active')}
            >
              Active Sprint
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Sprint
            </Button>
          </div>
        </div>

        <div className="h-full">
          {view === 'list' && (
            <SprintList
              onSelectSprint={setSelectedSprint}
              onViewChange={setView}
            />
          )}
          {view === 'planning' && (
            <SprintPlanning
              sprintId={selectedSprint}
              onBack={() => setView('list')}
            />
          )}
          {view === 'active' && (
            <ActiveSprint
              sprintId={selectedSprint}
              onBack={() => setView('list')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
