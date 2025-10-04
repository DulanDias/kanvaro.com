import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import mongoose from 'mongoose'

export async function GET() {
  try {
    console.log('Checking database health...')
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    console.log('MONGODB_URI value:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    
    const db = await connectDB()
    console.log('Database connection state:', db.connection.readyState)
    console.log('Database name:', db.connection.name)
    console.log('Database host:', db.connection.host)
    console.log('Database port:', db.connection.port)
    
    // Test a simple operation
    const collections = await db.connection.db.listCollections().toArray()
    console.log('Available collections:', collections.map((c: any) => c.name))
    
    return NextResponse.json({
      success: true,
      connectionState: db.connection.readyState,
      connectionStates: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      },
      database: {
        name: db.connection.name,
        host: db.connection.host,
        port: db.connection.port
      },
      collections: collections.map((c: any) => c.name),
      message: 'Database health check completed'
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Database health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        connectionState: mongoose.connection.readyState,
        connectionStates: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        }
      },
      { status: 500 }
    )
  }
}
