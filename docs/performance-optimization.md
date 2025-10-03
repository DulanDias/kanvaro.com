# Kanvaro - Performance Optimization & Caching Strategies

## Overview

Kanvaro implements comprehensive performance optimization strategies including Redis caching, database query optimization, CDN integration, and advanced caching patterns. The system is designed to handle high traffic loads with sub-second response times.

## Performance Architecture

### Performance Stack
```
┌─────────────────────────────────────────────────────────┐
│                Performance Stack                      │
├─────────────────────────────────────────────────────────┤
│  CDN (CloudFront) → Load Balancer → App Server       │
│  ├── Static Assets Caching                           │
│  ├── API Response Caching                            │
│  └── Global Content Delivery                         │
├─────────────────────────────────────────────────────────┤
│  Redis Cache Layer                                    │
│  ├── Session Management                              │
│  ├── API Response Caching                            │
│  ├── Database Query Caching                          │
│  └── Real-time Data Caching                           │
├─────────────────────────────────────────────────────────┤
│  Database Optimization                                │
│  ├── Indexing Strategy                               │
│  ├── Query Optimization                              │
│  ├── Connection Pooling                              │
│  └── Read Replicas                                   │
└─────────────────────────────────────────────────────────┘
```

## Redis Caching Implementation

### Cache Configuration
```typescript
// lib/cache/redis-config.ts
import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

export const redis = new Redis(redisConfig);
export const redisCluster = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 },
], {
  redisOptions: redisConfig,
  enableReadyCheck: false,
  scaleReads: 'slave',
});

// Cache key prefixes
export const CACHE_KEYS = {
  USER: 'user:',
  PROJECT: 'project:',
  TASK: 'task:',
  TEAM: 'team:',
  SESSION: 'session:',
  API_RESPONSE: 'api:',
  PERMISSIONS: 'permissions:',
  ORGANIZATION: 'organization:',
} as const;
```

### Cache Service
```typescript
// lib/cache/cache-service.ts
import { redis } from './redis-config';
import { CACHE_KEYS } from './redis-config';

export class CacheService {
  // Generic cache operations
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // User-specific caching
  static async getUser(userId: string): Promise<any | null> {
    return this.get(`${CACHE_KEYS.USER}${userId}`);
  }

  static async setUser(userId: string, userData: any, ttl: number = 1800): Promise<boolean> {
    return this.set(`${CACHE_KEYS.USER}${userId}`, userData, ttl);
  }

  static async invalidateUser(userId: string): Promise<boolean> {
    return this.del(`${CACHE_KEYS.USER}${userId}`);
  }

  // Project-specific caching
  static async getProject(projectId: string): Promise<any | null> {
    return this.get(`${CACHE_KEYS.PROJECT}${projectId}`);
  }

  static async setProject(projectId: string, projectData: any, ttl: number = 3600): Promise<boolean> {
    return this.set(`${CACHE_KEYS.PROJECT}${projectId}`, projectData, ttl);
  }

  static async invalidateProject(projectId: string): Promise<boolean> {
    return this.del(`${CACHE_KEYS.PROJECT}${projectId}`);
  }

  // Task-specific caching
  static async getTask(taskId: string): Promise<any | null> {
    return this.get(`${CACHE_KEYS.TASK}${taskId}`);
  }

  static async setTask(taskId: string, taskData: any, ttl: number = 1800): Promise<boolean> {
    return this.set(`${CACHE_KEYS.TASK}${taskId}`, taskData, ttl);
  }

  static async invalidateTask(taskId: string): Promise<boolean> {
    return this.del(`${CACHE_KEYS.TASK}${taskId}`);
  }

  // API response caching
  static async getApiResponse(endpoint: string, params: any): Promise<any | null> {
    const key = `${CACHE_KEYS.API_RESPONSE}${endpoint}:${JSON.stringify(params)}`;
    return this.get(key);
  }

  static async setApiResponse(endpoint: string, params: any, response: any, ttl: number = 300): Promise<boolean> {
    const key = `${CACHE_KEYS.API_RESPONSE}${endpoint}:${JSON.stringify(params)}`;
    return this.set(key, response, ttl);
  }

  // Permission caching
  static async getUserPermissions(userId: string): Promise<string[] | null> {
    return this.get(`${CACHE_KEYS.PERMISSIONS}${userId}`);
  }

  static async setUserPermissions(userId: string, permissions: string[], ttl: number = 3600): Promise<boolean> {
    return this.set(`${CACHE_KEYS.PERMISSIONS}${userId}`, permissions, ttl);
  }

  static async invalidateUserPermissions(userId: string): Promise<boolean> {
    return this.del(`${CACHE_KEYS.PERMISSIONS}${userId}`);
  }

  // Batch operations
  static async mget(keys: string[]): Promise<(any | null)[]> {
    try {
      const values = await redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  static async mset(keyValuePairs: Record<string, any>, ttl: number = 3600): Promise<boolean> {
    try {
      const pipeline = redis.pipeline();
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value));
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Cache invalidation patterns
  static async invalidateUserRelated(userId: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.USER}${userId}`,
      `${CACHE_KEYS.PERMISSIONS}${userId}`,
      `${CACHE_KEYS.SESSION}*${userId}*`,
    ];
    
    await Promise.all(patterns.map(pattern => {
      if (pattern.includes('*')) {
        return redis.eval(`
          local keys = redis.call('keys', ARGV[1])
          for i=1,#keys,5000 do
            redis.call('del', unpack(keys, i, math.min(i+4999, #keys)))
          end
        `, 0, pattern);
      } else {
        return redis.del(pattern);
      }
    }));
  }

  static async invalidateProjectRelated(projectId: string): Promise<void> {
    const patterns = [
      `${CACHE_KEYS.PROJECT}${projectId}`,
      `${CACHE_KEYS.TASK}*`,
      `${CACHE_KEYS.API_RESPONSE}*projects*`,
    ];
    
    await Promise.all(patterns.map(pattern => {
      if (pattern.includes('*')) {
        return redis.eval(`
          local keys = redis.call('keys', ARGV[1])
          for i=1,#keys,5000 do
            redis.call('del', unpack(keys, i, math.min(i+4999, #keys)))
          end
        `, 0, pattern);
      } else {
        return redis.del(pattern);
      }
    }));
  }
}
```

### Cache Middleware
```typescript
// middleware/cache-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { CacheService } from '@/lib/cache/cache-service';

