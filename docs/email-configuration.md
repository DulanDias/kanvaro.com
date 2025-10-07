---
slug: "self-hosting/email-configuration"
title: "Email Configuration"
summary: "Configure email services for notifications, invitations, and system communications with SMTP and Azure Communication Services."
visibility: "public"
audiences: ["admin", "self_host_admin"]
category: "self-hosting"
order: 40
updated: "2025-01-04"
---

# Kanvaro - Email Configuration Setup

## Overview

Kanvaro supports multiple email service providers for sending notifications, invitations, and system emails. The setup wizard includes comprehensive email configuration for SMTP, Azure Communication Services, and other popular email providers.

## Supported Email Providers

### 1. SMTP (Simple Mail Transfer Protocol)
- **Gmail SMTP**
- **Outlook SMTP**
- **Custom SMTP Server**
- **Office 365 SMTP**

### 2. Azure Communication Services
- **Azure Email Service**
- **Azure Communication Services**
- **Azure SendGrid Integration**

### 3. Third-party Services
- **SendGrid**
- **Mailgun**
- **Amazon SES**

## Email Configuration Interface

### Provider Selection UI
```typescript
// components/setup/EmailProviderSelection.tsx
interface EmailProvider {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  popular: boolean;
  features: string[];
}

const emailProviders: EmailProvider[] = [
  {
    id: 'smtp',
    name: 'SMTP Server',
    description: 'Use your own SMTP server or email provider',
    icon: Mail,
    popular: true,
    features: ['Custom server', 'Full control', 'Any email provider']
  },
  {
    id: 'azure',
    name: 'Azure Communication Services',
    description: 'Microsoft Azure email service',
    icon: Cloud,
    popular: true,
    features: ['High deliverability', 'Scalable', 'Enterprise grade']
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Popular email delivery service',
    icon: Send,
    popular: true,
    features: ['High deliverability', 'Analytics', 'Templates']
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Developer-friendly email service',
    icon: Zap,
    popular: false,
    features: ['Developer API', 'Webhooks', 'Analytics']
  }
];
```

## SMTP Configuration

### SMTP Settings Interface
```typescript
// components/setup/SMTPConfiguration.tsx
interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  authMethod: 'login' | 'plain' | 'cram-md5';
}

const SMTPConfigurationForm = () => {
  const [config, setConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    authMethod: 'login'
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testSMTPConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            SMTP Host
          </label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="smtp.gmail.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Port
          </label>
          <select
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={25}>25 (Non-secure)</option>
            <option value={587}>587 (TLS)</option>
            <option value={465}>465 (SSL)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            placeholder="your-email@gmail.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            placeholder="App password or account password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Email
          </label>
          <input
            type="email"
            value={config.fromEmail}
            onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
            placeholder="noreply@yourcompany.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Name
          </label>
          <input
            type="text"
            value={config.fromName}
            onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
            placeholder="Kanvaro System"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Testing...
            </>
          ) : (
            <>
              <Mail className="-ml-1 mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </button>
        
        {testResult && (
          <div className={`flex items-center ${
            testResult.success ? 'text-green-600' : 'text-red-600'
          }`}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
};
```

### SMTP Connection Testing
```typescript
// lib/email/smtp-test.ts
import nodemailer from 'nodemailer';

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export async function testSMTPConnection(config: SMTPConfig): Promise<TestResult> {
  try {
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password
      }
    });

    // Verify connection
    await transporter.verify();
    
    // Send test email
    const testEmail = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to: config.username, // Send test email to the same user
      subject: 'Kanvaro Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Kanvaro Email Test</h2>
          <p>This is a test email from your Kanvaro instance.</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Sent from Kanvaro Setup Wizard
          </p>
        </div>
      `
    };

    await transporter.sendMail(testEmail);
    
    return {
      success: true,
      message: 'SMTP connection successful! Test email sent.',
      details: {
        host: config.host,
        port: config.port,
        secure: config.secure
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `SMTP connection failed: ${error.message}`,
      details: error
    };
  }
}
```

## Azure Communication Services Configuration

### Azure Setup Interface
```typescript
// components/setup/AzureConfiguration.tsx
interface AzureConfig {
  connectionString: string;
  fromEmail: string;
  fromName: string;
  resourceGroup: string;
  serviceName: string;
  region: string;
}

