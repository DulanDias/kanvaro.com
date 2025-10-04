import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    // Test MongoDB connection
    // If connecting from within Docker, use the service name instead of localhost
    const host = config.host === 'localhost' ? 'mongodb' : config.host
    const port = config.host === 'localhost' ? 27017 : config.port
    const uri = `mongodb://${config.username}:${config.password}@${host}:${port}/${config.database}?authSource=${config.authSource}`
    
    await mongoose.connect(uri, {
      authSource: config.authSource,
      ssl: config.ssl
    })
    
    // Test basic operations
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping()
    }
    
    // Close connection
    await mongoose.disconnect()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 400 }
    )
  }
}
