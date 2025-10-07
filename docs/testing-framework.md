---
slug: "reference/testing-framework"
title: "Testing Framework"
summary: "Comprehensive testing framework including unit tests, integration tests, and end-to-end testing strategies."
visibility: "public"
audiences: ["admin", "self_host_admin"]
category: "reference"
order: 100
updated: "2025-01-04"
---

# Kanvaro - Testing Framework & Strategy

## Overview

Kanvaro implements a comprehensive testing strategy using Jest as the primary testing framework, with unit tests, integration tests, and end-to-end tests. The testing framework ensures code quality, reliability, and maintainability across the entire application.

## Testing Architecture

### Testing Pyramid
```
┌─────────────────────────────────────────────────────────┐
│                    Testing Pyramid                     │
├─────────────────────────────────────────────────────────┤
│  E2E Tests (Playwright) - 10%                         │
│  ├── User workflows                                   │
│  ├── Critical business flows                          │
│  └── Cross-browser testing                            │
├─────────────────────────────────────────────────────────┤
│  Integration Tests (Jest) - 20%                      │
│  ├── API endpoint testing                            │
│  ├── Database integration                            │
│  ├── External service integration                    │
│  └── Authentication flows                            │
├─────────────────────────────────────────────────────────┤
│  Unit Tests (Jest) - 70%                             │
│  ├── Component testing                               │
│  ├── Utility function testing                       │
│  ├── Service layer testing                          │
│  └── Business logic testing                         │
└─────────────────────────────────────────────────────────┘
```

## Jest Configuration

### Jest Setup
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/models/(.*)$': '<rootDir>/src/models/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);
```

### Jest Setup File
```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/kanvaro-test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Global test utilities
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

## Unit Testing

### Component Testing
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

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

  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive');
  });

  it('applies correct size styles', () => {
    render(<Button size="lg">Large Button</Button>);
    expect(screen.getByText('Large Button')).toHaveClass('h-11');
  });
});
```

### Service Layer Testing
```typescript
// src/lib/__tests__/auth/jwt-manager.test.ts
import { JWTManager } from '@/lib/auth/jwt-manager';

describe('JWTManager', () => {
  const mockPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'admin',
    organizationId: 'org-123',
    permissions: ['user:create', 'project:read'],
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = JWTManager.generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = JWTManager.generateAccessToken(mockPayload);
      const token2 = JWTManager.generateAccessToken({
        ...mockPayload,
        userId: 'user-456',
      });
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const token = JWTManager.generateAccessToken(mockPayload);
      const decoded = JWTManager.verifyAccessToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        JWTManager.verifyAccessToken('invalid-token');
      }).toThrow('Invalid access token');
    });

    it('should throw error for expired token', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbklkIjoib3JnLTEyMyIsInBlcm1pc3Npb25zIjpbInVzZXI6Y3JlYXRlIiwicHJvamVjdDpyZWFkIl0sImlhdCI6MTYwOTQ1NjAwMCwiZXhwIjoxNjA5NDU2MDAwfQ.invalid';
      
      expect(() => {
        JWTManager.verifyAccessToken(expiredToken);
      }).toThrow('Invalid access token');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const token = JWTManager.generateAccessToken(mockPayload);
      expect(JWTManager.isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsIm9yZ2FuaXphdGlvbklkIjoib3JnLTEyMyIsInBlcm1pc3Npb25zIjpbInVzZXI6Y3JlYXRlIiwicHJvamVjdDpyZWFkIl0sImlhdCI6MTYwOTQ1NjAwMCwiZXhwIjoxNjA5NDU2MDAwfQ.invalid';
      
      expect(JWTManager.isTokenExpired(expiredToken)).toBe(true);
    });
  });
});
```

### Utility Function Testing
```typescript
// src/utils/__tests__/validation.test.ts
import { SecurityValidator } from '@/utils/validation';

