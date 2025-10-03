# Kanvaro - Production Readiness & Deployment

## Overview

Kanvaro is designed for production-grade deployment with enterprise-level security, scalability, and reliability. This document outlines the complete production deployment strategy, monitoring, and maintenance procedures.

## Production Architecture

### High-Availability Deployment
```
┌─────────────────────────────────────────────────────────┐
│                    Production Stack                    │
├─────────────────────────────────────────────────────────┤
│  Load Balancer (Nginx/HAProxy)                        │
│  ├── SSL Termination                                   │
│  ├── Rate Limiting                                     │
│  └── DDoS Protection                                   │
├─────────────────────────────────────────────────────────┤
│  Application Layer (Multiple Instances)               │
│  ├── Kanvaro App (Next.js)                            │
│  ├── API Gateway                                       │
│  └── Background Workers                                │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                            │
│  ├── MongoDB (Replica Set)                             │
│  ├── Redis (Cluster)                                   │
│  └── File Storage (S3/MinIO)                           │
├─────────────────────────────────────────────────────────┤
│  Monitoring & Logging                                  │
│  ├── Prometheus + Grafana                              │
│  ├── ELK Stack (Elasticsearch, Logstash, Kibana)      │
│  └── Alert Manager                                     │
└─────────────────────────────────────────────────────────┘
```

## Production Deployment

### Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - kanvaro-app-1
      - kanvaro-app-2
    restart: unless-stopped

  # Application Instances
  kanvaro-app-1:
    build: .
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/kanvaro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  kanvaro-app-2:
    build: .
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/kanvaro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  # Database
  mongodb:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/mongod.conf:/etc/mongod.conf
    ports:
      - "27017:27017"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
        reservations:
          memory: 2G
          cpus: '1.0'

  # Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "6379:6379"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  # Background Workers
  worker:
    build: .
    command: npm run worker
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/kanvaro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./logs:/app/logs
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

### Nginx Configuration
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Upstream servers
    upstream kanvaro_backend {
        least_conn;
        server kanvaro-app-1:3000 max_fails=3 fail_timeout=30s;
        server kanvaro-app-2:3000 max_fails=3 fail_timeout=30s;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://kanvaro_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Auth routes with stricter rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://kanvaro_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://kanvaro_backend;
        }

        # Main application
        location / {
            proxy_pass http://kanvaro_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
    }
}
```

## Monitoring & Observability

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'kanvaro-app'
    static_configs:
      - targets: ['kanvaro-app-1:3000', 'kanvaro-app-2:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 5s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']
    scrape_interval: 30s
```

### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "Kanvaro Production Dashboard",
    "panels": [
      {
        "title": "Application Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"kanvaro-app\"}",
            "legendFormat": "{{instance}}"
          }
        ]
      },
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
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "mongodb_connections_current",
            "legendFormat": "Current connections"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_resident_memory_bytes",
            "legendFormat": "{{instance}}"
          }
        ]
      }
    ]
  }
}
```

### Alert Rules
```yaml
# monitoring/alert_rules.yml
groups:
  - name: kanvaro_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseDown
        expr: up{job="mongodb"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "MongoDB instance is not responding"

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 / 1024 > 1.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }} GB"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk space is {{ $value }}% full"
```

## Backup & Recovery

### Database Backup
```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups/kanvaro"
DATE=$(date +%Y%m%d_%H%M%S)
MONGO_URI="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017"

# Create backup directory
mkdir -p $BACKUP_DIR

# MongoDB backup
echo "Starting MongoDB backup..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongodb_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/mongodb_$DATE.tar.gz" -C "$BACKUP_DIR" "mongodb_$DATE"
rm -rf "$BACKUP_DIR/mongodb_$DATE"

# Redis backup
echo "Starting Redis backup..."
redis-cli -h redis -a "$REDIS_PASSWORD" --rdb "$BACKUP_DIR/redis_$DATE.rdb"

