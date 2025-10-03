# Kanvaro - Initial Setup Wizard

## Overview

Kanvaro features a comprehensive setup wizard that guides users through the initial configuration process when the application is first deployed. This wizard ensures proper database setup, admin user creation, organization configuration, and email service setup - all essential for a fully functional self-hosted instance.

## Setup Wizard Flow

### Phase 1: System Health Check
```
1. Application starts and checks system status
2. Verifies Docker environment
3. Checks for existing database connection
4. If no database exists, redirects to setup wizard
5. If database exists and configured, redirects to login
```

### Phase 2: Database Configuration
```
1. Database Connection Setup
2. Database Creation & Initialization
3. Database Seeding
4. Connection Verification
```

### Phase 3: Admin User Creation
```
1. Admin Account Setup
2. Organization Configuration
3. Basic Settings Configuration
```

### Phase 4: Email Service Configuration
```
1. Email Provider Selection
2. SMTP/Azure Configuration
3. Email Testing
4. Notification Settings
```

### Phase 5: Final Configuration
```
1. System Settings Review
2. Initial Data Seeding
3. Setup Completion
4. Redirect to Dashboard
```

## Detailed Setup Steps

### Step 1: Welcome & System Check

#### Welcome Screen
- **Title**: "Welcome to Kanvaro Setup"
- **Description**: "Let's get your Kanvaro instance configured and ready to use"
- **Features**: 
  - System requirements check
  - Docker environment verification
  - Database connection status
- **Actions**: "Get Started" button

#### System Requirements Check
```typescript
interface SystemCheck {
  docker: boolean;
  database: boolean;
  permissions: boolean;
  storage: boolean;
  memory: boolean;
}
```

### Step 2: Database Configuration

#### Database Connection Setup
```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  authSource?: string;
  ssl: boolean;
}
```

#### Database Setup Form
- **Host**: MongoDB host (default: localhost)
- **Port**: MongoDB port (default: 27017)
- **Database Name**: Database name (default: kanvaro)
- **Username**: Database username
- **Password**: Database password
- **Authentication Source**: Optional auth database
- **SSL**: Enable SSL connection
- **Test Connection**: Button to verify connection

#### Database Initialization Process
```typescript
async function initializeDatabase(config: DatabaseConfig) {
  // 1. Test connection
  await testConnection(config);
  
  // 2. Create database if not exists
  await createDatabase(config.database);
  
  // 3. Create collections
  await createCollections();
  
  // 4. Create indexes
  await createIndexes();
  
  // 5. Set up initial schema
  await setupSchema();
}
```

### Step 3: Admin User Creation

#### Admin Account Setup
```typescript
interface AdminUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin';
}
```

#### Organization Configuration
```typescript
interface Organization {
  name: string;
  domain?: string;
  logo?: File;
  timezone: string;
  currency: string;
  language: string;
  industry?: string;
  size: 'startup' | 'small' | 'medium' | 'enterprise';
}
```

#### Admin Setup Form Fields
- **Personal Information**:
  - First Name
  - Last Name
  - Email Address
  - Password (with strength indicator)
  - Confirm Password
- **Organization Details**:
  - Organization Name
  - Website Domain (optional)
  - Logo Upload
  - Timezone Selection
  - Currency Selection
  - Language Selection
  - Industry Type (optional)
  - Organization Size

### Step 4: Email Service Configuration

#### Email Provider Selection
```typescript
interface EmailProvider {
  type: 'smtp' | 'azure' | 'sendgrid' | 'mailgun';
  name: string;
  description: string;
  icon: string;
}
```

#### SMTP Configuration
```typescript
interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}
```

#### Azure Communication Services Configuration
```typescript
interface AzureConfig {
  connectionString: string;
  fromEmail: string;
  fromName: string;
  resourceGroup: string;
  serviceName: string;
}
```

#### Email Configuration Form
- **Provider Selection**: Radio buttons for different providers
- **SMTP Settings** (if SMTP selected):
  - SMTP Host
  - Port (25, 587, 465)
  - Security (None, TLS, SSL)
  - Username
  - Password
  - From Email Address
  - From Name
- **Azure Settings** (if Azure selected):
  - Connection String
  - From Email Address
  - From Name
  - Resource Group
  - Service Name
- **Test Email**: Send test email to admin user

### Step 5: Final Configuration & Completion

#### System Settings Review
- Database configuration summary
- Admin user information
- Organization details
- Email service configuration
- System preferences

#### Initial Data Seeding
```typescript
async function seedInitialData(adminUser: AdminUser, organization: Organization) {
  // 1. Create admin user
  const user = await createUser(adminUser);
  
  // 2. Create organization
  const org = await createOrganization(organization);
  
  // 3. Set up default project templates
  await createDefaultTemplates();
  
  // 4. Configure system settings
  await setupSystemSettings();
  
  // 5. Create initial project categories
  await createDefaultCategories();
  
  // 6. Set up notification templates
  await createNotificationTemplates();
}
```

## UI/UX Design Specifications

### Design System
- **Framework**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
- **Icons**: Lucide React
- **Components**: Professional shadcn/ui components with Radix UI primitives
- **Theme**: Modern, clean, professional with built-in accessibility
- **Responsive**: Mobile-first design with shadcn/ui responsive components

