import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const setupData = await request.json()
    console.log('Setup data received:', JSON.stringify(setupData, null, 2))
    
    // Validate required setup data
    if (!setupData.database) {
      throw new Error('Database configuration is missing')
    }
    if (!setupData.organization) {
      throw new Error('Organization configuration is missing')
    }
    if (!setupData.admin) {
      throw new Error('Admin user configuration is missing')
    }
    
    // Create MongoDB URI from setup data
    const { database } = setupData
    
    // For Docker setup, use the internal service name instead of localhost
    const host = database.host === 'localhost' ? 'mongodb' : database.host
    const port = database.host === 'localhost' ? 27017 : database.port
    
    const mongoUri = `mongodb://${database.username}:${database.password}@${host}:${port}/${database.database}?authSource=${database.authSource}`
    
    console.log('Connecting to MongoDB with URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'))
    
    // Connect to the new database
    await mongoose.connect(mongoUri, {
      ssl: database.ssl
    })
    
    console.log('Successfully connected to MongoDB')
    
    // Create organization
    console.log('Creating organization with data:', setupData.organization)
    const organization = new Organization({
      name: setupData.organization.name,
      domain: setupData.organization.domain,
      logo: setupData.organization.logo,
      darkLogo: setupData.organization.darkLogo,
      logoMode: setupData.organization.logoMode,
      timezone: setupData.organization.timezone,
      currency: setupData.organization.currency,
      language: setupData.organization.language,
      industry: setupData.organization.industry,
      size: setupData.organization.size,
      settings: {
        allowSelfRegistration: false,
        requireEmailVerification: true,
        defaultUserRole: 'team_member',
        projectTemplates: []
      },
      billing: {
        plan: 'free',
        maxUsers: 5,
        maxProjects: 3,
        features: ['basic_project_management', 'time_tracking', 'basic_reporting']
      },
      emailConfig: setupData.email ? {
        provider: setupData.email.provider,
        smtp: setupData.email.smtp,
        azure: setupData.email.azure
      } : undefined
    })
    
    console.log('Saving organization...')
    await organization.save()
    console.log('Organization saved successfully:', organization._id)
    
    // Create admin user
    console.log('Creating admin user with data:', setupData.admin)
    const hashedPassword = await bcrypt.hash(setupData.admin.password, 12)
    
    const adminUser = new User({
      firstName: setupData.admin.firstName,
      lastName: setupData.admin.lastName,
      email: setupData.admin.email,
      password: hashedPassword,
      role: 'admin',
      organization: organization._id,
      isActive: true,
      emailVerified: true,
      timezone: setupData.organization.timezone,
      language: setupData.organization.language,
      currency: setupData.organization.currency,
      preferences: {
        theme: 'system',
        sidebarCollapsed: false,
        notifications: {
          email: true,
          inApp: true,
          push: false
        }
      }
    })
    
    console.log('Saving admin user...')
    await adminUser.save()
    console.log('Admin user saved successfully:', adminUser._id)
    
    // Save database configuration to environment (in production, this would be saved securely)
    // For now, we'll just return success and let the client handle the redirect
    
    console.log('Setup completed successfully!')
    return NextResponse.json({ 
      success: true,
      message: 'Setup completed successfully',
      redirectTo: '/dashboard'
    })
  } catch (error) {
    console.error('Setup completion failed:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Setup completion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
