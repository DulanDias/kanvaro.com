import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    // For MongoDB, we don't actually "create" a database in the traditional sense
    // MongoDB creates databases automatically when you first write to them
    // What we're doing here is testing the connection and ensuring we can access the database
    
    // Build MongoDB URI with authentication
    // If connecting from within Docker, use the service name instead of localhost
    const host = config.host === 'localhost' ? 'mongodb' : config.host
    const port = config.host === 'localhost' ? 27017 : config.port
    const uri = `mongodb://${config.username}:${config.password}@${host}:${port}/${config.database}?authSource=${config.authSource}`
    
    console.log('Attempting to connect to:', uri)
    console.log('Original config:', config)
    
    // Connect to MongoDB
    await mongoose.connect(uri, {
      ssl: config.ssl
    })
    
    // Test basic operations to ensure database is accessible
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping()
      
      // Create a simple test collection to "initialize" the database
      const testCollection = mongoose.connection.db.collection('_setup_test')
      await testCollection.insertOne({ 
        test: true, 
        createdAt: new Date() 
      })
      
      // Clean up test document
      await testCollection.deleteOne({ test: true })
    }
    
    // Close connection
    await mongoose.disconnect()
    
    return NextResponse.json({ 
      success: true,
      message: 'Database is ready for use'
    })
  } catch (error) {
    console.error('Database creation failed:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Database setup failed. Please check your connection settings.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}
