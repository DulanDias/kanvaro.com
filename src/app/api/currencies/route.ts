import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { Currency } from '@/models/Currency'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const majorOnly = searchParams.get('major') === 'true'
    const activeOnly = searchParams.get('active') !== 'false' // Default to true

    // Try to get database config from config.json
    let mongoUri = process.env.MONGODB_URI
    
    if (!mongoUri) {
      try {
        const configPath = join(process.cwd(), 'config.json')
        const config = JSON.parse(readFileSync(configPath, 'utf8'))
        if (config.database && config.database.uri) {
          mongoUri = config.database.uri
        }
      } catch (err) {
        // Could not read config.json, using environment variable
      }
    }

    if (!mongoUri) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Connect to database
    await mongoose.connect(mongoUri)
    
    // Build query
    const query: any = {}
    if (activeOnly) {
      query.isActive = true
    }
    if (majorOnly) {
      query.isMajor = true
    }

    // Fetch currencies from database
    const currencies = await Currency.find(query)
      .sort({ isMajor: -1, name: 1 }) // Major currencies first, then alphabetical
      .lean()

    return NextResponse.json({
      success: true,
      data: currencies
    })
    
  } catch (error) {
    console.error('Currency fetch failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch currencies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
