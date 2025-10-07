---
slug: "reference/user-role-management"
title: "User Role Management"
summary: "Comprehensive user role management system with role-based access control, permissions, and team organization."
visibility: "public"
audiences: ["admin", "project_manager", "self_host_admin"]
category: "reference"
order: 120
updated: "2025-01-04"
---

# Kanvaro - User & Role Management System

## Overview

Kanvaro implements a comprehensive user and role management system with predefined roles, custom role creation, bulk user import, and granular permission control. The system supports user invitations, role assignments, and organization-level access management.

## User Management

### User Account Structure
```typescript
// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  customRole?: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  isActive: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  timezone: string;
  language: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      inApp: boolean;
      push: boolean;
    };
    sidebarCollapsed: boolean;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'project_manager', 'team_member', 'client', 'viewer'],
    default: 'team_member'
  },
  customRole: {
    type: Schema.Types.ObjectId,
    ref: 'CustomRole'
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    maxlength: 500
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'en'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    },
    sidebarCollapsed: { type: Boolean, default: false }
  },
  lastLoginAt: Date
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ organization: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ organization: 1, isActive: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
```

### User Invitation System
```typescript
// models/UserInvitation.ts
export interface IUserInvitation extends Document {
  email: string;
  organization: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  role: string;
  customRole?: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isAccepted: boolean;
  acceptedAt?: Date;
  createdAt: Date;
}

const UserInvitationSchema = new Schema<IUserInvitation>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  customRole: {
    type: Schema.Types.ObjectId,
    ref: 'CustomRole'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  acceptedAt: Date
}, {
  timestamps: true
});

UserInvitationSchema.index({ email: 1, organization: 1 });
UserInvitationSchema.index({ token: 1 });
UserInvitationSchema.index({ expiresAt: 1 });

export const UserInvitation = mongoose.model<IUserInvitation>('UserInvitation', UserInvitationSchema);
```

### User Service
```typescript
// lib/services/user-service.ts
import { User } from '@/models/User';
import { UserInvitation } from '@/models/UserInvitation';
import { EmailService } from './email-service';
import { PermissionService } from '@/lib/permissions/permission-service';
import crypto from 'crypto';

export class UserService {
  // Create user account
  static async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    organization: string;
    customRole?: string;
  }): Promise<IUser> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = new User({
      ...userData,
      password: hashedPassword,
      isEmailVerified: false
    });

    await user.save();
    return user;
  }

  // Invite user to organization
  static async inviteUser(
    email: string,
    role: string,
    organizationId: string,
    invitedBy: string,
    customRole?: string
  ): Promise<IUserInvitation> {
    // Check if user already exists
    const existingUser = await User.findOne({ email, organization: organizationId });
    if (existingUser) {
      throw new Error('User already exists in this organization');
    }

    // Check for pending invitation
    const existingInvitation = await UserInvitation.findOne({
      email,
      organization: organizationId,
      isAccepted: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      throw new Error('Invitation already sent to this email');
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new UserInvitation({
      email,
      organization: organizationId,
      invitedBy,
      role,
      customRole,
      token
    });

    await invitation.save();

    // Send invitation email
    await EmailService.sendUserInvitation(email, token, organizationId);

    return invitation;
  }

  // Accept invitation
  static async acceptInvitation(
    token: string,
    password: string
  ): Promise<IUser> {
    const invitation = await UserInvitation.findOne({
      token,
      isAccepted: false,
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      firstName: '', // Will be filled by user
      lastName: '', // Will be filled by user
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      customRole: invitation.customRole,
      organization: invitation.organization,
      isEmailVerified: true
    });

    await user.save();

    // Mark invitation as accepted
    invitation.isAccepted = true;
    invitation.acceptedAt = new Date();
    await invitation.save();

    return user;
  }

  // Bulk import users
  static async bulkImportUsers(
    users: Array<{
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      customRole?: string;
    }>,
    organizationId: string,
    importedBy: string
  ): Promise<{
    successful: number;
    failed: Array<{ email: string; error: string }>;
  }> {
    const results = {
      successful: 0,
      failed: []
    };

    for (const userData of users) {
      try {
        // Generate temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');
        
        // Create user
        const user = await this.createUser({
          ...userData,
          password: tempPassword,
          organization: organizationId
        });

        // Send welcome email with temporary password
        await EmailService.sendWelcomeEmail(
          user.email,
          tempPassword,
          user.firstName
        );

        results.successful++;
      } catch (error) {
        results.failed.push({
          email: userData.email,
          error: error.message
        });
      }
    }

    return results;
  }

  // Update user role
  static async updateUserRole(
    userId: string,
    newRole: string,
    customRole?: string,
    updatedBy: string
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = newRole;
    if (customRole) {
      user.customRole = customRole;
    } else {
      user.customRole = undefined;
    }

    await user.save();

    // Invalidate user permissions cache
    await PermissionService.invalidateUserPermissions(userId);

    // Log role change
    await this.logUserAction(userId, 'role_updated', {
      oldRole: user.role,
      newRole,
      updatedBy
    });

    return user;
  }

  // Deactivate user
  static async deactivateUser(
    userId: string,
    deactivatedBy: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    await user.save();

    // Log deactivation
    await this.logUserAction(userId, 'user_deactivated', {
      deactivatedBy
    });
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<string[]> {
    return PermissionService.getUserPermissions(userId);
  }

  // Log user actions
  private static async logUserAction(
    userId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    // Implementation for logging user actions
    console.log(`User ${userId} action: ${action}`, metadata);
  }
}
```

