# Local Development Setup

This guide will help you set up Kanvaro for local development.

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 6+ (or use Docker)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kanvaro/kanvaro.git
cd kanvaro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Services

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d postgres redis

# Or start all services
docker-compose up -d
```

### 4. Set Up Environment Variables

```bash
# Copy environment template
cp apps/api/env.example apps/api/.env

# Edit the environment file
nano apps/api/.env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://kanvaro:kanvaro@localhost:5432/kanvaro?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Application URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001

# Security (generate secure keys for production)
JWT_SECRET=dev-secret-key
SESSION_SECRET=dev-session-secret
CSRF_SECRET=dev-csrf-secret
```

### 5. Set Up Database

```bash
# Generate Prisma client
cd apps/api
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 6. Start Development Servers

```bash
# Start API server (Terminal 1)
cd apps/api
npm run dev

# Start Web server (Terminal 2)
cd apps/web
npm run dev
```

### 7. Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Database Studio**: `npx prisma studio`

## Development Workflow

### Code Quality

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Format code
npm run format
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name your-migration-name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following [Coding Guidelines](./coding-guidelines.md)
3. Write tests for new functionality
4. Update documentation if needed
5. Create pull request

## Project Structure

```
kanvaro/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # Utilities
│   │   │   └── hooks/       # Custom hooks
│   │   └── package.json
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── modules/     # Feature modules
│       │   ├── common/      # Shared utilities
│       │   └── main.ts      # Application entry
│       ├── prisma/          # Database schema
│       └── package.json
├── packages/
│   └── shared/              # Shared types and utilities
├── infra/
│   └── terraform/          # Infrastructure as Code
├── docs/                    # Documentation
└── package.json            # Root package.json
```

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL
```

**Redis Connection Error**
```bash
# Check if Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli ping
```

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Prisma Client Issues**
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Performance Issues

**Slow Database Queries**
- Use `npx prisma studio` to monitor queries
- Check database indexes
- Use `EXPLAIN ANALYZE` for query optimization

**Memory Issues**
- Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096"`
- Monitor with `htop` or Activity Monitor

## Development Tools

### Recommended VS Code Extensions

- Prisma
- Tailwind CSS IntelliSense
- TypeScript Importer
- ESLint
- Prettier
- GitLens
- Thunder Client (API testing)

### Useful Commands

```bash
# Watch mode for API
cd apps/api && npm run start:dev

# Watch mode for Web
cd apps/web && npm run dev

# Run all tests
npm run test

# Build for production
npm run build

# Clean all build artifacts
npm run clean
```

## Next Steps

1. Read [Coding Guidelines](./coding-guidelines.md) for development standards
2. Check [Testing Strategy](./testing-strategy.md) for testing approach
3. Review [Prisma Migrations](./prisma-migrations.md) for database changes
4. Explore [Features](../features/) documentation for feature implementation

## Getting Help

- Check the [GitHub Issues](https://github.com/kanvaro/kanvaro/issues)
- Join our [Discord Community](https://discord.gg/kanvaro)
- Read the [FAQ](../faq.md)
- Contact the maintainers