### Setup Wizard UI Components

#### Progress Indicator
```typescript
interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  icon: LucideIcon;
}
```

#### Form Components
- **Input Fields**: Styled with Tailwind CSS
- **Validation**: Real-time validation with error messages
- **File Upload**: Drag-and-drop logo upload
- **Select Dropdowns**: Custom styled select components
- **Toggle Switches**: For boolean options
- **Password Strength**: Visual password strength indicator

#### Layout Structure
```
┌─────────────────────────────────────────┐
│  Kanvaro Setup Wizard                  │
├─────────────────────────────────────────┤
│  [Progress Steps]                      │
├─────────────────────────────────────────┤
│                                         │
│  [Current Step Content]                 │
│                                         │
├─────────────────────────────────────────┤
│  [Back] [Next/Complete]                 │
└─────────────────────────────────────────┘
```

## Technical Implementation

### Setup Wizard API Endpoints

#### Database Configuration
```typescript
// POST /api/setup/database/test
async function testDatabaseConnection(config: DatabaseConfig) {
  // Test MongoDB connection
}

// POST /api/setup/database/initialize
async function initializeDatabase(config: DatabaseConfig) {
  // Initialize database and collections
}
```

#### Admin User Creation
```typescript
// POST /api/setup/admin
async function createAdminUser(userData: AdminUser) {
  // Create admin user account
}

// POST /api/setup/organization
async function createOrganization(orgData: Organization) {
  // Create organization
}
```

#### Email Configuration
```typescript
// POST /api/setup/email/test
async function testEmailConfiguration(config: EmailConfig) {
  // Test email service
}

// POST /api/setup/email/save
async function saveEmailConfiguration(config: EmailConfig) {
  // Save email configuration
}
```

#### Setup Completion
```typescript
// POST /api/setup/complete
async function completeSetup() {
  // Finalize setup and redirect to dashboard
}
```

### Database Schema for Setup

#### Setup Status Tracking
```typescript
interface SetupStatus {
  _id: ObjectId;
  step: string;
  completed: boolean;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Initial Collections Created
- Users
- Organizations
- Projects
- Tasks
- Teams
- Settings
- Notifications
- Audit Logs

### Error Handling & Recovery

#### Setup Error Scenarios
1. **Database Connection Failed**
   - Show connection error details
   - Provide troubleshooting steps
   - Allow retry with different credentials

2. **Email Service Failed**
   - Show email test failure
   - Provide alternative configurations
   - Allow skipping email setup (with warnings)

3. **File Upload Failed**
   - Show upload error
   - Provide alternative upload methods
   - Allow proceeding without logo

4. **Setup Interruption**
   - Save progress at each step
   - Allow resuming from last completed step
   - Clear setup data on restart

#### Recovery Mechanisms
```typescript
// Save setup progress
async function saveSetupProgress(step: string, data: any) {
  await SetupStatus.updateOne(
    { step },
    { $set: { data, updatedAt: new Date() } },
    { upsert: true }
  );
}

// Resume setup from last step
async function resumeSetup() {
  const lastStep = await SetupStatus.findOne({ completed: false });
  return lastStep?.step || 'database';
}
```

## Security Considerations

### Setup Security
- **One-time Setup**: Setup wizard only accessible when no admin user exists
- **Secure Passwords**: Enforce strong password requirements
- **Database Security**: Use secure database credentials
- **Email Security**: Secure email service configuration
- **Data Validation**: Comprehensive input validation
- **CSRF Protection**: CSRF tokens for all forms

### Access Control
```typescript
// Middleware to check if setup is needed
async function setupRequired(req: Request, res: Response, next: NextFunction) {
  const adminExists = await User.findOne({ role: 'admin' });
  
  if (!adminExists && req.path !== '/setup') {
    return res.redirect('/setup');
  }
  
  if (adminExists && req.path === '/setup') {
    return res.redirect('/dashboard');
  }
  
  next();
}
```

## Setup Wizard Pages

### Page Structure
```
/setup
├── /database          # Database configuration
├── /admin            # Admin user creation
├── /organization      # Organization setup
├── /email            # Email service configuration
├── /review           # Final review
└── /complete         # Setup completion
```

### Navigation Flow
```
Welcome → Database → Admin → Organization → Email → Review → Complete
   ↑         ↑        ↑         ↑           ↑       ↑        ↓
   └─────────┴────────┴─────────┴───────────┴───────┴─────── Dashboard
```

## Post-Setup Configuration

### Initial Dashboard Setup
1. **Welcome Tour**: Guided tour of main features
2. **Project Templates**: Set up initial project templates
3. **Team Invitations**: Invite initial team members
4. **Notification Preferences**: Configure notification settings
5. **System Preferences**: Set up system-wide preferences

### Default Data Seeding
- **Project Categories**: Default project categories
- **Task Templates**: Common task templates
- **Workflow Templates**: Default workflow configurations
- **Notification Templates**: Email notification templates
- **System Settings**: Default system configuration

---

*This setup wizard documentation will be updated as the implementation progresses and new requirements are identified.*