## Role Management

### Predefined Roles
```typescript
// lib/roles/predefined-roles.ts
export const PREDEFINED_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: Object.values(Permission), // All permissions
    isSystem: true
  },
  
  ADMIN: {
    name: 'Admin',
    description: 'Organization administrator with most permissions',
    permissions: [
      // User management
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.USER_DELETE,
      Permission.USER_INVITE,
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
      
      // Tasks
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.TASK_DELETE,
      Permission.TASK_ASSIGN,
      Permission.TASK_CHANGE_STATUS,
      
      // Team
      Permission.TEAM_READ,
      Permission.TEAM_INVITE,
      Permission.TEAM_REMOVE,
      Permission.TEAM_MANAGE_PERMISSIONS,
      
      // Time tracking
      Permission.TIME_TRACKING_CREATE,
      Permission.TIME_TRACKING_READ,
      Permission.TIME_TRACKING_UPDATE,
      Permission.TIME_TRACKING_DELETE,
      Permission.TIME_TRACKING_APPROVE,
      
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
      
      // Settings
      Permission.SETTINGS_READ,
      Permission.SETTINGS_UPDATE,
      Permission.SETTINGS_MANAGE_INTEGRATIONS
    ],
    isSystem: true
  },
  
  PROJECT_MANAGER: {
    name: 'Project Manager',
    description: 'Manages assigned projects and team members',
    permissions: [
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
      Permission.TASK_DELETE,
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
      Permission.REPORTING_EXPORT
    ],
    isSystem: true
  },
  
  SOFTWARE_ENGINEER: {
    name: 'Software Engineer',
    description: 'Developer with task management and time tracking access',
    permissions: [
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
      Permission.REPORTING_VIEW
    ],
    isSystem: true
  },
  
  QA_ENGINEER: {
    name: 'QA Engineer',
    description: 'Quality assurance with testing and validation access',
    permissions: [
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
      Permission.REPORTING_VIEW
    ],
    isSystem: true
  },
  
  CLIENT: {
    name: 'Client',
    description: 'Read-only access with limited input capabilities',
    permissions: [
      // Projects
      Permission.PROJECT_READ,
      
      // Tasks
      Permission.TASK_READ,
      
      // Team
      Permission.TEAM_READ,
      
      // Financial
      Permission.FINANCIAL_READ,
      
      // Reporting
      Permission.REPORTING_VIEW
    ],
    isSystem: true
  },
  
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to assigned projects',
    permissions: [
      // Projects
      Permission.PROJECT_READ,
      
      // Tasks
      Permission.TASK_READ,
      
      // Team
      Permission.TEAM_READ,
      
      // Financial
      Permission.FINANCIAL_READ,
      
      // Reporting
      Permission.REPORTING_VIEW
    ],
    isSystem: true
  }
};
```

