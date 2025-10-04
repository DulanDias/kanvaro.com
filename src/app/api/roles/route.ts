import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // For now, return predefined roles
    // In a real implementation, you would fetch from a CustomRole model
    const roles = [
      {
        _id: 'admin',
        name: 'Administrator',
        description: 'Full access to all features and settings',
        permissions: [
          'user:create',
          'user:read',
          'user:update',
          'user:delete',
          'project:create',
          'project:read',
          'project:update',
          'project:delete',
          'team:read',
          'team:manage',
          'settings:read',
          'settings:update',
          'reports:read',
          'reports:export'
        ],
        isSystem: true,
        userCount: 1,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'project_manager',
        name: 'Project Manager',
        description: 'Can manage projects and assign tasks to team members',
        permissions: [
          'project:create',
          'project:read',
          'project:update',
          'task:create',
          'task:read',
          'task:update',
          'task:delete',
          'team:read',
          'reports:read'
        ],
        isSystem: true,
        userCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'team_member',
        name: 'Team Member',
        description: 'Can work on assigned tasks and projects',
        permissions: [
          'project:read',
          'task:create',
          'task:read',
          'task:update',
          'time:create',
          'time:read',
          'time:update'
        ],
        isSystem: true,
        userCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'client',
        name: 'Client',
        description: 'Read-only access to assigned projects',
        permissions: [
          'project:read',
          'task:read',
          'reports:read'
        ],
        isSystem: true,
        userCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to assigned content',
        permissions: [
          'project:read',
          'task:read'
        ],
        isSystem: true,
        userCount: 0,
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({ 
      success: true, 
      data: roles 
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
