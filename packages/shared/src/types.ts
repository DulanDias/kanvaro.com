// Shared types for Kanvaro

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  PM = 'PM',
  DEV = 'DEV',
  VIEWER = 'VIEWER',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  CLOSED = 'CLOSED',
}

export enum SprintState {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_MENTIONED = 'TASK_MENTIONED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  SPRINT_STARTED = 'SPRINT_STARTED',
  SPRINT_ENDING = 'SPRINT_ENDING',
  INVITE_SENT = 'INVITE_SENT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MAGIC_LINK = 'MAGIC_LINK',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SetupStatus {
  isInitialized: boolean;
  checks: {
    db: string;
    redis: string;
    s3: string;
    ses: string;
    baseUrl: string;
  };
}