export function cacheMiddleware(ttl: number = 300) {
  return async (request: NextRequest) => {
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const params = Object.fromEntries(url.searchParams);
    
    // Check cache first
    const cachedResponse = await CacheService.getApiResponse(endpoint, params);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-TTL': ttl.toString(),
        },
      });
    }

    // Continue to handler
    const response = await NextResponse.next();
    
    // Cache successful responses
    if (response.status === 200) {
      const responseData = await response.clone().json();
      await CacheService.setApiResponse(endpoint, params, responseData, ttl);
    }

    return response;
  };
}

export function cacheUserData(ttl: number = 1800) {
  return async (request: NextRequest) => {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.next();
    }

    // Check if user data is cached
    const cachedUser = await CacheService.getUser(userId);
    if (cachedUser) {
      // Add cached user data to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-cached-user', JSON.stringify(cachedUser));
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  };
}
```

## Database Query Optimization

### Indexing Strategy
```typescript
// lib/database/indexes.ts
import { connectDB } from './connection';

export async function createIndexes() {
  const db = await connectDB();

  // User indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ organization: 1 });
  await db.collection('users').createIndex({ role: 1 });
  await db.collection('users').createIndex({ isActive: 1 });
  await db.collection('users').createIndex({ createdAt: -1 });

  // Project indexes
  await db.collection('projects').createIndex({ organization: 1 });
  await db.collection('projects').createIndex({ createdBy: 1 });
  await db.collection('projects').createIndex({ status: 1 });
  await db.collection('projects').createIndex({ teamMembers: 1 });
  await db.collection('projects').createIndex({ createdAt: -1 });
  await db.collection('projects').createIndex({ 
    organization: 1, 
    status: 1, 
    createdAt: -1 
  });

  // Task indexes
  await db.collection('tasks').createIndex({ project: 1 });
  await db.collection('tasks').createIndex({ assignedTo: 1 });
  await db.collection('tasks').createIndex({ status: 1 });
  await db.collection('tasks').createIndex({ priority: 1 });
  await db.collection('tasks').createIndex({ dueDate: 1 });
  await db.collection('tasks').createIndex({ 
    project: 1, 
    status: 1, 
    priority: 1 
  });

  // Time tracking indexes
  await db.collection('timetracking').createIndex({ user: 1 });
  await db.collection('timetracking').createIndex({ project: 1 });
  await db.collection('timetracking').createIndex({ task: 1 });
  await db.collection('timetracking').createIndex({ date: -1 });
  await db.collection('timetracking').createIndex({ 
    user: 1, 
    date: -1 
  });

  // Financial indexes
  await db.collection('expenses').createIndex({ project: 1 });
  await db.collection('expenses').createIndex({ user: 1 });
  await db.collection('expenses').createIndex({ status: 1 });
  await db.collection('expenses').createIndex({ date: -1 });

  // Invoice indexes
  await db.collection('invoices').createIndex({ project: 1 });
  await db.collection('invoices').createIndex({ client: 1 });
  await db.collection('invoices').createIndex({ status: 1 });
  await db.collection('invoices').createIndex({ dueDate: 1 });
  await db.collection('invoices').createIndex({ createdAt: -1 });

  // Session indexes
  await db.collection('sessions').createIndex({ userId: 1 });
  await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // Activity log indexes
  await db.collection('activitylogs').createIndex({ userId: 1 });
  await db.collection('activitylogs').createIndex({ project: 1 });
  await db.collection('activitylogs').createIndex({ action: 1 });
  await db.collection('activitylogs').createIndex({ timestamp: -1 });
  await db.collection('activitylogs').createIndex({ 
    userId: 1, 
    timestamp: -1 
  });
}
```

### Query Optimization Service
```typescript
// lib/database/query-optimizer.ts
import { CacheService } from '@/lib/cache/cache-service';
import { Project } from '@/models/Project';
import { Task } from '@/models/Task';
import { User } from '@/models/User';

