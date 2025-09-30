'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [steps] = useState<SetupStep[]>([
    {
      id: 'preflight',
      title: 'Preflight Check',
      description: 'Verify system requirements',
      completed: false,
    },
    {
      id: 'organization',
      title: 'Organization',
      description: 'Set up your organization',
      completed: false,
    },
    {
      id: 'admin',
      title: 'Admin Account',
      description: 'Create your admin account',
      completed: false,
    },
    {
      id: 'email',
      title: 'Email Settings',
      description: 'Configure email notifications',
      completed: false,
    },
    {
      id: 'defaults',
      title: 'Defaults',
      description: 'Create default project and board',
      completed: false,
    },
    {
      id: 'security',
      title: 'Security & URLs',
      description: 'Configure security settings',
      completed: false,
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Finish setup',
      completed: false,
    },
  ]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    // TODO: Implement actual setup completion
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    // Redirect to login or dashboard
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PreflightStep />;
      case 1:
        return <OrganizationStep />;
      case 2:
        return <AdminStep />;
      case 3:
        return <EmailStep />;
      case 4:
        return <DefaultsStep />;
      case 5:
        return <SecurityStep />;
      case 6:
        return <CompleteStep />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Progress Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : index === currentStep ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PreflightStep() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        We'll check your system requirements and verify that everything is ready
        for Kanvaro.
      </p>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm">Database connection</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm">Redis cache</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm">S3 storage</span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm">Email service</span>
        </div>
      </div>
    </div>
  );
}

function OrganizationStep() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="orgName">Organization Name</Label>
        <Input id="orgName" placeholder="Enter your organization name" />
      </div>

      <div>
        <Label htmlFor="orgLogo">Logo (Optional)</Label>
        <Input id="orgLogo" type="file" accept="image/*" />
      </div>

      <div>
        <Label htmlFor="primaryColor">Primary Color</Label>
        <Input id="primaryColor" type="color" defaultValue="#3b82f6" />
      </div>

      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <Input id="timezone" defaultValue="UTC" />
      </div>
    </div>
  );
}

function AdminStep() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="adminName">Full Name</Label>
        <Input id="adminName" placeholder="Enter your full name" />
      </div>

      <div>
        <Label htmlFor="adminEmail">Email Address</Label>
        <Input id="adminEmail" type="email" placeholder="Enter your email" />
      </div>

      <div>
        <Label htmlFor="adminPassword">Password</Label>
        <Input
          id="adminPassword"
          type="password"
          placeholder="Create a strong password"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input id="enableMfa" type="checkbox" />
        <Label htmlFor="enableMfa">Enable two-factor authentication</Label>
      </div>
    </div>
  );
}

function EmailStep() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Configure email settings for notifications and user invitations.
      </p>

      <div>
        <Label htmlFor="fromEmail">From Email</Label>
        <Input
          id="fromEmail"
          type="email"
          placeholder="noreply@yourdomain.com"
        />
      </div>

      <div>
        <Label htmlFor="fromName">From Name</Label>
        <Input id="fromName" placeholder="Kanvaro" />
      </div>

      <div>
        <Label htmlFor="testEmail">Test Email Address</Label>
        <Input id="testEmail" type="email" placeholder="test@example.com" />
      </div>

      <Button variant="outline" size="sm">
        Send Test Email
      </Button>
    </div>
  );
}

function DefaultsStep() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Create a default project and board to get started quickly.
      </p>

      <div className="flex items-center space-x-2">
        <input id="createSampleData" type="checkbox" />
        <Label htmlFor="createSampleData">
          Create sample data for demonstration
        </Label>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Default Project</h4>
        <p className="text-sm text-blue-700">
          We'll create a "Default Project" with a Kanban board containing
          Backlog, In Progress, Review, and Done columns.
        </p>
      </div>
    </div>
  );
}

function SecurityStep() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Configure security settings and URLs for your Kanvaro instance.
      </p>

      <div>
        <Label htmlFor="appUrl">App Base URL</Label>
        <Input id="appUrl" placeholder="https://app.yourdomain.com" />
      </div>

      <div>
        <Label htmlFor="apiUrl">API Base URL</Label>
        <Input id="apiUrl" placeholder="https://api.yourdomain.com" />
      </div>

      <div>
        <Label htmlFor="cookieDomain">Cookie Domain</Label>
        <Input id="cookieDomain" placeholder="yourdomain.com" />
      </div>

      <div>
        <Label htmlFor="cspMode">Content Security Policy Mode</Label>
        <select id="cspMode" className="w-full p-2 border rounded">
          <option value="strict">Strict</option>
          <option value="standard">Standard</option>
        </select>
      </div>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h3 className="text-xl font-semibold">Setup Complete!</h3>
      <p className="text-gray-600">
        Your Kanvaro instance is ready to use. You can now start managing your
        projects and teams.
      </p>
    </div>
  );
}
