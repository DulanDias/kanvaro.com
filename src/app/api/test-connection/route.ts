import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable is not set',
        env: process.env.NODE_ENV
      })
    }

    // Test direct connection
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    })

    console.log('Connection state:', connection.connection.readyState)
    console.log('Database name:', connection.connection.name)
    console.log('Database host:', connection.connection.host)

    // Test a simple operation
    if (!connection.connection.db) {
      throw new Error('Database connection is not available')
    }
    const collections = await connection.connection.db.listCollections().toArray()
    console.log('Collections found:', collections.length)

    // Close the connection
    await mongoose.disconnect()

    return NextResponse.json({
      success: true,
      connectionState: connection.connection.readyState,
      database: {
        name: connection.connection.name,
        host: connection.connection.host,
        port: connection.connection.port
      },
      collections: collections.map((c: any) => c.name),
      message: 'Direct connection test successful'
    })
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}