export class QueryOptimizer {
  // Optimized project queries
  static async getProjects(organizationId: string, filters: any = {}) {
    const cacheKey = `projects:${organizationId}:${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Build optimized query
    const query: any = { organization: organizationId };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Use aggregation pipeline for better performance
    const projects = await Project.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teamMembers',
          foreignField: '_id',
          as: 'teamMembers',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1 } }
          ]
        }
      },
      {
        $addFields: {
          createdBy: { $arrayElemAt: ['$createdBy', 0] },
          teamMemberCount: { $size: '$teamMembers' }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (filters.page - 1) * (filters.limit || 10) },
      { $limit: filters.limit || 10 }
    ]);

    // Cache the result
    await CacheService.set(cacheKey, projects, 300);

    return projects;
  }

  // Optimized task queries
  static async getTasks(projectId: string, filters: any = {}) {
    const cacheKey = `tasks:${projectId}:${JSON.stringify(filters)}`;
    
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const query: any = { project: projectId };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    const tasks = await Task.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1 } }
          ]
        }
      },
      {
        $addFields: {
          assignedTo: { $arrayElemAt: ['$assignedTo', 0] },
          createdBy: { $arrayElemAt: ['$createdBy', 0] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (filters.page - 1) * (filters.limit || 20) },
      { $limit: filters.limit || 20 }
    ]);

    await CacheService.set(cacheKey, tasks, 180);

    return tasks;
  }

  // Optimized user queries
  static async getUsers(organizationId: string, filters: any = {}) {
    const cacheKey = `users:${organizationId}:${JSON.stringify(filters)}`;
    
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const query: any = { organization: organizationId, isActive: true };
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('firstName lastName email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * (filters.limit || 20))
      .limit(filters.limit || 20);

    await CacheService.set(cacheKey, users, 600);

    return users;
  }

  // Batch operations for better performance
  static async getBatchData(requests: Array<{
    type: 'user' | 'project' | 'task';
    id: string;
  }>) {
    const cacheKeys = requests.map(req => `${req.type}:${req.id}`);
    const cached = await CacheService.mget(cacheKeys);
    
    const missing = requests.filter((_, index) => !cached[index]);
    const results = [...cached];

    if (missing.length > 0) {
      // Batch fetch missing data
      const userIds = missing.filter(r => r.type === 'user').map(r => r.id);
      const projectIds = missing.filter(r => r.type === 'project').map(r => r.id);
      const taskIds = missing.filter(r => r.type === 'task').map(r => r.id);

      const [users, projects, tasks] = await Promise.all([
        userIds.length ? User.find({ _id: { $in: userIds } }) : [],
        projectIds.length ? Project.find({ _id: { $in: projectIds } }) : [],
        taskIds.length ? Task.find({ _id: { $in: taskIds } }) : [],
      ]);

      // Update results and cache
      const cacheUpdates: Record<string, any> = {};
      
      missing.forEach((req, index) => {
        const originalIndex = requests.findIndex(r => r.id === req.id && r.type === req.type);
        
        if (req.type === 'user') {
          const user = users.find(u => u._id.toString() === req.id);
          results[originalIndex] = user;
          if (user) cacheUpdates[`user:${req.id}`] = user;
        } else if (req.type === 'project') {
          const project = projects.find(p => p._id.toString() === req.id);
          results[originalIndex] = project;
          if (project) cacheUpdates[`project:${req.id}`] = project;
        } else if (req.type === 'task') {
          const task = tasks.find(t => t._id.toString() === req.id);
          results[originalIndex] = task;
          if (task) cacheUpdates[`task:${req.id}`] = task;
        }
      });

      // Cache the fetched data
      if (Object.keys(cacheUpdates).length > 0) {
        await CacheService.mset(cacheUpdates, 300);
      }
    }

    return results;
  }
}
```

## CDN and Static Asset Optimization

### CDN Configuration
```typescript
// lib/cdn/cloudfront-config.ts
export const CDN_CONFIG = {
  distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
  domainName: process.env.CLOUDFRONT_DOMAIN,
  cacheBehaviors: {
    static: {
      pathPattern: '/static/*',
      ttl: 31536000, // 1 year
      compress: true,
    },
    api: {
      pathPattern: '/api/*',
      ttl: 300, // 5 minutes
      compress: true,
    },
    images: {
      pathPattern: '/images/*',
      ttl: 86400, // 1 day
      compress: true,
    },
  },
  headers: {
    'Cache-Control': 'public, max-age=31536000',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
};

export class CDNService {
  static async invalidateCache(paths: string[]): Promise<void> {
    // Implementation for CloudFront cache invalidation
    const cloudfront = new AWS.CloudFront();
    
    await cloudfront.createInvalidation({
      DistributionId: CDN_CONFIG.distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
        CallerReference: `invalidation-${Date.now()}`,
      },
    }).promise();
  }

  static async uploadAsset(file: Buffer, key: string): Promise<string> {
    const s3 = new AWS.S3();
    
    await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: this.getContentType(key),
      CacheControl: 'public, max-age=31536000',
    }).promise();

    return `https://${CDN_CONFIG.domainName}/${key}`;
  }

