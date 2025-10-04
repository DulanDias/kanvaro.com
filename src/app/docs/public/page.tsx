'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
  Globe,
  LogIn,
  Lock
} from 'lucide-react'
import Link from 'next/link'

const publicDocumentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Installation, setup wizard, and initial configuration',
    color: 'bg-blue-500',
    items: [
      {
        title: 'System Requirements',
        description: 'Hardware and software requirements',
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
\`\`\`

**5. Access Setup Wizard**
- Navigate to your server URL
- You'll be automatically redirected to the setup wizard
- Follow the guided setup process`
      },
      {
        title: 'Setup Wizard',
        description: 'Initial configuration process',
        content: `### Setup Wizard

**The setup wizard will guide you through:**

1. **Database Configuration**
   - MongoDB connection setup
   - Local or cloud database options
   - Connection string configuration

2. **Admin User Setup**
   - Create the first administrator account
   - Set secure password requirements
   - Configure admin privileges

3. **Organization Setup**
   - Organization name and branding
   - Logo upload (optional)
   - Regional settings and preferences

4. **Email Configuration**
   - SMTP server setup
   - Email notifications configuration
   - Test email functionality

**Setup Process:**
- Each step is clearly explained
- Validation ensures proper configuration
- Progress tracking shows completion status
- Help documentation available at each step`
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication & Access',
    icon: Shield,
    description: 'Login, password reset, and access information',
    color: 'bg-purple-500',
    items: [
      {
        title: 'How to Sign In',
        description: 'Accessing the system',
        content: `### How to Sign In

**Accessing the System:**

1. **Navigate to Sign In Page:**
   - Go to your Kanvaro instance URL
   - You'll be redirected to the sign in page if not authenticated

2. **Enter Your Credentials:**
   - Email address (provided by your administrator)
   - Password (provided by your administrator)

3. **First Time Sign In:**
   - You may be required to change your password
   - Follow the on-screen instructions
   - Use a strong, unique password

**Security Features:**
- Secure password hashing
- JWT token authentication
- Session management
- Auto-logout on inactivity
- Password visibility toggle

**Troubleshooting Sign In Issues:**
- Check your internet connection
- Verify the server is running
- Contact your system administrator if problems persist`
      },
      {
        title: 'Forgot Password',
        description: 'What to do if you forget your password',
        content: `### Forgot Password

**If You Forgot Your Password:**

1. **Use the Forgot Password Feature:**
   - Click "Forgot your password?" on the sign in page
   - Enter your email address
   - Check your email for a verification code

2. **Enter Verification Code:**
   - Use the 6-digit code sent to your email
   - Code is valid for 10 minutes
   - Enter the code to proceed

3. **Set New Password:**
   - Create a new, secure password
   - Password must be at least 8 characters
   - Use a combination of letters, numbers, and symbols

**Security Considerations:**
- Passwords are never stored in plain text
- All password changes are logged
- Verification codes expire in 10 minutes
- Strong password requirements are enforced

**Prevention Tips:**
- Use a password manager
- Create strong, unique passwords
- Don't share your credentials
- Sign out when finished`
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

3. **Account Creation Process:**
   - Admin creates your account
   - Temporary password is generated
   - Welcome email is sent to you
   - First sign in requires password change

**User Roles:**
- **Admin:** Full system access and management
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
        title: 'Sign In Issues',
        description: 'Common sign in problems and solutions',
        content: `### Sign In Issues

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
      },
      {
        title: 'Password Reset Issues',
        description: 'Problems with password reset process',
        content: `### Password Reset Issues

**Common Problems:**

1. **Didn't Receive Email:**
   - Check spam/junk folder
   - Verify email address is correct
   - Wait a few minutes for delivery
   - Try resending the code

2. **Verification Code Not Working:**
   - Ensure code is 6 digits
   - Check if code has expired (10 minutes)
   - Try requesting a new code
   - Contact administrator if persistent

3. **New Password Not Accepted:**
   - Password must be at least 8 characters
   - Include uppercase and lowercase letters
   - Add numbers and special characters
   - Avoid common passwords

**Getting Help:**
- Contact your system administrator
- Provide your email address
- Describe the specific issue
- Include any error messages`
      }
    ]
  }
]

export default function PublicDocumentationPage() {
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
                Public documentation for {settings?.name || organization?.name || 'Kanvaro'}. Installation guides, login help, and basic access information.
              </p>
              <p className="text-sm text-muted-foreground">
                This documentation covers the essential information needed to get started with your {settings?.name || organization?.name || 'Kanvaro'} instance.
              </p>
            </div>
          </div>

          {/* Public Documentation Notice */}
          <div className="mb-8">
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Public Documentation</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      This is the public documentation section. For advanced features and admin-specific guides, 
                      please <Link href="/login" className="underline hover:no-underline">log in</Link> to access the full documentation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {publicDocumentationSections.map((section) => {
              const Icon = section.icon
              return (
                <Card 
                  key={section.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => handleSectionClick(section.id)}
                  >
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
                      <div className="text-muted-foreground text-xl">
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
                  <div className="space-y-3">
                    <h4 className="font-medium">Need More Help?</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <Link href="/login" className="text-primary hover:underline">
                          Sign In
                        </Link> for full documentation
                      </p>
                      
                      {settings?.isConfigured && settings?.contactInfo && (
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
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
