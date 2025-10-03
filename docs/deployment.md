# Kanvaro - Deployment Guide

## Overview

Kanvaro is designed for easy self-hosting using Docker, making it accessible to SMEs, startups, freelancers, and organizations of all sizes. This guide covers various deployment scenarios from single-server setups to production-ready configurations.

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB available space
- **OS**: Linux, macOS, or Windows with Docker support

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

### Software Requirements
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Git**: For cloning the repository

## Quick Start Deployment

### 1. Clone the Repository
```bash
git clone https://github.com/DulanDias/kanvaro.com.git
cd kanvaro.com
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Application
```bash
docker-compose up -d
```

### 4. Access the Application
- Open your browser to `http://localhost:3000`
- Complete the initial setup wizard

## Docker Configuration

### Docker Compose Setup

#### Basic Configuration (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  kanvaro-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/kanvaro
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongodb
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Environment Variables

#### Required Variables
```bash
# Database
MONGODB_URI=mongodb://mongodb:27017/dias
MONGODB_USERNAME=admin
MONGODB_PASSWORD=password

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# File Storage
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760  # 10MB

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Optional Variables
```bash
# Redis (for sessions and caching)
REDIS_URL=redis://redis:6379

# External Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Production Deployment

### 1. Server Setup

#### Ubuntu/Debian Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Security Configuration

#### Firewall Setup
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### SSL/TLS Configuration
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Reverse Proxy Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size
    client_max_body_size 100M;
}
```

### 4. Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/dias"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="dias_mongodb_1"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
docker exec $CONTAINER_NAME mongodump --out /backup
docker cp $CONTAINER_NAME:/backup $BACKUP_DIR/dias_$DATE

# Compress backup
tar -czf $BACKUP_DIR/dias_$DATE.tar.gz $BACKUP_DIR/dias_$DATE
rm -rf $BACKUP_DIR/dias_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "dias_*.tar.gz" -mtime +7 -delete

echo "Backup completed: dias_$DATE.tar.gz"
```

#### Cron Job Setup
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh >> /var/log/dias-backup.log 2>&1
```

## Scaling and High Availability

### Multi-Instance Deployment

#### Load Balancer Configuration
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - dias-app-1
      - dias-app-2

  dias-app-1:
    build: .
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/dias
    depends_on:
      - mongodb
      - redis

  dias-app-2:
    build: .
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/dias
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### Database Clustering

#### MongoDB Replica Set
```yaml
version: '3.8'

services:
  mongodb-primary:
    image: mongo:6.0
    command: mongod --replSet rs0 --bind_ip_all
    ports:
      - "27017:27017"
    volumes:
      - mongodb_primary_data:/data/db

  mongodb-secondary-1:
    image: mongo:6.0
    command: mongod --replSet rs0 --bind_ip_all
    ports:
      - "27018:27017"
    volumes:
      - mongodb_secondary1_data:/data/db

  mongodb-secondary-2:
    image: mongo:6.0
    command: mongod --replSet rs0 --bind_ip_all
    ports:
      - "27019:27017"
    volumes:
      - mongodb_secondary2_data:/data/db
```

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

#### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Log Management

#### Log Configuration
```yaml
version: '3.8'

services:
  dias-app:
    build: .
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    volumes:
      - ./logs:/app/logs

  logrotate:
    image: blacklabelops/logrotate
    volumes:
      - ./logs:/var/log
      - ./logrotate.conf:/etc/logrotate.d/logrotate.conf
```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000
```

#### Database Connection Issues
```bash
# Check MongoDB container
docker logs dias_mongodb_1

# Test database connection
docker exec -it dias_mongodb_1 mongo
```

#### Memory Issues
```bash
# Check container resource usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  dias-app:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Performance Optimization

#### Database Optimization
```javascript
// MongoDB indexes
db.tasks.createIndex({ "projectId": 1, "status": 1 })
db.tasks.createIndex({ "assignedTo": 1, "dueDate": 1 })
db.projects.createIndex({ "createdBy": 1, "status": 1 })
```

#### Application Optimization
```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Security Best Practices

### Container Security
- Use non-root user in containers
- Regularly update base images
- Scan images for vulnerabilities
- Use secrets management for sensitive data

### Network Security
- Use internal Docker networks
- Implement proper firewall rules
- Use HTTPS in production
- Regular security updates

### Data Security
- Encrypt sensitive data at rest
- Use strong authentication
- Implement proper access controls
- Regular security audits

---

*This deployment guide will be updated as new deployment scenarios and best practices are identified.*
