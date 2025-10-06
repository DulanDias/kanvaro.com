'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useOrganization } from '@/hooks/useOrganization'
import { Building2, Upload, Save, AlertCircle, X, Users, UserCheck, Building, Crown } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCurrencies } from '@/hooks/useCurrencies'

export function OrganizationSettings() {
  const { organization, loading } = useOrganization()
  const { currencies, loading: currenciesLoading, formatCurrencyDisplay } = useCurrencies(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    timezone: 'UTC',
    currency: 'USD',
    language: 'en',
    industry: '',
    size: 'small' as 'startup' | 'small' | 'medium' | 'enterprise',
    allowSelfRegistration: false,
    requireEmailVerification: true,
    defaultUserRole: 'team_member',
    timeTracking: {
      allowTimeTracking: true,
      allowManualTimeSubmission: true,
      requireApproval: false,
      allowBillableTime: true,
      defaultHourlyRate: 0,
      maxDailyHours: 12,
      maxWeeklyHours: 60,
      maxSessionHours: 8,
      allowOvertime: false,
      requireDescription: true,
      requireCategory: false,
      allowFutureTime: false,
      allowPastTime: true,
      pastTimeLimitDays: 30,
      roundingRules: {
        enabled: false,
        increment: 15,
        roundUp: true
      },
      notifications: {
        onTimerStart: false,
        onTimerStop: true,
        onOvertime: true,
        onApprovalNeeded: true,
        onTimeSubmitted: true
      }
    }
  })
  
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [darkLogo, setDarkLogo] = useState<File | null>(null)
  const [darkLogoPreview, setDarkLogoPreview] = useState<string | null>(null)
  const [logoMode, setLogoMode] = useState<'single' | 'dual'>('single')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney'
  ]

  // Currencies are now loaded from database via useCurrencies hook

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Real Estate', 'Media', 'Non-profit', 'Other'
  ]

  const organizationSizes = [
    { value: 'startup', label: 'Startup (1-10 employees)' },
    { value: 'small', label: 'Small (11-50 employees)' },
    { value: 'medium', label: 'Medium (51-200 employees)' },
    { value: 'enterprise', label: 'Enterprise (200+ employees)' }
  ]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }
      
      if (type === 'light') {
        setLogo(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setLogoPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setDarkLogo(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setDarkLogoPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removeLogo = (type: 'light' | 'dark') => {
    if (type === 'light') {
      setLogo(null)
      setLogoPreview(null)
    } else {
      setDarkLogo(null)
      setDarkLogoPreview(null)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required'
    }

    if (formData.domain) {
      // Allow both plain domains (example.com) and full URLs (https://example.com)
      const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/
      if (!domainRegex.test(formData.domain)) {
        newErrors.domain = 'Please enter a valid domain name or URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        domain: organization.domain || '',
        timezone: organization.timezone || 'UTC',
        currency: organization.currency || 'USD',
        language: organization.language || 'en',
        industry: organization.industry || '',
        size: organization.size || 'small',
        allowSelfRegistration: organization.settings?.allowSelfRegistration || false,
        requireEmailVerification: organization.settings?.requireEmailVerification || true,
        defaultUserRole: organization.settings?.defaultUserRole || 'team_member',
        timeTracking: {
          allowTimeTracking: organization.settings?.timeTracking?.allowTimeTracking ?? true,
          allowManualTimeSubmission: organization.settings?.timeTracking?.allowManualTimeSubmission ?? true,
          requireApproval: organization.settings?.timeTracking?.requireApproval ?? false,
          allowBillableTime: organization.settings?.timeTracking?.allowBillableTime ?? true,
          defaultHourlyRate: organization.settings?.timeTracking?.defaultHourlyRate ?? 0,
          maxDailyHours: organization.settings?.timeTracking?.maxDailyHours ?? 12,
          maxWeeklyHours: organization.settings?.timeTracking?.maxWeeklyHours ?? 60,
          maxSessionHours: organization.settings?.timeTracking?.maxSessionHours ?? 8,
          allowOvertime: organization.settings?.timeTracking?.allowOvertime ?? false,
          requireDescription: organization.settings?.timeTracking?.requireDescription ?? true,
          requireCategory: organization.settings?.timeTracking?.requireCategory ?? false,
          allowFutureTime: organization.settings?.timeTracking?.allowFutureTime ?? false,
          allowPastTime: organization.settings?.timeTracking?.allowPastTime ?? true,
          pastTimeLimitDays: organization.settings?.timeTracking?.pastTimeLimitDays ?? 30,
          roundingRules: {
            enabled: organization.settings?.timeTracking?.roundingRules?.enabled ?? false,
            increment: organization.settings?.timeTracking?.roundingRules?.increment ?? 15,
            roundUp: organization.settings?.timeTracking?.roundingRules?.roundUp ?? true
          },
          notifications: {
            onTimerStart: organization.settings?.timeTracking?.notifications?.onTimerStart ?? false,
            onTimerStop: organization.settings?.timeTracking?.notifications?.onTimerStop ?? true,
            onOvertime: organization.settings?.timeTracking?.notifications?.onOvertime ?? true,
            onApprovalNeeded: organization.settings?.timeTracking?.notifications?.onApprovalNeeded ?? true,
            onTimeSubmitted: organization.settings?.timeTracking?.notifications?.onTimeSubmitted ?? true
          }
        }
      })
      
      // Set logo previews if they exist
      if (organization.logo) {
        setLogoPreview(organization.logo)
      }
      if (organization.darkLogo) {
        setDarkLogoPreview(organization.darkLogo)
      }
      if (organization.logoMode) {
        // Map organization logoMode to component logoMode
        if (organization.logoMode === 'light' || organization.logoMode === 'dark') {
          setLogoMode('single')
        } else {
          setLogoMode('dual')
        }
      }
    }
  }, [organization])

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('data', JSON.stringify({
        ...formData,
        logoMode
      }))
      
      if (logo) {
        formDataToSend.append('logo', logo)
      }
      if (darkLogo) {
        formDataToSend.append('darkLogo', darkLogo)
      }

      const response = await fetch('/api/organization', {
        method: 'PUT',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to update organization')
      }

      setMessage({ type: 'success', text: 'Organization settings updated successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update organization settings' })
    } finally {
      setSaving(false)
    }
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
            <Building2 className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Update your organization's basic information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your Company Name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Website Domain (Optional)</Label>
            <Input
              id="domain"
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="yourcompany.com or https://yourcompany.com"
              className={errors.domain ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Enter your website domain or full URL (e.g., example.com or https://example.com)
            </p>
            {errors.domain && (
              <p className="text-sm text-red-600">{errors.domain}</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <p className="text-sm text-muted-foreground">
                Configure your organization logo for the best display across all themes
              </p>
            </div>

            {/* Logo Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  logoMode === 'single'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => setLogoMode('single')}
              >
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Single Logo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload one logo that will be used across all themes and interfaces
                  </p>
                </div>
              </div>

              <div
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  logoMode === 'dual'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => setLogoMode('dual')}
              >
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                    <div className="flex space-x-1">
                      <div className="h-4 w-4 bg-white border border-gray-300 rounded"></div>
                      <div className="h-4 w-4 bg-gray-800 border border-gray-600 rounded"></div>
                    </div>
                  </div>
                  <h3 className="font-semibold">Dual Logos</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload separate logos for light and dark themes to ensure optimal visibility
                  </p>
                </div>
              </div>
            </div>

            {logoMode === 'single' ? (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-20 w-20 object-contain rounded-lg border bg-background"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLogo('light')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="logo" className="text-sm font-medium text-foreground">
                      Organization Logo
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload a logo that works well in both light and dark themes
                    </p>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'light')}
                      className="hidden"
                    />
                    <Label
                      htmlFor="logo"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-accent transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">Max 5MB, PNG/JPG/SVG</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Light Mode Logo */}
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <Label className="text-sm font-medium text-foreground">Light Mode Logo</Label>
                  </div>
                  <div className="flex items-center space-x-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Light logo preview"
                          className="h-20 w-20 object-contain rounded-lg border bg-white"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLogo('light')}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-white">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">
                        Optimized for light backgrounds
                      </p>
                      <input
                        type="file"
                        id="light-logo"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'light')}
                        className="hidden"
                      />
                      <Label
                        htmlFor="light-logo"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-accent transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Dark Mode Logo */}
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-4 h-4 bg-gray-800 border border-gray-600 rounded"></div>
                    <Label className="text-sm font-medium text-foreground">Dark Mode Logo</Label>
                  </div>
                  <div className="flex items-center space-x-4">
                    {darkLogoPreview ? (
                      <div className="relative">
                        <img
                          src={darkLogoPreview}
                          alt="Dark logo preview"
                          className="h-20 w-20 object-contain rounded-lg border bg-gray-800"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLogo('dark')}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-gray-800">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">
                        Optimized for dark backgrounds
                      </p>
                      <input
                        type="file"
                        id="dark-logo"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'dark')}
                        className="hidden"
                      />
                      <Label
                        htmlFor="dark-logo"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-accent transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currenciesLoading ? (
                    <SelectItem value="__loading__" disabled>Loading currencies...</SelectItem>
                  ) : (
                    currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {formatCurrencyDisplay(currency)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Size</Label>
              <p className="text-sm text-muted-foreground">
                Choose the size category that best represents your organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organizationSizes.map((size) => {
                const getIcon = () => {
                  switch (size.value) {
                    case 'startup': return Users
                    case 'small': return UserCheck
                    case 'medium': return Building2
                    case 'enterprise': return Crown
                    default: return Users
                  }
                }
                const Icon = getIcon()
                
                return (
                  <div
                    key={size.value}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.size === size.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                     onClick={() => setFormData({ ...formData, size: size.value as 'startup' | 'small' | 'medium' | 'enterprise' })}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        formData.size === size.value
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            formData.size === size.value
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/30'
                          }`}>
                            {formData.size === size.value && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="font-semibold text-foreground">{size.label}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {size.value === 'startup' && 'Small teams and early-stage companies'}
                          {size.value === 'small' && 'Growing businesses with established teams'}
                          {size.value === 'medium' && 'Established companies with multiple departments'}
                          {size.value === 'enterprise' && 'Large organizations with complex structures'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Registration Settings</CardTitle>
          <CardDescription>
            Configure how new users can join your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Self Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to register themselves without invitation
              </p>
            </div>
            <Switch
              checked={formData.allowSelfRegistration}
              onCheckedChange={(checked) => setFormData({ ...formData, allowSelfRegistration: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Require users to verify their email address before accessing the system
              </p>
            </div>
            <Switch
              checked={formData.requireEmailVerification}
              onCheckedChange={(checked) => setFormData({ ...formData, requireEmailVerification: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultRole">Default User Role</Label>
            <Select value={formData.defaultUserRole} onValueChange={(value) => setFormData({ ...formData, defaultUserRole: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select default role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team_member">Team Member</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Tracking Settings</CardTitle>
          <CardDescription>
            Configure global time tracking settings for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Time Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Enable time tracking across all projects in your organization
              </p>
            </div>
            <Switch
              checked={formData.timeTracking.allowTimeTracking}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                timeTracking: { ...formData.timeTracking, allowTimeTracking: checked }
              })}
            />
          </div>

          {formData.timeTracking.allowTimeTracking && (
            <div className="ml-6 pl-4 border-l-2 border-muted space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Manual Time Submission</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow team members to submit time entries manually after completing tasks
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.allowManualTimeSubmission}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, allowManualTimeSubmission: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Require manager approval for all time entries
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.requireApproval}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, requireApproval: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Billable Time</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable billing and cost tracking for time entries
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.allowBillableTime}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, allowBillableTime: checked }
                  })}
                />
              </div>

              {formData.timeTracking.allowBillableTime && (
                <div>
                  <Label htmlFor="defaultHourlyRate">Default Hourly Rate ($)</Label>
                  <Input
                    id="defaultHourlyRate"
                    type="number"
                    value={formData.timeTracking.defaultHourlyRate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      timeTracking: { ...formData.timeTracking, defaultHourlyRate: Number(e.target.value) }
                    })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxDailyHours">Max Daily Hours</Label>
                  <Input
                    id="maxDailyHours"
                    type="number"
                    value={formData.timeTracking.maxDailyHours}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      timeTracking: { ...formData.timeTracking, maxDailyHours: Number(e.target.value) }
                    })}
                    min="1"
                    max="24"
                  />
                </div>
                <div>
                  <Label htmlFor="maxWeeklyHours">Max Weekly Hours</Label>
                  <Input
                    id="maxWeeklyHours"
                    type="number"
                    value={formData.timeTracking.maxWeeklyHours}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      timeTracking: { ...formData.timeTracking, maxWeeklyHours: Number(e.target.value) }
                    })}
                    min="1"
                    max="168"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSessionHours">Max Session Hours</Label>
                  <Input
                    id="maxSessionHours"
                    type="number"
                    value={formData.timeTracking.maxSessionHours}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      timeTracking: { ...formData.timeTracking, maxSessionHours: Number(e.target.value) }
                    })}
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Overtime</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow time entries beyond daily/weekly limits
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.allowOvertime}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, allowOvertime: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Description</Label>
                  <p className="text-sm text-muted-foreground">
                    Require description for all time entries
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.requireDescription}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, requireDescription: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Category</Label>
                  <p className="text-sm text-muted-foreground">
                    Require category selection for time entries
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.requireCategory}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, requireCategory: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Future Time</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow logging time for future dates
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.allowFutureTime}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, allowFutureTime: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Past Time</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow logging time for past dates
                  </p>
                </div>
                <Switch
                  checked={formData.timeTracking.allowPastTime}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    timeTracking: { ...formData.timeTracking, allowPastTime: checked }
                  })}
                />
              </div>

              {formData.timeTracking.allowPastTime && (
                <div>
                  <Label htmlFor="pastTimeLimitDays">Past Time Limit (Days)</Label>
                  <Input
                    id="pastTimeLimitDays"
                    type="number"
                    value={formData.timeTracking.pastTimeLimitDays}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      timeTracking: { ...formData.timeTracking, pastTimeLimitDays: Number(e.target.value) }
                    })}
                    min="1"
                    max="365"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Rounding Rules</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Rounding</Label>
                    <p className="text-sm text-muted-foreground">
                      Round time entries to specified increments
                    </p>
                  </div>
                  <Switch
                    checked={formData.timeTracking.roundingRules.enabled}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      timeTracking: { 
                        ...formData.timeTracking, 
                        roundingRules: { ...formData.timeTracking.roundingRules, enabled: checked }
                      }
                    })}
                  />
                </div>

                {formData.timeTracking.roundingRules.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="roundingIncrement">Increment (minutes)</Label>
                      <Input
                        id="roundingIncrement"
                        type="number"
                        value={formData.timeTracking.roundingRules.increment}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          timeTracking: { 
                            ...formData.timeTracking, 
                            roundingRules: { ...formData.timeTracking.roundingRules, increment: Number(e.target.value) }
                          }
                        })}
                        min="1"
                        max="60"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Round Up</Label>
                        <p className="text-sm text-muted-foreground">
                          Round up instead of down
                        </p>
                      </div>
                      <Switch
                        checked={formData.timeTracking.roundingRules.roundUp}
                        onCheckedChange={(checked) => setFormData({ 
                          ...formData, 
                          timeTracking: { 
                            ...formData.timeTracking, 
                            roundingRules: { ...formData.timeTracking.roundingRules, roundUp: checked }
                          }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timer Start</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when timer starts
                      </p>
                    </div>
                    <Switch
                      checked={formData.timeTracking.notifications.onTimerStart}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        timeTracking: { 
                          ...formData.timeTracking, 
                          notifications: { ...formData.timeTracking.notifications, onTimerStart: checked }
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timer Stop</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when timer stops
                      </p>
                    </div>
                    <Switch
                      checked={formData.timeTracking.notifications.onTimerStop}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        timeTracking: { 
                          ...formData.timeTracking, 
                          notifications: { ...formData.timeTracking.notifications, onTimerStop: checked }
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Overtime Alert</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when overtime is logged
                      </p>
                    </div>
                    <Switch
                      checked={formData.timeTracking.notifications.onOvertime}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        timeTracking: { 
                          ...formData.timeTracking, 
                          notifications: { ...formData.timeTracking.notifications, onOvertime: checked }
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Approval Needed</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when approval is needed
                      </p>
                    </div>
                    <Switch
                      checked={formData.timeTracking.notifications.onApprovalNeeded}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        timeTracking: { 
                          ...formData.timeTracking, 
                          notifications: { ...formData.timeTracking.notifications, onApprovalNeeded: checked }
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Time Submitted</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when time is submitted
                      </p>
                    </div>
                    <Switch
                      checked={formData.timeTracking.notifications.onTimeSubmitted}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        timeTracking: { 
                          ...formData.timeTracking, 
                          notifications: { ...formData.timeTracking.notifications, onTimeSubmitted: checked }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
