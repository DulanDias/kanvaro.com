# Kanvaro - Advanced Permission System

## Overview

Kanvaro implements a comprehensive permission system with role-based access control (RBAC), custom roles, and granular permissions. The system allows administrators to create custom roles with specific permission sets, enabling fine-grained access control across all features.

## Permission Architecture

### Permission Hierarchy
```
┌─────────────────────────────────────────────────────────┐
│                Permission System                       │
├─────────────────────────────────────────────────────────┤
│  Super Admin (All Permissions)                        │
│  ├── Admin (Most Permissions)                         │
│  ├── Project Manager (Project + Team Permissions)     │
│  ├── Team Member (Basic Permissions)                  │
│  ├── Client (Read-Only Permissions)                   │
│  └── Custom Roles (Custom Permission Sets)            │
└─────────────────────────────────────────────────────────┘
```

## Permission Definitions

### Core Permission Categories
```typescript
// lib/permissions/permission-definitions.ts
export enum PermissionCategory {
  // System permissions
  SYSTEM = 'system',
  // User management permissions
  USER = 'user',
  // Organization permissions
  ORGANIZATION = 'organization',
  // Project permissions
  PROJECT = 'project',
  // Task permissions
  TASK = 'task',
  // Team permissions
  TEAM = 'team',
  // Time tracking permissions
  TIME_TRACKING = 'time_tracking',
  // Financial permissions
  FINANCIAL = 'financial',
  // Reporting permissions
  REPORTING = 'reporting',
  // Settings permissions
  SETTINGS = 'settings',
}

export enum Permission {
  // System permissions
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_MONITOR = 'system:monitor',
  SYSTEM_MAINTENANCE = 'system:maintenance',
  
  // User management permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_INVITE = 'user:invite',
  USER_ACTIVATE = 'user:activate',
  USER_DEACTIVATE = 'user:deactivate',
  USER_MANAGE_ROLES = 'user:manage_roles',
  
  // Organization permissions
  ORGANIZATION_READ = 'organization:read',
  ORGANIZATION_UPDATE = 'organization:update',
  ORGANIZATION_DELETE = 'organization:delete',
  ORGANIZATION_MANAGE_SETTINGS = 'organization:manage_settings',
  ORGANIZATION_MANAGE_BILLING = 'organization:manage_billing',
  
  // Project permissions
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_MANAGE_TEAM = 'project:manage_team',
  PROJECT_MANAGE_BUDGET = 'project:manage_budget',
  PROJECT_ARCHIVE = 'project:archive',
  PROJECT_RESTORE = 'project:restore',
  
  // Task permissions
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  TASK_CHANGE_STATUS = 'task:change_status',
  TASK_MANAGE_COMMENTS = 'task:manage_comments',
  TASK_MANAGE_ATTACHMENTS = 'task:manage_attachments',
  
  // Team permissions
  TEAM_READ = 'team:read',
  TEAM_INVITE = 'team:invite',
  TEAM_REMOVE = 'team:remove',
  TEAM_MANAGE_PERMISSIONS = 'team:manage_permissions',
  TEAM_VIEW_ACTIVITY = 'team:view_activity',
  
  // Time tracking permissions
  TIME_TRACKING_CREATE = 'time_tracking:create',
  TIME_TRACKING_READ = 'time_tracking:read',
  TIME_TRACKING_UPDATE = 'time_tracking:update',
  TIME_TRACKING_DELETE = 'time_tracking:delete',
  TIME_TRACKING_APPROVE = 'time_tracking:approve',
  TIME_TRACKING_EXPORT = 'time_tracking:export',
  
  // Financial permissions
  FINANCIAL_READ = 'financial:read',
  FINANCIAL_MANAGE_BUDGET = 'financial:manage_budget',
  FINANCIAL_CREATE_EXPENSE = 'financial:create_expense',
  FINANCIAL_APPROVE_EXPENSE = 'financial:approve_expense',
  FINANCIAL_CREATE_INVOICE = 'financial:create_invoice',
  FINANCIAL_SEND_INVOICE = 'financial:send_invoice',
  FINANCIAL_MANAGE_PAYMENTS = 'financial:manage_payments',
  
  // Reporting permissions
  REPORTING_VIEW = 'reporting:view',
  REPORTING_CREATE = 'reporting:create',
  REPORTING_EXPORT = 'reporting:export',
  REPORTING_SHARE = 'reporting:share',
  
  // Settings permissions
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  SETTINGS_MANAGE_INTEGRATIONS = 'settings:manage_integrations',
  SETTINGS_MANAGE_WEBHOOKS = 'settings:manage_webhooks',
}
```

