# Kanvaro - shadcn/ui Integration Guide

## Overview

Kanvaro leverages [shadcn/ui](https://ui.shadcn.com/) - a modern, accessible component library built on Radix UI primitives and Tailwind CSS. This ensures professional-quality components with built-in accessibility, faster development, and seamless Next.js integration.

## Why shadcn/ui for Kanvaro?

### ✅ **Faster Development**
- Professional components out of the box
- No need to build common UI patterns from scratch
- Consistent design system across the application
- Rapid prototyping and iteration

### ✅ **Built-in Accessibility**
- Radix UI primitives handle a11y concerns automatically
- Keyboard navigation support
- Screen reader compatibility
- ARIA attributes included by default

### ✅ **Highly Customizable**
- Copy components to your project for full control
- Easy to modify and extend
- Brand-specific theming
- Component variants and styling

### ✅ **Next.js Optimized**
- Seamless integration with Next.js
- Server-side rendering support
- TypeScript-first approach
- Modern React patterns

## Installation & Setup

### 1. Initialize shadcn/ui
```bash
# Install shadcn/ui
npx shadcn-ui@latest init

# This will create:
# - components.json (configuration)
# - lib/utils.ts (utility functions)
# - components/ui/ (component directory)
```

### 2. Configure components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 3. Install Required Components
```bash
# Core components for Kanvaro
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add sidebar
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add date-picker
npx shadcn-ui@latest add command
npx shadcn-ui@latest add combobox
npx shadcn-ui@latest add data-table
npx shadcn-ui@latest add chart
```

## Kanvaro-Specific Component Usage

### Setup Wizard Components

#### Progress Steps with shadcn/ui
```typescript
// components/setup/ProgressSteps.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

export const ProgressSteps = ({ steps, currentStep }: ProgressStepsProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-8">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2',
                      {
                        'border-primary bg-primary text-primary-foreground': step.status === 'completed',
                        'border-primary bg-white text-primary': step.status === 'current',
                        'border-muted bg-muted text-muted-foreground': step.status === 'upcoming',
                      }
                    )}
                  >
                    {step.status === 'completed' ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'ml-4 text-sm font-medium',
                      {
                        'text-primary': step.status === 'current',
                        'text-muted-foreground': step.status === 'upcoming',
                        'text-foreground': step.status === 'completed',
                      }
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {stepIdx < steps.length - 1 && (
                  <div className="ml-8 h-0.5 w-8 bg-muted" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </CardContent>
    </Card>
  );
};
```

#### Setup Form with shadcn/ui
```typescript
// components/setup/SetupForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export const SetupForm = ({
  title,
  description,
  children,
  onBack,
  onNext,
  onComplete,
  isLastStep = false,
  isLoading = false
}: SetupFormProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="ml-auto">
            {isLastStep ? (
              <Button
                onClick={onComplete}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Database Configuration Form
```typescript
// components/setup/DatabaseConfiguration.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Database, Loader2 } from 'lucide-react';

export const DatabaseConfiguration = () => {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: 'localhost',
    port: 27017,
    database: 'kanvaro',
    username: '',
    password: '',
    authSource: 'admin',
    ssl: false
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Configure your MongoDB database connection. Make sure MongoDB is running and accessible.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="host">Database Host</Label>
          <Input
            id="host"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="localhost"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            type="number"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
            placeholder="27017"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="database">Database Name</Label>
        <Input
          id="database"
          value={config.database}
          onChange={(e) => setConfig({ ...config, database: e.target.value })}
          placeholder="kanvaro"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            placeholder="admin"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          onClick={handleTestConnection}
          disabled={testing}
          className="flex items-center"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
        
        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
```

### Email Configuration Form
```typescript
// components/setup/EmailConfiguration.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Mail, Cloud, Send, Zap } from 'lucide-react';

export const EmailConfiguration = () => {
  const [provider, setProvider] = useState<'smtp' | 'azure' | 'sendgrid' | 'mailgun'>('smtp');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  return (
    <div className="space-y-6">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Configure your email service to send notifications, invitations, and system emails.
        </AlertDescription>
      </Alert>

      <Tabs value={provider} onValueChange={(value) => setProvider(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smtp" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="azure" className="flex items-center">
            <Cloud className="mr-2 h-4 w-4" />
            Azure
          </TabsTrigger>
          <TabsTrigger value="sendgrid" className="flex items-center">
            <Send className="mr-2 h-4 w-4" />
            SendGrid
          </TabsTrigger>
          <TabsTrigger value="mailgun" className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Mailgun
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-4">
          <SMTPConfiguration />
        </TabsContent>

        <TabsContent value="azure" className="space-y-4">
          <AzureConfiguration />
        </TabsContent>

        <TabsContent value="sendgrid" className="space-y-4">
          <SendGridConfiguration />
        </TabsContent>

        <TabsContent value="mailgun" className="space-y-4">
          <MailgunConfiguration />
        </TabsContent>
      </Tabs>

      <div className="flex items-center space-x-4">
        <Button
          onClick={handleTestConnection}
          disabled={testing}
          className="flex items-center"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
        
        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
```

## Dashboard Components

### Project Dashboard with shadcn/ui
```typescript
// components/dashboard/ProjectDashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ProjectDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Badge variant="secondary">12</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Badge variant="default">24</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+4 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Badge variant="outline">8</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 new member</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Badge variant="secondary">85%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.team.map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{project.progress}%</div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
```

## Theming & Customization

### Custom Theme Configuration
```typescript
// lib/theme.ts
export const themeConfig = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 84% 4.9%)',
    primary: 'hsl(221.2 83.2% 53.3%)',
    primaryForeground: 'hsl(210 40% 98%)',
    secondary: 'hsl(210 40% 96%)',
    secondaryForeground: 'hsl(222.2 84% 4.9%)',
    muted: 'hsl(210 40% 96%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',
    accent: 'hsl(210 40% 96%)',
    accentForeground: 'hsl(222.2 84% 4.9%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(221.2 83.2% 53.3%)',
  },
  dark: {
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    card: 'hsl(222.2 84% 4.9%)',
    cardForeground: 'hsl(210 40% 98%)',
    primary: 'hsl(217.2 91.2% 59.8%)',
    primaryForeground: 'hsl(222.2 84% 4.9%)',
    secondary: 'hsl(217.2 32.6% 17.5%)',
    secondaryForeground: 'hsl(210 40% 98%)',
    muted: 'hsl(217.2 32.6% 17.5%)',
    mutedForeground: 'hsl(215 20.2% 65.1%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
    accentForeground: 'hsl(210 40% 98%)',
    destructive: 'hsl(0 62.8% 30.6%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(217.2 32.6% 17.5%)',
    input: 'hsl(217.2 32.6% 17.5%)',
    ring: 'hsl(224.3 76.3% 94.1%)',
  }
};
```

## Best Practices

### 1. Component Composition
```typescript
// Use shadcn/ui components as building blocks
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProjectCard = ({ project }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        {project.name}
        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
          {project.status}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{project.description}</p>
      <Button className="mt-4">View Project</Button>
    </CardContent>
  </Card>
);
```

### 2. Consistent Styling
```typescript
// Use Tailwind classes consistently
// Good: Using semantic color tokens
<Button variant="default" className="bg-primary text-primary-foreground">

// Good: Using component variants
<Button variant="outline" size="sm">

// Good: Using utility classes for spacing
<div className="space-y-4 p-6">
```

### 3. Accessibility
```typescript
// shadcn/ui components include accessibility by default
// Always use proper labels and ARIA attributes
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" aria-describedby="email-help" />
<p id="email-help" className="text-sm text-muted-foreground">
  We'll never share your email.
</p>
```

---

*This shadcn/ui integration guide will be updated as new components are added and best practices evolve.*
