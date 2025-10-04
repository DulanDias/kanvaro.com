'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useOrganization } from '@/hooks/useOrganization'
import { Mail, Send, AlertCircle, CheckCircle, TestTube, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function EmailSettings() {
  const { organization, loading } = useOrganization()
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    provider: 'smtp' as 'smtp' | 'azure' | 'sendgrid' | 'mailgun' | 'skip',
    smtp: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromEmail: '',
      fromName: ''
    },
    azure: {
      clientId: '',
      clientSecret: '',
      tenantId: '',
      fromEmail: '',
      fromName: ''
    }
  })
  
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load email configuration from API
  useEffect(() => {
    const loadEmailConfig = async () => {
      try {
        const response = await fetch('/api/settings/email')
        if (response.ok) {
          const config = await response.json()
          setFormData({
            provider: config.provider || 'smtp',
            smtp: {
              host: config.smtp?.host || '',
              port: config.smtp?.port || 587,
              secure: config.smtp?.secure || false,
              username: config.smtp?.username || '',
              password: config.smtp?.password || '',
              fromEmail: config.smtp?.fromEmail || '',
              fromName: config.smtp?.fromName || ''
            },
            azure: {
              clientId: config.azure?.clientId || '',
              clientSecret: config.azure?.clientSecret || '',
              tenantId: config.azure?.tenantId || '',
              fromEmail: config.azure?.fromEmail || '',
              fromName: config.azure?.fromName || ''
            }
          })
        }
      } catch (error) {
        console.error('Failed to load email configuration:', error)
      } finally {
        // Loading completed
      }
    }

    loadEmailConfig()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.provider === 'smtp') {
      if (!formData.smtp.host.trim()) newErrors.host = 'SMTP host is required'
      if (!formData.smtp.username.trim()) newErrors.username = 'Username is required'
      if (!formData.smtp.password.trim()) newErrors.password = 'Password is required'
      if (!formData.smtp.fromEmail.trim()) newErrors.fromEmail = 'From email is required'
      if (!formData.smtp.fromName.trim()) newErrors.fromName = 'From name is required'
      if (formData.smtp.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.smtp.fromEmail)) {
        newErrors.fromEmail = 'Please enter a valid email address'
      }
    } else if (formData.provider === 'azure') {
      if (!formData.azure.clientId.trim()) newErrors.clientId = 'Client ID is required'
      if (!formData.azure.clientSecret.trim()) newErrors.clientSecret = 'Client Secret is required'
      if (!formData.azure.tenantId.trim()) newErrors.tenantId = 'Tenant ID is required'
      if (!formData.azure.fromEmail.trim()) newErrors.fromEmail = 'From email is required'
      if (!formData.azure.fromName.trim()) newErrors.fromName = 'From name is required'
      if (formData.azure.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.azure.fromEmail)) {
        newErrors.fromEmail = 'Please enter a valid email address'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTestEmail = async () => {
    setTesting(true)
    setTestResult(null)
    setTestMessage('')

    try {
      const response = await fetch('/api/setup/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult('success')
        setTestMessage('Email configuration test successful!')
      } else {
        setTestResult('error')
        setTestMessage(result.error || 'Email test failed')
      }
    } catch (error) {
      setTestResult('error')
      setTestMessage('Email test failed')
    } finally {
      setTesting(false)
    }
  }


  const handleSave = async () => {
    if (formData.provider !== 'skip' && !validateForm()) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update email settings')
      }

      setMessage({ type: 'success', text: 'Email settings updated successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update email settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!validateForm()) {
      return
    }
    await handleTestEmail()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure your email provider settings for sending notifications and invitations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Provider Selection */}
          <div className="space-y-4">
            <Label>Email Provider</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.provider === 'smtp'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => setFormData({ ...formData, provider: 'smtp' })}
              >
                <div className="text-center">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">SMTP Server</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use your own SMTP server
                  </p>
                </div>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.provider === 'azure'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => setFormData({ ...formData, provider: 'azure' })}
              >
                <div className="text-center">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Azure App</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use Azure App with Exchange Online
                  </p>
                </div>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.provider === 'skip'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => setFormData({ ...formData, provider: 'skip' })}
              >
                <div className="text-center">
                  <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-semibold">Skip Email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Disable email notifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {formData.provider === 'smtp' && (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>SMTP Configuration</AlertTitle>
                <AlertDescription>
                  Configure your SMTP server settings. Common providers: Gmail (smtp.gmail.com:587), Outlook (smtp-mail.outlook.com:587), or your custom SMTP server.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host *</Label>
                  <Input
                    id="smtp-host"
                    type="text"
                    value={formData.smtp.host}
                    onChange={(e) => setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, host: e.target.value.trim() }
                    })}
                    placeholder="smtp.gmail.com"
                    className={errors.host ? 'border-red-500' : ''}
                  />
                  {errors.host && (
                    <p className="text-sm text-red-600">{errors.host}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port *</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={formData.smtp.port}
                    onChange={(e) => setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, port: parseInt(e.target.value) || 587 }
                    })}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp-secure"
                  checked={formData.smtp.secure}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, secure: checked }
                  })}
                />
                <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Username *</Label>
                  <Input
                    id="smtp-username"
                    type="text"
                    value={formData.smtp.username}
                    onChange={(e) => setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, username: e.target.value.trim() }
                    })}
                    placeholder="your-email@gmail.com"
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Password *</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={formData.smtp.password}
                    onChange={(e) => setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, password: e.target.value }
                    })}
                    placeholder="Email account password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-from-email">From Email *</Label>
                  <Input
                    id="smtp-from-email"
                    type="email"
                    value={formData.smtp.fromEmail}
                    onChange={(e) => setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, fromEmail: e.target.value.trim() }
                    })}
                    placeholder="noreply@yourcompany.com"
                    className={errors.fromEmail ? 'border-red-500' : ''}
                  />
                  {errors.fromEmail && (
                    <p className="text-sm text-red-600">{errors.fromEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-from-name">From Name *</Label>
                  <Input
                    id="smtp-from-name"
                    type="text"
                    value={formData.smtp.fromName}
                    onChange={(e) => setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, fromName: e.target.value.trim() }
                    })}
                    placeholder="Your Company"
                    className={errors.fromName ? 'border-red-500' : ''}
                  />
                  {errors.fromName && (
                    <p className="text-sm text-red-600">{errors.fromName}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.provider === 'azure' && (
            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>Azure App Configuration</AlertTitle>
                <AlertDescription>
                  Configure your Azure App registration for Exchange Online. You'll need to create an app in Azure Portal and grant it Mail.Send permissions.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-client-id">Client ID *</Label>
                  <Input
                    id="azure-client-id"
                    type="text"
                    value={formData.azure.clientId}
                    onChange={(e) => setFormData({
                      ...formData,
                      azure: { ...formData.azure, clientId: e.target.value }
                    })}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className={errors.clientId ? 'border-red-500' : ''}
                  />
                  {errors.clientId && (
                    <p className="text-sm text-red-600">{errors.clientId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azure-tenant-id">Tenant ID *</Label>
                  <Input
                    id="azure-tenant-id"
                    type="text"
                    value={formData.azure.tenantId}
                    onChange={(e) => setFormData({
                      ...formData,
                      azure: { ...formData.azure, tenantId: e.target.value }
                    })}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className={errors.tenantId ? 'border-red-500' : ''}
                  />
                  {errors.tenantId && (
                    <p className="text-sm text-red-600">{errors.tenantId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="azure-client-secret">Client Secret *</Label>
                <Input
                  id="azure-client-secret"
                  type="password"
                  value={formData.azure.clientSecret}
                  onChange={(e) => setFormData({
                    ...formData,
                    azure: { ...formData.azure, clientSecret: e.target.value }
                  })}
                  placeholder="Enter your Azure app client secret"
                  className={errors.clientSecret ? 'border-red-500' : ''}
                />
                {errors.clientSecret && (
                  <p className="text-sm text-red-600">{errors.clientSecret}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-from-email">From Email *</Label>
                  <Input
                    id="azure-from-email"
                    type="email"
                    value={formData.azure.fromEmail}
                    onChange={(e) => setFormData({
                      ...formData,
                      azure: { ...formData.azure, fromEmail: e.target.value.trim() }
                    })}
                    placeholder="noreply@yourcompany.com"
                    className={errors.fromEmail ? 'border-red-500' : ''}
                  />
                  {errors.fromEmail && (
                    <p className="text-sm text-red-600">{errors.fromEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azure-from-name">From Name *</Label>
                  <Input
                    id="azure-from-name"
                    type="text"
                    value={formData.azure.fromName}
                    onChange={(e) => setFormData({
                      ...formData,
                      azure: { ...formData.azure, fromName: e.target.value.trim() }
                    })}
                    placeholder="Your Company"
                    className={errors.fromName ? 'border-red-500' : ''}
                  />
                  {errors.fromName && (
                    <p className="text-sm text-red-600">{errors.fromName}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.provider === 'skip' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Email notifications disabled</p>
                <p>Email functionality will be disabled for this organization.</p>
              </AlertDescription>
            </Alert>
          )}

          {formData.provider !== 'skip' && (
            <div className="flex items-center justify-between">
              <Button 
                onClick={handleTest} 
                disabled={testing || saving}
                variant="outline"
                className="flex items-center gap-2"
              >
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                {testing ? 'Testing...' : 'Test Email'}
              </Button>

              {testResult && (
                <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
                  {testResult === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {testMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
