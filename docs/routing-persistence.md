# Kanvaro - Advanced Routing & URL Persistence

## Overview

Kanvaro implements advanced routing with complete URL persistence, ensuring that all application state, filters, search parameters, and navigation state can be shared via URLs. This enables users to bookmark specific views, share links with exact state, and maintain application state across sessions.

## Routing Architecture

### Next.js App Router with Advanced State Management
```typescript
// lib/routing/types.ts
export interface RouteState {
  // URL Parameters
  params: Record<string, string>;
  // Query Parameters
  searchParams: Record<string, string | string[]>;
  // Application State
  filters: Record<string, any>;
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
  view: 'list' | 'grid' | 'kanban' | 'calendar';
  selectedItems: string[];
  expandedItems: string[];
}

export interface PersistedRoute {
  pathname: string;
  state: RouteState;
  timestamp: number;
  userId?: string;
}
```

### URL State Management
```typescript
// lib/routing/url-state.ts
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

// URL State Schema
const URLStateSchema = z.object({
  // Filters
  status: z.string().optional(),
  priority: z.string().optional(),
  assignee: z.string().optional(),
  project: z.string().optional(),
  dateRange: z.string().optional(),
  
  // View Settings
  view: z.enum(['list', 'grid', 'kanban', 'calendar']).optional(),
  sort: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  
  // Pagination
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  
  // Selection
  selected: z.string().optional(),
  expanded: z.string().optional(),
  
  // Search
  search: z.string().optional(),
  searchFields: z.string().optional(),
});

export const useURLState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<RouteState>(() => {
    const params = Object.fromEntries(searchParams.entries());
    return URLStateSchema.parse(params);
  });

  const updateURL = useCallback((newState: Partial<RouteState>) => {
    const currentState = { ...state, ...newState };
    const url = new URL(window.location.href);
    
    // Clear existing params
    url.search = '';
    
    // Add new params
    Object.entries(currentState).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v.toString()));
        } else {
          url.searchParams.set(key, value.toString());
        }
      }
    });
    
    // Update URL without page reload
    router.replace(url.pathname + url.search, { scroll: false });
    setState(currentState);
  }, [state, router]);

  const resetURL = useCallback(() => {
    router.replace(pathname);
    setState({});
  }, [router, pathname]);

  const shareURL = useCallback(() => {
    return window.location.href;
  }, []);

  return {
    state,
    updateURL,
    resetURL,
    shareURL,
    isLoading: false
  };
};
```

### Advanced Route Persistence
```typescript
// lib/routing/persistence.ts
import { RouteState, PersistedRoute } from './types';

export class RoutePersistence {
  private static readonly STORAGE_KEY = 'kanvaro_routes';
  private static readonly MAX_ROUTES = 50;

  static saveRoute(pathname: string, state: RouteState, userId?: string): void {
    const route: PersistedRoute = {
      pathname,
      state,
      timestamp: Date.now(),
      userId
    };

    const routes = this.getRoutes();
    const existingIndex = routes.findIndex(r => r.pathname === pathname);
    
    if (existingIndex >= 0) {
      routes[existingIndex] = route;
    } else {
      routes.unshift(route);
    }

    // Keep only the most recent routes
    if (routes.length > this.MAX_ROUTES) {
      routes.splice(this.MAX_ROUTES);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(routes));
  }

  static getRoutes(): PersistedRoute[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getRoute(pathname: string): PersistedRoute | null {
    const routes = this.getRoutes();
    return routes.find(r => r.pathname === pathname) || null;
  }

  static clearRoutes(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static exportRoutes(): string {
    const routes = this.getRoutes();
    return JSON.stringify(routes, null, 2);
  }

  static importRoutes(data: string): boolean {
    try {
      const routes = JSON.parse(data);
      if (Array.isArray(routes)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(routes));
        return true;
      }
    } catch {
      // Invalid data
    }
    return false;
  }
}
```

## Component-Level URL Persistence

