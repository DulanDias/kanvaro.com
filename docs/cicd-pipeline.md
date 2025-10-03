# Kanvaro - CI/CD Pipeline & Deployment

## Overview

Kanvaro implements a comprehensive CI/CD pipeline using GitHub Actions for continuous integration and AWS AppRunner for deployment. The pipeline ensures automated testing, building, and deployment with proper versioning and rollback capabilities.

## CI/CD Architecture

### Pipeline Flow
```
┌─────────────────────────────────────────────────────────┐
│                CI/CD Pipeline Flow                     │
├─────────────────────────────────────────────────────────┤
│  Code Push → GitHub Actions → Build → Test → Deploy   │
│  ├── Linting & Formatting                             │
│  ├── Unit Tests                                       │
│  ├── Integration Tests                                │
│  ├── E2E Tests                                        │
│  ├── Security Scanning                                │
│  ├── Build Docker Image                               │
│  ├── Push to ECR                                      │
│  └── Deploy to AWS AppRunner                          │
└─────────────────────────────────────────────────────────┘
```

## GitHub Actions Workflows

### Main CI/CD Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: kanvaro
  ECS_SERVICE: kanvaro-service
  ECS_CLUSTER: kanvaro-cluster
  ECS_TASK_DEFINITION: kanvaro-task-definition

jobs:
  # Linting and Code Quality
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Run TypeScript check
        run: npm run type-check

  # Security Scanning
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Unit and Integration Tests
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand({ping: 1})'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  # E2E Tests
  e2e:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # Build and Deploy (only on main branch)
  build-and-deploy:
    needs: [lint, security, test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to AWS AppRunner
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.build-image.outputs.image }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Run health check
        run: |
          sleep 30
          curl -f ${{ secrets.APP_URL }}/api/health || exit 1

      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: '#deployments'
          text: 'Kanvaro deployed successfully to production'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Pull Request Workflow
```yaml
# .github/workflows/pr.yml
name: Pull Request Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  pr-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Check test coverage
        run: npm run test:coverage

      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
          delete-old-comments: true
```

### Release Workflow
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:all

      - name: Build application
        run: npm run build

      - name: Create release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false

      - name: Upload release assets
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./dist
          asset_name: kanvaro-${{ github.ref }}.tar.gz
          asset_content_type: application/gzip
```

## AWS AppRunner Configuration

### AppRunner Service Configuration
```yaml
# aws-apprunner.yml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - echo "Installing dependencies..."
      - npm ci
      - echo "Running tests..."
      - npm run test:ci
      - echo "Building application..."
      - npm run build
      - echo "Build completed successfully"
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
    env: PORT
  env:
    - name: NODE_ENV
      value: production
    - name: PORT
      value: "3000"
    - name: MONGODB_URI
      value: ${{ secrets.MONGODB_URI }}
    - name: REDIS_URL
      value: ${{ secrets.REDIS_URL }}
    - name: JWT_SECRET
      value: ${{ secrets.JWT_SECRET }}
    - name: JWT_REFRESH_SECRET
      value: ${{ secrets.JWT_REFRESH_SECRET }}
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose for Local Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/kanvaro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-jwt-secret
      - JWT_REFRESH_SECRET=dev-refresh-secret
    depends_on:
      - mongodb
      - redis
    volumes:
      - .:/app
      - /app/node_modules

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

volumes:
  mongodb_data:
  redis_data:
```

## Environment Configuration

### Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://username:password@host:port/database
REDIS_URL=redis://username:password@host:port

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@kanvaro.com

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=your-connection-string

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=kanvaro-storage

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Feature Flags
ENABLE_2FA=true
ENABLE_SSO=false
ENABLE_ANALYTICS=true
```

### Secrets Management
```yaml
# .github/workflows/secrets.yml
name: Update Secrets

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  update-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Update database credentials
        run: |
          # Rotate database credentials
          aws secretsmanager update-secret \
            --secret-id kanvaro/database \
            --secret-string '{"username":"new-user","password":"new-password"}'

      - name: Update JWT secrets
        run: |
          # Generate new JWT secrets
          NEW_JWT_SECRET=$(openssl rand -base64 32)
          NEW_REFRESH_SECRET=$(openssl rand -base64 32)
          
          aws secretsmanager update-secret \
            --secret-id kanvaro/jwt \
            --secret-string "{\"jwt_secret\":\"$NEW_JWT_SECRET\",\"refresh_secret\":\"$NEW_REFRESH_SECRET\"}"

      - name: Update email credentials
        run: |
          # Rotate email service credentials
          aws secretsmanager update-secret \
            --secret-id kanvaro/email \
            --secret-string '{"smtp_user":"new-user","smtp_pass":"new-password"}'
```

