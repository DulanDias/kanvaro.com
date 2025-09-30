'use client';

import { useParams } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban/kanban-board';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full p-4">
        <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>
        <KanbanBoard boardId={boardId} />
      </div>
    </div>
  );
}