describe('SecurityValidator', () => {
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(SecurityValidator.validateEmail('test@example.com')).toBe(true);
      expect(SecurityValidator.validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(SecurityValidator.validateEmail('invalid-email')).toBe(false);
      expect(SecurityValidator.validateEmail('test@')).toBe(false);
      expect(SecurityValidator.validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for strong password', () => {
      const result = SecurityValidator.validatePassword('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return false for weak password', () => {
      const result = SecurityValidator.validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require uppercase letter', () => {
      const result = SecurityValidator.validatePassword('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase letter', () => {
      const result = SecurityValidator.validatePassword('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should require number', () => {
      const result = SecurityValidator.validatePassword('Password!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should require special character', () => {
      const result = SecurityValidator.validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = SecurityValidator.sanitizeInput(input);
      expect(sanitized).toBe('alert("xss")Hello');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const sanitized = SecurityValidator.sanitizeInput(input);
      expect(sanitized).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick="alert(\'xss\')"Hello';
      const sanitized = SecurityValidator.sanitizeInput(input);
      expect(sanitized).toBe('"Hello');
    });
  });
});
```

## Integration Testing

### API Endpoint Testing
```typescript
// src/pages/api/__tests__/projects.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/v1/projects';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';
import { User } from '@/models/User';

// Mock database connection
jest.mock('@/lib/db');
jest.mock('@/models/Project');
jest.mock('@/models/User');

describe('/api/v1/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/projects', () => {
    it('should return projects for authenticated user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'x-user-id': 'user-123',
          'x-organization-id': 'org-123',
        },
        query: {
          page: '1',
          limit: '10',
        },
      });

      const mockProjects = [
        {
          _id: 'project-1',
          name: 'Test Project 1',
          description: 'Test Description 1',
          status: 'active',
          createdBy: 'user-123',
          organization: 'org-123',
        },
        {
          _id: 'project-2',
          name: 'Test Project 2',
          description: 'Test Description 2',
          status: 'completed',
          createdBy: 'user-123',
          organization: 'org-123',
        },
      ];

      (Project.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockProjects),
            }),
          }),
        }),
      });

      (Project.countDocuments as jest.Mock).mockResolvedValue(2);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: mockProjects,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      });
    });

    it('should filter projects by status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'x-user-id': 'user-123',
          'x-organization-id': 'org-123',
        },
        query: {
          status: 'active',
        },
      });

      const mockProjects = [
        {
          _id: 'project-1',
          name: 'Test Project 1',
          status: 'active',
        },
      ];

      (Project.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockProjects),
            }),
          }),
        }),
      });

      (Project.countDocuments as jest.Mock).mockResolvedValue(1);

      await handler(req, res);

      expect(Project.find).toHaveBeenCalledWith({
        organization: 'org-123',
        status: 'active',
      });
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-user-id': 'user-123',
          'x-organization-id': 'org-123',
        },
        body: {
          name: 'New Project',
          description: 'New Project Description',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      });

      const mockProject = {
        _id: 'project-123',
        name: 'New Project',
        description: 'New Project Description',
        createdBy: 'user-123',
        organization: 'org-123',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'project-123',
          name: 'New Project',
          createdBy: { firstName: 'John', lastName: 'Doe' },
        }),
      };

      (Project as any).mockImplementation(() => mockProject);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        success: true,
        data: expect.objectContaining({
          name: 'New Project',
          description: 'New Project Description',
        }),
        message: 'Project created successfully',
        timestamp: expect.any(String),
      });
    });

    it('should return validation error for missing name', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-user-id': 'user-123',
          'x-organization-id': 'org-123',
        },
        body: {
          description: 'New Project Description',
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Project name is required',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        timestamp: expect.any(String),
      });
    });
  });
});
```

### Database Integration Testing
```typescript
// src/lib/__tests__/database.test.ts
import { connectDB, disconnectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Project } from '@/models/Project';
import { Task } from '@/models/Task';

