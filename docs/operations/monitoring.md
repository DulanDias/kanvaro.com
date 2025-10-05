---
slug: "operations/monitoring"
title: "System Monitoring and Health Checks"
summary: "Comprehensive monitoring setup for Kanvaro production environments including health checks, metrics collection, alerting, and performance monitoring."
visibility: "internal"
audiences: ["admin", "self_host_admin"]
category: "operations"
order: 20
updated: "2025-01-04"
---

# System Monitoring and Health Checks

## What This Is

This operations guide covers comprehensive monitoring setup for Kanvaro production environments. It includes health check endpoints, metrics collection, alerting systems, and performance monitoring to ensure system reliability and availability.

## Basic Theory

Monitoring follows a multi-layered approach:

- **Application Health**: Internal application status and dependencies
- **Infrastructure Health**: Server resources, containers, and network
- **Business Metrics**: User activity, performance indicators, and business KPIs
- **Security Monitoring**: Access patterns, authentication failures, and security events

## Prerequisites

- Kanvaro production deployment
- Monitoring server or cloud monitoring service
- Administrative access to production environment
- Understanding of system architecture

## Health Check Implementation

### Step 1: Application Health Endpoints

1. **Basic Health Check**:
   ```typescript
   // app/api/health/route.ts
   import { NextResponse } from 'next/server';
   import connectDB from '@/lib/db';
   import { createClient } from 'redis';
   
   export async function GET() {
     const health = {
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       version: process.env.npm_package_version,
       environment: process.env.NODE_ENV
     };
   
     try {
       // Check database connection
       await connectDB();
       health.database = 'connected';
   
       // Check Redis connection
       const redis = createClient({ url: process.env.REDIS_URL });
       await redis.connect();
       await redis.ping();
       health.redis = 'connected';
       await redis.disconnect();
   
       return NextResponse.json(health);
     } catch (error) {
       health.status = 'unhealthy';
       health.error = error.message;
       return NextResponse.json(health, { status: 503 });
     }
   }
   ```

2. **Detailed Health Check**:
   ```typescript
   // app/api/health/detailed/route.ts
   export async function GET() {
     const checks = {
       database: await checkDatabase(),
       redis: await checkRedis(),
       storage: await checkStorage(),
       email: await checkEmail(),
       external_apis: await checkExternalAPIs()
     };
   
     const overallStatus = Object.values(checks).every(check => check.status === 'healthy') 
       ? 'healthy' 
       : 'unhealthy';
   
     return NextResponse.json({
       status: overallStatus,
       timestamp: new Date().toISOString(),
       checks
     });
   }
   ```

### Step 2: Database Health Checks

1. **MongoDB Health Check**:
   ```typescript
   async function checkDatabase() {
     try {
       const start = Date.now();
       await connectDB();
       const responseTime = Date.now() - start;
       
       return {
         status: 'healthy',
         response_time: responseTime,
         connection_pool: await getConnectionPoolStatus()
       };
     } catch (error) {
       return {
         status: 'unhealthy',
         error: error.message
       };
     }
   }
   ```

2. **Redis Health Check**:
   ```typescript
   async function checkRedis() {
     try {
       const redis = createClient({ url: process.env.REDIS_URL });
       await redis.connect();
       
       const start = Date.now();
       await redis.ping();
       const responseTime = Date.now() - start;
       
       const info = await redis.info('memory');
       await redis.disconnect();
       
       return {
         status: 'healthy',
         response_time: responseTime,
         memory_usage: parseRedisMemoryInfo(info)
       };
     } catch (error) {
       return {
         status: 'unhealthy',
         error: error.message
       };
     }
   }
   ```

### Step 3: Storage Health Checks

1. **File System Check**:
   ```typescript
   async function checkStorage() {
     try {
       const uploadDir = process.env.UPLOAD_DIR || './uploads';
       const stats = await fs.stat(uploadDir);
       
       return {
         status: 'healthy',
         path: uploadDir,
         writable: await isWritable(uploadDir),
         free_space: await getFreeSpace(uploadDir)
       };
     } catch (error) {
       return {
         status: 'unhealthy',
         error: error.message
       };
     }
   }
   ```

## Metrics Collection

### Step 1: Application Metrics

1. **Performance Metrics**:
   ```typescript
   // lib/metrics.ts
   import { register, Counter, Histogram, Gauge } from 'prom-client';
   
   export const httpRequestDuration = new Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status_code']
   });
   
   export const httpRequestTotal = new Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'route', 'status_code']
   });
   
   export const activeUsers = new Gauge({
     name: 'active_users',
     help: 'Number of active users'
   });
   
   export const databaseConnections = new Gauge({
     name: 'database_connections_active',
     help: 'Number of active database connections'
   });
   ```

2. **Business Metrics**:
   ```typescript
   export const projectsCreated = new Counter({
     name: 'projects_created_total',
     help: 'Total number of projects created'
   });
   
   export const tasksCompleted = new Counter({
     name: 'tasks_completed_total',
     help: 'Total number of tasks completed',
     labelNames: ['project_id', 'user_id']
   });
   
   export const timeTracked = new Counter({
     name: 'time_tracked_seconds_total',
     help: 'Total time tracked in seconds',
     labelNames: ['project_id', 'user_id']
   });
   ```

