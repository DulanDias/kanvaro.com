import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { hasDatabaseConfig } from '@/lib/db-config'
import { Organization } from '@/models/Organization'
import { authenticateUser } from '@/lib/auth-utils'
import { PermissionService } from '@/lib/permissions/permission-service'
import { Permission } from '@/lib/permissions/permission-definitions'

export async function GET() {
  try {
    // Authenticate user
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    // Allow any authenticated user to read basic organization info
    // Detailed management actions remain protected in PUT routes

    // Check if database is configured
    const isConfigured = await hasDatabaseConfig()
    if (!isConfigured) {
      // Return mock organization for demo purposes when DB is not configured
      const mockOrganization = {
        id: '1',
        name: 'Kanvaro',
        domain: 'kanvaro.com',
        logo: '/logo-light.svg',
        darkLogo: '/logo-dark.svg',
        logoMode: 'both',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        industry: 'Technology',
        size: 'small',
        settings: {
          allowSelfRegistration: false,
          requireEmailVerification: true,
          defaultUserRole: 'team_member',
          projectTemplates: [],
          timeTracking: {
            allowTimeTracking: true,
            allowManualTimeSubmission: true
          }
        },
        billing: {
          plan: 'free',
          maxUsers: 5,
          maxProjects: 3,
          features: ['basic_project_management', 'time_tracking', 'basic_reporting']
        }
      }
      return NextResponse.json(mockOrganization)
    }
    
    await connectDB()
    
    // Get the first organization (in a real app, this would be based on user's organization)
    const organization = await Organization.findOne()
    
    if (!organization) {
      // Return default organization when none exists
      const defaultOrganization = {
        id: '1',
        name: 'Kanvaro',
        domain: 'kanvaro.com',
        logo: '/logo-light.svg',
        darkLogo: '/logo-dark.svg',
        logoMode: 'both',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        industry: 'Technology',
        size: 'small',
        settings: {
          allowSelfRegistration: false,
          requireEmailVerification: true,
          defaultUserRole: 'team_member',
          projectTemplates: [],
          timeTracking: {
            allowTimeTracking: true,
            allowManualTimeSubmission: true
          }
        },
        billing: {
          plan: 'free',
          maxUsers: 5,
          maxProjects: 3,
          features: ['basic_project_management', 'time_tracking', 'basic_reporting']
        }
      }
      return NextResponse.json(defaultOrganization)
    }
    
    return NextResponse.json({
      id: organization._id,
      name: organization.name,
      domain: organization.domain,
      logo: organization.logo,
      darkLogo: organization.darkLogo,
      logoMode: organization.logoMode,
      timezone: organization.timezone,
      currency: organization.currency,
      language: organization.language,
      industry: organization.industry,
      size: organization.size,
      settings: organization.settings,
      billing: organization.billing
    })
  } catch (error) {
    console.error('Organization fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    // Check if user can update organization
    const canUpdateOrganization = await PermissionService.hasPermission(user.id, Permission.ORGANIZATION_UPDATE)
    if (!canUpdateOrganization) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update organization' },
        { status: 403 }
      )
    }

    // Parse body (support JSON or form data)
    const contentType = request.headers.get('content-type') || ''
    let updateData: any
    try {
      if (contentType.includes('application/json')) {
        updateData = await request.json()
      } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const form = await request.formData()
        const toBool = (v: FormDataEntryValue | null) => {
          if (v === null) return undefined
          const s = String(v).toLowerCase()
          if (['true','1','yes','on'].includes(s)) return true
          if (['false','0','no','off'].includes(s)) return false
          return undefined
        }
        // Many clients (OrganizationSettings) send a JSON blob under the 'data' field
        let parsed: any = {}
        const rawData = form.get('data')
        if (typeof rawData === 'string') {
          try { parsed = JSON.parse(rawData) } catch {}
        }
        updateData = {
          name: form.get('name') ?? undefined,
          domain: form.get('domain') ?? undefined,
          // Do not coerce File objects to string. Prefer values from parsed JSON if present.
          logo: typeof parsed.logo === 'string' ? parsed.logo : undefined,
          darkLogo: typeof parsed.darkLogo === 'string' ? parsed.darkLogo : undefined,
          logoMode: (form.get('logoMode') ?? parsed.logoMode) ?? undefined,
          timezone: form.get('timezone') ?? undefined,
          currency: form.get('currency') ?? undefined,
          language: form.get('language') ?? undefined,
          industry: form.get('industry') ?? undefined,
          size: form.get('size') ?? undefined,
          allowSelfRegistration: toBool(form.get('allowSelfRegistration') ?? form.get('settings.allowSelfRegistration') ?? (parsed.settings?.allowSelfRegistration ?? parsed.allowSelfRegistration ?? null)),
          requireEmailVerification: toBool(form.get('requireEmailVerification') ?? form.get('settings.requireEmailVerification') ?? (parsed.settings?.requireEmailVerification ?? parsed.requireEmailVerification ?? null)),
          defaultUserRole: (form.get('defaultUserRole') ?? form.get('settings.defaultUserRole') ?? parsed.settings?.defaultUserRole ?? parsed.defaultUserRole) ?? undefined,
          timeTracking: {
            allowTimeTracking: toBool(form.get('timeTracking.allowTimeTracking') ?? form.get('settings.timeTracking.allowTimeTracking') ?? (parsed.settings?.timeTracking?.allowTimeTracking ?? parsed.timeTracking?.allowTimeTracking ?? null)),
            allowManualTimeSubmission: toBool(form.get('timeTracking.allowManualTimeSubmission') ?? form.get('settings.timeTracking.allowManualTimeSubmission') ?? (parsed.settings?.timeTracking?.allowManualTimeSubmission ?? parsed.timeTracking?.allowManualTimeSubmission ?? null)),
          },
        }
        // Fallback to parsed top-level fields if direct form values are missing
        updateData.name = updateData.name ?? parsed.name
        updateData.domain = updateData.domain ?? parsed.domain
        updateData.timezone = updateData.timezone ?? parsed.timezone
        updateData.currency = updateData.currency ?? parsed.currency
        updateData.language = updateData.language ?? parsed.language
        updateData.industry = updateData.industry ?? parsed.industry
        updateData.size = updateData.size ?? parsed.size
      } else {
        // Fallback attempt JSON
        updateData = await request.json()
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request payload. Expect JSON or form data.' },
        { status: 400 }
      )
    }

    // Normalize nested settings if provided
    const normalized = {
      name: updateData.name,
      domain: updateData.domain,
      logo: updateData.logo,
      darkLogo: updateData.darkLogo,
      logoMode: updateData.logoMode,
      timezone: updateData.timezone,
      currency: updateData.currency,
      language: updateData.language,
      industry: updateData.industry,
      size: updateData.size,
      allowSelfRegistration: updateData.allowSelfRegistration ?? updateData.settings?.allowSelfRegistration,
      requireEmailVerification: updateData.requireEmailVerification ?? updateData.settings?.requireEmailVerification,
      defaultUserRole: updateData.defaultUserRole ?? updateData.settings?.defaultUserRole,
      timeTracking: {
        allowTimeTracking: updateData.timeTracking?.allowTimeTracking ?? updateData.settings?.timeTracking?.allowTimeTracking,
        allowManualTimeSubmission: updateData.timeTracking?.allowManualTimeSubmission ?? updateData.settings?.timeTracking?.allowManualTimeSubmission,
        requireApproval: updateData.timeTracking?.requireApproval ?? updateData.settings?.timeTracking?.requireApproval,
        allowBillableTime: updateData.timeTracking?.allowBillableTime ?? updateData.settings?.timeTracking?.allowBillableTime,
        defaultHourlyRate: updateData.timeTracking?.defaultHourlyRate ?? updateData.settings?.timeTracking?.defaultHourlyRate,
        maxDailyHours: updateData.timeTracking?.maxDailyHours ?? updateData.settings?.timeTracking?.maxDailyHours,
        maxWeeklyHours: updateData.timeTracking?.maxWeeklyHours ?? updateData.settings?.timeTracking?.maxWeeklyHours,
        maxSessionHours: updateData.timeTracking?.maxSessionHours ?? updateData.settings?.timeTracking?.maxSessionHours,
        allowOvertime: updateData.timeTracking?.allowOvertime ?? updateData.settings?.timeTracking?.allowOvertime,
        requireDescription: updateData.timeTracking?.requireDescription ?? updateData.settings?.timeTracking?.requireDescription,
        requireCategory: updateData.timeTracking?.requireCategory ?? updateData.settings?.timeTracking?.requireCategory,
        allowFutureTime: updateData.timeTracking?.allowFutureTime ?? updateData.settings?.timeTracking?.allowFutureTime,
        allowPastTime: updateData.timeTracking?.allowPastTime ?? updateData.settings?.timeTracking?.allowPastTime,
        pastTimeLimitDays: updateData.timeTracking?.pastTimeLimitDays ?? updateData.settings?.timeTracking?.pastTimeLimitDays,
        roundingRules: {
          enabled: updateData.timeTracking?.roundingRules?.enabled ?? updateData.settings?.timeTracking?.roundingRules?.enabled,
          increment: updateData.timeTracking?.roundingRules?.increment ?? updateData.settings?.timeTracking?.roundingRules?.increment,
          roundUp: updateData.timeTracking?.roundingRules?.roundUp ?? updateData.settings?.timeTracking?.roundingRules?.roundUp,
        },
        notifications: {
          onTimerStart: updateData.timeTracking?.notifications?.onTimerStart ?? updateData.settings?.timeTracking?.notifications?.onTimerStart,
          onTimerStop: updateData.timeTracking?.notifications?.onTimerStop ?? updateData.settings?.timeTracking?.notifications?.onTimerStop,
          onOvertime: updateData.timeTracking?.notifications?.onOvertime ?? updateData.settings?.timeTracking?.notifications?.onOvertime,
          onApprovalNeeded: updateData.timeTracking?.notifications?.onApprovalNeeded ?? updateData.settings?.timeTracking?.notifications?.onApprovalNeeded,
          onTimeSubmitted: updateData.timeTracking?.notifications?.onTimeSubmitted ?? updateData.settings?.timeTracking?.notifications?.onTimeSubmitted,
        },
      },
    }

    // Check if database is configured
    const isConfigured = await hasDatabaseConfig()
    if (!isConfigured) {
      return NextResponse.json(
        { message: 'Organization settings updated successfully (demo mode)' },
        { status: 200 }
      )
    }
    
    await connectDB()
    
    // Build update doc only with provided fields
    const updateDoc: any = {}
    const setIfDefined = (path: string, val: any) => {
      if (val !== undefined) updateDoc[path] = val
    }
    setIfDefined('name', normalized.name)
    setIfDefined('domain', normalized.domain)
    setIfDefined('logo', normalized.logo)
    setIfDefined('darkLogo', normalized.darkLogo)
    setIfDefined('logoMode', normalized.logoMode)
    setIfDefined('timezone', normalized.timezone)
    setIfDefined('currency', normalized.currency)
    setIfDefined('language', normalized.language)
    setIfDefined('industry', normalized.industry)
    setIfDefined('size', normalized.size)
    setIfDefined('settings.allowSelfRegistration', normalized.allowSelfRegistration)
    setIfDefined('settings.requireEmailVerification', normalized.requireEmailVerification)
    setIfDefined('settings.defaultUserRole', normalized.defaultUserRole)
    setIfDefined('settings.timeTracking.allowTimeTracking', normalized.timeTracking.allowTimeTracking)
    setIfDefined('settings.timeTracking.allowManualTimeSubmission', normalized.timeTracking.allowManualTimeSubmission)
    setIfDefined('settings.timeTracking.requireApproval', normalized.timeTracking.requireApproval)
    setIfDefined('settings.timeTracking.allowBillableTime', normalized.timeTracking.allowBillableTime)
    setIfDefined('settings.timeTracking.defaultHourlyRate', normalized.timeTracking.defaultHourlyRate)
    setIfDefined('settings.timeTracking.maxDailyHours', normalized.timeTracking.maxDailyHours)
    setIfDefined('settings.timeTracking.maxWeeklyHours', normalized.timeTracking.maxWeeklyHours)
    setIfDefined('settings.timeTracking.maxSessionHours', normalized.timeTracking.maxSessionHours)
    setIfDefined('settings.timeTracking.allowOvertime', normalized.timeTracking.allowOvertime)
    setIfDefined('settings.timeTracking.requireDescription', normalized.timeTracking.requireDescription)
    setIfDefined('settings.timeTracking.requireCategory', normalized.timeTracking.requireCategory)
    setIfDefined('settings.timeTracking.allowFutureTime', normalized.timeTracking.allowFutureTime)
    setIfDefined('settings.timeTracking.allowPastTime', normalized.timeTracking.allowPastTime)
    setIfDefined('settings.timeTracking.pastTimeLimitDays', normalized.timeTracking.pastTimeLimitDays)
    setIfDefined('settings.timeTracking.roundingRules.enabled', normalized.timeTracking.roundingRules?.enabled)
    setIfDefined('settings.timeTracking.roundingRules.increment', normalized.timeTracking.roundingRules?.increment)
    setIfDefined('settings.timeTracking.roundingRules.roundUp', normalized.timeTracking.roundingRules?.roundUp)
    setIfDefined('settings.timeTracking.notifications.onTimerStart', normalized.timeTracking.notifications?.onTimerStart)
    setIfDefined('settings.timeTracking.notifications.onTimerStop', normalized.timeTracking.notifications?.onTimerStop)
    setIfDefined('settings.timeTracking.notifications.onOvertime', normalized.timeTracking.notifications?.onOvertime)
    setIfDefined('settings.timeTracking.notifications.onApprovalNeeded', normalized.timeTracking.notifications?.onApprovalNeeded)
    setIfDefined('settings.timeTracking.notifications.onTimeSubmitted', normalized.timeTracking.notifications?.onTimeSubmitted)

    // Update the organization
    const organization = await Organization.findOneAndUpdate(
      {},
      updateDoc,
      { new: true, upsert: true }
    )
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Failed to update organization' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Organization settings updated successfully',
      organization: {
        id: organization._id,
        name: organization.name,
        domain: organization.domain,
        timezone: organization.timezone,
        currency: organization.currency,
        language: organization.language,
        industry: organization.industry,
        size: organization.size,
        settings: organization.settings
      }
    })
  } catch (error) {
    console.error('Organization update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}