### Default Role Definitions
```typescript
// lib/permissions/role-definitions.ts
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  TEAM_MEMBER = 'team_member',
  CLIENT = 'client',
  VIEWER = 'viewer',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  
  [Role.ADMIN]: [
    // User management
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_INVITE,
    Permission.USER_ACTIVATE,
    Permission.USER_DEACTIVATE,
    Permission.USER_MANAGE_ROLES,
    
    // Organization
    Permission.ORGANIZATION_READ,
    Permission.ORGANIZATION_UPDATE,
    Permission.ORGANIZATION_MANAGE_SETTINGS,
    Permission.ORGANIZATION_MANAGE_BILLING,
    
    // Projects
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE_TEAM,
    Permission.PROJECT_MANAGE_BUDGET,
    Permission.PROJECT_ARCHIVE,
    Permission.PROJECT_RESTORE,
    
    // Tasks
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    
    // Team
    Permission.TEAM_READ,
    Permission.TEAM_INVITE,
    Permission.TEAM_REMOVE,
    Permission.TEAM_MANAGE_PERMISSIONS,
    Permission.TEAM_VIEW_ACTIVITY,
    
    // Time tracking
    Permission.TIME_TRACKING_CREATE,
    Permission.TIME_TRACKING_READ,
    Permission.TIME_TRACKING_UPDATE,
    Permission.TIME_TRACKING_DELETE,
    Permission.TIME_TRACKING_APPROVE,
    Permission.TIME_TRACKING_EXPORT,
    
    // Financial
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_MANAGE_BUDGET,
    Permission.FINANCIAL_CREATE_EXPENSE,
    Permission.FINANCIAL_APPROVE_EXPENSE,
    Permission.FINANCIAL_CREATE_INVOICE,
    Permission.FINANCIAL_SEND_INVOICE,
    Permission.FINANCIAL_MANAGE_PAYMENTS,
    
    // Reporting
    Permission.REPORTING_VIEW,
    Permission.REPORTING_CREATE,
    Permission.REPORTING_EXPORT,
    Permission.REPORTING_SHARE,
    
    // Settings
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.SETTINGS_MANAGE_INTEGRATIONS,
    Permission.SETTINGS_MANAGE_WEBHOOKS,
  ],
  
  [Role.PROJECT_MANAGER]: [
    // Projects
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_MANAGE_TEAM,
    Permission.PROJECT_MANAGE_BUDGET,
    
    // Tasks
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    
    // Team
    Permission.TEAM_READ,
    Permission.TEAM_INVITE,
    Permission.TEAM_VIEW_ACTIVITY,
    
    // Time tracking
    Permission.TIME_TRACKING_CREATE,
    Permission.TIME_TRACKING_READ,
    Permission.TIME_TRACKING_UPDATE,
    Permission.TIME_TRACKING_APPROVE,
    Permission.TIME_TRACKING_EXPORT,
    
    // Financial
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_MANAGE_BUDGET,
    Permission.FINANCIAL_CREATE_EXPENSE,
    Permission.FINANCIAL_APPROVE_EXPENSE,
    Permission.FINANCIAL_CREATE_INVOICE,
    Permission.FINANCIAL_SEND_INVOICE,
    
    // Reporting
    Permission.REPORTING_VIEW,
    Permission.REPORTING_CREATE,
    Permission.REPORTING_EXPORT,
  ],
  
  [Role.TEAM_MEMBER]: [
    // Projects
    Permission.PROJECT_READ,
    
    // Tasks
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    
    // Team
    Permission.TEAM_READ,
    
    // Time tracking
    Permission.TIME_TRACKING_CREATE,
    Permission.TIME_TRACKING_READ,
    Permission.TIME_TRACKING_UPDATE,
    
    // Financial
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_CREATE_EXPENSE,
    
    // Reporting
    Permission.REPORTING_VIEW,
  ],
  
  [Role.CLIENT]: [
    // Projects
    Permission.PROJECT_READ,
    
    // Tasks
    Permission.TASK_READ,
    
    // Team
    Permission.TEAM_READ,
    
    // Financial
    Permission.FINANCIAL_READ,
    
    // Reporting
    Permission.REPORTING_VIEW,
  ],
  
  [Role.VIEWER]: [
    // Projects
    Permission.PROJECT_READ,
    
    // Tasks
    Permission.TASK_READ,
    
    // Team
    Permission.TEAM_READ,
    
    // Financial
    Permission.FINANCIAL_READ,
    
    // Reporting
    Permission.REPORTING_VIEW,
  ],
};
```

