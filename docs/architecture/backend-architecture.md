# Backend Architecture

Kanvaro API is built with NestJS (Fastify) and Prisma.

- Modules: auth, users, projects, boards, tasks, sprints, time-logs, reports, search, notifications, realtime, audit, jobs
- Transport: HTTP + WebSocket (socket.io)
- Security: helmet, cookies, CSRF (planned), rate limiting (planned)
- Persistence: PostgreSQL (Prisma), Redis (queues, cache)
- Background: BullMQ for timers, report refresh, cleanups

## Request lifecycle

1. Fastify adapter handles request
2. Global validation pipe validates DTOs
3. Controllers delegate to services
4. Prisma performs DB operations
5. Realtime gateway emits events as needed

## Error handling

- Validation errors return 400
- Auth errors return 401/403
- Unknown errors return 500 with minimal leakage
