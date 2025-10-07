---
slug: "reference/rest-api-design"
title: "REST API Design"
summary: "RESTful API design principles, endpoints, authentication, and integration patterns for Kanvaro API."
visibility: "public"
audiences: ["admin", "self_host_admin"]
category: "reference"
order: 80
updated: "2025-01-04"
---

# Kanvaro - REST API Design & Implementation

## Overview

Kanvaro implements a comprehensive REST API with proper authentication, authorization, rate limiting, and error handling. The API follows RESTful principles with clear endpoint structures, proper HTTP status codes, and comprehensive error responses.

## API Architecture

### Base URL Structure
```
Production: https://api.kanvaro.com/v1
Development: https://dev-api.kanvaro.com/v1
Local: http://localhost:3000/api/v1
```

### Authentication Strategy
```typescript
// lib/auth/auth-strategy.ts
export interface AuthStrategy {
  // Public endpoints (no authentication required)
  public: string[];
  // Protected endpoints (JWT required)
  protected: string[];
  // Admin-only endpoints (admin role required)
  admin: string[];
}

export const AUTH_STRATEGY: AuthStrategy = {
  public: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/setup/*', // Setup wizard endpoints
    '/health',
    '/docs',
  ],
  protected: [
    '/projects/*',
    '/tasks/*',
    '/team/*',
    '/time-tracking/*',
    '/reports/*',
    '/profile/*',
  ],
  admin: [
    '/admin/*',
    '/users/*',
    '/organizations/*',
    '/system/*',
  ]
};
```

## REST API Endpoints

### Authentication Endpoints
```typescript
// API Routes for Authentication
POST   /api/v1/auth/login              // User login
POST   /api/v1/auth/register           // User registration
POST   /api/v1/auth/logout             // User logout
POST   /api/v1/auth/refresh            // Refresh JWT token
POST   /api/v1/auth/forgot-password    // Request password reset
POST   /api/v1/auth/reset-password     // Reset password
POST   /api/v1/auth/verify-email       // Verify email address
POST   /api/v1/auth/verify-2fa         // Verify 2FA code
POST   /api/v1/auth/disable-2fa        // Disable 2FA
GET    /api/v1/auth/me                  // Get current user
PUT    /api/v1/auth/me                  // Update current user
```

### Project Management Endpoints
```typescript
// Project Management API
GET    /api/v1/projects                // List projects
POST   /api/v1/projects                // Create project
GET    /api/v1/projects/:id            // Get project details
PUT    /api/v1/projects/:id            // Update project
DELETE /api/v1/projects/:id            // Delete project
GET    /api/v1/projects/:id/tasks      // Get project tasks
GET    /api/v1/projects/:id/team       // Get project team
POST   /api/v1/projects/:id/team       // Add team member
DELETE /api/v1/projects/:id/team/:userId // Remove team member
GET    /api/v1/projects/:id/analytics  // Get project analytics
```

### Task Management Endpoints
```typescript
// Task Management API
GET    /api/v1/tasks                   // List tasks
POST   /api/v1/tasks                   // Create task
GET    /api/v1/tasks/:id               // Get task details
PUT    /api/v1/tasks/:id               // Update task
DELETE /api/v1/tasks/:id               // Delete task
POST   /api/v1/tasks/:id/assign        // Assign task
POST   /api/v1/tasks/:id/status        // Update task status
GET    /api/v1/tasks/:id/comments      // Get task comments
POST   /api/v1/tasks/:id/comments     // Add comment
GET    /api/v1/tasks/:id/attachments   // Get task attachments
POST   /api/v1/tasks/:id/attachments  // Upload attachment
```

### Team Management Endpoints
```typescript
// Team Management API
GET    /api/v1/team                    // List team members
POST   /api/v1/team                    // Add team member
GET    /api/v1/team/:id                // Get team member details
PUT    /api/v1/team/:id                // Update team member
DELETE /api/v1/team/:id                // Remove team member
GET    /api/v1/team/:id/permissions   // Get user permissions
PUT    /api/v1/team/:id/permissions   // Update permissions
GET    /api/v1/team/:id/activity       // Get user activity
```

### Time Tracking Endpoints
```typescript
// Time Tracking API
GET    /api/v1/time-tracking           // List time entries
POST   /api/v1/time-tracking           // Create time entry
GET    /api/v1/time-tracking/:id       // Get time entry details
PUT    /api/v1/time-tracking/:id       // Update time entry
DELETE /api/v1/time-tracking/:id       // Delete time entry
GET    /api/v1/time-tracking/reports  // Get time reports
GET    /api/v1/time-tracking/export   // Export time data
```

