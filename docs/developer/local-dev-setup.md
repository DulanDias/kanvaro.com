# Local Development Setup

## Prerequisites

- Node.js 18+, npm 9+
- Docker (optional for Postgres/Redis)

## Start services

```bash
docker-compose up -d postgres redis
```

## Install and run

```bash
npm install
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Prisma

```bash
cd apps/api
npx prisma migrate dev
npx prisma studio
```