### Step 2: System Metrics

1. **Server Resources**:
   ```typescript
   export const memoryUsage = new Gauge({
     name: 'memory_usage_bytes',
     help: 'Memory usage in bytes',
     labelNames: ['type']
   });
   
   export const cpuUsage = new Gauge({
     name: 'cpu_usage_percent',
     help: 'CPU usage percentage'
   });
   
   export const diskUsage = new Gauge({
     name: 'disk_usage_bytes',
     help: 'Disk usage in bytes',
     labelNames: ['mountpoint']
   });
   ```

### Step 3: Custom Metrics Collection

1. **Middleware for Request Metrics**:
   ```typescript
   // middleware/metrics.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { httpRequestDuration, httpRequestTotal } from '@/lib/metrics';
   
   export function metricsMiddleware(req: NextRequest) {
     const start = Date.now();
   
     return (res: NextResponse) => {
       const duration = (Date.now() - start) / 1000;
       const route = req.nextUrl.pathname;
       const method = req.method;
       const statusCode = res.status;
   
       httpRequestDuration
         .labels(method, route, statusCode.toString())
         .observe(duration);
   
       httpRequestTotal
         .labels(method, route, statusCode.toString())
         .inc();
   
       return res;
     };
   }
   ```

## Alerting Configuration

### Step 1: Alert Rules

1. **Application Alerts**:
   ```yaml
   # alerts.yml
   groups:
   - name: kanvaro-app
     rules:
     - alert: ApplicationDown
       expr: up{job="kanvaro"} == 0
       for: 1m
       labels:
         severity: critical
       annotations:
         summary: "Kanvaro application is down"
         description: "Application has been down for more than 1 minute"
   
     - alert: HighErrorRate
       expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
       for: 2m
       labels:
         severity: warning
       annotations:
         summary: "High error rate detected"
         description: "Error rate is {{ $value }} errors per second"
   
     - alert: HighResponseTime
       expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "High response time"
         description: "95th percentile response time is {{ $value }} seconds"
   ```

2. **Infrastructure Alerts**:
   ```yaml
   - name: kanvaro-infrastructure
     rules:
     - alert: HighMemoryUsage
       expr: memory_usage_bytes / memory_total_bytes > 0.9
       for: 5m
       labels:
         severity: warning
       annotations:
         summary: "High memory usage"
         description: "Memory usage is {{ $value }}%"
   
     - alert: DiskSpaceLow
       expr: disk_free_bytes / disk_total_bytes < 0.1
       for: 5m
       labels:
         severity: critical
       annotations:
         summary: "Disk space low"
         description: "Disk space is {{ $value }}% free"
   
     - alert: DatabaseDown
       expr: up{job="mongodb"} == 0
       for: 1m
       labels:
         severity: critical
       annotations:
         summary: "Database is down"
         description: "MongoDB database is not responding"
   ```

### Step 2: Notification Channels

1. **Email Notifications**:
   ```yaml
   # alertmanager.yml
   global:
     smtp_smarthost: 'smtp.gmail.com:587'
     smtp_from: 'alerts@yourdomain.com'
     smtp_auth_username: 'alerts@yourdomain.com'
     smtp_auth_password: 'your-password'
   
   route:
     group_by: ['alertname']
     group_wait: 10s
     group_interval: 10s
     repeat_interval: 1h
     receiver: 'web.hook'
   
   receivers:
   - name: 'web.hook'
     email_configs:
     - to: 'admin@yourdomain.com'
       subject: 'Kanvaro Alert: {{ .GroupLabels.alertname }}'
       body: |
         {{ range .Alerts }}
         Alert: {{ .Annotations.summary }}
         Description: {{ .Annotations.description }}
         {{ end }}
   ```

2. **Slack Notifications**:
   ```yaml
   - name: 'slack'
     slack_configs:
     - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
       channel: '#alerts'
       title: 'Kanvaro Alert'
       text: |
         {{ range .Alerts }}
         *Alert:* {{ .Annotations.summary }}
         *Description:* {{ .Annotations.description }}
         {{ end }}
   ```

## Performance Monitoring

### Step 1: Application Performance

1. **Response Time Monitoring**:
   ```typescript
   // lib/performance.ts
   export class PerformanceMonitor {
     private static instance: PerformanceMonitor;
     private metrics: Map<string, number[]> = new Map();
   
     static getInstance(): PerformanceMonitor {
       if (!PerformanceMonitor.instance) {
         PerformanceMonitor.instance = new PerformanceMonitor();
       }
       return PerformanceMonitor.instance;
     }
   
     recordTiming(operation: string, duration: number) {
       if (!this.metrics.has(operation)) {
         this.metrics.set(operation, []);
       }
       this.metrics.get(operation)!.push(duration);
     }
   
     getAverageTiming(operation: string): number {
       const timings = this.metrics.get(operation) || [];
       return timings.reduce((a, b) => a + b, 0) / timings.length;
     }
   
     getSlowestOperations(limit: number = 10): Array<{operation: string, avg: number}> {
       const operations = Array.from(this.metrics.entries())
         .map(([operation, timings]) => ({
           operation,
           avg: this.getAverageTiming(operation)
         }))
         .sort((a, b) => b.avg - a.avg)
         .slice(0, limit);
   
       return operations;
     }
   }
   ```

