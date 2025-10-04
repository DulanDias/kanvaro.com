import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real application, you would load these settings from a configuration file
    // or environment variables. For now, we'll return default values.
    
    const defaultConfig = {
      host: process.env.MONGODB_HOST || 'localhost',
      port: parseInt(process.env.MONGODB_PORT || '27017'),
      database: process.env.MONGODB_DATABASE || 'kanvaro',
      username: process.env.MONGODB_USERNAME || '',
      password: process.env.MONGODB_PASSWORD || '',
      authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
      ssl: process.env.MONGODB_SSL === 'true' || false
    }
    
    return NextResponse.json(defaultConfig)
  } catch (error) {
    console.error('Database settings retrieval failed:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve database settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const databaseConfig = await request.json()
    
    // In a real application, you would save these settings to a configuration file
    // or environment variables. For now, we'll just return a success message.
    
    console.log('Database configuration updated:', {
      host: databaseConfig.host,
      port: databaseConfig.port,
      database: databaseConfig.database,
      ssl: databaseConfig.ssl
    })
    
    return NextResponse.json({
      message: 'Database settings updated successfully',
      config: {
        host: databaseConfig.host,
        port: databaseConfig.port,
        database: databaseConfig.database,
        ssl: databaseConfig.ssl
      }
    })
  } catch (error) {
    console.error('Database settings update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update database settings' },
      { status: 500 }
    )
  }
}