## Custom Role Management

### Custom Role Model
```typescript
// models/CustomRole.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomRole extends Document {
  name: string;
  description: string;
  organization: mongoose.Types.ObjectId;
  permissions: Permission[];
  isActive: boolean;
  isSystem: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomRoleSchema = new Schema<ICustomRole>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  permissions: [{
    type: String,
    enum: Object.values(Permission)
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
CustomRoleSchema.index({ organization: 1, name: 1 }, { unique: true });
CustomRoleSchema.index({ organization: 1, isActive: 1 });

export const CustomRole = mongoose.model<ICustomRole>('CustomRole', CustomRoleSchema);
```

### Permission Service
```typescript
// lib/permissions/permission-service.ts
import { Permission, Role, ROLE_PERMISSIONS } from './permission-definitions';
import { CustomRole } from '@/models/CustomRole';
import { User } from '@/models/User';

export class PermissionService {
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await User.findById(userId).populate('customRole');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Get base role permissions
    const basePermissions = ROLE_PERMISSIONS[user.role as Role] || [];
    
    // Get custom role permissions if user has a custom role
    let customPermissions: Permission[] = [];
    if (user.customRole) {
      const customRole = await CustomRole.findById(user.customRole);
      if (customRole && customRole.isActive) {
        customPermissions = customRole.permissions;
      }
    }

    // Combine permissions (custom role permissions override base role)
    const allPermissions = [...new Set([...basePermissions, ...customPermissions])];
    
    return allPermissions;
  }

  static async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  static async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  static async hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(permission => userPermissions.includes(permission));
  }

  static async canAccessResource(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const permission = `${resource}:${action}` as Permission;
    return this.hasPermission(userId, permission);
  }

  static async createCustomRole(
    name: string,
    description: string,
    permissions: Permission[],
    organizationId: string,
    createdBy: string
  ): Promise<ICustomRole> {
    // Validate permissions
    const validPermissions = permissions.filter(p => Object.values(Permission).includes(p));
    
    const customRole = new CustomRole({
      name,
      description,
      permissions: validPermissions,
      organization: organizationId,
      createdBy
    });

    await customRole.save();
    return customRole;
  }

  static async updateCustomRole(
    roleId: string,
    updates: {
      name?: string;
      description?: string;
      permissions?: Permission[];
      isActive?: boolean;
    }
  ): Promise<ICustomRole> {
    const customRole = await CustomRole.findById(roleId);
    
    if (!customRole) {
      throw new Error('Custom role not found');
    }

    if (updates.name) customRole.name = updates.name;
    if (updates.description) customRole.description = updates.description;
    if (updates.permissions) customRole.permissions = updates.permissions;
    if (updates.isActive !== undefined) customRole.isActive = updates.isActive;

    await customRole.save();
    return customRole;
  }

  static async deleteCustomRole(roleId: string): Promise<void> {
    // Check if role is in use
    const usersWithRole = await User.countDocuments({ customRole: roleId });
    
    if (usersWithRole > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await CustomRole.findByIdAndDelete(roleId);
  }

  static async getCustomRoles(organizationId: string): Promise<ICustomRole[]> {
    return CustomRole.find({ organization: organizationId, isActive: true });
  }

  static async assignCustomRole(userId: string, roleId: string): Promise<void> {
    const user = await User.findById(userId);
    const customRole = await CustomRole.findById(roleId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!customRole) {
      throw new Error('Custom role not found');
    }

    // Check if user belongs to the same organization
    if (user.organization.toString() !== customRole.organization.toString()) {
      throw new Error('User and role must belong to the same organization');
    }

    user.customRole = roleId;
    await user.save();
  }

  static async removeCustomRole(userId: string): Promise<void> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.customRole = undefined;
    await user.save();
  }
}
```

## Permission Middleware