### Custom Role Management
```typescript
// lib/roles/custom-role-service.ts
import { CustomRole } from '@/models/CustomRole';
import { Permission } from '@/lib/permissions/permission-definitions';

export class CustomRoleService {
  // Create custom role
  static async createCustomRole(
    name: string,
    description: string,
    permissions: Permission[],
    organizationId: string,
    createdBy: string
  ): Promise<ICustomRole> {
    // Validate permissions
    const validPermissions = permissions.filter(p => 
      Object.values(Permission).includes(p)
    );

    if (validPermissions.length !== permissions.length) {
      throw new Error('Invalid permissions provided');
    }

    // Check if role name already exists in organization
    const existingRole = await CustomRole.findOne({
      name,
      organization: organizationId,
      isActive: true
    });

    if (existingRole) {
      throw new Error('Role name already exists in this organization');
    }

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

  // Update custom role
  static async updateCustomRole(
    roleId: string,
    updates: {
      name?: string;
      description?: string;
      permissions?: Permission[];
      isActive?: boolean;
    },
    organizationId: string
  ): Promise<ICustomRole> {
    const customRole = await CustomRole.findOne({
      _id: roleId,
      organization: organizationId
    });

    if (!customRole) {
      throw new Error('Custom role not found');
    }

    if (updates.name && updates.name !== customRole.name) {
      // Check if new name already exists
      const existingRole = await CustomRole.findOne({
        name: updates.name,
        organization: organizationId,
        isActive: true,
        _id: { $ne: roleId }
      });

      if (existingRole) {
        throw new Error('Role name already exists in this organization');
      }
    }

    if (updates.name) customRole.name = updates.name;
    if (updates.description) customRole.description = updates.description;
    if (updates.permissions) customRole.permissions = updates.permissions;
    if (updates.isActive !== undefined) customRole.isActive = updates.isActive;

    await customRole.save();

    // Invalidate permissions for users with this role
    await this.invalidateRolePermissions(roleId);

    return customRole;
  }

  // Delete custom role
  static async deleteCustomRole(
    roleId: string,
    organizationId: string
  ): Promise<void> {
    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({
      customRole: roleId,
      organization: organizationId
    });

    if (usersWithRole > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await CustomRole.findOneAndDelete({
      _id: roleId,
      organization: organizationId
    });
  }

  // Get organization roles
  static async getOrganizationRoles(organizationId: string): Promise<ICustomRole[]> {
    return CustomRole.find({
      organization: organizationId,
      isActive: true
    }).sort({ name: 1 });
  }

  // Assign custom role to user
  static async assignCustomRole(
    userId: string,
    roleId: string,
    organizationId: string
  ): Promise<void> {
    const user = await User.findOne({
      _id: userId,
      organization: organizationId
    });

    if (!user) {
      throw new Error('User not found in this organization');
    }

    const customRole = await CustomRole.findOne({
      _id: roleId,
      organization: organizationId,
      isActive: true
    });

    if (!customRole) {
      throw new Error('Custom role not found');
    }

    user.customRole = roleId;
    await user.save();

    // Invalidate user permissions
    await PermissionService.invalidateUserPermissions(userId);
  }

  // Remove custom role from user
  static async removeCustomRole(
    userId: string,
    organizationId: string
  ): Promise<void> {
    const user = await User.findOne({
      _id: userId,
      organization: organizationId
    });

    if (!user) {
      throw new Error('User not found in this organization');
    }

    user.customRole = undefined;
    await user.save();

    // Invalidate user permissions
    await PermissionService.invalidateUserPermissions(userId);
  }

  // Invalidate permissions for users with specific role
  private static async invalidateRolePermissions(roleId: string): Promise<void> {
    const users = await User.find({ customRole: roleId });
    
    await Promise.all(
      users.map(user => 
        PermissionService.invalidateUserPermissions(user._id.toString())
      )
    );
  }
}
```

## User Management API

