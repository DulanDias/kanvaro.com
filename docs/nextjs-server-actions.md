---
slug: "reference/nextjs-server-actions"
title: "Next.js Server Actions"
summary: "Implementation guide for Next.js Server Actions in Kanvaro for form handling, data mutations, and API integration."
visibility: "public"
audiences: ["admin", "self_host_admin"]
category: "reference"
order: 50
updated: "2025-01-04"
---

# Kanvaro - Next.js Server Actions Integration

## Overview

Kanvaro leverages Next.js Server Actions for seamless full-stack development, providing type-safe server-side operations that integrate directly with React components. This approach eliminates the need for separate API endpoints for many operations while maintaining security and performance.

## Server Actions Architecture

### Server Actions vs API Routes
```typescript
// Traditional API Route approach
// app/api/projects/route.ts
export async function POST(request: NextRequest) {
  // Handle project creation
}

// Server Actions approach
// lib/actions/project-actions.ts
'use server'

export async function createProject(formData: FormData) {
  // Handle project creation directly
}
```

### Benefits of Server Actions
- **Type Safety**: Full TypeScript support across client and server
- **Simplified Data Flow**: Direct function calls instead of HTTP requests
- **Automatic Serialization**: Built-in handling of complex data types
- **Progressive Enhancement**: Forms work without JavaScript
- **Optimistic Updates**: Built-in support for optimistic UI updates

## Server Actions Implementation

### Project Management Actions
```typescript
// lib/actions/project-actions.ts
'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Project } from '@/models/Project';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/get-current-user';

const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teamMembers: z.array(z.string()).optional(),
});

export async function createProject(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      teamMembers: formData.getAll('teamMembers'),
    };

    const validatedData = CreateProjectSchema.parse(rawData);

    await connectDB();

    const project = new Project({
      ...validatedData,
      createdBy: user.id,
      organization: user.organization,
      teamMembers: validatedData.teamMembers || [user.id],
    });

    await project.save();

    revalidatePath('/projects');
    redirect(`/projects/${project._id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const rawData = {
      name: formData.get('name'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
    };

    await connectDB();

    const project = await Project.findOne({
      _id: projectId,
      organization: user.organization,
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Update project fields
    Object.assign(project, rawData);
    await project.save();

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const project = await Project.findOne({
      _id: projectId,
      organization: user.organization,
    });

    if (!project) {
      throw new Error('Project not found');
    }

    await Project.findByIdAndDelete(projectId);

    revalidatePath('/projects');
    redirect('/projects');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}
```

### Task Management Actions
```typescript
// lib/actions/task-actions.ts
'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Task } from '@/models/Task';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/get-current-user';

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  project: z.string().min(1, 'Project is required'),
  story: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  storyPoints: z.number().optional(),
  dueDate: z.string().optional(),
});

export async function createTask(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      project: formData.get('project'),
      story: formData.get('story'),
      assignedTo: formData.get('assignedTo'),
      priority: formData.get('priority'),
      storyPoints: formData.get('storyPoints') ? Number(formData.get('storyPoints')) : undefined,
      dueDate: formData.get('dueDate'),
    };

    const validatedData = CreateTaskSchema.parse(rawData);

    await connectDB();

    const task = new Task({
      ...validatedData,
      createdBy: user.id,
    });

    await task.save();

    revalidatePath('/projects');
    revalidatePath(`/projects/${validatedData.project}`);
    
    return { success: true, taskId: task._id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }
    
    await task.save();

    revalidatePath('/projects');
    revalidatePath(`/projects/${task.project}`);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}
```

### User Management Actions
```typescript
// lib/actions/user-actions.ts
'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { User } from '@/models/User';
import { UserInvitation } from '@/models/UserInvitation';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { EmailService } from '@/lib/services/email-service';
import crypto from 'crypto';

const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  customRole: z.string().optional(),
});