### Permission Check Middleware
```typescript
// middleware/permission-check.ts
import { NextRequest, NextResponse } from 'next/server';
import { PermissionService } from '@/lib/permissions/permission-service';
import { Permission } from '@/lib/permissions/permission-definitions';

export function requirePermission(permission: Permission) {
  return async (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }

    try {
      const hasPermission = await PermissionService.hasPermission(userId, permission);
      
      if (!hasPermission) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permission
          },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Permission check failed' },
        { status: 500 }
      );
    }
  };
}

export function requireAnyPermission(permissions: Permission[]) {
  return async (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }

    try {
      const hasPermission = await PermissionService.hasAnyPermission(userId, permissions);
      
      if (!hasPermission) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permissions
          },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Permission check failed' },
        { status: 500 }
      );
    }
  };
}

export function requireAllPermissions(permissions: Permission[]) {
  return async (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }

    try {
      const hasPermission = await PermissionService.hasAllPermissions(userId, permissions);
      
      if (!hasPermission) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: permissions
          },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Permission check failed' },
        { status: 500 }
      );
    }
  };
}
```

### Resource Access Control
```typescript
// lib/permissions/resource-access.ts
export class ResourceAccessControl {
  static async canAccessProject(userId: string, projectId: string): Promise<boolean> {
    const user = await User.findById(userId);
    const project = await Project.findById(projectId);
    
    if (!user || !project) {
      return false;
    }

    // Check if user belongs to the same organization
    if (user.organization.toString() !== project.organization.toString()) {
      return false;
    }

    // Check if user is project creator or team member
    if (project.createdBy.toString() === userId || 
        project.teamMembers.includes(userId)) {
      return true;
    }

    // Check if user has project read permission
    return PermissionService.hasPermission(userId, Permission.PROJECT_READ);
  }

  static async canModifyProject(userId: string, projectId: string): Promise<boolean> {
    const user = await User.findById(userId);
    const project = await Project.findById(projectId);
    
    if (!user || !project) {
      return false;
    }

    // Check if user belongs to the same organization
    if (user.organization.toString() !== project.organization.toString()) {
      return false;
    }

    // Check if user is project creator
    if (project.createdBy.toString() === userId) {
      return true;
    }

    // Check if user has project update permission
    return PermissionService.hasPermission(userId, Permission.PROJECT_UPDATE);
  }

  static async canDeleteProject(userId: string, projectId: string): Promise<boolean> {
    const user = await User.findById(userId);
    const project = await Project.findById(projectId);
    
    if (!user || !project) {
      return false;
    }

    // Check if user belongs to the same organization
    if (user.organization.toString() !== project.organization.toString()) {
      return false;
    }

    // Check if user is project creator
    if (project.createdBy.toString() === userId) {
      return true;
    }

    // Check if user has project delete permission
    return PermissionService.hasPermission(userId, Permission.PROJECT_DELETE);
  }

  static async canAccessTask(userId: string, taskId: string): Promise<boolean> {
    const user = await User.findById(userId);
    const task = await Task.findById(taskId).populate('project');
    
    if (!user || !task) {
      return false;
    }

    // Check if user belongs to the same organization
    if (user.organization.toString() !== task.project.organization.toString()) {
      return false;
    }

    // Check if user is task creator or assignee
    if (task.createdBy.toString() === userId || 
        task.assignedTo?.toString() === userId) {
      return true;
    }

    // Check if user is project team member
    if (task.project.teamMembers.includes(userId)) {
      return true;
    }

    // Check if user has task read permission
    return PermissionService.hasPermission(userId, Permission.TASK_READ);
  }

  static async canModifyTask(userId: string, taskId: string): Promise<boolean> {
    const user = await User.findById(userId);
    const task = await Task.findById(taskId).populate('project');
    
    if (!user || !task) {
      return false;
    }

    // Check if user belongs to the same organization
    if (user.organization.toString() !== task.project.organization.toString()) {
      return false;
    }

    // Check if user is task creator or assignee
    if (task.createdBy.toString() === userId || 
        task.assignedTo?.toString() === userId) {
      return true;
    }

    // Check if user has task update permission
    return PermissionService.hasPermission(userId, Permission.TASK_UPDATE);
  }
}
```

## API Endpoints for Permission Management