### Financial Management Endpoints
```typescript
// Financial Management API
GET    /api/v1/budget                 // Get budget information
PUT    /api/v1/budget                 // Update budget
GET    /api/v1/expenses               // List expenses
POST   /api/v1/expenses               // Create expense
GET    /api/v1/invoices               // List invoices
POST   /api/v1/invoices               // Create invoice
GET    /api/v1/invoices/:id           // Get invoice details
PUT    /api/v1/invoices/:id           // Update invoice
POST   /api/v1/invoices/:id/send      // Send invoice
GET    /api/v1/payments               // List payments
```

## Authentication Implementation

### JWT Token Management
```typescript
// lib/auth/jwt-manager.ts
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export class JWTManager {
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'kanvaro',
      audience: 'kanvaro-users',
    });
  }

  static generateRefreshToken(payload: {
    userId: string;
    email: string;
    organizationId: string;
  }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'kanvaro',
      audience: 'kanvaro-users',
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'kanvaro',
        audience: 'kanvaro-users',
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'kanvaro',
        audience: 'kanvaro-users',
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }
}
```

### Authentication Middleware
```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { JWTManager } from '@/lib/auth/jwt-manager';
import { AUTH_STRATEGY } from '@/lib/auth/auth-strategy';

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if endpoint is public
  if (AUTH_STRATEGY.public.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if token exists
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Verify token
    const payload = JWTManager.verifyAccessToken(token);
    
    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-organization-id', payload.organizationId);
    requestHeaders.set('x-user-permissions', JSON.stringify(payload.permissions));

    // Check admin routes
    if (AUTH_STRATEGY.admin.some(route => pathname.startsWith(route))) {
      if (payload.role !== 'admin' && payload.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

## Rate Limiting Implementation

### Rate Limiting Strategy
```typescript
// lib/rate-limiting/rate-limiter.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private static readonly RATE_LIMIT_PREFIX = 'rate_limit:';
  
  static async checkLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const now = Date.now();
    const window = Math.floor(now / config.windowMs);
    const redisKey = `${this.RATE_LIMIT_PREFIX}${key}:${window}`;
    
    const current = await redis.incr(redisKey);
    await redis.expire(redisKey, Math.ceil(config.windowMs / 1000));
    
    const remaining = Math.max(0, config.maxRequests - current);
    const resetTime = (window + 1) * config.windowMs;
    
    if (current > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }
    
    return {
      allowed: true,
      remaining,
      resetTime
    };
  }

  static async middleware(
    request: NextRequest,
    config: RateLimitConfig
  ): Promise<NextResponse | null> {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    // Create rate limit key
    const key = `${ip}:${userAgent}:${userId}`;
    
    const result = await this.checkLimit(key, config);
    
    if (!result.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': result.retryAfter?.toString() || '0',
          }
        }
      );
    }
    
    return null;
  }
}

// Rate limiting configurations
export const RATE_LIMIT_CONFIGS = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // Project management endpoints
  projects: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // Time tracking endpoints
  timeTracking: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
  },
  
  // Admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
  },
};
```

## Error Handling

### Error Response Structure
```typescript
// lib/errors/api-error.ts
export class APIError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const API_ERRORS = {
  // Authentication errors
  AUTHENTICATION_REQUIRED: new APIError(
    'Authentication required',
    401,
    'AUTHENTICATION_REQUIRED'
  ),
  
  INVALID_CREDENTIALS: new APIError(
    'Invalid credentials',
    401,
    'INVALID_CREDENTIALS'
  ),
  
  TOKEN_EXPIRED: new APIError(
    'Token expired',
    401,
    'TOKEN_EXPIRED'
  ),
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS: new APIError(
    'Insufficient permissions',
    403,
    'INSUFFICIENT_PERMISSIONS'
  ),
  
  RESOURCE_ACCESS_DENIED: new APIError(
    'Resource access denied',
    403,
    'RESOURCE_ACCESS_DENIED'
  ),
  
  // Validation errors
  VALIDATION_ERROR: new APIError(
    'Validation error',
    400,
    'VALIDATION_ERROR'
  ),
  
  INVALID_INPUT: new APIError(
    'Invalid input',
    400,
    'INVALID_INPUT'
  ),
  
  // Resource errors
  RESOURCE_NOT_FOUND: new APIError(
    'Resource not found',
    404,
    'RESOURCE_NOT_FOUND'
  ),
  