# File backup
echo "Starting file backup..."
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" -C /app uploads

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Recovery Script
```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_DIR="/backups/kanvaro"
BACKUP_DATE=$1

if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: $0 <backup_date>"
    echo "Available backups:"
    ls -la $BACKUP_DIR/*.tar.gz | awk '{print $9}' | sed 's/.*mongodb_\(.*\)\.tar\.gz/\1/'
    exit 1
fi

MONGO_URI="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017"

echo "Starting restore from backup: $BACKUP_DATE"

# Stop application
docker-compose stop kanvaro-app-1 kanvaro-app-2

# Restore MongoDB
echo "Restoring MongoDB..."
tar -xzf "$BACKUP_DIR/mongodb_$BACKUP_DATE.tar.gz" -C /tmp
mongorestore --uri="$MONGO_URI" /tmp/mongodb_$BACKUP_DATE

# Restore Redis
echo "Restoring Redis..."
redis-cli -h redis -a "$REDIS_PASSWORD" --rdb "$BACKUP_DIR/redis_$BACKUP_DATE.rdb"

# Restore files
echo "Restoring files..."
tar -xzf "$BACKUP_DIR/files_$BACKUP_DATE.tar.gz" -C /app

# Start application
docker-compose start kanvaro-app-1 kanvaro-app-2

echo "Restore completed"
```

## Security Hardening

### Container Security
```dockerfile
# Dockerfile.production
FROM node:18-alpine AS base

# Security: Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S kanvaro -u 1001

# Security: Update packages
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Security: Remove unnecessary packages
RUN apk del --purge

# Security: Set proper permissions
RUN chown -R kanvaro:nodejs /app
USER kanvaro

# Security: Use multi-stage build
FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS runtime
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=kanvaro:nodejs . .

# Security: Remove development dependencies
RUN npm prune --production

# Security: Use dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### Security Headers
```typescript
// middleware/security.ts
import { NextRequest, NextResponse } from 'next/server';

export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
  
  return response;
}
```

## Performance Optimization

### Caching Strategy
```typescript
// lib/cache/redis-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export class RedisCache {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  static async del(key: string): Promise<void> {
    await redis.del(key);
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### Database Optimization
```typescript
// lib/database/optimization.ts
export class DatabaseOptimizer {
  static async createIndexes(): Promise<void> {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ organization: 1, role: 1 });
    await User.collection.createIndex({ isActive: 1 });

    // Project indexes
    await Project.collection.createIndex({ organization: 1, status: 1 });
    await Project.collection.createIndex({ createdBy: 1 });
    await Project.collection.createIndex({ teamMembers: 1 });
    await Project.collection.createIndex({ startDate: 1, endDate: 1 });

    // Task indexes
    await Task.collection.createIndex({ project: 1, status: 1 });
    await Task.collection.createIndex({ assignedTo: 1 });
    await Task.collection.createIndex({ createdBy: 1 });
    await Task.collection.createIndex({ dueDate: 1 });
    await Task.collection.createIndex({ tags: 1 });

    // Time entry indexes
    await TimeEntry.collection.createIndex({ user: 1, date: 1 });
    await TimeEntry.collection.createIndex({ project: 1, date: 1 });
    await TimeEntry.collection.createIndex({ task: 1 });
  }

  static async optimizeQueries(): Promise<void> {
    // Enable query profiling
    await mongoose.connection.db.command({ profile: 2, slowms: 100 });
  }
}
```

## Deployment Automation

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - run: npm run security:scan

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
      - name: Run health checks
        run: |
          sleep 30
          curl -f http://localhost/health || exit 1
```

### Health Checks
```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      cache: 'unknown',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };

  try {
    // Check database
    await connectDB();
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'unhealthy';
  }

  try {
    // Check Redis
    await redis.ping();
    health.services.cache = 'healthy';
  } catch (error) {
    health.services.cache = 'unhealthy';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}
```

---

*This production readiness guide will be updated as new deployment strategies and monitoring solutions are implemented.*
