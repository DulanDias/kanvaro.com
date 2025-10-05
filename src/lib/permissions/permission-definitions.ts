// Permission system definitions for Kanvaro
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
  // Epic permissions
  EPIC = 'epic',
  // Sprint permissions
  SPRINT = 'sprint',
  // Story permissions
  STORY = 'story',
  // Calendar permissions
  CALENDAR = 'calendar',
  // Kanban permissions
  KANBAN = 'kanban',
  // Backlog permissions
  BACKLOG = 'backlog',
  // Test management permissions
  TEST_MANAGEMENT = 'test_management',
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
  PROJECT_VIEW_ALL = 'project:view_all', // Admin can see all projects
  
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
  TIME_TRACKING_VIEW_ALL = 'time_tracking:view_all',
  
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
  SETTINGS_MANAGE_EMAIL = 'settings:manage_email',
  SETTINGS_MANAGE_DATABASE = 'settings:manage_database',
  SETTINGS_MANAGE_SECURITY = 'settings:manage_security',
  
  // Epic permissions
  EPIC_CREATE = 'epic:create',
  EPIC_READ = 'epic:read',
  EPIC_UPDATE = 'epic:update',
  EPIC_DELETE = 'epic:delete',
  
  // Sprint permissions
  SPRINT_CREATE = 'sprint:create',
  SPRINT_READ = 'sprint:read',
  SPRINT_UPDATE = 'sprint:update',
  SPRINT_DELETE = 'sprint:delete',
  SPRINT_MANAGE = 'sprint:manage',
  
  // Story permissions
  STORY_CREATE = 'story:create',
  STORY_READ = 'story:read',
  STORY_UPDATE = 'story:update',
  STORY_DELETE = 'story:delete',
  
  // Calendar permissions
  CALENDAR_READ = 'calendar:read',
  CALENDAR_CREATE = 'calendar:create',
  CALENDAR_UPDATE = 'calendar:update',
  CALENDAR_DELETE = 'calendar:delete',
  
  // Kanban permissions
  KANBAN_READ = 'kanban:read',
  KANBAN_MANAGE = 'kanban:manage',
  
  // Backlog permissions
  BACKLOG_READ = 'backlog:read',
  BACKLOG_MANAGE = 'backlog:manage',
  
  // Test management permissions
  TEST_SUITE_CREATE = 'test_suite:create',
  TEST_SUITE_READ = 'test_suite:read',
  TEST_SUITE_UPDATE = 'test_suite:update',
  TEST_SUITE_DELETE = 'test_suite:delete',
  TEST_CASE_CREATE = 'test_case:create',
  TEST_CASE_READ = 'test_case:read',
  TEST_CASE_UPDATE = 'test_case:update',
  TEST_CASE_DELETE = 'test_case:delete',
  TEST_PLAN_CREATE = 'test_plan:create',
  TEST_PLAN_READ = 'test_plan:read',
  TEST_PLAN_UPDATE = 'test_plan:update',
  TEST_PLAN_DELETE = 'test_plan:delete',
  TEST_PLAN_MANAGE = 'test_plan:manage',
  TEST_EXECUTION_CREATE = 'test_execution:create',
  TEST_EXECUTION_READ = 'test_execution:read',
  TEST_EXECUTION_UPDATE = 'test_execution:update',
  TEST_REPORT_VIEW = 'test_report:view',
  TEST_REPORT_EXPORT = 'test_report:export',
}

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  TEAM_MEMBER = 'team_member',
  CLIENT = 'client',
  VIEWER = 'viewer',
  QA_ENGINEER = 'qa_engineer',
  TESTER = 'tester',
}

export enum ProjectRole {
  PROJECT_MANAGER = 'project_manager',
  PROJECT_MEMBER = 'project_member',
  PROJECT_VIEWER = 'project_viewer',
  PROJECT_CLIENT = 'project_client',
  PROJECT_QA_LEAD = 'project_qa_lead',
  PROJECT_TESTER = 'project_tester',
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
    
    // Projects (can see all projects)
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE_TEAM,
    Permission.PROJECT_MANAGE_BUDGET,
    Permission.PROJECT_ARCHIVE,
    Permission.PROJECT_RESTORE,
    Permission.PROJECT_VIEW_ALL,
    
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
    Permission.TIME_TRACKING_VIEW_ALL,
    
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
    Permission.SETTINGS_MANAGE_EMAIL,
    Permission.SETTINGS_MANAGE_DATABASE,
    Permission.SETTINGS_MANAGE_SECURITY,
    
