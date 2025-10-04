import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'

export async function GET() {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        isSetupComplete: false,
        reason: 'no_database_configured'
      })
    }
    
    await connectDB()
    
    // Check if any admin user exists
    const adminUser = await User.findOne({ role: 'admin' })
    
    return NextResponse.json({
      isSetupComplete: !!adminUser,
      reason: adminUser ? 'setup_complete' : 'no_admin_user'
    })
  } catch (error) {
    console.error('Setup status check failed:', error)
    return NextResponse.json({
      isSetupComplete: false,
      reason: 'database_connection_failed'
    })
  }
}