export async function inviteUser(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const rawData = {
      email: formData.get('email'),
      role: formData.get('role'),
      customRole: formData.get('customRole'),
    };

    const validatedData = InviteUserSchema.parse(rawData);

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: validatedData.email,
      organization: user.organization,
    });

    if (existingUser) {
      throw new Error('User already exists in this organization');
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new UserInvitation({
      email: validatedData.email,
      organization: user.organization,
      invitedBy: user.id,
      role: validatedData.role,
      customRole: validatedData.customRole,
      token,
    });

    await invitation.save();

    // Send invitation email
    await EmailService.sendUserInvitation(
      validatedData.email,
      token,
      user.organization
    );

    revalidatePath('/team');
    
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

export async function updateUserRole(userId: string, role: string, customRole?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const targetUser = await User.findOne({
      _id: userId,
      organization: user.organization,
    });

    if (!targetUser) {
      throw new Error('User not found');
    }

    targetUser.role = role;
    if (customRole) {
      targetUser.customRole = customRole;
    } else {
      targetUser.customRole = undefined;
    }

    await targetUser.save();

    revalidatePath('/team');
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}
```

## Form Integration with Server Actions

### Project Creation Form
```typescript
// components/forms/CreateProjectForm.tsx
'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createProject } from '@/lib/actions/project-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const initialState = {
  success: false,
  errors: {},
  error: null,
};

export function CreateProjectForm() {
  const [state, formAction] = useFormState(createProject, initialState);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter project name"
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
              />
            </div>
          </div>

          {state.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Task Status Update with Optimistic Updates
```typescript
// components/tasks/TaskStatusButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateTaskStatus } from '@/lib/actions/task-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TaskStatusButtonProps {
  taskId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100' },
  { value: 'review', label: 'Review', color: 'bg-yellow-100' },
  { value: 'testing', label: 'Testing', color: 'bg-purple-100' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100' },
];

export function TaskStatusButton({ 
  taskId, 
  currentStatus, 
  onStatusChange 
}: TaskStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    // Optimistic update
    setOptimisticStatus(newStatus);
    onStatusChange?.(newStatus);

    startTransition(async () => {
      try {
        const result = await updateTaskStatus(taskId, newStatus);
        if (!result.success) {
          // Revert optimistic update on error
          setOptimisticStatus(currentStatus);
          onStatusChange?.(currentStatus);
        }
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticStatus(currentStatus);
        onStatusChange?.(currentStatus);
      }
    });
  };

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === optimisticStatus);

  return (
    <div className="flex items-center space-x-2">
      <Badge className={currentOption?.color}>
        {currentOption?.label}
      </Badge>
      
      <div className="flex space-x-1">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={optimisticStatus === option.value ? 'default' : 'outline'}
            onClick={() => handleStatusChange(option.value)}
            disabled={isPending}
            className="text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

## Middleware Integration

### Authentication Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTManager } from '@/lib/auth/jwt-manager';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for public routes
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    const payload = JWTManager.verifyAccessToken(token);
    
    // Add user info to headers for Server Actions
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-organization-id', payload.organizationId);
    requestHeaders.set('x-user-permissions', JSON.stringify(payload.permissions));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Error Handling in Server Actions

### Global Error Handler
```typescript
// lib/actions/error-handler.ts
export function handleServerActionError(error: unknown) {
  console.error('Server Action Error:', error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      errors: error.flatten().fieldErrors,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
  };
}
```

### Retry Logic for Server Actions
```typescript
// lib/actions/retry-wrapper.ts
export async function withRetry<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}
```

## Performance Optimization

### Server Action Caching
```typescript
// lib/actions/cached-actions.ts
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

export const getCachedProjects = cache(async (organizationId: string) => {
  // This will be cached for the duration of the request
  const projects = await Project.find({ organization: organizationId });
  return projects;
});

export const getCachedProject = unstable_cache(
  async (projectId: string) => {
    const project = await Project.findById(projectId);
    return project;
  },
  ['project'],
  {
    tags: ['projects'],
    revalidate: 3600, // 1 hour
  }
);
```

---

*This Next.js Server Actions documentation will be updated as new patterns emerge and the framework evolves.*
