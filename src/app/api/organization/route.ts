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

    // Check if user can read organization
    const canReadOrganization = await PermissionService.hasPermission(user.id, Permission.ORGANIZATION_READ)
    if (!canReadOrganization) {
      return NextResponse.json(
        { error: 'Insufficient permissions to read organization' },
        { status: 403 }
      )
    }

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

    const updateData = await request.json()
    
    // Check if database is configured
    const isConfigured = await hasDatabaseConfig()
    if (!isConfigured) {
      return NextResponse.json(
        { message: 'Organization settings updated successfully (demo mode)' },
        { status: 200 }
      )
    }
    
    await connectDB()
    
    // Update the organization
    const organization = await Organization.findOneAndUpdate(
      {},
      {
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
        'settings.allowSelfRegistration': updateData.allowSelfRegistration,
        'settings.requireEmailVerification': updateData.requireEmailVerification,
        'settings.defaultUserRole': updateData.defaultUserRole,
        'settings.timeTracking.allowTimeTracking': updateData.timeTracking?.allowTimeTracking,
        'settings.timeTracking.allowManualTimeSubmission': updateData.timeTracking?.allowManualTimeSubmission
      },
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