    // Epics
    Permission.EPIC_CREATE,
    Permission.EPIC_READ,
    Permission.EPIC_UPDATE,
    Permission.EPIC_DELETE,
    
    // Sprints
    Permission.SPRINT_CREATE,
    Permission.SPRINT_READ,
    Permission.SPRINT_UPDATE,
    Permission.SPRINT_DELETE,
    Permission.SPRINT_MANAGE,
    
    // Stories
    Permission.STORY_CREATE,
    Permission.STORY_READ,
    Permission.STORY_UPDATE,
    Permission.STORY_DELETE,
    
    // Calendar
    Permission.CALENDAR_READ,
    Permission.CALENDAR_CREATE,
    Permission.CALENDAR_UPDATE,
    Permission.CALENDAR_DELETE,
    
    // Kanban
    Permission.KANBAN_READ,
    Permission.KANBAN_MANAGE,
    
    // Backlog
    Permission.BACKLOG_READ,
    Permission.BACKLOG_MANAGE,
  ],
  
  [Role.PROJECT_MANAGER]: [
    // User management (limited)
    Permission.USER_READ,
    Permission.USER_INVITE,
    
    // Organization (read only)
    Permission.ORGANIZATION_READ,
    
    // Projects (assigned projects only)
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
    
    // Team (project team only)
    Permission.TEAM_READ,
    Permission.TEAM_INVITE,
    Permission.TEAM_REMOVE,
    Permission.TEAM_VIEW_ACTIVITY,
    
    // Time tracking
    Permission.TIME_TRACKING_CREATE,
    Permission.TIME_TRACKING_READ,
    Permission.TIME_TRACKING_UPDATE,
    Permission.TIME_TRACKING_DELETE,
    Permission.TIME_TRACKING_APPROVE,
    Permission.TIME_TRACKING_EXPORT,
    
    // Financial (project budget only)
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_MANAGE_BUDGET,
    Permission.FINANCIAL_CREATE_EXPENSE,
    Permission.FINANCIAL_APPROVE_EXPENSE,
    
    // Reporting
    Permission.REPORTING_VIEW,
    Permission.REPORTING_CREATE,
    Permission.REPORTING_EXPORT,
    
    // Settings (limited)
    Permission.SETTINGS_READ,
    
    // Epics
    Permission.EPIC_CREATE,
    Permission.EPIC_READ,
    Permission.EPIC_UPDATE,
    Permission.EPIC_DELETE,
    
    // Sprints
    Permission.SPRINT_CREATE,
    Permission.SPRINT_READ,
    Permission.SPRINT_UPDATE,
    Permission.SPRINT_DELETE,
    Permission.SPRINT_MANAGE,
    
    // Stories
    Permission.STORY_CREATE,
    Permission.STORY_READ,
    Permission.STORY_UPDATE,
    Permission.STORY_DELETE,
    
    // Calendar
    Permission.CALENDAR_READ,
    Permission.CALENDAR_CREATE,
    Permission.CALENDAR_UPDATE,
    Permission.CALENDAR_DELETE,
    
    // Kanban
    Permission.KANBAN_READ,
    Permission.KANBAN_MANAGE,
    
    // Backlog
    Permission.BACKLOG_READ,
    Permission.BACKLOG_MANAGE,
  ],
  
  [Role.TEAM_MEMBER]: [
    // User management (own profile only)
    Permission.USER_READ,
    
    // Organization (read only)
    Permission.ORGANIZATION_READ,
    
    // Projects (assigned projects only)
    Permission.PROJECT_READ,
    
    // Tasks (assigned tasks)
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    
    // Team (read only)
    Permission.TEAM_READ,
    
    // Time tracking (own time)
    Permission.TIME_TRACKING_CREATE,
    Permission.TIME_TRACKING_READ,
    Permission.TIME_TRACKING_UPDATE,
    Permission.TIME_TRACKING_DELETE,
    
    // Financial (read only)
    Permission.FINANCIAL_READ,
    
    // Reporting (limited)
    Permission.REPORTING_VIEW,
    
    // Settings (own settings)
    Permission.SETTINGS_READ,
    
    // Epics (read only)
    Permission.EPIC_READ,
    
    // Sprints (read only)
    Permission.SPRINT_READ,
    
    // Stories (read only)
    Permission.STORY_READ,
    
    // Calendar (read only)
    Permission.CALENDAR_READ,
    
    // Kanban (read only)
    Permission.KANBAN_READ,
    
    // Backlog (read only)
    Permission.BACKLOG_READ,
  ],
  
  [Role.CLIENT]: [
    // User management (own profile only)
    Permission.USER_READ,
    
    // Organization (read only)
    Permission.ORGANIZATION_READ,
    
    // Projects (assigned projects only)
    Permission.PROJECT_READ,
    
    // Tasks (read only)
    Permission.TASK_READ,
    
    // Team (read only)
    Permission.TEAM_READ,
    
    // Time tracking (read only)
    Permission.TIME_TRACKING_READ,
    
    // Financial (read only)
    Permission.FINANCIAL_READ,
    
    // Reporting (read only)
    Permission.REPORTING_VIEW,
    
    // Settings (own settings)
    Permission.SETTINGS_READ,
    
    // Epics (read only)
    Permission.EPIC_READ,
    
    // Sprints (read only)
    Permission.SPRINT_READ,
    
    // Stories (read only)
    Permission.STORY_READ,
    
    // Calendar (read only)
    Permission.CALENDAR_READ,
    
    // Kanban (read only)
    Permission.KANBAN_READ,
    
    // Backlog (read only)
    Permission.BACKLOG_READ,
  ],
  
  [Role.VIEWER]: [
    // User management (own profile only)
    Permission.USER_READ,
    
    // Organization (read only)
    Permission.ORGANIZATION_READ,
    
    // Projects (assigned projects only)
    Permission.PROJECT_READ,
    
    // Tasks (read only)
    Permission.TASK_READ,
    
    // Team (read only)
    Permission.TEAM_READ,
    
    // Time tracking (read only)
    Permission.TIME_TRACKING_READ,
    
    // Financial (read only)
    Permission.FINANCIAL_READ,
    
    // Reporting (read only)
    Permission.REPORTING_VIEW,
    
    // Settings (own settings)
    Permission.SETTINGS_READ,
    
    // Epics (read only)
    Permission.EPIC_READ,
    
    // Sprints (read only)
    Permission.SPRINT_READ,
    
    // Stories (read only)
    Permission.STORY_READ,
    
    // Calendar (read only)
    Permission.CALENDAR_READ,
    
    // Kanban (read only)
    Permission.KANBAN_READ,
    
    // Backlog (read only)
    Permission.BACKLOG_READ,
  ],
  
  [Role.QA_ENGINEER]: [
    // User management (read only)
    Permission.USER_READ,
    
    // Organization (read only)
    Permission.ORGANIZATION_READ,
    
    // Projects (assigned projects only)
    Permission.PROJECT_READ,
    
    // Tasks (full access for bug management)
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    
    // Team (read only)
    Permission.TEAM_READ,
    
    // Time tracking (read only)
    Permission.TIME_TRACKING_READ,
    
    // Financial (read only)
    Permission.FINANCIAL_READ,
    
    // Reporting (read only)
    Permission.REPORTING_VIEW,
    
    // Settings (own settings)
    Permission.SETTINGS_READ,
    
    // Epics (read only)
    Permission.EPIC_READ,
    
    // Sprints (read only)
    Permission.SPRINT_READ,
    
    // Stories (read only)
    Permission.STORY_READ,
    
    // Calendar (read only)
    Permission.CALENDAR_READ,
    
    // Kanban (read only)
    Permission.KANBAN_READ,
    
    // Backlog (read only)
    Permission.BACKLOG_READ,
    
    // Test management (full test management permissions)
    Permission.TEST_SUITE_CREATE,
    Permission.TEST_SUITE_READ,
    Permission.TEST_SUITE_UPDATE,
    Permission.TEST_SUITE_DELETE,
    Permission.TEST_CASE_CREATE,
    Permission.TEST_CASE_READ,
    Permission.TEST_CASE_UPDATE,
    Permission.TEST_CASE_DELETE,
    Permission.TEST_PLAN_CREATE,
    Permission.TEST_PLAN_READ,
    Permission.TEST_PLAN_UPDATE,
    Permission.TEST_PLAN_DELETE,
    Permission.TEST_PLAN_MANAGE,
    Permission.TEST_EXECUTION_CREATE,
    Permission.TEST_EXECUTION_READ,
    Permission.TEST_EXECUTION_UPDATE,
    Permission.TEST_REPORT_VIEW,
    Permission.TEST_REPORT_EXPORT,
  ],
  
  [Role.TESTER]: [
    // User management (read only)
    Permission.USER_READ,
    
    // Organization (read only)
    Permission.ORGANIZATION_READ,
    
    // Projects (assigned projects only)
    Permission.PROJECT_READ,
    
    // Tasks (create bugs only)
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    
    // Team (read only)
    Permission.TEAM_READ,
    
    // Time tracking (read only)
    Permission.TIME_TRACKING_READ,
    
    // Financial (read only)
    Permission.FINANCIAL_READ,
    
    // Reporting (read only)
    Permission.REPORTING_VIEW,
    
    // Settings (own settings)
    Permission.SETTINGS_READ,
    
    // Epics (read only)
    Permission.EPIC_READ,
    
    // Sprints (read only)
    Permission.SPRINT_READ,
    
    // Stories (read only)
    Permission.STORY_READ,
    
    // Calendar (read only)
    Permission.CALENDAR_READ,
    
    // Kanban (read only)
    Permission.KANBAN_READ,
    
    // Backlog (read only)
    Permission.BACKLOG_READ,
    
    // Test management (execution and reporting only)
    Permission.TEST_SUITE_READ,
    Permission.TEST_CASE_READ,
    Permission.TEST_PLAN_READ,
    Permission.TEST_EXECUTION_CREATE,
    Permission.TEST_EXECUTION_READ,
    Permission.TEST_EXECUTION_UPDATE,
    Permission.TEST_REPORT_VIEW,
  ],
};