## Monitoring and Alerting

### Health Check Endpoint
```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check database connection
    await connectDB();
    
    // Check Redis connection
    await redis.ping();
    
    // Check external services
    const externalServices = await Promise.allSettled([
      // Add external service checks here
    ]);

    const isHealthy = externalServices.every(
      result => result.status === 'fulfilled'
    );

    const status = isHealthy ? 'healthy' : 'unhealthy';
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        external: externalServices.map(result => ({
          status: result.status,
          value: result.status === 'fulfilled' ? 'ok' : 'error'
        }))
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}
```

### Monitoring Configuration
```yaml
# monitoring/cloudwatch-config.yml
Resources:
  KanvaroLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /aws/apprunner/kanvaro
      RetentionInDays: 30

  KanvaroAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: Kanvaro-High-Error-Rate
      AlarmDescription: Alert when error rate is high
      MetricName: ErrorCount
      Namespace: AWS/AppRunner
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic

  SNSTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: kanvaro-alerts
      DisplayName: Kanvaro Alerts
```

## Deployment Strategies

### Blue-Green Deployment
```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  push:
    branches: [main]

jobs:
  blue-green-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to green environment
        run: |
          # Deploy to green environment
          aws apprunner start-deployment \
            --service-arn ${{ secrets.APPRUNNER_SERVICE_ARN }} \
            --source-configuration '{
              "ImageRepository": {
                "ImageIdentifier": "${{ secrets.ECR_REGISTRY }}/kanvaro:${{ github.sha }}",
                "ImageConfiguration": {
                  "Port": "3000",
                  "RuntimeEnvironmentVariables": {
                    "NODE_ENV": "production"
                  }
                }
              }
            }'

      - name: Wait for deployment
        run: |
          aws apprunner wait service-updated \
            --service-arn ${{ secrets.APPRUNNER_SERVICE_ARN }}

      - name: Run health checks
        run: |
          # Run comprehensive health checks
          curl -f ${{ secrets.GREEN_URL }}/api/health || exit 1
          
          # Run smoke tests
          npm run test:smoke -- --base-url=${{ secrets.GREEN_URL }}

      - name: Switch traffic to green
        run: |
          # Update load balancer to point to green environment
          aws elbv2 modify-target-group \
            --target-group-arn ${{ secrets.TARGET_GROUP_ARN }} \
            --health-check-path /api/health

      - name: Cleanup blue environment
        run: |
          # Cleanup old blue environment after successful deployment
          aws apprunner delete-service \
            --service-arn ${{ secrets.BLUE_SERVICE_ARN }}
```

### Rollback Strategy
```yaml
# .github/workflows/rollback.yml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      target_version:
        description: 'Target version to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Rollback to previous version
        run: |
          # Get previous version from ECR
          PREVIOUS_IMAGE=${{ secrets.ECR_REGISTRY }}/kanvaro:${{ github.event.inputs.target_version }}
          
          # Deploy previous version
          aws apprunner start-deployment \
            --service-arn ${{ secrets.APPRUNNER_SERVICE_ARN }} \
            --source-configuration '{
              "ImageRepository": {
                "ImageIdentifier": "'$PREVIOUS_IMAGE'",
                "ImageConfiguration": {
                  "Port": "3000"
                }
              }
            }'

      - name: Verify rollback
        run: |
          # Wait for deployment
          aws apprunner wait service-updated \
            --service-arn ${{ secrets.APPRUNNER_SERVICE_ARN }}
          
          # Verify health
          curl -f ${{ secrets.APP_URL }}/api/health || exit 1

      - name: Notify rollback completion
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: '#deployments'
          text: 'Rollback to version ${{ github.event.inputs.target_version }} completed successfully'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

### Docker Build Optimization
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

---

*This CI/CD pipeline documentation will be updated as deployment strategies evolve and new automation features are added.*
