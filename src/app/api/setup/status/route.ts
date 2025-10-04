import { NextResponse } from 'next/server'
import { isSetupCompleted, loadConfig } from '@/lib/config'

export async function GET() {
  try {
    const config = loadConfig()
    
    return NextResponse.json({
      setupCompleted: config.setupCompleted,
      hasConfig: !!config.database,
      organizationId: config.organizationId,
      message: config.setupCompleted 
        ? 'Application is configured and ready' 
        : 'Application setup is required'
    })
  } catch (error) {
    console.error('Failed to check setup status:', error)
    return NextResponse.json({
      setupCompleted: false,
      hasConfig: false,
      message: 'Failed to check setup status'
    })
  }
}