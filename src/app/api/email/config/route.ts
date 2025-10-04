import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Organization } from '@/models/Organization'

export async function GET() {
  try {
    await connectDB()
    
    const organization = await Organization.findOne({})
    
    if (!organization?.emailConfig) {
      return NextResponse.json({
        configured: false,
        message: 'Email configuration not found'
      })
    }

    return NextResponse.json({
      configured: true,
      provider: organization.emailConfig.provider,
      fromEmail: organization.emailConfig.smtp?.fromEmail || organization.emailConfig.azure?.fromEmail,
      fromName: organization.emailConfig.smtp?.fromName || organization.emailConfig.azure?.fromName
    })
  } catch (error) {
    console.error('Failed to get email configuration:', error)
    return NextResponse.json(
      { error: 'Failed to get email configuration' },
      { status: 500 }
    )
  }
}
