import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { Currency } from '@/models/Currency'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const majorOnly = searchParams.get('major') === 'true'
    const activeOnly = searchParams.get('active') !== 'false' // Default to true

    // Connect to database using unified connection system
    await connectDB()
    
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