### User Management Endpoints
```typescript
// pages/api/v1/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { UserService } from '@/lib/services/user-service';
import { requirePermission } from '@/middleware/permission-check';
import { Permission } from '@/lib/permissions/permission-definitions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check permissions
    const permissionCheck = await requirePermission(Permission.USER_READ)(req as any);
    if (permissionCheck) {
      return res.status(permissionCheck.status).json(permissionCheck);
    }

    const { method } = req;
    const userId = req.headers['x-user-id'] as string;
    const organizationId = req.headers['x-organization-id'] as string;

    switch (method) {
      case 'GET':
        const { page = 1, limit = 20, role, search, isActive } = req.query;
        
        const filters: any = { organization: organizationId };
        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive === 'true';
        if (search) {
          filters.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ];
        }

        const users = await User.find(filters)
          .select('-password')
          .populate('customRole', 'name permissions')
          .sort({ createdAt: -1 })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit));

        const total = await User.countDocuments(filters);

        return res.status(200).json({
          success: true,
          data: users,
          meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          },
          timestamp: new Date().toISOString()
        });

      case 'POST':
        const { action } = req.body;

        if (action === 'invite') {
          const { email, role, customRole } = req.body;
          
          const invitation = await UserService.inviteUser(
            email,
            role,
            organizationId,
            userId,
            customRole
          );

          return res.status(201).json({
            success: true,
            data: invitation,
            message: 'User invitation sent successfully',
            timestamp: new Date().toISOString()
          });
        }

        if (action === 'bulk_import') {
          const { users } = req.body;
          
          const results = await UserService.bulkImportUsers(
            users,
            organizationId,
            userId
          );

          return res.status(201).json({
            success: true,
            data: results,
            message: 'Bulk import completed',
            timestamp: new Date().toISOString()
          });
        }

        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          code: 'INVALID_ACTION'
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

### Role Management Endpoints
```typescript
// pages/api/v1/roles/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { CustomRoleService } from '@/lib/roles/custom-role-service';
import { requirePermission } from '@/middleware/permission-check';
import { Permission } from '@/lib/permissions/permission-definitions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    const organizationId = req.headers['x-organization-id'] as string;

    switch (method) {
      case 'GET':
        const roles = await CustomRoleService.getOrganizationRoles(organizationId);
        
        return res.status(200).json({
          success: true,
          data: roles,
          timestamp: new Date().toISOString()
        });

      case 'POST':
        // Check permissions
        const permissionCheck = await requirePermission(Permission.USER_MANAGE_ROLES)(req as any);
        if (permissionCheck) {
          return res.status(permissionCheck.status).json(permissionCheck);
        }

        const { name, description, permissions } = req.body;
        const createdBy = req.headers['x-user-id'] as string;

        const customRole = await CustomRoleService.createCustomRole(
          name,
          description,
          permissions,
          organizationId,
          createdBy
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
```

## Bulk Import System

### CSV Import Service
```typescript
// lib/services/bulk-import-service.ts
import csv from 'csv-parser';
import { UserService } from './user-service';

export class BulkImportService {
  static async parseCSV(csvData: string): Promise<Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    customRole?: string;
  }>> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      
      const stream = csv({
        headers: ['firstName', 'lastName', 'email', 'role', 'customRole'],
        skipEmptyLines: true
      });

      stream.on('data', (data) => {
        results.push({
          firstName: data.firstName?.trim(),
          lastName: data.lastName?.trim(),
          email: data.email?.trim().toLowerCase(),
          role: data.role?.trim(),
          customRole: data.customRole?.trim()
        });
      });

      stream.on('end', () => {
        resolve(results);
      });

      stream.on('error', (error) => {
        reject(error);
      });

      stream.write(csvData);
      stream.end();
    });
  }

  static async validateImportData(users: any[]): Promise<{
    valid: any[];
    invalid: Array<{ user: any; errors: string[] }>;
  }> {
    const valid = [];
    const invalid = [];

    for (const user of users) {
      const errors = [];

      if (!user.firstName) errors.push('First name is required');
      if (!user.lastName) errors.push('Last name is required');
      if (!user.email) errors.push('Email is required');
      if (!user.role) errors.push('Role is required');

      if (user.email && !this.isValidEmail(user.email)) {
        errors.push('Invalid email format');
      }

      if (user.role && !this.isValidRole(user.role)) {
        errors.push('Invalid role');
      }

      if (errors.length > 0) {
        invalid.push({ user, errors });
      } else {
        valid.push(user);
      }
    }

    return { valid, invalid };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidRole(role: string): boolean {
    const validRoles = [
      'super_admin',
      'admin',
      'project_manager',
      'team_member',
      'client',
      'viewer'
    ];
    return validRoles.includes(role);
  }
}
```

---

*This user and role management documentation will be updated as new user management features are added and permission systems evolve.*
