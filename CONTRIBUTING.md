# Contributing to Kanvaro

Thank you for your interest in contributing to Kanvaro! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git
- A GitHub account

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/kanvaro.git
   cd kanvaro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the development environment**
   ```bash
   # Start development services
   docker-compose up -d postgres redis
   
   # Set up environment variables
   cp apps/api/env.example apps/api/.env
   # Edit the .env file with your configuration
   
   # Set up the database
   cd apps/api
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: API server
   cd apps/api && npm run dev
   
   # Terminal 2: Web server
   cd apps/web && npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Follow the [Coding Guidelines](./docs/developer/coding-guidelines.md)
- Write tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve issue with authentication"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 🧪 Testing

### Running Tests

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

### Writing Tests

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test API endpoints and database interactions
- **End-to-end tests**: Test complete user workflows

### Test Structure

```
apps/api/src/
├── modules/
│   └── auth/
│       ├── auth.controller.spec.ts
│       ├── auth.service.spec.ts
│       └── auth.module.spec.ts
└── test/
    ├── auth.e2e-spec.ts
    └── setup.ts
```

## 📝 Code Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper type annotations
- Avoid `any` type

### Code Style

- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic

### File Organization

```
src/
├── modules/           # Feature modules
├── common/            # Shared utilities
├── config/            # Configuration files
└── main.ts           # Application entry point
```

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Add request/response validation
- Document endpoints with Swagger

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to reproduce the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: OS, Node.js version, browser, etc.
6. **Screenshots**: If applicable
7. **Logs**: Any relevant error logs

## 💡 Feature Requests

When requesting features, please include:

1. **Description**: Clear description of the feature
2. **Use case**: Why this feature would be useful
3. **Proposed solution**: How you think it should work
4. **Alternatives**: Other solutions you've considered
5. **Additional context**: Any other relevant information

## 📚 Documentation

### Updating Documentation

- Update relevant documentation when making changes
- Follow the existing documentation structure
- Use clear, concise language
- Include code examples where helpful
- Update the table of contents if needed

### Documentation Structure

```
docs/
├── architecture/      # System architecture
├── features/         # Feature documentation
├── developer/        # Developer guides
├── infra/           # Infrastructure guides
└── ops/             # Operations guides
```

## 🔍 Code Review Process

### For Contributors

1. Ensure your code follows the guidelines
2. Write comprehensive tests
3. Update documentation if needed
4. Respond to review feedback
5. Keep commits focused and atomic

### For Reviewers

1. Check code quality and style
2. Verify tests are comprehensive
3. Ensure documentation is updated
4. Test the changes locally
5. Provide constructive feedback

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version numbers are bumped
- [ ] Release notes are written
- [ ] Security review completed

## 🤝 Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative

- Help others when you can
- Share knowledge and experience
- Be patient with newcomers
- Work together to solve problems

## 📞 Getting Help

- 📖 [Documentation](./docs/)
- 🐛 [GitHub Issues](https://github.com/kanvaro/kanvaro/issues)
- 💬 [Discussions](https://github.com/kanvaro/kanvaro/discussions)
- 📧 [Email](mailto:support@kanvaro.com)

## 📄 License

By contributing to Kanvaro, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Kanvaro! 🎉
