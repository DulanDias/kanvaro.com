'use client'

import { CheckCircle, Database, User, Building, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SetupCompleteProps {
  onComplete: () => void
  onBack: () => void
  setupData: any
  isLoading: boolean
}

export const SetupComplete = ({ onComplete, onBack, setupData, isLoading }: SetupCompleteProps) => {
  const setupSteps = [
    {
      title: 'Database Configuration',
      icon: Database,
      completed: !!setupData.database,
      details: setupData.database ? `${setupData.database.host}:${setupData.database.port}` : 'Not configured'
    },
    {
      title: 'Admin User',
      icon: User,
      completed: !!setupData.admin,
      details: setupData.admin ? `${setupData.admin.firstName} ${setupData.admin.lastName}` : 'Not created'
    },
    {
      title: 'Organization',
      icon: Building,
      completed: !!setupData.organization,
      details: setupData.organization ? 
        (() => {
          let details = setupData.organization.name
          if (setupData.organization.logo && setupData.organization.darkLogo) {
            details += ' (with light & dark logos)'
          } else if (setupData.organization.logo || setupData.organization.darkLogo) {
            details += ' (with logo)'
          }
          return details
        })() : 
        'Not configured'
    },
    {
      title: 'Email Service',
      icon: Mail,
      completed: !!setupData.email,
      details: setupData.email ? 
        (setupData.email.provider === 'skip' ? 'Skipped' : 
         setupData.email.provider === 'smtp' ? 'SMTP Configured' : 
         'Azure Configured') : 'Not configured'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-start space-x-4 mb-8">
        <div className="flex-shrink-0">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Setup Complete!
          </h2>
          <p className="text-muted-foreground">
            Your Kanvaro instance is ready to use
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Setup Summary
        </h3>
        <div className="space-y-3">
          {setupSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    step.completed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {step.title}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    step.completed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.details}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-accent/50 border border-accent rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          What's Next?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Access your dashboard to start managing projects</li>
          <li>• Invite team members to collaborate</li>
          <li>• Create your first project</li>
          <li>• Configure additional settings as needed</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Completing Setup...
            </>
          ) : (
            <>
              Complete Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