  RESOURCE_ALREADY_EXISTS: new APIError(
    'Resource already exists',
    409,
    'RESOURCE_ALREADY_EXISTS'
  ),
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: new APIError(
    'Rate limit exceeded',
    429,
    'RATE_LIMIT_EXCEEDED'
  ),
  
  // Server errors
  INTERNAL_SERVER_ERROR: new APIError(
    'Internal server error',
    500,
    'INTERNAL_SERVER_ERROR'
  ),
  
  DATABASE_ERROR: new APIError(
    'Database error',
    500,
    'DATABASE_ERROR'
  ),
  
  EXTERNAL_SERVICE_ERROR: new APIError(
    'External service error',
    502,
    'EXTERNAL_SERVICE_ERROR'
  ),
};
```

### Error Handler Middleware
```typescript
// middleware/error-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { APIError } from '@/lib/errors/api-error';
import { SecurityLogger } from '@/lib/security/logging';

export function errorHandler(error: Error, request: NextRequest) {
  // Log error
  SecurityLogger.logSecurityEvent('api_error', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // Handle API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      {
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return NextResponse.json(
      {
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // Handle default errors
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}
```

## API Response Standards

### Success Response Format
```typescript
// lib/api/response-formats.ts
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export class APIResponseBuilder {
  static success<T>(data: T, message?: string, meta?: any): APIResponse<T> {
    return {
      success: true,
      data,
      message,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, code: string, statusCode: number): APIResponse {
    return {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): APIResponse<T[]> {
    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
```

### API Endpoint Implementation Example
```typescript
// app/api/v1/projects/route.ts (App Router)
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';
import { APIResponseBuilder } from '@/lib/api/response-formats';
import { APIError } from '@/lib/errors/api-error';
import { errorHandler } from '@/middleware/error-handler';
import { RateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiting/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await RateLimiter.middleware(
      request,
      RATE_LIMIT_CONFIGS.projects
    );
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    await connectDB();

    const userId = request.headers.get('x-user-id') as string;
    const organizationId = request.headers.get('x-organization-id') as string;
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const query: any = { organization: organizationId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    return NextResponse.json(
      APIResponseBuilder.paginated(projects, Number(page), Number(limit), total)
    );
  } catch (error) {
    return errorHandler(error as Error, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await RateLimiter.middleware(
      request,
      RATE_LIMIT_CONFIGS.projects
    );
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    await connectDB();

    const userId = request.headers.get('x-user-id') as string;
    const organizationId = request.headers.get('x-organization-id') as string;
    const body = await request.json();
    const { name, description, startDate, endDate, teamMembers } = body;

    if (!name) {
      throw new APIError('Project name is required', 400, 'VALIDATION_ERROR');
    }

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      createdBy: userId,
      organization: organizationId,
      teamMembers: teamMembers || [userId],
    });

    await project.save();
    await project.populate('createdBy', 'firstName lastName email');
    await project.populate('teamMembers', 'firstName lastName email');

    return NextResponse.json(
      APIResponseBuilder.success(project, 'Project created successfully'),
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as Error, request);
  }
}
```

## API Documentation

### OpenAPI Specification
```yaml
# api-docs/openapi.yml
openapi: 3.0.0
info:
  title: Kanvaro API
  description: Project Management API
  version: 1.0.0
  contact:
    name: Kanvaro Support
    email: support@kanvaro.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.kanvaro.com/v1
    description: Production server
  - url: https://dev-api.kanvaro.com/v1
    description: Development server

security:
  - bearerAuth: []

paths:
  /auth/login:
    post:
      summary: User login
      tags: [Authentication]
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
              required: [email, password]
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      user:
                        $ref: '#/components/schemas/User'
                      accessToken:
                        type: string
                      refreshToken:
                        type: string
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /projects:
    get:
      summary: List projects
      tags: [Projects]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
        - name: status
          in: query
          schema:
            type: string
            enum: [planning, active, on-hold, completed, cancelled]
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Projects retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        role:
          type: string
        organization:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [planning, active, on-hold, completed, cancelled]
        createdBy:
          $ref: '#/components/schemas/User'
        teamMembers:
          type: array
          items:
            $ref: '#/components/schemas/User'
        startDate:
          type: string
          format: date
        endDate:
          type: string
          format: date
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Error:
      type: object
      properties:
        success:
          type: boolean
          default: false
        error:
          type: string
        code:
          type: string
        statusCode:
          type: integer
        timestamp:
          type: string
          format: date-time

    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
```

---

*This REST API design documentation will be updated as new endpoints are added and API features are enhanced.*
