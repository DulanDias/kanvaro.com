# Kanvaro

> **Agile project management, fast and learnable.**

[![CI/CD](https://github.com/kanvaro/kanvaro/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/kanvaro/kanvaro/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)

Kanvaro is a performance-first, single-tenant, open source project management system designed for modern development teams. Built with Next.js, NestJS, and PostgreSQL, it provides a fast, secure, and scalable solution for agile project management.

## ✨ Features

### 🚀 Performance First
- **Server-side rendering** with Next.js for optimal performance
- **Optimized bundle sizes** (<100KB gzipped)
- **Virtualized lists** for handling large datasets
- **Database query optimization** with Prisma ORM
- **Redis caching** for improved response times

### 🔐 Security by Design
- **Argon2id password hashing** for secure authentication
- **Session-based authentication** with HttpOnly cookies
- **CSRF protection** and rate limiting
- **Input validation** and sanitization
- **Audit logging** for all user actions

### 📊 Agile Project Management
- **Kanban boards** with drag-and-drop functionality
- **Sprint planning** and burndown charts
- **Time tracking** with manual logs and timers
- **Rich reports** including velocity and throughput
- **Real-time collaboration** with WebSocket support

### 🎓 Built-in Learning
- **Agile Learning Center** with contextual help
- **Interactive tutorials** for new users
- **Best practices** guidance throughout the app
- **Educational content** on Scrum, Kanban, and more

### 🏗️ Self-Hosted & Scalable
- **Single-tenant architecture** for data isolation
- **AWS deployment** with Terraform automation
- **Docker Compose** for local development
- **Horizontal scaling** with ECS Fargate
- **Comprehensive monitoring** and alerting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 6+ (or use Docker)

### Local Development

```bash
# Clone the repository
git clone https://github.com/kanvaro/kanvaro.git
cd kanvaro

# Install dependencies
npm install

# Start development services
docker-compose up -d postgres redis

# Set up environment variables
cp apps/api/env.example apps/api/.env
# Edit the .env file with your configuration

# Set up the database
cd apps/api
npx prisma generate
npx prisma migrate dev

# Start the development servers
npm run dev
```

### AWS Deployment

```bash
# Configure AWS credentials
aws configure

# Deploy infrastructure
cd infra/terraform
terraform init
terraform plan
terraform apply

# Deploy applications
# (Follow the deployment guide in docs/)
```

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[System Overview](./docs/architecture/system-overview.md)** - High-level architecture
- **[Local Development Setup](./docs/developer/local-dev-setup.md)** - Getting started
- **[Features](./docs/features/)** - Detailed feature documentation
- **[Infrastructure](./docs/infra/)** - AWS deployment guides
- **[API Documentation](http://localhost:3001/api/docs)** - Interactive API docs

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router, TypeScript, SSR/ISR)
- React 18 with TanStack Query
- Tailwind CSS + Radix UI
- dnd-kit for drag-and-drop
- TipTap rich text editor

**Backend:**
- NestJS with Fastify
- Prisma ORM with PostgreSQL
- Redis for caching and pub/sub
- BullMQ for background jobs
- Socket.IO for real-time features

**Infrastructure:**
- AWS ECS Fargate
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- S3 for file storage
- CloudFront CDN
- Application Load Balancer

### Project Structure

```
kanvaro/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # NestJS backend
├── packages/
│   └── shared/              # Shared types and utilities
├── infra/
│   └── terraform/          # Infrastructure as Code
├── docs/                    # Documentation
└── .github/workflows/      # CI/CD pipelines
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Self-Hosted

```bash
# Production deployment with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Production

```bash
# Deploy infrastructure
cd infra/terraform
terraform apply

# Deploy applications
# (Follow the AWS deployment guide)
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/kanvaro/kanvaro/issues)
- 💬 [Discussions](https://github.com/kanvaro/kanvaro/discussions)
- 📧 [Contact Us](mailto:support@kanvaro.com)

---

**Made with ❤️ by the Kanvaro team**
