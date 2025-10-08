import { NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { hasDatabaseConfig } from '@/lib/db-config'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    
    // Check if database is configured
    const isConfigured = await hasDatabaseConfig()
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Database configuration not found. Please complete the setup process.',
        env: process.env.NODE_ENV
      })
    }

    // Test connection using unified system
    const connection = await connectDB()

    console.log('Connection state:', connection.connection.readyState)
    console.log('Database name:', connection.connection.name)
    console.log('Database host:', connection.connection.host)

    // Test a simple operation
    if (!connection.connection.db) {
      throw new Error('Database connection is not available')
    }
    const collections = await connection.connection.db.listCollections().toArray()
    console.log('Collections found:', collections.length)

    return NextResponse.json({
      success: true,
      connectionState: connection.connection.readyState,
      database: {
        name: connection.connection.name,
        host: connection.connection.host,
        port: connection.connection.port
      },
      collections: collections.map((c: any) => c.name),
      message: 'Connection test successful'
    })
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