### Custom Role Management API
```typescript
// pages/api/v1/roles/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PermissionService } from '@/lib/permissions/permission-service';
import { requirePermission } from '@/middleware/permission-check';
import { Permission } from '@/lib/permissions/permission-definitions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check permissions
    const permissionCheck = await requirePermission(Permission.USER_MANAGE_ROLES)(req as any);
    if (permissionCheck) {
      return res.status(permissionCheck.status).json(permissionCheck);
    }

    const { method } = req;
    const userId = req.headers['x-user-id'] as string;
    const organizationId = req.headers['x-organization-id'] as string;

    switch (method) {
      case 'GET':
        const roles = await PermissionService.getCustomRoles(organizationId);
        return res.status(200).json({
          success: true,
          data: roles,
          timestamp: new Date().toISOString()
        });

      case 'POST':
        const { name, description, permissions } = req.body;
        
        if (!name || !permissions || !Array.isArray(permissions)) {
          return res.status(400).json({
            success: false,
            error: 'Name and permissions are required',
            code: 'VALIDATION_ERROR'
          });
        }

        const customRole = await PermissionService.createCustomRole(
          name,
          description,
          permissions,
          organizationId,
          userId
        );

        return res.status(201).json({
          success: true,
          data: customRole,
          message: 'Custom role created successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}

// pages/api/v1/roles/[id].ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    const { id } = req.query;
    const userId = req.headers['x-user-id'] as string;

    switch (method) {
      case 'PUT':
        const { name, description, permissions, isActive } = req.body;
        
        const updatedRole = await PermissionService.updateCustomRole(id as string, {
          name,
          description,
          permissions,
          isActive
        });

        return res.status(200).json({
          success: true,
          data: updatedRole,
          message: 'Custom role updated successfully',
          timestamp: new Date().toISOString()
        });

      case 'DELETE':
        await PermissionService.deleteCustomRole(id as string);
        
        return res.status(200).json({
          success: true,
          message: 'Custom role deleted successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}
```

### User Role Assignment API
```typescript
// pages/api/v1/users/[id]/role.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    const { id } = req.query;
    const userId = req.headers['x-user-id'] as string;

    switch (method) {
      case 'POST':
        const { roleId } = req.body;
        
        if (!roleId) {
          return res.status(400).json({
            success: false,
            error: 'Role ID is required',
            code: 'VALIDATION_ERROR'
          });
        }

        await PermissionService.assignCustomRole(id as string, roleId);
        
        return res.status(200).json({
          success: true,
          message: 'Role assigned successfully',
          timestamp: new Date().toISOString()
        });

      case 'DELETE':
        await PermissionService.removeCustomRole(id as string);
        
        return res.status(200).json({
          success: true,
          message: 'Role removed successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}
```

## Permission Testing

### Permission Test Suite
```typescript
// tests/permissions/permission.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { PermissionService } from '@/lib/permissions/permission-service';
import { Permission, Role } from '@/lib/permissions/permission-definitions';

describe('Permission System', () => {
  describe('Role Permissions', () => {
    it('should return correct permissions for admin role', async () => {
      const permissions = await PermissionService.getUserPermissions('admin-user-id');
      
      expect(permissions).toContain(Permission.USER_CREATE);
      expect(permissions).toContain(Permission.PROJECT_CREATE);
      expect(permissions).toContain(Permission.TASK_CREATE);
      expect(permissions).toContain(Permission.FINANCIAL_MANAGE_BUDGET);
    });

    it('should return correct permissions for team member role', async () => {
      const permissions = await PermissionService.getUserPermissions('team-member-id');
      
      expect(permissions).toContain(Permission.TASK_CREATE);
      expect(permissions).toContain(Permission.TIME_TRACKING_CREATE);
      expect(permissions).not.toContain(Permission.USER_CREATE);
      expect(permissions).not.toContain(Permission.PROJECT_DELETE);
    });
  });

  describe('Permission Checks', () => {
    it('should return true for valid permission', async () => {
      const hasPermission = await PermissionService.hasPermission(
        'admin-user-id',
        Permission.USER_CREATE
      );
      expect(hasPermission).toBe(true);
    });

    it('should return false for invalid permission', async () => {
      const hasPermission = await PermissionService.hasPermission(
        'team-member-id',
        Permission.USER_CREATE
      );
      expect(hasPermission).toBe(false);
    });
  });

  describe('Custom Roles', () => {
    it('should create custom role with permissions', async () => {
      const customRole = await PermissionService.createCustomRole(
        'Custom Manager',
        'Custom role for project managers',
        [Permission.PROJECT_CREATE, Permission.TASK_CREATE],
        'org-id',
        'admin-user-id'
      );

      expect(customRole.name).toBe('Custom Manager');
      expect(customRole.permissions).toContain(Permission.PROJECT_CREATE);
      expect(customRole.permissions).toContain(Permission.TASK_CREATE);
    });

    it('should assign custom role to user', async () => {
      await PermissionService.assignCustomRole('user-id', 'custom-role-id');
      
      const permissions = await PermissionService.getUserPermissions('user-id');
      expect(permissions).toContain(Permission.PROJECT_CREATE);
    });
  });
});
```

---

*This permission system documentation will be updated as new permissions are added and the system evolves.*