  private static getContentType(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      'js': 'application/javascript',
      'css': 'text/css',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
    };
    return types[ext || ''] || 'application/octet-stream';
  }
}
```

### Image Optimization
```typescript
// lib/optimization/image-optimizer.ts
import sharp from 'sharp';

export class ImageOptimizer {
  static async optimizeImage(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp',
    } = options;

    return sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();
  }

  static async generateThumbnail(
    buffer: Buffer,
    size: number = 150
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  static async generateResponsiveImages(
    buffer: Buffer,
    sizes: number[] = [320, 640, 768, 1024, 1280]
  ): Promise<Record<string, Buffer>> {
    const results: Record<string, Buffer> = {};

    await Promise.all(
      sizes.map(async (size) => {
        const optimized = await sharp(buffer)
          .resize(size, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();

        results[`${size}w`] = optimized;
      })
    );

    return results;
  }
}
```

## Performance Monitoring

### Performance Metrics
```typescript
// lib/monitoring/performance-metrics.ts
export class PerformanceMetrics {
  static async trackApiPerformance(
    endpoint: string,
    duration: number,
    statusCode: number
  ): Promise<void> {
    // Track API performance metrics
    const metrics = {
      endpoint,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
      success: statusCode < 400,
    };

    // Send to monitoring service
    await this.sendMetrics('api_performance', metrics);
  }

  static async trackCachePerformance(
    operation: 'hit' | 'miss',
    key: string,
    duration: number
  ): Promise<void> {
    const metrics = {
      operation,
      key,
      duration,
      timestamp: new Date().toISOString(),
    };

    await this.sendMetrics('cache_performance', metrics);
  }

  static async trackDatabasePerformance(
    query: string,
    duration: number,
    resultCount: number
  ): Promise<void> {
    const metrics = {
      query: query.substring(0, 100), // Truncate for privacy
      duration,
      resultCount,
      timestamp: new Date().toISOString(),
    };

    await this.sendMetrics('database_performance', metrics);
  }

  private static async sendMetrics(type: string, data: any): Promise<void> {
    // Implementation for sending metrics to monitoring service
    // This could be CloudWatch, DataDog, New Relic, etc.
    console.log(`[${type}]`, data);
  }
}
```

### Performance Middleware
```typescript
// middleware/performance-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMetrics } from '@/lib/monitoring/performance-metrics';

export function performanceMiddleware() {
  return async (request: NextRequest) => {
    const start = Date.now();
    const endpoint = request.nextUrl.pathname;

    // Continue to handler
    const response = await NextResponse.next();

    // Track performance
    const duration = Date.now() - start;
    await PerformanceMetrics.trackApiPerformance(
      endpoint,
      duration,
      response.status
    );

    // Add performance headers
    response.headers.set('X-Response-Time', `${duration}ms`);
    response.headers.set('X-Cache', 'MISS');

    return response;
  };
}
```

## Caching Strategies

### Cache-Aside Pattern
```typescript
// lib/cache/cache-aside.ts
export class CacheAside {
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Try to get from cache
    const cached = await CacheService.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const data = await fetcher();
    
    // Store in cache
    await CacheService.set(key, data, ttl);
    
    return data;
  }
}
```

### Write-Through Pattern
```typescript
// lib/cache/write-through.ts
export class WriteThrough {
  static async set<T>(
    key: string,
    value: T,
    writer: (value: T) => Promise<void>,
    ttl: number = 3600
  ): Promise<void> {
    // Write to cache
    await CacheService.set(key, value, ttl);
    
    // Write to persistent storage
    await writer(value);
  }
}
```

### Cache Invalidation Strategies
```typescript
// lib/cache/invalidation-strategies.ts
export class CacheInvalidation {
  // Time-based invalidation
  static async setWithTTL(key: string, value: any, ttl: number): Promise<void> {
    await CacheService.set(key, value, ttl);
  }

