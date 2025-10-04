'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { OrganizationLogo } from '@/components/ui/OrganizationLogo'
import { useOrganization } from '@/hooks/useOrganization'
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings'
import { 
  BookOpen, 
  User, 
  Database, 
  Mail, 
  Settings, 
  Shield, 
  HelpCircle, 
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Key,
  Users,
  Server,
  Globe
} from 'lucide-react'
import Link from 'next/link'

const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Initial setup and configuration',
    color: 'bg-blue-500',
    items: [
      {
        title: 'System Requirements',
        description: 'Hardware and software requirements for running Kanvaro',
        content: `### System Requirements

**Minimum Requirements:**
- CPU: 2 cores, 2.4GHz
- RAM: 4GB
- Storage: 20GB free space
- OS: Linux, macOS, or Windows
- Node.js: 18.x or higher
- MongoDB: 5.0 or higher

**Recommended Requirements:**
- CPU: 4 cores, 3.0GHz
- RAM: 8GB
- Storage: 50GB free space
- SSD storage for better performance

**Network Requirements:**
- Port 3000 (or configured port) must be accessible
- MongoDB port (default 27017) must be accessible
- SMTP port 587 or 465 for email functionality`
      },
      {
        title: 'Installation Guide',
        description: 'Step-by-step installation instructions',
        content: `### Installation Guide

**1. Download and Extract**
\`\`\`bash
# Download the latest release
wget https://github.com/kanvaro/kanvaro/releases/latest/download/kanvaro.tar.gz
tar -xzf kanvaro.tar.gz
cd kanvaro
\`\`\`

**2. Install Dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Environment Configuration**
\`\`\`bash
# Copy the example environment file
cp env.example .env

# Edit the environment variables
nano .env
\`\`\`

**4. Start the Application**
\`\`\`bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
\`\`\``
      }
    ]
  },
  {
    id: 'setup-wizard',
    title: 'Setup Wizard',
    icon: Settings,
    description: 'Initial configuration and setup',
    color: 'bg-green-500',
    items: [
      {
        title: 'Database Configuration',
        description: 'Setting up MongoDB connection',
        content: `### Database Configuration

**MongoDB Setup:**

1. **Local MongoDB Installation:**
   \`\`\`bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS with Homebrew
   brew install mongodb-community
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   \`\`\`

2. **MongoDB Atlas (Cloud):**
   - Create account at https://cloud.mongodb.com
   - Create a new cluster
   - Get connection string
   - Add IP whitelist

3. **Connection String Format:**
   \`\`\`
   mongodb://username:password@host:port/database
   \`\`\`

**Environment Variables:**
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/kanvaro
MONGODB_USERNAME=admin
MONGODB_PASSWORD=your-secure-password
\`\`\``
      },
      {
        title: 'Admin User Setup',
        description: 'Creating the administrator account',
        content: `### Admin User Setup

**Creating the First Admin User:**

1. **Required Information:**
   - First Name
   - Last Name
   - Email Address
   - Password (minimum 8 characters)

2. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

3. **Security Best Practices:**
   - Use a strong, unique password
   - Enable two-factor authentication (if available)
   - Keep credentials secure
   - Change default password immediately

**Admin Privileges:**
- Full system access
- User management
- Organization settings
- System configuration
- Data backup and restore`
      },
      {
        title: 'Organization Setup',
        description: 'Configuring organization details',
        content: `### Organization Setup

**Organization Information:**

1. **Basic Details:**
   - Organization Name
   - Organization Logo (optional)
   - Timezone
   - Default Language
   - Currency

2. **Logo Configuration:**
   - Supported formats: PNG, JPG, SVG
   - Recommended size: 200x200px
   - Light and dark mode logos supported
   - Maximum file size: 2MB

3. **Regional Settings:**
   - Timezone selection
   - Date format preferences
   - Number format preferences
   - Currency settings

**Organization Features:**
- Custom branding
- Multi-language support
- Regional customization
- User role management`
      },
      {
        title: 'Email Configuration',
        description: 'Setting up email notifications',
        content: `### Email Configuration

**SMTP Configuration:**

1. **Gmail SMTP:**
   \`\`\`env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   \`\`\`

2. **Outlook SMTP:**
   \`\`\`env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   \`\`\`

3. **Custom SMTP Server:**
   \`\`\`env
   SMTP_HOST=mail.yourdomain.com
   SMTP_PORT=587
   SMTP_USER=noreply@yourdomain.com
   SMTP_PASS=your-password
   SMTP_SECURE=false
   \`\`\`

**Email Features:**
- User notifications
- Password reset emails
- System alerts
- Report delivery
- Custom email templates`
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: Shield,
    description: 'Login, security, and user management',
    color: 'bg-purple-500',
    items: [
      {
        title: 'Login Process',
        description: 'How to log in to the system',
        content: `### Login Process

**Accessing the System:**

1. **Navigate to Login Page:**
   - Go to your Kanvaro instance URL
   - Click "Sign In" or navigate to /login

2. **Enter Credentials:**
   - Email address (admin@yourdomain.com)
   - Password (created during setup)

3. **Authentication:**
   - Credentials are verified securely
   - JWT tokens are generated
   - Session is established

**Security Features:**
- Secure password hashing
- JWT token authentication
- Session management
- Auto-logout on inactivity
- Password visibility toggle`
      },
      {
        title: 'Password Reset',
        description: 'How to reset forgotten passwords',
        content: `### Password Reset Process

**If You Forgot Your Password:**

1. **Contact System Administrator:**
   - Email: admin@yourdomain.com
   - Phone: [Contact your system administrator]
   - In-person: [Visit your IT department]

2. **Administrator Process:**
   - Admin will verify your identity
   - Temporary password will be provided
   - You'll be required to change it on first login

3. **Self-Service Reset (Future Feature):**
   - Email-based password reset
   - Security questions
   - Two-factor authentication

**Security Considerations:**
- Passwords are never stored in plain text
- All password changes are logged
- Temporary passwords expire in 24 hours
- Strong password requirements enforced`
      },
      {
        title: 'User Registration',
        description: 'How new users are added to the system',
        content: `### User Registration

**Adding New Users:**

1. **Admin-Only Process:**
   - Only system administrators can create accounts
   - Contact your admin to request access
   - Provide required information

2. **Required Information:**
   - Full name
   - Email address
   - Role assignment
   - Department/team

3. **Account Creation:**
   - Admin creates account
   - Temporary password generated
   - Welcome email sent
   - First login requires password change

**User Roles:**
- **Admin:** Full system access
- **Manager:** Project and team management
- **Member:** Standard user access
- **Viewer:** Read-only access

**Contact Information:**
- System Administrator: admin@yourdomain.com
- IT Support: support@yourdomain.com
- Phone: [Your support number]`
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: HelpCircle,
    description: 'Common issues and solutions',
    color: 'bg-orange-500',
    items: [
      {
        title: 'Login Issues',
        description: 'Common login problems and solutions',
        content: `### Login Issues

**Common Problems:**

1. **"Invalid Credentials" Error:**
   - Check email address spelling
   - Verify password is correct
   - Ensure Caps Lock is off
   - Try typing password in a text editor first

2. **"Session Expired" Error:**
   - Your session has timed out
   - Refresh the page and try again
   - Clear browser cookies if persistent

3. **Page Not Loading:**
   - Check internet connection
   - Verify server is running
   - Try different browser
   - Clear browser cache

4. **Database Connection Error:**
   - Contact system administrator
   - Check if MongoDB is running
   - Verify connection settings

**Still Having Issues?**
Contact your system administrator at admin@yourdomain.com`
      },
      {
        title: 'Setup Problems',
        description: 'Issues during initial setup',
        content: `### Setup Problems

**Database Connection Issues:**

1. **MongoDB Not Running:**
   \`\`\`bash
   # Check if MongoDB is running
   sudo systemctl status mongodb
   
   # Start MongoDB
   sudo systemctl start mongodb
   \`\`\`

2. **Connection String Issues:**
   - Verify MongoDB URI format
   - Check username and password
   - Ensure database exists
   - Test connection manually

**Email Configuration Issues:**

1. **SMTP Authentication Failed:**
   - Verify email credentials
   - Check SMTP settings
   - Test with email client
   - Contact email provider

2. **Email Not Sending:**
   - Check firewall settings
   - Verify port accessibility
   - Test SMTP connection
   - Review email logs

**General Setup Issues:**
- Check all environment variables
- Verify file permissions
- Review application logs
- Contact support if needed`
      }
    ]
  },
  {
    id: 'support',
    title: 'Support & Contact',
    icon: Users,
    description: 'Getting help and support',
    color: 'bg-red-500',
    items: [
      {
        title: 'System Administrator',
        description: 'Primary contact for technical issues',
        content: `### System Administrator Contact

**Primary Contact:**
- **Name:** [System Administrator Name]
- **Email:** admin@yourdomain.com
- **Phone:** [Phone Number]
- **Office Hours:** Monday-Friday, 9 AM - 5 PM

**What to Include in Support Requests:**
- Your name and email
- Description of the problem
- Steps to reproduce the issue
- Error messages (if any)
- Browser and operating system
- Screenshots (if helpful)

**Response Times:**
- Critical issues: Within 2 hours
- General issues: Within 24 hours
- Feature requests: Within 1 week`
      },
      {
        title: 'IT Support Team',
        description: 'Additional technical support',
        content: `### IT Support Team

**Support Channels:**
- **Email:** support@yourdomain.com
- **Phone:** [Support Phone Number]
- **Help Desk:** [Internal ticketing system]
- **Office:** [Physical location]

**Support Hours:**
- Monday-Friday: 8 AM - 6 PM
- Saturday: 9 AM - 1 PM
- Sunday: Closed
- Holidays: Limited support

**Self-Service Resources:**
- This documentation wiki
- Video tutorials
- FAQ section
- User guides`
      }
    ]
  }
]

export default function DocumentationPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const { organization } = useOrganization()
  const { settings, loading: settingsLoading } = useOrganizationSettings()

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(selectedSection === sectionId ? null : sectionId)
    setSelectedItem(null)
  }

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
  }

  const handleBack = () => {
    setSelectedItem(null)
  }

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    <OrganizationLogo 
                      lightLogo={organization?.logo} 
                      darkLogo={organization?.darkLogo}
                      logoMode={organization?.logoMode}
                      fallbackText={organization?.name?.charAt(0) || 'K'}
                      size="sm"
                      className="rounded"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
                    <p className="text-sm text-muted-foreground">{organization?.name || 'Kanvaro'} Help Center</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedItem.title}</CardTitle>
                    <p className="text-muted-foreground">{selectedItem.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    {selectedItem.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header - Left Aligned like Setup Flow */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <OrganizationLogo 
                  lightLogo={settings?.logo || organization?.logo} 
                  darkLogo={settings?.darkLogo || organization?.darkLogo}
                  logoMode={settings?.logoMode || organization?.logoMode}
                  fallbackText={settings?.name?.charAt(0) || organization?.name?.charAt(0) || 'K'}
                  size="md"
                  className="rounded"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Documentation</h1>
                <p className="text-muted-foreground">{settings?.name || organization?.name || 'Kanvaro'} Help Center</p>
              </div>
            </div>
            <div className="max-w-3xl">
              <p className="text-muted-foreground mb-4">
                Comprehensive guides, tutorials, and troubleshooting information for {settings?.name || organization?.name || 'Kanvaro'}.
              </p>
              <p className="text-sm text-muted-foreground">
                Access detailed documentation, admin guides, and advanced features based on your permissions.
              </p>
            </div>
          </div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentationSections.map((section) => {
              const Icon = section.icon
              return (
                <Card 
                  key={section.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSectionClick(section.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-lg ${section.color} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        {selectedSection === section.id ? '−' : '+'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedSection === section.id && (
                      <div className="space-y-3">
                        {section.items.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleItemClick(item)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Help */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>Quick Help</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Common Issues</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Can't log in? Check your credentials</li>
                      <li>• Forgot password? Contact your administrator</li>
                      <li>• Setup issues? Check database connection</li>
                      <li>• Email not working? Verify SMTP settings</li>
                    </ul>
                  </div>
                  {settings?.isConfigured && settings?.contactInfo && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Contact Support</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>
                          <strong>System Administrator:</strong><br />
                          {settings.contactInfo.adminName}<br />
                          <a href={`mailto:${settings.contactInfo.adminEmail}`} className="text-primary hover:underline">
                            {settings.contactInfo.adminEmail}
                          </a>
                          {settings.contactInfo.adminPhone && (
                            <><br />
                            <a href={`tel:${settings.contactInfo.adminPhone}`} className="text-primary hover:underline">
                              {settings.contactInfo.adminPhone}
                            </a></>
                          )}
                        </div>
                        
                        {settings.contactInfo.supportEmail && (
                          <div>
                            <strong>IT Support:</strong><br />
                            <a href={`mailto:${settings.contactInfo.supportEmail}`} className="text-primary hover:underline">
                              {settings.contactInfo.supportEmail}
                            </a>
                            {settings.contactInfo.supportPhone && (
                              <><br />
                              <a href={`tel:${settings.contactInfo.supportPhone}`} className="text-primary hover:underline">
                                {settings.contactInfo.supportPhone}
                              </a></>
                            )}
                          </div>
                        )}
                        
                        {settings.contactInfo.supportHours && (
                          <div>
                            <strong>Support Hours:</strong><br />
                            {settings.contactInfo.supportHours}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
