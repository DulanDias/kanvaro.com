---
slug: "getting-started/setup-wizard"
title: "Setup Wizard Guide"
summary: "Step-by-step guide to initial Kanvaro setup using the WordPress-style installation wizard for first-time configuration."
visibility: "public"
audiences: ["admin", "self_host_admin"]
category: "how-to"
order: 10
updated: "2025-01-04"
---

# Setup Wizard Guide

## What This Is

The Kanvaro Setup Wizard is a WordPress-style installation process that guides you through the initial configuration of your Kanvaro instance. It handles database setup, admin user creation, organization configuration, and basic system settings.

## Basic Theory

The setup wizard follows a progressive disclosure pattern, collecting essential information in logical steps:

1. **Database Configuration** - Establishes connection to your database
2. **Admin Account Creation** - Creates the first system administrator
3. **Organization Setup** - Configures your organization/company profile
4. **Email Configuration** - Sets up email delivery for notifications
5. **System Preferences** - Configures default settings and themes

## Prerequisites

- Kanvaro application deployed and accessible
- Database server running and accessible
- SMTP server for email delivery (optional but recommended)
- Domain name or IP address for your Kanvaro instance

## Step-by-Step Setup

### Step 1: Access the Setup Wizard

1. Navigate to your Kanvaro instance URL
2. If this is the first time accessing the system, you'll be automatically redirected to the setup wizard
3. Alternatively, visit `/setup` directly

### Step 2: Database Configuration

1. **Database Type**: Select your database type (MongoDB, PostgreSQL, MySQL)
2. **Connection Details**:
   - Host: Database server address
   - Port: Database port (default varies by type)
   - Database Name: Name of your database
   - Username: Database user credentials
   - Password: Database password
3. **Test Connection**: Click "Test Connection" to verify settings
4. **Create Tables**: Click "Initialize Database" to create required tables

### Step 3: Create Admin Account

1. **Personal Information**:
   - Full Name: Your display name
   - Email Address: Your admin email
   - Password: Strong password (minimum 8 characters)
   - Confirm Password: Re-enter password
2. **Account Settings**:
   - Time Zone: Select your local timezone
   - Language: Choose your preferred language
3. **Security**: Enable two-factor authentication (recommended)

### Step 4: Organization Setup

1. **Organization Details**:
   - Organization Name: Your company/organization name
   - Industry: Select your industry type
   - Company Size: Number of employees
2. **Contact Information**:
   - Address: Physical address
   - Phone: Contact number
   - Website: Company website (optional)
3. **Branding**:
   - Logo: Upload company logo
   - Primary Color: Brand color for the interface

### Step 5: Email Configuration

1. **SMTP Settings**:
   - SMTP Server: Your email server address
   - Port: SMTP port (usually 587 or 465)
   - Security: SSL/TLS encryption
   - Username: Email account username
   - Password: Email account password
2. **Test Email**: Send a test email to verify configuration
3. **Email Templates**: Configure default email templates

### Step 6: System Preferences

1. **Default Settings**:
   - Currency: Default currency for financial tracking
   - Date Format: Date display format
   - Time Format: 12-hour or 24-hour format
2. **Security Settings**:
   - Session Timeout: User session duration
   - Password Policy: Password requirements
   - Login Attempts: Failed login lockout settings
3. **Notification Settings**:
   - Email Notifications: Enable/disable email alerts
   - Push Notifications: Enable/disable browser notifications

### Step 7: Final Configuration

1. **Review Settings**: Review all configuration options
2. **Create Sample Data**: Optionally create sample projects and tasks
3. **Complete Setup**: Click "Complete Setup" to finish

## Validation

After completing the setup wizard:

1. **Login Test**: Log in with your admin credentials
2. **Dashboard Access**: Verify you can access the main dashboard
3. **Email Test**: Send a test email to confirm email configuration
4. **Database Check**: Verify all tables were created successfully
5. **File Permissions**: Ensure upload directories are writable

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify database server is running
- Check connection credentials
- Ensure database exists and is accessible
- Check firewall settings

**Email Configuration Issues**
- Verify SMTP server settings
- Check authentication credentials
- Test with a simple email client first
- Ensure port 587/465 is not blocked

**File Permission Errors**
- Set correct permissions on upload directories
- Ensure web server has write access
- Check disk space availability

**Setup Wizard Not Loading**
- Clear browser cache
- Check for JavaScript errors in console
- Verify all required files are present
- Check web server configuration

### Advanced Configuration

**Custom Database Settings**
```bash
# Environment variables for advanced configuration
DB_HOST=your-db-host
DB_PORT=27017
DB_NAME=kanvaro
DB_USER=kanvaro_user
DB_PASS=secure_password
```

**Email Provider Configuration**
- **Gmail**: Use App Passwords for authentication
- **Outlook**: Configure OAuth2 authentication
- **Custom SMTP**: Use your organization's email server

## Audience-Specific Notes

### For Self-hosting Admins
- Ensure your server meets minimum requirements
- Configure SSL certificates for secure access
- Set up regular database backups
- Monitor system resources during setup

### For Organization Admins
- Prepare organization information before starting
- Have company branding assets ready
- Plan user roles and permissions structure
- Consider integration requirements

## Next Steps

After completing the setup wizard:

1. **Invite Team Members**: Add your team to the organization
2. **Create Your First Project**: Set up your initial project
3. **Configure Integrations**: Set up any required third-party integrations
4. **Customize Settings**: Fine-tune system preferences
5. **Train Users**: Provide training to team members

## Security Considerations

- Use strong passwords for all accounts
- Enable two-factor authentication
- Regularly update the system
- Monitor access logs
- Implement backup strategies
- Use HTTPS in production

---

*This guide covers the basic setup wizard process. For advanced configuration options, see the [Advanced Configuration Guide](../operations/advanced-configuration.md).*