const AzureConfigurationForm = () => {
  const [config, setConfig] = useState<AzureConfig>({
    connectionString: '',
    fromEmail: '',
    fromName: '',
    resourceGroup: '',
    serviceName: '',
    region: 'eastus'
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testAzureConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Cloud className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Azure Communication Services Setup
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>To use Azure Communication Services, you need to:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create an Azure Communication Services resource</li>
                <li>Get the connection string from Azure portal</li>
                <li>Configure your domain for email sending</li>
                <li>Verify your domain with Azure</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Connection String
        </label>
        <input
          type="password"
          value={config.connectionString}
          onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
          placeholder="endpoint=https://your-resource.communication.azure.com/;accesskey=..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Get this from your Azure Communication Services resource in the Azure portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Email
          </label>
          <input
            type="email"
            value={config.fromEmail}
            onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
            placeholder="noreply@yourdomain.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Name
          </label>
          <input
            type="text"
            value={config.fromName}
            onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
            placeholder="Kanvaro System"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Resource Group
          </label>
          <input
            type="text"
            value={config.resourceGroup}
            onChange={(e) => setConfig({ ...config, resourceGroup: e.target.value })}
            placeholder="my-resource-group"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Service Name
          </label>
          <input
            type="text"
            value={config.serviceName}
            onChange={(e) => setConfig({ ...config, serviceName: e.target.value })}
            placeholder="my-communication-service"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Testing...
            </>
          ) : (
            <>
              <Cloud className="-ml-1 mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </button>
        
        {testResult && (
          <div className={`flex items-center ${
            testResult.success ? 'text-green-600' : 'text-red-600'
          }`}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Azure Connection Testing
```typescript
// lib/email/azure-test.ts
import { EmailClient } from '@azure/communication-email';

export async function testAzureConnection(config: AzureConfig): Promise<TestResult> {
  try {
    const emailClient = new EmailClient(config.connectionString);
    
    // Create test email message
    const emailMessage = {
      senderAddress: config.fromEmail,
      content: {
        subject: 'Kanvaro Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Kanvaro Email Test</h2>
            <p>This is a test email from your Kanvaro instance using Azure Communication Services.</p>
            <p>If you received this email, your Azure configuration is working correctly!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px;">
              Sent from Kanvaro Setup Wizard via Azure Communication Services
            </p>
          </div>
        `
      },
      recipients: {
        to: [{ address: config.fromEmail, displayName: 'Test Recipient' }]
      }
    };

    // Send test email
    const poller = await emailClient.beginSend(emailMessage);
    const result = await poller.pollUntilDone();
    
    return {
      success: true,
      message: 'Azure Communication Services connection successful! Test email sent.',
      details: {
        messageId: result.id,
        serviceName: config.serviceName,
        resourceGroup: config.resourceGroup
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Azure connection failed: ${error.message}`,
      details: error
    };
  }
}
```

## Email Service Configuration Storage

### Database Schema
```typescript
// models/EmailConfiguration.ts
export interface IEmailConfiguration extends Document {
  organization: mongoose.Types.ObjectId;
  provider: 'smtp' | 'azure' | 'sendgrid' | 'mailgun';
  config: {
    // SMTP config
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    
    // Azure config
    connectionString?: string;
    resourceGroup?: string;
    serviceName?: string;
    
    // Common config
    fromEmail: string;
    fromName: string;
  };
  isActive: boolean;
  lastTested: Date;
  testResult: {
    success: boolean;
    message: string;
    testedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmailConfigurationSchema = new Schema<IEmailConfiguration>({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  provider: { 
    type: String, 
    enum: ['smtp', 'azure', 'sendgrid', 'mailgun'],
    required: true 
  },
  config: {
    host: String,
    port: Number,
    secure: Boolean,
    username: String,
    password: String,
    connectionString: String,
    resourceGroup: String,
    serviceName: String,
    fromEmail: { type: String, required: true },
    fromName: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true },
  lastTested: Date,
  testResult: {
    success: Boolean,
    message: String,
    testedAt: Date
  }
}, {
  timestamps: true
});

export const EmailConfiguration = mongoose.model<IEmailConfiguration>('EmailConfiguration', EmailConfigurationSchema);
```

## Email Templates

### Default Email Templates
```typescript
// lib/email/templates.ts
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to Kanvaro!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #3B82F6; margin: 0;">Welcome to Kanvaro!</h1>
        </div>
        <div style="padding: 20px; background: #F9FAFB; border-radius: 8px;">
          <p>Hello {{userName}},</p>
          <p>Welcome to Kanvaro! Your account has been successfully created.</p>
          <p>You can now start managing your projects and collaborating with your team.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
        </div>
      </div>
    `
  },
  
  invitation: {
    subject: 'You\'ve been invited to join {{organizationName}} on Kanvaro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #3B82F6; margin: 0;">You're Invited!</h1>
        </div>
        <div style="padding: 20px; background: #F9FAFB; border-radius: 8px;">
          <p>Hello,</p>
          <p>{{inviterName}} has invited you to join <strong>{{organizationName}}</strong> on Kanvaro.</p>
          <p>Click the button below to accept the invitation and create your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{invitationUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 14px; color: #6B7280;">
            This invitation will expire in 7 days.
          </p>
        </div>
      </div>
    `
  },
  
  passwordReset: {
    subject: 'Reset your Kanvaro password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #3B82F6; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 20px; background: #F9FAFB; border-radius: 8px;">
          <p>Hello,</p>
          <p>You requested to reset your password for your Kanvaro account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #6B7280;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
      </div>
    `
  }
};
```

## Email Service Implementation

### Email Service Factory
```typescript
// lib/email/EmailService.ts
export class EmailService {
  private transporter: any;
  private config: IEmailConfiguration;

  constructor(config: IEmailConfiguration) {
    this.config = config;
    this.transporter = this.createTransporter();
  }

  private createTransporter() {
    switch (this.config.provider) {
      case 'smtp':
        return nodemailer.createTransporter({
          host: this.config.config.host,
          port: this.config.config.port,
          secure: this.config.config.secure,
          auth: {
            user: this.config.config.username,
            pass: this.config.config.password
          }
        });
      
      case 'azure':
        return new EmailClient(this.config.config.connectionString!);
      
      default:
        throw new Error(`Unsupported email provider: ${this.config.provider}`);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (this.config.provider === 'smtp') {
        await this.transporter.sendMail({
          from: `${this.config.config.fromName} <${this.config.config.fromEmail}>`,
          to,
          subject,
          html
        });
      } else if (this.config.provider === 'azure') {
        const emailMessage = {
          senderAddress: this.config.config.fromEmail,
          content: { subject, html },
          recipients: { to: [{ address: to }] }
        };
        await this.transporter.beginSend(emailMessage);
      }
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
}
```

---

*This email configuration documentation will be updated as new email providers are added and existing ones are enhanced.*
