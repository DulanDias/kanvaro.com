# Kanvaro - Development Guide

## Overview

This guide provides comprehensive information for developers working on the Kanvaro project management application. It covers setup, coding standards, testing, and contribution guidelines.

## Development Environment Setup

### Prerequisites

#### Required Software
- **Node.js**: Version 18+ (LTS recommended)
- **npm**: Version 8+ (comes with Node.js)
- **Docker**: Version 20.10+ (for database and services)
- **Docker Compose**: Version 2.0+
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions

#### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Docker
- GitLens

### Local Development Setup

#### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/DulanDias/kanvaro.com.git
cd kanvaro.com

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

#### 2. Environment Configuration
```bash
# .env.local
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kanvaro_dev
JWT_SECRET=dev-jwt-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=dev-refresh-secret
PORT=3000
HOST=localhost
```

#### 3. Start Development Services
```bash
# Start MongoDB and Redis with Docker
docker-compose -f docker-compose.dev.yml up -d

# Start the development server
npm run dev
```

#### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

## Project Structure

```
kanvaro/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── forms/          # Form components
│   │   └── layout/         # Layout components
│   ├── pages/              # Next.js pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── projects/      # Project pages
│   │   └── auth/          # Authentication pages
│   ├── lib/               # Utility libraries
│   │   ├── auth/          # Authentication utilities
│   │   ├── db/            # Database utilities
│   │   └── utils/         # General utilities
│   ├── models/            # Database models
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles
├── public/                # Static assets
├── docs/                  # Documentation
├── tests/                 # Test files
├── docker/                # Docker configurations
├── scripts/               # Build and utility scripts
├── .env.example          # Environment variables template
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json
└── README.md
```

## Coding Standards

### TypeScript Configuration

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Code Style Guidelines

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Component Development

#### Component Structure
```typescript
// components/ui/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled || loading,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Custom Hooks
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
};
```

## Database Development

### Model Definition
```typescript
// models/Project.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  createdBy: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed'],
    default: 'planning'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date
}, {
  timestamps: true
});

// Indexes
ProjectSchema.index({ createdBy: 1, status: 1 });
ProjectSchema.index({ teamMembers: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
```

### API Route Development
```typescript
// pages/api/projects/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';
import { authenticate } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  try {
    const user = await authenticate(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        const projects = await Project.find({
          $or: [
            { createdBy: user.id },
            { teamMembers: user.id }
          ]
        }).populate('createdBy teamMembers', 'name email');
        
        return res.json(projects);

      case 'POST':
        const { name, description, startDate, endDate } = req.body;
        
        const project = new Project({
          name,
          description,
          startDate,
          endDate,
          createdBy: user.id,
          teamMembers: [user.id]
        });
        
        await project.save();
        return res.status(201).json(project);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Testing

### Test Setup
```typescript
// tests/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

### Component Testing
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### API Testing
```typescript
// tests/api/projects.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/projects';

describe('/api/projects', () => {
  it('should create a new project', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Project',
        description: 'Test Description',
        startDate: '2024-01-01'
      }
    });

    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.name).toBe('Test Project');
  });
});
```

## Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# After review and approval, merge to main
```

### Commit Message Convention
```
type(scope): description

feat(auth): add JWT authentication
fix(api): resolve user creation bug
docs(readme): update installation instructions
style(ui): improve button styling
refactor(db): optimize database queries
test(auth): add authentication tests
```

### Code Review Process
1. Create feature branch
2. Implement changes with tests
3. Create pull request
4. Code review by team members
5. Address feedback
6. Merge after approval

## Performance Optimization

### Next.js Optimization
```typescript
// pages/projects/[id].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const ProjectChart = dynamic(() => import('@/components/ProjectChart'), {
  loading: () => <div>Loading chart...</div>
});

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate static paths for popular projects
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Fetch project data
  return {
    props: { project },
    revalidate: 60 // Revalidate every minute
  };
};
```

### Database Optimization
```typescript
// lib/db/queries.ts
export const getProjectsWithTasks = async (userId: string) => {
  return Project.aggregate([
    { $match: { $or: [{ createdBy: userId }, { teamMembers: userId }] } },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'projectId',
        as: 'tasks'
      }
    },
    {
      $addFields: {
        taskCount: { $size: '$tasks' },
        completedTasks: {
          $size: {
            $filter: {
              input: '$tasks',
              cond: { $eq: ['$$this.status', 'completed'] }
            }
          }
        }
      }
    }
  ]);
};
```

## Debugging and Troubleshooting

### Development Tools
```bash
# Debug mode
npm run dev:debug

# Database inspection
npm run db:inspect

# Performance profiling
npm run profile

# Memory usage monitoring
npm run monitor
```

### Common Issues

#### Database Connection
```typescript
// lib/db/index.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
```

#### Memory Leaks
```typescript
// Cleanup in useEffect
useEffect(() => {
  const subscription = api.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Deployment Preparation

### Build Optimization
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "build:analyze": "ANALYZE=true next build",
    "build:docker": "docker build -t dias ."
  }
}
```

### Environment Validation
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().transform(Number).default('3000')
});

export const env = envSchema.parse(process.env);
```

---

*This development guide will be updated as the project evolves and new development practices are established.*
