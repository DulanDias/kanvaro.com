'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Permission } from './permission-definitions';

interface UserPermissions {
  globalPermissions: Permission[];
  projectPermissions: Record<string, Permission[]>;
  projectRoles: Record<string, string>;
  userRole: string;
  accessibleProjects: string[];
}

interface PermissionContextType {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  hasPermission: (permission: Permission, projectId?: string) => boolean;
  hasAnyPermission: (permissions: Permission[], projectId?: string) => boolean;
  hasAllPermissions: (permissions: Permission[], projectId?: string) => boolean;
  canAccessProject: (projectId: string) => boolean;
  canManageProject: (projectId: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (permission: Permission, projectId?: string): boolean => {
    // If permissions are still loading, return false to hide content until loaded
    if (!permissions) return false;
    
    // Check global permissions first
    if (permissions.globalPermissions.includes(permission)) {
      return true;
    }
    
    // Check project-specific permissions
    if (projectId && permissions.projectPermissions[projectId]) {
      return permissions.projectPermissions[projectId].includes(permission);
    }
    
    return false;
  };

  const hasAnyPermission = (permissionsToCheck: Permission[], projectId?: string): boolean => {
    return permissionsToCheck.some(permission => hasPermission(permission, projectId));
  };

  const hasAllPermissions = (permissionsToCheck: Permission[], projectId?: string): boolean => {
    return permissionsToCheck.every(permission => hasPermission(permission, projectId));
  };

  const canAccessProject = (projectId: string): boolean => {
    if (!permissions) return false;
    return permissions.accessibleProjects.includes(projectId);
  };

  const canManageProject = (projectId: string): boolean => {
    return hasPermission(Permission.PROJECT_UPDATE, projectId);
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  const value: PermissionContextType = {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessProject,
    canManageProject,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
}

// Optimized hooks that use the context
export function usePermissions() {
  const context = usePermissionContext();
  
  return {
    hasPermission: context.hasPermission,
    hasAnyPermission: context.hasAnyPermission,
    hasAllPermissions: context.hasAllPermissions,
    canAccessProject: context.canAccessProject,
    canManageProject: context.canManageProject,
    accessibleProjects: context.permissions?.accessibleProjects || [],
    loading: context.loading,
    error: context.error
  };
}

export function useProjectPermissions(projectId: string) {
  const context = usePermissionContext();
  
  return {
    hasPermission: (permission: Permission) => context.hasPermission(permission, projectId),
    hasAnyPermission: (permissions: Permission[]) => context.hasAnyPermission(permissions, projectId),
    hasAllPermissions: (permissions: Permission[]) => context.hasAllPermissions(permissions, projectId),
    canAccess: context.canAccessProject(projectId),
    canManage: context.canManageProject(projectId),
    loading: context.loading,
    error: context.error
  };
}

export function useFeaturePermissions() {
  const { hasPermission, loading, error } = usePermissionContext();

  return {
    // Project permissions
    canCreateProject: hasPermission(Permission.PROJECT_CREATE),
    canViewAllProjects: hasPermission(Permission.PROJECT_VIEW_ALL),
    
    // Task permissions
    canCreateTask: hasPermission(Permission.TASK_CREATE),
    canManageTasks: hasPermission(Permission.TASK_UPDATE) || hasPermission(Permission.TASK_DELETE) || hasPermission(Permission.TASK_ASSIGN),
    
    // Team permissions
    canManageTeam: hasPermission(Permission.TEAM_INVITE) || hasPermission(Permission.TEAM_REMOVE) || hasPermission(Permission.TEAM_MANAGE_PERMISSIONS),
    
    // Time tracking permissions
    canTrackTime: hasPermission(Permission.TIME_TRACKING_CREATE),
    canApproveTime: hasPermission(Permission.TIME_TRACKING_APPROVE),
    canViewAllTime: hasPermission(Permission.TIME_TRACKING_VIEW_ALL),
    
    // Financial permissions
    canManageBudget: hasPermission(Permission.FINANCIAL_MANAGE_BUDGET),
    canCreateExpense: hasPermission(Permission.FINANCIAL_CREATE_EXPENSE),
    canApproveExpense: hasPermission(Permission.FINANCIAL_APPROVE_EXPENSE),
    
    // Settings permissions
    canManageSettings: hasPermission(Permission.SETTINGS_UPDATE) || hasPermission(Permission.SETTINGS_MANAGE_EMAIL) || hasPermission(Permission.SETTINGS_MANAGE_DATABASE) || hasPermission(Permission.SETTINGS_MANAGE_SECURITY),
    
    // Reporting permissions
    canViewReports: hasPermission(Permission.REPORTING_VIEW),
    canCreateReports: hasPermission(Permission.REPORTING_CREATE),
    canExportReports: hasPermission(Permission.REPORTING_EXPORT),
    
    // Epic permissions
    canManageEpics: hasPermission(Permission.EPIC_CREATE) || hasPermission(Permission.EPIC_UPDATE) || hasPermission(Permission.EPIC_DELETE),
    
    // Sprint permissions
    canManageSprints: hasPermission(Permission.SPRINT_CREATE) || hasPermission(Permission.SPRINT_UPDATE) || hasPermission(Permission.SPRINT_DELETE) || hasPermission(Permission.SPRINT_MANAGE),
    
    // Story permissions
    canManageStories: hasPermission(Permission.STORY_CREATE) || hasPermission(Permission.STORY_UPDATE) || hasPermission(Permission.STORY_DELETE),
    
    // Calendar permissions
    canManageCalendar: hasPermission(Permission.CALENDAR_CREATE) || hasPermission(Permission.CALENDAR_UPDATE) || hasPermission(Permission.CALENDAR_DELETE),
    
    // Kanban permissions
    canManageKanban: hasPermission(Permission.KANBAN_MANAGE),
    
    // Backlog permissions
    canManageBacklog: hasPermission(Permission.BACKLOG_MANAGE),
    
    loading,
    error
  };
}

export function useUserManagementPermissions() {
  const { hasPermission, loading, error } = usePermissionContext();

  return {
    canCreateUser: hasPermission(Permission.USER_CREATE),
    canInviteUser: hasPermission(Permission.USER_INVITE),
    canManageRoles: hasPermission(Permission.USER_MANAGE_ROLES),
    canActivateUser: hasPermission(Permission.USER_ACTIVATE),
    canDeactivateUser: hasPermission(Permission.USER_DEACTIVATE),
    canDeleteUser: hasPermission(Permission.USER_DELETE),
    canManageUsers: hasPermission(Permission.USER_CREATE) || hasPermission(Permission.USER_UPDATE) || hasPermission(Permission.USER_DELETE) || hasPermission(Permission.USER_INVITE),
    loading,
    error
  };
}