  // Event-based invalidation
  static async invalidateOnUpdate(entityType: string, entityId: string): Promise<void> {
    const patterns = [
      `${entityType}:${entityId}`,
      `api:*${entityType}*`,
      `api:*${entityId}*`,
    ];

    await Promise.all(
      patterns.map(pattern => 
        CacheService.invalidatePattern(pattern)
      )
    );
  }

  // Tag-based invalidation
  static async setWithTags(
    key: string,
    value: any,
    tags: string[],
    ttl: number = 3600
  ): Promise<void> {
    await CacheService.set(key, value, ttl);
    
    // Store tag relationships
    await Promise.all(
      tags.map(tag => 
        CacheService.sadd(`tag:${tag}`, key)
      )
    );
  }

  static async invalidateByTag(tag: string): Promise<void> {
    const keys = await CacheService.smembers(`tag:${tag}`);
    await Promise.all(
      keys.map(key => CacheService.del(key))
    );
    await CacheService.del(`tag:${tag}`);
  }
}
```

## Database Connection Pooling

### Connection Pool Configuration
```typescript
// lib/database/connection-pool.ts
import mongoose from 'mongoose';

const connectionOptions = {
  maxPoolSize: 10, // Maximum number of connections
  minPoolSize: 5,  // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try to connect
  socketTimeoutMS: 45000, // How long to wait for a response
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  retryWrites: true,
  retryReads: true,
};

export async function createConnectionPool() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, connectionOptions);
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}
```

---

*This performance optimization documentation will be updated as new optimization strategies are implemented and performance requirements evolve.*