2. **Database Query Monitoring**:
   ```typescript
   // lib/db-monitor.ts
   export function monitorDatabaseQuery(query: string, duration: number) {
     if (duration > 1000) { // Log slow queries
       console.warn(`Slow query detected: ${query} took ${duration}ms`);
     }
   
     // Record metrics
     PerformanceMonitor.getInstance().recordTiming(`db_query_${query}`, duration);
   }
   ```

### Step 2: User Experience Monitoring

1. **Page Load Times**:
   ```typescript
   // components/PerformanceMonitor.tsx
   'use client';
   
   import { useEffect } from 'react';
   
   export function PerformanceMonitor() {
     useEffect(() => {
       if (typeof window !== 'undefined' && 'performance' in window) {
         const observer = new PerformanceObserver((list) => {
           for (const entry of list.getEntries()) {
             if (entry.entryType === 'navigation') {
               const navEntry = entry as PerformanceNavigationTiming;
               console.log('Page load time:', navEntry.loadEventEnd - navEntry.navigationStart);
             }
           }
         });
   
         observer.observe({ entryTypes: ['navigation'] });
       }
     }, []);
   
     return null;
   }
   ```

## Log Analysis

### Step 1: Structured Logging

1. **Log Format Configuration**:
   ```typescript
   // lib/logger.ts
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     defaultMeta: {
       service: 'kanvaro',
       version: process.env.npm_package_version
     },
     transports: [
       new winston.transports.File({ 
         filename: 'logs/error.log', 
         level: 'error' 
       }),
       new winston.transports.File({ 
         filename: 'logs/combined.log' 
       })
     ]
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   
   export default logger;
   ```

2. **Application Logging**:
   ```typescript
   // Usage examples
   import logger from '@/lib/logger';
   
   // Info logging
   logger.info('User logged in', { userId, email });
   
   // Error logging
   logger.error('Database connection failed', { error: error.message, stack: error.stack });
   
   // Performance logging
   logger.info('Slow query detected', { query, duration, userId });
   ```

### Step 2: Log Aggregation

1. **ELK Stack Configuration**:
   ```yaml
   # docker-compose.monitoring.yml
   version: '3.8'
   
   services:
     elasticsearch:
       image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
       environment:
         - discovery.type=single-node
         - xpack.security.enabled=false
       ports:
         - "9200:9200"
   
     logstash:
       image: docker.elastic.co/logstash/logstash:8.8.0
       volumes:
         - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
       ports:
         - "5044:5044"
   
     kibana:
       image: docker.elastic.co/kibana/kibana:8.8.0
       ports:
         - "5601:5601"
       environment:
         - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
   ```

## Dashboard Configuration

### Step 1: Grafana Dashboard

1. **Application Dashboard**:
   ```json
   {
     "dashboard": {
       "title": "Kanvaro Application",
       "panels": [
         {
           "title": "Request Rate",
           "type": "graph",
           "targets": [
             {
               "expr": "rate(http_requests_total[5m])",
               "legendFormat": "{{method}} {{route}}"
             }
           ]
         },
         {
           "title": "Response Time",
           "type": "graph",
           "targets": [
             {
               "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
               "legendFormat": "95th percentile"
             }
           ]
         }
       ]
     }
   }
   ```

### Step 2: Custom Dashboards

1. **Business Metrics Dashboard**:
   - Active users over time
   - Projects created per day
   - Tasks completed per user
   - Time tracking trends
   - Revenue metrics (if applicable)

## Troubleshooting

### Common Issues

**Health Check Failures**
- Check service dependencies
- Verify network connectivity
- Review application logs
- Test individual components

**High Response Times**
- Check database performance
- Review query optimization
- Monitor memory usage
- Check for blocking operations

**Memory Leaks**
- Monitor memory usage over time
- Check for unclosed connections
- Review garbage collection
- Analyze heap dumps

### Performance Optimization

1. **Database Optimization**:
   - Add missing indexes
   - Optimize slow queries
   - Configure connection pooling
   - Monitor query performance

2. **Application Optimization**:
   - Implement caching strategies
   - Optimize image processing
   - Use CDN for static assets
   - Implement lazy loading

## Maintenance Procedures

### Daily Monitoring
- Review health check status
- Check error rates
- Monitor response times
- Review security alerts

### Weekly Analysis
- Analyze performance trends
- Review capacity planning
- Check backup status
- Update monitoring rules

### Monthly Review
- Review alert effectiveness
- Optimize monitoring configuration
- Plan capacity upgrades
- Security audit

---

*This guide covers comprehensive monitoring setup. For backup and recovery procedures, see the [Backup and Recovery Guide](../operations/backup-recovery.md).*
