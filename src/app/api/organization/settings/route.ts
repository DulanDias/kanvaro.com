import { NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Organization } from '@/models/Organization'

export async function GET() {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      // Demo mode - return minimal organization settings without contact info
      const mockSettings = {
        id: '1',
        name: 'Kanvaro',
        logo: null,
        darkLogo: null,
        logoMode: 'auto',
        contactInfo: null,
        isConfigured: false
      }
      return NextResponse.json(mockSettings)
    }

    await connectDB()
    
    // Find organization settings
    const organization = await Organization.findOne()
    
    if (!organization) {
      return NextResponse.json({
        id: null,
        name: 'Kanvaro',
        logo: null,
        darkLogo: null,
        logoMode: 'auto',
        contactInfo: null,
        isConfigured: false
      })
    }

    // Return organization settings with contact info
    const settings = {
      id: organization._id,
      name: organization.name,
      logo: organization.logo,
      darkLogo: organization.darkLogo,
      logoMode: organization.logoMode,
      contactInfo: organization.contactInfo || null,
      isConfigured: !!organization.contactInfo
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch organization settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
      { status: 500 }
    )
  }
}