export const PROJECT_ROLE_PERMISSIONS: Record<ProjectRole, Permission[]> = {
  [ProjectRole.PROJECT_MANAGER]: [
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_MANAGE_TEAM,
    Permission.PROJECT_MANAGE_BUDGET,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    Permission.TEAM_READ,
    Permission.TEAM_INVITE,
    Permission.TEAM_REMOVE,
    Permission.TIME_TRACKING_READ,
    Permission.TIME_TRACKING_APPROVE,
    Permission.TIME_TRACKING_EXPORT,
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_MANAGE_BUDGET,
    Permission.EPIC_CREATE,
    Permission.EPIC_READ,
    Permission.EPIC_UPDATE,
    Permission.EPIC_DELETE,
    Permission.SPRINT_CREATE,
    Permission.SPRINT_READ,
    Permission.SPRINT_UPDATE,
    Permission.SPRINT_DELETE,
    Permission.SPRINT_MANAGE,
    Permission.STORY_CREATE,
    Permission.STORY_READ,
    Permission.STORY_UPDATE,
    Permission.STORY_DELETE,
    Permission.CALENDAR_READ,
    Permission.CALENDAR_CREATE,
    Permission.CALENDAR_UPDATE,
    Permission.CALENDAR_DELETE,
    Permission.KANBAN_READ,
    Permission.KANBAN_MANAGE,
    Permission.BACKLOG_READ,
    Permission.BACKLOG_MANAGE,
  ],
  
  [ProjectRole.PROJECT_MEMBER]: [
    Permission.PROJECT_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TEAM_READ,
    Permission.TIME_TRACKING_CREATE,
    Permission.TIME_TRACKING_READ,
    Permission.TIME_TRACKING_UPDATE,
    Permission.TIME_TRACKING_DELETE,
    Permission.FINANCIAL_READ,
    Permission.EPIC_READ,
    Permission.SPRINT_READ,
    Permission.STORY_CREATE,
    Permission.STORY_READ,
    Permission.STORY_UPDATE,
    Permission.CALENDAR_READ,
    Permission.KANBAN_READ,
    Permission.BACKLOG_READ,
  ],
  
  [ProjectRole.PROJECT_VIEWER]: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.TEAM_READ,
    Permission.TIME_TRACKING_READ,
    Permission.FINANCIAL_READ,
    Permission.EPIC_READ,
    Permission.SPRINT_READ,
    Permission.STORY_READ,
    Permission.CALENDAR_READ,
    Permission.KANBAN_READ,
    Permission.BACKLOG_READ,
  ],
  
  [ProjectRole.PROJECT_CLIENT]: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.TEAM_READ,
    Permission.TIME_TRACKING_READ,
    Permission.FINANCIAL_READ,
    Permission.EPIC_READ,
    Permission.SPRINT_READ,
    Permission.STORY_READ,
    Permission.CALENDAR_READ,
    Permission.KANBAN_READ,
    Permission.BACKLOG_READ,
  ],
  
  [ProjectRole.PROJECT_QA_LEAD]: [
    Permission.PROJECT_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_ASSIGN,
    Permission.TASK_CHANGE_STATUS,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    Permission.TEAM_READ,
    Permission.TIME_TRACKING_READ,
    Permission.FINANCIAL_READ,
    Permission.EPIC_READ,
    Permission.SPRINT_READ,
    Permission.STORY_READ,
    Permission.CALENDAR_READ,
    Permission.KANBAN_READ,
    Permission.BACKLOG_READ,
    // Test management (full permissions for assigned project)
    Permission.TEST_SUITE_CREATE,
    Permission.TEST_SUITE_READ,
    Permission.TEST_SUITE_UPDATE,
    Permission.TEST_SUITE_DELETE,
    Permission.TEST_CASE_CREATE,
    Permission.TEST_CASE_READ,
    Permission.TEST_CASE_UPDATE,
    Permission.TEST_CASE_DELETE,
    Permission.TEST_PLAN_CREATE,
    Permission.TEST_PLAN_READ,
    Permission.TEST_PLAN_UPDATE,
    Permission.TEST_PLAN_DELETE,
    Permission.TEST_PLAN_MANAGE,
    Permission.TEST_EXECUTION_CREATE,
    Permission.TEST_EXECUTION_READ,
    Permission.TEST_EXECUTION_UPDATE,
    Permission.TEST_REPORT_VIEW,
    Permission.TEST_REPORT_EXPORT,
  ],
  
  [ProjectRole.PROJECT_TESTER]: [
    Permission.PROJECT_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_MANAGE_COMMENTS,
    Permission.TASK_MANAGE_ATTACHMENTS,
    Permission.TEAM_READ,
    Permission.TIME_TRACKING_READ,
    Permission.FINANCIAL_READ,
    Permission.EPIC_READ,
    Permission.SPRINT_READ,
    Permission.STORY_READ,
    Permission.CALENDAR_READ,
    Permission.KANBAN_READ,
    Permission.BACKLOG_READ,
    // Test management (execution and reporting only)
    Permission.TEST_SUITE_READ,
    Permission.TEST_CASE_READ,
    Permission.TEST_PLAN_READ,
    Permission.TEST_EXECUTION_CREATE,
    Permission.TEST_EXECUTION_READ,
    Permission.TEST_EXECUTION_UPDATE,
    Permission.TEST_REPORT_VIEW,
  ],
};

