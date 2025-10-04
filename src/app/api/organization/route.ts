import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Organization } from '@/models/Organization'

export async function GET() {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
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
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
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
    const updateData = await request.json()
    
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
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