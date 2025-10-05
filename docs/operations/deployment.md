---
slug: "operations/deployment"
title: "Production Deployment Guide"
summary: "Comprehensive production deployment guide covering Docker setup, environment configuration, monitoring, backup strategies, and troubleshooting for system administrators."
visibility: "internal"
audiences: ["admin", "self_host_admin"]
category: "operations"
order: 10
updated: "2025-01-04"
---

# Production Deployment Guide

## What This Is

This internal operations guide provides detailed instructions for deploying Kanvaro in production environments. It covers Docker configuration, environment setup, monitoring, backup strategies, and troubleshooting procedures for system administrators.

## Basic Theory

Production deployment follows a containerized approach using Docker and Docker Compose:

- **Application Container**: Next.js application with Node.js runtime
- **Database Container**: MongoDB for data persistence
- **Redis Container**: Session storage and caching
- **Reverse Proxy**: Nginx for SSL termination and load balancing
- **Monitoring Stack**: Health checks, logging, and metrics collection

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- Minimum 4GB RAM, 2 CPU cores, 50GB storage

## Production Environment Setup

### Step 1: Server Preparation

1. **Update System**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

### Step 2: Environment Configuration

1. **Create Production Environment File**:
   ```bash
   cp .env.example .env.production
   ```

2. **Configure Environment Variables**:
   ```env
   # Application
   NODE_ENV=production
   PORT=3000
   HOST=0.0.0.0
   
   # Database
   MONGODB_URI=mongodb://mongo:27017/kanvaro_prod
   REDIS_URL=redis://redis:6379
   
   # Security
   JWT_SECRET=your-super-secure-jwt-secret
   JWT_REFRESH_SECRET=your-super-secure-refresh-secret
   ENCRYPTION_KEY=your-32-character-encryption-key
   
   # Email
   SMTP_HOST=your-smtp-server
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your-email-password
   
   # File Storage
   UPLOAD_DIR=/app/uploads
   MAX_FILE_SIZE=10485760
   
   # Monitoring
   HEALTH_CHECK_INTERVAL=30000
   LOG_LEVEL=info
   ```

### Step 3: Docker Compose Configuration

1. **Production Docker Compose**:
   ```yaml
   version: '3.8'
   
   services:
     app:
       build:
         context: .
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       env_file:
         - .env.production
       volumes:
         - ./uploads:/app/uploads
         - ./logs:/app/logs
       depends_on:
         - mongo
         - redis
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   
     mongo:
       image: mongo:6.0
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
         - ./mongo-init:/docker-entrypoint-initdb.d
       restart: unless-stopped
       command: mongod --auth
   
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
       volumes:
         - redis_data:/data
       restart: unless-stopped
       command: redis-server --appendonly yes
   
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/nginx/ssl
       depends_on:
         - app
       restart: unless-stopped
   
   volumes:
     mongo_data:
     redis_data:
   ```

### Step 4: SSL Configuration

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Configure Auto-renewal**:
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Step 5: Nginx Configuration

1. **Nginx Configuration**:
   ```nginx
   upstream kanvaro {
       server app:3000;
   }
   
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
   
       ssl_certificate /etc/nginx/ssl/fullchain.pem;
       ssl_certificate_key /etc/nginx/ssl/privkey.pem;
   
       location / {
           proxy_pass http://kanvaro;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   
       location /api/health {
           access_log off;
           proxy_pass http://kanvaro;
       }
   }
   ```

## Monitoring and Logging

### Step 1: Health Monitoring

1. **Application Health Check**:
   ```javascript
   // api/health/route.ts
   export async function GET() {
     try {
       await connectDB();
       await redis.ping();
       return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
     } catch (error) {
       return Response.json({ status: 'unhealthy', error: error.message }, { status: 500 });
     }
   }
   ```

2. **System Monitoring**:
   ```bash
   # Install monitoring tools
   sudo apt install htop iotop nethogs
   
   # Monitor system resources
   htop
   iotop
   nethogs
   ```

### Step 2: Log Management

1. **Application Logging**:
   ```javascript
   // lib/logger.ts
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
       new winston.transports.File({ filename: 'logs/combined.log' }),
     ],
   });
   ```

2. **Log Rotation**:
   ```bash
   # Configure logrotate
   sudo nano /etc/logrotate.d/kanvaro
   
   # Add:
   /path/to/kanvaro/logs/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 644 www-data www-data
   }
   ```

## Backup and Recovery

### Step 1: Database Backup

1. **MongoDB Backup Script**:
   ```bash
   #!/bin/bash
   # backup-mongo.sh
   
   BACKUP_DIR="/backups/mongodb"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   
   docker exec kanvaro_mongo_1 mongodump --out /backup/$DATE
   docker cp kanvaro_mongo_1:/backup/$DATE $BACKUP_DIR/
   
   # Compress backup
   tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz $BACKUP_DIR/$DATE
   rm -rf $BACKUP_DIR/$DATE
   
   # Keep only last 30 days
   find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +30 -delete
   ```

2. **Automated Backup**:
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup-mongo.sh
   ```

### Step 2: File Backup

1. **File Backup Script**:
   ```bash
   #!/bin/bash
   # backup-files.sh
   
   BACKUP_DIR="/backups/files"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   
   tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/kanvaro/uploads
   
   # Keep only last 30 days
   find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
   ```

### Step 3: Recovery Procedures

1. **Database Recovery**:
   ```bash
   # Restore MongoDB
   docker exec kanvaro_mongo_1 mongorestore /backup/20240101_120000
   ```

2. **File Recovery**:
   ```bash
   # Restore files
   tar -xzf /backups/files/uploads_20240101_120000.tar.gz -C /
   ```

## Security Configuration

### Step 1: Firewall Setup

1. **Configure UFW**:
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw deny 3000/tcp
   ```

### Step 2: Application Security

1. **Environment Security**:
   ```bash
   # Secure environment file
   chmod 600 .env.production
   chown root:root .env.production
   ```

2. **Container Security**:
   ```yaml
   # Add to docker-compose.yml
   services:
     app:
       security_opt:
         - no-new-privileges:true
       read_only: true
       tmpfs:
         - /tmp
         - /var/tmp
   ```

## Troubleshooting

### Common Issues

**Application Won't Start**
- Check environment variables
- Verify database connection
- Review application logs
- Check port availability

**Database Connection Issues**
- Verify MongoDB is running
- Check connection string
- Review database logs
- Test network connectivity

**SSL Certificate Problems**
- Verify certificate validity
- Check certificate path
- Review Nginx configuration
- Test SSL configuration

### Performance Optimization

1. **Database Optimization**:
   - Add database indexes
   - Optimize queries
   - Configure connection pooling
   - Monitor slow queries

2. **Application Optimization**:
   - Enable gzip compression
   - Configure caching
   - Optimize images
   - Use CDN for static assets

## Maintenance Procedures

### Daily Tasks
- Monitor system resources
- Check application logs
- Verify backup completion
- Review security alerts

### Weekly Tasks
- Update system packages
- Review performance metrics
- Test backup restoration
- Security audit

### Monthly Tasks
- Update application dependencies
- Review and rotate logs
- Performance optimization
- Security updates

## Emergency Procedures

### System Down
1. Check service status
2. Review error logs
3. Restart services
4. Contact support if needed

### Data Loss
1. Stop application
2. Restore from backup
3. Verify data integrity
4. Restart application

### Security Breach
1. Isolate system
2. Review access logs
3. Change all passwords
4. Update security measures

---

*This guide covers production deployment procedures. For development setup, see the [Development Guide](../development.md).*