// Permission scopes
export enum PermissionScope {
  GLOBAL = 'global', // Organization-wide access
  PROJECT = 'project', // Project-specific access
  OWN = 'own', // Own resources only
}

// Helper function to get permission scope
export function getPermissionScope(permission: Permission): PermissionScope {
  const globalPermissions = [
    Permission.USER_CREATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,
    Permission.ORGANIZATION_UPDATE,
    Permission.ORGANIZATION_DELETE,
    Permission.ORGANIZATION_MANAGE_SETTINGS,
    Permission.ORGANIZATION_MANAGE_BILLING,
    Permission.PROJECT_VIEW_ALL,
    Permission.TIME_TRACKING_VIEW_ALL,
    Permission.FINANCIAL_READ,
    Permission.REPORTING_VIEW,
    Permission.REPORTING_CREATE,
    Permission.REPORTING_EXPORT,
    Permission.REPORTING_SHARE,
    Permission.SETTINGS_MANAGE_EMAIL,
    Permission.SETTINGS_MANAGE_DATABASE,
    Permission.SETTINGS_MANAGE_SECURITY,
  ];
  
  const ownPermissions = [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.TIME_TRACKING_CREATE,
    Permission.TIME_TRACKING_UPDATE,
    Permission.TIME_TRACKING_DELETE,
    Permission.SETTINGS_READ,
  ];
  
  if (globalPermissions.includes(permission)) {
    return PermissionScope.GLOBAL;
  }
  
  if (ownPermissions.includes(permission)) {
    return PermissionScope.OWN;
  }
  
  return PermissionScope.PROJECT;
}