describe('Database Integration', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
  });

  describe('User Operations', () => {
    it('should create and retrieve user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        role: 'admin',
        organization: 'org-123',
      };

      const user = new User(userData);
      await user.save();

      const retrievedUser = await User.findById(user._id);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.firstName).toBe('John');
      expect(retrievedUser.email).toBe('john.doe@example.com');
    });

    it('should update user information', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        role: 'admin',
        organization: 'org-123',
      });
      await user.save();

      user.firstName = 'Jane';
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.firstName).toBe('Jane');
    });
  });

  describe('Project Operations', () => {
    it('should create project with team members', async () => {
      const user1 = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'admin',
        organization: 'org-123',
      });
      await user1.save();

      const user2 = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'hashedPassword',
        role: 'team_member',
        organization: 'org-123',
      });
      await user2.save();

      const project = new Project({
        name: 'Test Project',
        description: 'Test Description',
        createdBy: user1._id,
        organization: 'org-123',
        teamMembers: [user1._id, user2._id],
      });
      await project.save();

      const retrievedProject = await Project.findById(project._id)
        .populate('createdBy', 'firstName lastName')
        .populate('teamMembers', 'firstName lastName');

      expect(retrievedProject).toBeDefined();
      expect(retrievedProject.name).toBe('Test Project');
      expect(retrievedProject.teamMembers).toHaveLength(2);
    });
  });

  describe('Task Operations', () => {
    it('should create task with project relationship', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'admin',
        organization: 'org-123',
      });
      await user.save();

      const project = new Project({
        name: 'Test Project',
        createdBy: user._id,
        organization: 'org-123',
      });
      await project.save();

      const task = new Task({
        title: 'Test Task',
        description: 'Test Description',
        project: project._id,
        createdBy: user._id,
        assignedTo: user._id,
      });
      await task.save();

      const retrievedTask = await Task.findById(task._id)
        .populate('project', 'name')
        .populate('createdBy', 'firstName lastName')
        .populate('assignedTo', 'firstName lastName');

      expect(retrievedTask).toBeDefined();
      expect(retrievedTask.title).toBe('Test Task');
      expect(retrievedTask.project.name).toBe('Test Project');
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await expect(page).toHaveURL('/login');
  });
});

// tests/e2e/projects.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new project', async ({ page }) => {
    await page.goto('/projects');
    await page.click('[data-testid="create-project-button"]');
    
    await page.fill('[data-testid="project-name-input"]', 'New Test Project');
    await page.fill('[data-testid="project-description-input"]', 'Test project description');
    await page.selectOption('[data-testid="project-status-select"]', 'planning');
    await page.click('[data-testid="save-project-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-list"]')).toContainText('New Test Project');
  });

  test('should edit an existing project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project's edit button
    await page.click('[data-testid="project-edit-button"]:first-child');
    
    await page.fill('[data-testid="project-name-input"]', 'Updated Project Name');
    await page.click('[data-testid="save-project-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-list"]')).toContainText('Updated Project Name');
  });

  test('should delete a project', async ({ page }) => {
    await page.goto('/projects');
    
    // Click on first project's delete button
    await page.click('[data-testid="project-delete-button"]:first-child');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## Test Utilities

### Test Helpers
```typescript
// tests/utils/test-helpers.ts
import { faker } from '@faker-js/faker';
import { User } from '@/models/User';
import { Project } from '@/models/Project';
import { Task } from '@/models/Task';

export class TestHelpers {
  static async createTestUser(overrides: Partial<any> = {}) {
    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: 'hashedPassword',
      role: 'team_member',
      organization: faker.string.uuid(),
      ...overrides,
    };

    const user = new User(userData);
    await user.save();
    return user;
  }

  static async createTestProject(createdBy: string, overrides: Partial<any> = {}) {
    const projectData = {
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      createdBy,
      organization: faker.string.uuid(),
      status: 'active',
      ...overrides,
    };

    const project = new Project(projectData);
    await project.save();
    return project;
  }

  static async createTestTask(projectId: string, createdBy: string, overrides: Partial<any> = {}) {
    const taskData = {
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      project: projectId,
      createdBy,
      status: 'todo',
      priority: 'medium',
      ...overrides,
    };

    const task = new Task(taskData);
    await task.save();
    return task;
  }

  static async cleanupDatabase() {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
  }

  static generateMockJWT(payload: any = {}) {
    const defaultPayload = {
      userId: faker.string.uuid(),
      email: faker.internet.email(),
      role: 'admin',
      organizationId: faker.string.uuid(),
      permissions: ['user:create', 'project:read'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    return `mock-jwt-token-${JSON.stringify({ ...defaultPayload, ...payload })}`;
  }
}
```

### Mock Data Factories
```typescript
// tests/factories/user-factory.ts
import { faker } from '@faker-js/faker';
import { User } from '@/models/User';

export class UserFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(['admin', 'team_member', 'client']),
      organization: faker.string.uuid(),
      isActive: true,
      ...overrides,
    };
  }

  static createAdmin(overrides: Partial<any> = {}) {
    return this.create({
      role: 'admin',
      ...overrides,
    });
  }

  static createTeamMember(overrides: Partial<any> = {}) {
    return this.create({
      role: 'team_member',
      ...overrides,
    });
  }

  static createClient(overrides: Partial<any> = {}) {
    return this.create({
      role: 'client',
      ...overrides,
    });
  }
}
```

## Test Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

### GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
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
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

---

*This testing framework documentation will be updated as new testing patterns are identified and testing strategies evolve.*