### Project List with Persistent Filters
```typescript
// components/projects/ProjectList.tsx
import { useURLState } from '@/lib/routing/url-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

export const ProjectList = () => {
  const { state, updateURL, shareURL } = useURLState();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync URL state with component state
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects?${new URLSearchParams(state as any)}`);
        const data = await response.json();
        setProjects(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [state]);

  const handleFilterChange = (key: string, value: any) => {
    updateURL({ [key]: value });
  };

  const handleSortChange = (field: string) => {
    const direction = state.sort === field && state.sortDirection === 'asc' ? 'desc' : 'asc';
    updateURL({ sort: field, sortDirection: direction });
  };

  const handleViewChange = (view: string) => {
    updateURL({ view });
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Projects
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={shareURL}>
                Share View
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={state.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={state.status || ''}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={state.priority || ''}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={state.assignee || ''}
              onValueChange={(value) => handleFilterChange('assignee', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Assignees</SelectItem>
                {/* Populate with team members */}
              </SelectContent>
            </Select>

            <Select
              value={state.project || ''}
              onValueChange={(value) => handleFilterChange('project', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {/* Populate with projects */}
              </SelectContent>
            </Select>
          </div>

          {/* Sort and View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange('name')}
                className={state.sort === 'name' ? 'bg-primary text-primary-foreground' : ''}
              >
                Name
                {state.sort === 'name' && (
                  state.sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange('createdAt')}
                className={state.sort === 'createdAt' ? 'bg-primary text-primary-foreground' : ''}
              >
                Created
                {state.sort === 'createdAt' && (
                  state.sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
                )}
              </Button>
            </div>

            <Tabs value={state.view || 'list'} onValueChange={handleViewChange}>
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <ProjectGrid projects={projects} view={state.view || 'list'} />
        )}
      </div>
    </div>
  );
};
```

### Task Kanban with Persistent State
```typescript
// components/tasks/TaskKanban.tsx
import { useURLState } from '@/lib/routing/url-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export const TaskKanban = () => {
  const { state, updateURL } = useURLState();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'review', title: 'Review', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ]);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Update local state
    const newColumns = Array.from(columns);
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    const destColumn = newColumns.find(col => col.id === destination.droppableId);
    const task = sourceColumn.tasks.find(task => task.id === draggableId);

    // Remove from source
    sourceColumn.tasks.splice(source.index, 1);
    
    // Add to destination
    destColumn.tasks.splice(destination.index, 0, task);

    setColumns(newColumns);

    // Update URL state
    updateURL({
      kanbanState: {
        columns: newColumns.map(col => ({
          id: col.id,
          taskIds: col.tasks.map(task => task.id)
        }))
      }
    });

    // Update server
    updateTaskStatus(draggableId, destination.droppableId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Add Task
          </Button>
          <Button variant="outline" size="sm" onClick={() => updateURL({ view: 'list' })}>
            List View
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <Card key={column.id} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  {column.title}
                  <Badge variant="secondary">{column.tasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] p-2 rounded-lg ${
                        snapshot.isDraggingOver ? 'bg-muted/50' : ''
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium">{task.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                                      {task.priority}
                                    </Badge>
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
```

## Advanced URL State Features

### Deep Linking with State Restoration
```typescript
// lib/routing/deep-linking.ts
export class DeepLinkManager {
  static createDeepLink(state: RouteState, baseUrl: string = ''): string {
    const url = new URL(baseUrl || window.location.origin);
    
    // Add all state to URL
    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v.toString()));
        } else {
          url.searchParams.set(key, value.toString());
        }
      }
    });

    return url.toString();
  }

  static restoreStateFromURL(searchParams: URLSearchParams): RouteState {
    const state: any = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (state[key]) {
        // Handle array values
        if (Array.isArray(state[key])) {
          state[key].push(value);
        } else {
          state[key] = [state[key], value];
        }
      } else {
        state[key] = value;
      }
    }

    return state;
  }

  static shareCurrentState(): { url: string; qrCode: string } {
    const url = window.location.href;
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    
    return { url, qrCode };
  }
}
```

### URL State Validation
```typescript
// lib/routing/validation.ts
import { z } from 'zod';

const RouteStateSchema = z.object({
  // Filters
  status: z.enum(['active', 'completed', 'on-hold', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignee: z.string().uuid().optional(),
  project: z.string().uuid().optional(),
  dateRange: z.string().regex(/^\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/).optional(),
  
  // View Settings
  view: z.enum(['list', 'grid', 'kanban', 'calendar']).optional(),
  sort: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  
  // Pagination
  page: z.coerce.number().min(1).max(1000).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  
  // Selection
  selected: z.string().optional(),
  expanded: z.string().optional(),
  
  // Search
  search: z.string().max(100).optional(),
  searchFields: z.string().optional(),
});

export const validateRouteState = (state: any): RouteState => {
  try {
    return RouteStateSchema.parse(state);
  } catch (error) {
    console.warn('Invalid route state:', error);
    return {};
  }
};
```

### URL State Middleware
```typescript
// middleware/route-state.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateRouteState } from '@/lib/routing/validation';

export function routeStateMiddleware(request: NextRequest) {
  const url = request.nextUrl;
  const searchParams = url.searchParams;
  
  // Validate and sanitize URL parameters
  const state = validateRouteState(Object.fromEntries(searchParams.entries()));
  
  // Add validated state to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-route-state', JSON.stringify(state));
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

## URL Persistence Best Practices

### 1. State Serialization
```typescript
// lib/routing/serialization.ts
export class StateSerializer {
  static serialize(state: RouteState): string {
    // Remove undefined values
    const cleanState = Object.fromEntries(
      Object.entries(state).filter(([_, value]) => value !== undefined)
    );
    
    return JSON.stringify(cleanState);
  }

  static deserialize(serialized: string): RouteState {
    try {
      return JSON.parse(serialized);
    } catch {
      return {};
    }
  }

  static compress(state: RouteState): string {
    const serialized = this.serialize(state);
    // Use compression for large states
    return btoa(serialized);
  }

  static decompress(compressed: string): RouteState {
    try {
      const decompressed = atob(compressed);
      return this.deserialize(decompressed);
    } catch {
      return {};
    }
  }
}
```

### 2. URL State Caching
```typescript
// lib/routing/cache.ts
export class URLStateCache {
  private static readonly CACHE_KEY = 'kanvaro_url_cache';
  private static readonly TTL = 24 * 60 * 60 * 1000; // 24 hours

  static set(pathname: string, state: RouteState): void {
    const cache = this.getCache();
    cache[pathname] = {
      state,
      timestamp: Date.now()
    };
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
  }

  static get(pathname: string): RouteState | null {
    const cache = this.getCache();
    const entry = cache[pathname];
    
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.TTL) {
      delete cache[pathname];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    
    return entry.state;
  }

  private static getCache(): Record<string, { state: RouteState; timestamp: number }> {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }
}
```

---

*This routing persistence guide will be updated as new routing patterns are identified and URL state management features are enhanced.*
