'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';

interface Task {
  id: string;
  title: string;
  columnId: string;
  orderKey: string;
}

interface Column {
  id: string;
  name: string;
  orderKey: string;
}

interface KanbanBoardProps {
  boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setActiveTask] = useState<Task | null>(null);
  const socket = useSocket();

  useEffect(() => {
    loadBoardData();
  }, [boardId]);

  useEffect(() => {
    if (socket) {
      socket.emit('join-board', { boardId });

      socket.on('task.moved', (task) => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, columnId: task.columnId, orderKey: task.orderKey }
              : t
          )
        );
      });

      return () => {
        socket.emit('leave-board', { boardId });
        socket.off('task.moved');
      };
    }
  }, [socket, boardId]);

  const loadBoardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // For now, create mock data
      const mockColumns: Column[] = [
        { id: '1', name: 'Backlog', orderKey: '0|000000' },
        { id: '2', name: 'In Progress', orderKey: '0|000001' },
        { id: '3', name: 'Review', orderKey: '0|000002' },
        { id: '4', name: 'Done', orderKey: '0|000003' },
      ];

      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Set up development environment',
          columnId: '1',
          orderKey: '0|000000',
        },
        {
          id: '2',
          title: 'Create user authentication',
          columnId: '1',
          orderKey: '0|000001',
        },
        {
          id: '3',
          title: 'Implement Kanban board',
          columnId: '2',
          orderKey: '0|000000',
        },
        {
          id: '4',
          title: 'Add drag and drop',
          columnId: '2',
          orderKey: '0|000001',
        },
        { id: '5', title: 'Write tests', columnId: '3', orderKey: '0|000000' },
        {
          id: '6',
          title: 'Deploy to production',
          columnId: '4',
          orderKey: '0|000000',
        },
      ];

      setColumns(mockColumns);
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newColumnId = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === newColumnId) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: newColumnId } : t))
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/move`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ toColumnId: newColumnId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to move task');
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, columnId: task.columnId } : t
        )
      );
    }
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.orderKey.localeCompare(b.orderKey));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading board...</div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksForColumn(column.id)}
          />
        ))}

        <div className="w-64">
          <Button
            variant="outline"
            className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-gray-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>
    </DndContext>
  );
}
